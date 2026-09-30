/* Demostración local: nunca escribe en Supabase ni ejecuta el modelo. */
window.SatipoDistrictDemo = (() => {
  const districts = [{"ubigeo": "120601", "name": "SATIPO"}, {"ubigeo": "120602", "name": "COVIRIALI"}, {"ubigeo": "120603", "name": "LLAYLLA"}, {"ubigeo": "120604", "name": "MAZAMARI"}, {"ubigeo": "120605", "name": "PAMPA HERMOSA"}, {"ubigeo": "120606", "name": "PANGOA"}, {"ubigeo": "120607", "name": "RIO NEGRO"}, {"ubigeo": "120608", "name": "RIO TAMBO"}, {"ubigeo": "120609", "name": "VIZCATAN DEL ENE"}];
  let root, scenario=null, history=[];
  const historyKey=()=>`satipo-demo-v2:${window.SatipoBackend.profile?.id || 'admin'}`;
  function save() {
    history=[scenario,...history.filter(item=>item.id!==scenario.id)].slice(0,10);
    try { localStorage.setItem(historyKey(),JSON.stringify(history));return true; } catch { return false; }
  }
  const $=s=>root.querySelector(s);
  const escape=s=>window.SatipoBackend.escapeHTML(String(s));
  function generate() {
    const random=crypto.getRandomValues(new Uint32Array(districts.length*4));
    const now=new Date();
    const scenarioProfile=$('#demo-profile').value;
    scenario={type:'SIMULATION_ONLY',notice:'Condiciones e índice simulados. No es un pronóstico ni una alerta real.',version:2,profile:$('#demo-profile').value,id:crypto.randomUUID(),generatedAt:now.toISOString(),endsAt:new Date(now.getTime()+86400000).toISOString(),horizonHours:24,
      districts:districts.map((district,i)=>{
        const u=k=>random[i*4+k]/4294967296;
        const dry=scenarioProfile==='Seco',wet=scenarioProfile==='Lluvioso';
        const temperatureC=Math.round((dry?28+u(0)*8:wet?20+u(0)*7:23+u(0)*9)*10)/10;
        const humidityPct=Math.round(dry?25+u(1)*30:wet?75+u(1)*23:45+u(1)*40);
        const rainMm=Math.round((dry?u(2)*2:wet?8+u(2)*27:u(2)*12)*10)/10;
        const windKmh=Math.round(4+u(3)*24);
        const score=Math.round(Math.max(0,Math.min(100,(temperatureC-18)*2+(100-humidityPct)*0.55+windKmh*0.7-rainMm*2)));
        return {...district,temperatureC,humidityPct,rainMm,windKmh,score,level:score>=70?'Alto':score>=40?'Medio':'Bajo'};
      })};
    const saved=save();render();
    $('#demo-status').textContent=saved?'Escenario simulado guardado en este navegador. No se crearon incidentes reales.':'Escenario generado; el navegador no permite guardar el historial. Puedes exportarlo.';
  }
  function render() {
    const filter=$('#demo-filter').value;
    const rows=scenario.districts.filter(r=>filter==='Todos'||r.level===filter).sort((a,b)=>b.score-a.score);
    $('#demo-period').textContent=`Escenario ${scenario.id.slice(0,8)} · Creado ${new Date(scenario.generatedAt).toLocaleString('es-PE',{timeZone:'America/Lima'})} (hora de Perú) · Horizonte ilustrativo: 24 horas`;
    $('#demo-summary').innerHTML=['Alto','Medio','Bajo'].map(level=>`<article class="kpi-card"><h4>Nivel ${level.toLowerCase()} simulado</h4><strong>${scenario.districts.filter(r=>r.level===level).length}</strong><small>Distritos de este escenario ficticio</small></article>`).join('');
    $('#demo-cards').innerHTML=rows.map(row=>`<article class="operation-card"><small>SIMULACIÓN · UBIGEO ${escape(row.ubigeo)}</small><h3>${escape(row.name)}</h3><span class="badge ${row.level==='Alto'?'alert':row.level==='Medio'?'warn':'good'}">${row.level} · ficticio</span><p><strong>${row.score}/100</strong> · Índice demostrativo</p><meter min="0" max="100" value="${row.score}" aria-label="Índice simulado de ${escape(row.name)}">${row.score}</meter><dl class="demo-weather"><dt>Temperatura simulada</dt><dd>${row.temperatureC} °C</dd><dt>Humedad simulada</dt><dd>${row.humidityPct} %</dd><dt>Lluvia simulada · 24 h</dt><dd>${row.rainMm} mm</dd><dt>Viento simulado</dt><dd>${row.windKmh} km/h</dd></dl><p>No representa probabilidad de incendio. ${row.level==='Alto'?'En una demostración, este distrito aparecería primero para revisión.':'Escenario de ejemplo para probar la visualización.'}</p></article>`).join('')||'<p class="empty-state">No hay distritos de ese nivel en este escenario. Puedes generar otro.</p>';
    $('#demo-history').innerHTML=history.map(item=>`<option value="${escape(item.id)}" ${item.id===scenario.id?'selected':''}>${escape(item.profile)} · ${escape(new Date(item.generatedAt).toLocaleString('es-PE',{timeZone:'America/Lima'}))} · ${escape(item.id.slice(0,8))}</option>`).join('');
    $('#demo-count').textContent=`${rows.length} de 9 distritos · Niveles arbitrarios: bajo 0–39, medio 40–69, alto 70–100.`;
  }
  function download() {
    const blob=new Blob([JSON.stringify(scenario,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download=`SIMULACION-satipo-${scenario.id}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    $('#demo-status').textContent='Escenario exportado e identificado como SIMULATION_ONLY. No contiene predicciones reales.';
  }
  function init(element) {
    root=element;
    root.innerHTML=`<div class="reading-heading"><div><p class="eyebrow">DEMOSTRACIÓN TERRITORIAL</p><h2>Escenarios por distrito</h2></div><span class="badge warn">SIMULACIÓN · DATOS FICTICIOS</span></div>
    <p class="reference-note"><strong>Condiciones e índices ficticios, coherentes entre sí.</strong> Sirven para demostrar el funcionamiento del panel. No proceden del modelo, de NASA ni de sensores; no anuncian incendios reales. Los nombres de los distritos sí corresponden a Satipo. El índice usa una regla ilustrativa: aumenta con calor, sequedad y viento, y disminuye con lluvia. No está validada para pronosticar incendios.</p>
    <p id="demo-period"></p><div id="demo-summary" class="kpis-grid"></div>
    <div class="reading-toolbar"><label for="demo-profile">Escenario a generar</label><select id="demo-profile"><option>Variable</option><option>Seco</option><option>Lluvioso</option></select><label for="demo-filter">Nivel simulado</label><select id="demo-filter"><option>Todos</option><option>Alto</option><option>Medio</option><option>Bajo</option></select><button type="button" id="demo-generate" class="secondary-button">Generar otro escenario</button><button type="button" id="demo-download" class="secondary-button">Exportar simulación</button></div>
    <div class="reading-toolbar"><label for="demo-history">Historial local · últimos 10 escenarios</label><select id="demo-history"></select></div><output id="demo-status" class="operations-status" aria-live="polite"></output><p id="demo-count"></p><div id="demo-cards" class="operation-cards"></div>`;
    $('#demo-filter').addEventListener('change',render);
    $('#demo-generate').addEventListener('click',generate);
    $('#demo-download').addEventListener('click',download);
    $('#demo-history').addEventListener('change',()=>{
      scenario=history.find(item=>item.id===$('#demo-history').value);render();
      $('#demo-status').textContent='Escenario anterior recuperado del navegador. Conserva su fecha original; no representa condiciones actuales.';
    });
    try {
      const saved=JSON.parse(localStorage.getItem(historyKey())||'[]');
      if(Array.isArray(saved))history=saved.filter(item=>item.version===2&&item.type==='SIMULATION_ONLY'&&typeof item.id==='string'&&Number.isFinite(Date.parse(item.generatedAt))&&['Seco','Variable','Lluvioso'].includes(item.profile)&&Array.isArray(item.districts)&&item.districts.length===9&&new Set(item.districts.map(r=>r.ubigeo)).size===9&&item.districts.every(r=>districts.some(d=>d.ubigeo===r.ubigeo)&&['score','temperatureC','humidityPct','rainMm','windKmh'].every(k=>Number.isFinite(r[k]))&&r.score>=0&&r.score<=100&&['Alto','Medio','Bajo'].includes(r.level))).slice(0,10);
    } catch {history=[];}
    if(history.length){scenario=history[0];render();$('#demo-status').textContent='Último escenario simulado recuperado del historial local.';}else generate();
  }
  return {init};
})();
