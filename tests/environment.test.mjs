import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeWeather,parseFirms,PublicEnvironment} from '../backend/adapters/out/environment.mjs';
import {AdminService} from '../backend/application/use-cases/admin-service.mjs';
import {MemoryIdentity} from '../backend/adapters/out/memory.mjs';
import {createHandler} from '../backend/adapters/in/http.mjs';
import territory from '../backend/adapters/out/territory.json' with {type:'json'};
const header='latitude,longitude,acq_date,acq_time,confidence,frp,satellite,instrument';
const csv=header+'\n-11.2,-74.5,2026-10-23,945,n,3.2,N20,VIIRS\n';
function weather(){return territory.locations.map(l=>({latitude:l.latitude,longitude:l.longitude,utc_offset_seconds:0,current_units:{temperature_2m:'°C',relative_humidity_2m:'%',rain:'mm',wind_speed_10m:'km/h'},current:{time:'2026-10-23T15:45',interval:900,temperature_2m:25.2,relative_humidity_2m:79,rain:0,wind_speed_10m:1.1}}));}

test('Open-Meteo: nueve puntos, unidades, UTC y valores nulos explícitos',()=>{
  const data=weather();data[0].current.rain=null;
  const rows=normalizeWeather(data);assert.equal(rows.length,9);assert.equal(rows[0].observed_at,'2026-10-23T15:45Z');assert.deepEqual(rows[0].missing,['rain_mm']);
  data[0].current_units.temperature_2m='°F';assert.throws(()=>normalizeWeather(data));
  assert.throws(()=>normalizeWeather(weather().slice(1)));
  const invalid=weather();invalid[0].current.relative_humidity_2m=120;assert.throws(()=>normalizeWeather(invalid));
});
test('FIRMS: UTC HHMM, confianza, deduplicación exacta y filtro del rectángulo',()=>{
  const rows=parseFirms(csv+csv.split('\n')[1]+'\n0,0,2026-10-23,1200,h,10,N20,VIIRS','VIIRS_NOAA20_NRT');
  assert.equal(rows.length,1);assert.equal(rows[0].observed_at,'2026-10-23T09:45:00Z');assert.equal(rows[0].confirmed_fire,false);
  assert.deepEqual(parseFirms(header,'VIIRS_NOAA20_NRT'),[]);
  for(const bad of ['Invalid MAP_KEY','',csv.replace(',945,',',2560,'),csv.replace(',3.2,',',NaN,'),csv.replace('2026-10-23','2026-02-30')])assert.throws(()=>parseFirms(bad,'VIIRS_NOAA20_NRT'));
});
test('Falta de MAP_KEY no consulta NASA; caché y solicitudes concurrentes',async()=>{
  let calls=0,time=0;const app=new PublicEnvironment({clock:()=>time,ttlMs:1000,request:async url=>{calls++;assert.ok(url.startsWith('https://api.open-meteo.com/'));return new Response(JSON.stringify(weather()));}});
  const [a,b]=await Promise.all([app.snapshot(),app.snapshot()]);assert.equal(calls,1);assert.equal(a.fires.status,'not_configured');assert.equal(b.weather.rows.length,9);
  assert.equal((await app.snapshot()).cached,true);time=1001;await app.snapshot();assert.equal(calls,2);
});
test('FIRMS parcial conserva fuente disponible sin revelar clave ni errores upstream',async()=>{
  const key='test-secret-not-real';let calls=0;
  const app=new PublicEnvironment({firmsKey:key,request:async(url,options)=>{calls++;assert.equal(options.redirect,'error');
    if(url.includes('open-meteo'))return new Response(JSON.stringify(weather()));
    assert.ok(url.includes(key));if(url.includes('NOAA20'))return new Response(csv);
    throw Error('Leaked '+key);
  }});
  const result=await app.snapshot();assert.equal(calls,3);assert.equal(result.fires.status,'partial');assert.equal(result.fires.rows.length,1);assert.ok(!JSON.stringify(result).includes(key));
});
test('Fallo después de caducar caché no devuelve clima antiguo como actual',async()=>{
  let now=0;const app=new PublicEnvironment({clock:()=>now,ttlMs:1000,request:async()=>now===0?new Response(JSON.stringify(weather())):new Response('rate limit',{status:429})});
  assert.equal((await app.snapshot()).weather.rows.length,9);now=1001;const result=await app.snapshot();assert.equal(result.weather.status,'unavailable');assert.deepEqual(result.weather.rows,[]);
});
test('API ambiental autoriza antes de contactar proveedores',async()=>{
  let calls=0;const app=new AdminService({identity:new MemoryIdentity(),environment:{snapshot:async()=>{calls++;return {version:1};}}});
  await assert.rejects(app.getEnvironment(''),{code:'UNAUTHENTICATED'});await assert.rejects(app.getEnvironment('user'),{code:'FORBIDDEN'});assert.equal(calls,0);
  const handler=createHandler({serviceFactory:()=>app,allowedOrigins:[]});
  const result=await handler(new Request('https://test/api/environment',{headers:{authorization:'Bearer admin'}}));assert.equal(result.status,200);assert.equal(calls,1);
});
