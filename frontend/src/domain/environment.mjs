export function validateEnvironment(data) {
  const statuses=['ok','unavailable','not_configured','partial'];
  if(data?.version!==1||!Number.isFinite(Date.parse(data.retrieved_at))||!data.territory||!Array.isArray(data.territory.bbox)||data.territory.bbox.length!==4||!data.territory.bbox.every(Number.isFinite))throw Error('Respuesta ambiental inválida.');
  for(const name of ['weather','fires'])if(!data[name]||!statuses.includes(data[name].status)||!Array.isArray(data[name].rows))throw Error('Proveedor inválido.');
  if(data.weather.rows.length>9||data.fires.rows.length>50000)throw Error('Respuesta demasiado grande.');
  for(const row of data.weather.rows) {
    if(typeof row.location?.id!=='string'||typeof row.location.name!=='string'||!Number.isFinite(Date.parse(row.observed_at))||row.kind!=='weather_model'||!row.values)throw Error('Meteorología inválida.');
    if(!Number.isFinite(row.location.latitude)||!Number.isFinite(row.location.longitude)||!Number.isFinite(row.interval_seconds)||row.interval_seconds<=0)throw Error('Ubicación o intervalo inválidos.');
    for(const key of ['temperature_c','humidity_pct','rain_mm','wind_kmh'])if(row.values[key]!==null&&!Number.isFinite(row.values[key]))throw Error('Medición inválida.');
  }
  for(const row of data.fires.rows) {
    if(typeof row.source!=='string'||!Number.isFinite(row.latitude)||Math.abs(row.latitude)>90||!Number.isFinite(row.longitude)||Math.abs(row.longitude)>180||!Number.isFinite(row.frp_mw)||row.frp_mw<0||!Number.isFinite(Date.parse(row.observed_at))||!['l','n','h'].includes(row.confidence)||row.confirmed_fire!==false)throw Error('Detección inválida.');
  }
  return data;
}
