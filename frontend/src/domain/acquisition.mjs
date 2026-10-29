const units = {temperature_c:'degC',humidity_pct:'%',tvoc_ppb:'ppb',eco2_ppm:'ppm',pm1_0:'ug/m3',pm2_5:'ug/m3',nc0_5:'#/cm3',nc1_0:'#/cm3',nc2_5:'#/cm3',pm10:'ug/m3',wind_kmh:'km/h',rain_mm:'mm'};
export function validateAcquisitionExport(value) {
  if(value?.schema_version!==1 || value.operational!==false || !Array.isArray(value.rows) || value.rows.length>10000) throw Error('Exportación API incompatible. Usa python -m acquisition export.');
  const keys=new Set();
  for(const row of value.rows) {
    const r=row?.reading;
    if(!r || !['weather','smoke'].includes(r.kind) || r.provenance!=='api' || !r.values || !r.units || Array.isArray(r.values) || !Object.keys(r.values).length) throw Error('Lectura API inválida.');
    for(const name of ['source','external_id','node_id']) if(typeof r[name]!=='string' || !r[name].trim() || r[name].length>200) throw Error('Identificador inválido.');
    if(typeof r.observed_at!=='string' || !/(Z|[+-]\d{2}:\d{2})$/.test(r.observed_at) || !Number.isFinite(Date.parse(r.observed_at))) throw Error('Fecha sin zona horaria o inválida.');
    const key=JSON.stringify([r.source,r.external_id]);if(keys.has(key))throw Error('Lecturas duplicadas.');keys.add(key);
    for(const [name,n] of Object.entries(r.values)) if(!Object.hasOwn(units,name) || units[name]!==r.units[name] || typeof n!=='number' || !Number.isFinite(n) || (name!=='temperature_c' && n<0) || (name==='humidity_pct' && n>100))throw Error('Variable, rango o unidad incompatible.');
    if(row.prediction!==null) {
      const p=row.prediction;
      if(!p || r.kind!=='smoke' || p.operational!==false || typeof p.alarm!=='boolean' || typeof p.score!=='number' || !Number.isFinite(p.score) || p.score<0 || p.score>1 || typeof p.model_version!=='string' || !p.model_version.trim() || p.risk_level!==null || p.anomaly!==null)throw Error('Predicción experimental inválida.');
    }
  }
  return value;
}
