export const districts = [{"ubigeo": "120601", "name": "SATIPO"}, {"ubigeo": "120602", "name": "COVIRIALI"}, {"ubigeo": "120603", "name": "LLAYLLA"}, {"ubigeo": "120604", "name": "MAZAMARI"}, {"ubigeo": "120605", "name": "PAMPA HERMOSA"}, {"ubigeo": "120606", "name": "PANGOA"}, {"ubigeo": "120607", "name": "RIO NEGRO"}, {"ubigeo": "120608", "name": "RIO TAMBO"}, {"ubigeo": "120609", "name": "VIZCATAN DEL ENE"}];

export function generateScenario(scenarioProfile, random, now, id) {
  if (!['Seco','Variable','Lluvioso'].includes(scenarioProfile)) throw new Error('Perfil de simulación inválido.');
    return {type:'SIMULATION_ONLY',notice:'Condiciones e índice simulados. No es un pronóstico ni una alerta real.',version:2,profile:scenarioProfile,id,generatedAt:now.toISOString(),endsAt:new Date(now.getTime()+86400000).toISOString(),horizonHours:24,
      districts:districts.map((district,i)=>{
        const u=k=>random[i*4+k];
        const dry=scenarioProfile==='Seco',wet=scenarioProfile==='Lluvioso';
        const temperatureC=Math.round((dry?28+u(0)*8:wet?20+u(0)*7:23+u(0)*9)*10)/10;
        const humidityPct=Math.round(dry?25+u(1)*30:wet?75+u(1)*23:45+u(1)*40);
        const rainMm=Math.round((dry?u(2)*2:wet?8+u(2)*27:u(2)*12)*10)/10;
        const windKmh=Math.round(4+u(3)*24);
        const score=Math.round(Math.max(0,Math.min(100,(temperatureC-18)*2+(100-humidityPct)*0.55+windKmh*0.7-rainMm*2)));
        return {...district,temperatureC,humidityPct,rainMm,windKmh,score,level:score>=70?'Alto':score>=40?'Medio':'Bajo'};
      })};

}

export function validHistory(saved) {
  if(!Array.isArray(saved)) return [];
  return saved.filter(item=>item.version===2&&item.type==='SIMULATION_ONLY'&&typeof item.id==='string'&&Number.isFinite(Date.parse(item.generatedAt))&&['Seco','Variable','Lluvioso'].includes(item.profile)&&Array.isArray(item.districts)&&item.districts.length===9&&new Set(item.districts.map(r=>r.ubigeo)).size===9&&item.districts.every(r=>districts.some(d=>d.ubigeo===r.ubigeo)&&['score','temperatureC','humidityPct','rainMm','windKmh'].every(k=>Number.isFinite(r[k]))&&r.score>=0&&r.score<=100&&['Alto','Medio','Bajo'].includes(r.level))).slice(0,10);
}
