import { EnvironmentPort } from '../../application/ports/out/environment.mjs';
import territory from './territory.json' with {type:'json'};

const WEATHER_FIELDS=['temperature_2m','relative_humidity_2m','rain','wind_speed_10m'];
const SOURCES=['VIIRS_NOAA20_NRT','VIIRS_NOAA21_NRT'];
const finite=(v,min=-Infinity,max=Infinity)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
const failed=()=>{throw Error('Respuesta del proveedor inválida');};

export function normalizeWeather(payload,locations=territory.locations) {
  const list=Array.isArray(payload)?payload:[payload];
  if(list.length!==locations.length)failed();
  return list.map((item,i)=>{
    const c=item?.current,u=item?.current_units;
    if(!c||!u||u.temperature_2m!=='°C'||u.relative_humidity_2m!=='%'||u.rain!=='mm'||u.wind_speed_10m!=='km/h'||item.utc_offset_seconds!==0)failed();
    if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(c.time)||!finite(item.latitude,-90,90)||!finite(item.longitude,-180,180)||!finite(c.interval,1,86400))failed();
    const observedAt=c.time+'Z';if(!Number.isFinite(Date.parse(observedAt)))failed();
    const values={temperature_c:c.temperature_2m,humidity_pct:c.relative_humidity_2m,rain_mm:c.rain,wind_kmh:c.wind_speed_10m};
    for(const [key,v] of Object.entries(values))if(v!==null&&!finite(v,key==='temperature_c'?-100:0,key==='humidity_pct'?100:Infinity))failed();
    if(Object.values(values).some(v=>v===undefined))failed();
    return {location:locations[i],grid:{latitude:item.latitude,longitude:item.longitude},observed_at:observedAt,
      interval_seconds:c.interval,values,units:{temperature_c:'degC',humidity_pct:'%',rain_mm:'mm',wind_kmh:'km/h'},
      kind:'weather_model',source:'Open-Meteo',missing:Object.entries(values).filter(([,v])=>v===null).map(([k])=>k)};
  });
}

export function parseFirms(csv,source,bbox=territory.bbox) {
  if(!SOURCES.includes(source)||typeof csv!=='string')failed();
  const lines=csv.replace(/^\uFEFF/,'').trim().split(/\r?\n/);
  const headers=lines.shift().split(',').map(v=>v.trim());
  const required=['latitude','longitude','acq_date','acq_time','confidence','frp','satellite','instrument'];
  if(!required.every(v=>headers.includes(v))||new Set(headers).size!==headers.length)failed();
  const unique=new Map();
  for(const line of lines) {
    if(!line.trim())continue;
    const cells=line.split(',').map(v=>v.trim());if(cells.length!==headers.length)failed();
    const row=Object.fromEntries(headers.map((h,i)=>[h,cells[i]]));
    if(!row.latitude||!row.longitude||!row.frp)failed();
    const latitude=Number(row.latitude),longitude=Number(row.longitude),frp=Number(row.frp);
    if(!finite(latitude,-90,90)||!finite(longitude,-180,180)||!finite(frp,0)||!['l','n','h'].includes(row.confidence))failed();
    if(!/^\d{4}-\d{2}-\d{2}$/.test(row.acq_date)||!/^\d{1,4}$/.test(row.acq_time))failed();
    const hhmm=row.acq_time.padStart(4,'0'),hour=Number(hhmm.slice(0,2)),minute=Number(hhmm.slice(2));
    if(hour>23||minute>59)failed();
    const observed_at=`${row.acq_date}T${hhmm.slice(0,2)}:${hhmm.slice(2)}:00Z`;
    if(!Number.isFinite(Date.parse(observed_at))||new Date(observed_at).toISOString().slice(0,10)!==row.acq_date)failed();
    if(longitude<bbox[0]||longitude>bbox[2]||latitude<bbox[1]||latitude>bbox[3])continue;
    const id=[source,observed_at,latitude,longitude].join(':');
    unique.set(id,{id,source,latitude,longitude,observed_at,confidence:row.confidence,frp_mw:frp,
      satellite:row.satellite,instrument:row.instrument,kind:'satellite_hotspot',confirmed_fire:false});
  }
  return [...unique.values()];
}

export class PublicEnvironment extends EnvironmentPort {
  constructor({firmsKey='',request=globalThis.fetch,clock=()=>Date.now(),ttlMs=900000}={}) {
    super();Object.assign(this,{firmsKey,request,clock,ttlMs});this.cached=null;this.pending=null;
  }
  async read(url,maxBytes=4_000_000) {
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
    try {
      const response=await this.request(url,{signal:controller.signal,redirect:'error'});
      if(!response.ok||!response.body)failed();
      const reader=response.body.getReader();let size=0;const chunks=[];
      try {while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>maxBytes){await reader.cancel();failed();}chunks.push(value);}}
      finally{reader.releaseLock();}
      const bytes=new Uint8Array(size);let offset=0;for(const part of chunks){bytes.set(part,offset);offset+=part.length;}
      return new TextDecoder().decode(bytes);
    } finally {clearTimeout(timer);}
  }
  async weather() {
    try {
      const params=new URLSearchParams({latitude:territory.locations.map(r=>r.latitude).join(','),longitude:territory.locations.map(r=>r.longitude).join(','),current:WEATHER_FIELDS.join(','),timezone:'GMT',wind_speed_unit:'kmh',temperature_unit:'celsius',precipitation_unit:'mm',forecast_days:'1'});
      return {status:'ok',rows:normalizeWeather(JSON.parse(await this.read('https://api.open-meteo.com/v1/forecast?'+params)))};
    }catch{return {status:'unavailable',rows:[],message:'Open-Meteo no respondió con datos válidos. Intenta más tarde.'};}
  }
  async fires() {
    if(!this.firmsKey)return {status:'not_configured',rows:[],message:'Falta configurar FIRMS_MAP_KEY en el servidor.'};
    const results=await Promise.all(SOURCES.map(async source=>{
      try {
        const url=`https://firms.modaps.eosdis.nasa.gov/api/area/csv/${encodeURIComponent(this.firmsKey)}/${source}/${territory.bbox.join(',')}/2`;
        return {source,status:'ok',rows:parseFirms(await this.read(url),source)};
      }catch{return {source,status:'unavailable',rows:[]};}
    }));
    const count=results.filter(r=>r.status==='ok').length;
    return {status:count===2?'ok':count?'partial':'unavailable',sources:results.map(({source,status})=>({source,status})),
      rows:results.flatMap(r=>r.rows).sort((a,b)=>b.observed_at.localeCompare(a.observed_at)),
      message:count===2?'Consulta de hoy y ayer en UTC. Un mismo fuego puede producir varias detecciones.':'Consulta incompleta: uno o más productos FIRMS no están disponibles; no equivale a ausencia de fuego.'};
  }
  async snapshot() {
    if(this.cached&&this.clock()<this.cached.expires)return {...this.cached.value,cached:true};
    if(this.pending)return this.pending;
    this.pending=(async()=>{
      const [weather,fires]=await Promise.all([this.weather(),this.fires()]);
      const value={version:1,retrieved_at:new Date(this.clock()).toISOString(),cached:false,cache_seconds:this.ttlMs/1000,
        territory:{bbox:territory.bbox,locations:territory.locations,scope:'Rectángulo envolvente de Satipo; puede incluir territorios vecinos. Sin asignación distrital de focos.'},weather,fires,
        attribution:{weather:'https://open-meteo.com/',fires:'https://firms.modaps.eosdis.nasa.gov/'}};
      this.cached={value,expires:this.clock()+this.ttlMs};return value;
    })();
    try{return await this.pending;}finally{this.pending=null;}
  }
}
