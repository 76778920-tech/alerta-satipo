export function reportIncident(report, priority, count, date) {
  return {id:`INC-${String(450+count).padStart(3,'0')}`,date,
    zone:report.location,type:`Reporte comunitario: ${report.type}`,nodes:priority ? [priority.id] : [],
    risk:({high:82,medium:64,low:41})[report.severity] || 60,
    state:'Nuevo',owner:'Cola comunitaria',source:'mobile'};
}
export function helpIncident(priority, count, date) {
  if (!priority) throw new Error('No hay datos demostrativos disponibles.');
  return {id:`INC-${String(460+count).padStart(3,'0')}`,date,zone:priority.zone,
    type:'Escalamiento de emergencia',nodes:[priority.id],risk:Math.max(priority.risk,85),
    state:'Nuevo',owner:'Respuesta inmediata',source:'mobile-help'};
}
export function simulateSensor(sensor, values) {
  const jitter=(value,amount,min,max,random)=>Math.min(max,Math.max(min,Number((value+(random*amount*2-amount)).toFixed(1))));
  return {...sensor,temp:jitter(sensor.temp,0.4,26,42,values[0]),
    smoke:Math.round(jitter(sensor.smoke,2.5,10,90,values[1])),
    humidity:Math.round(jitter(sensor.humidity,1.8,20,75,values[2])),
    wind:Math.round(jitter(sensor.wind,1.2,4,28,values[3])),
    lastComm:Math.max(1,Math.min(14,sensor.lastComm+(values[4]>0.7?1:-1)))};
}
