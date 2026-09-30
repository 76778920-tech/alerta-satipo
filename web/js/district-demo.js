/* Demostración local: nunca escribe en Supabase ni ejecuta el modelo. */
window.SatipoDistrictDemo = (() => {
  const districts = [{"ubigeo": "120601", "name": "SATIPO"}, {"ubigeo": "120602", "name": "COVIRIALI"}, {"ubigeo": "120603", "name": "LLAYLLA"}, {"ubigeo": "120604", "name": "MAZAMARI"}, {"ubigeo": "120605", "name": "PAMPA HERMOSA"}, {"ubigeo": "120606", "name": "PANGOA"}, {"ubigeo": "120607", "name": "RIO NEGRO"}, {"ubigeo": "120608", "name": "RIO TAMBO"}, {"ubigeo": "120609", "name": "VIZCATAN DEL ENE"}];
  let root, scenario=null;
  const $=s=>root.querySelector(s);
  const escape=s=>window.SatipoBackend.escapeHTML(String(s));
  function generate() {
    const random=crypto.getRandomValues(new Uint32Array(districts.length));
    const now=new Date();
    scenario={type:'SIMULATION_ONLY',notice:'Datos ficticios aleatorios. No es un pronóstico ni una alerta real.',id:crypto.randomUUID(),generatedAt:now.toISOString(),endsAt:new Date(now.getTime()+86400000).toISOString(),horizonHours:24,
      districts:districts.map((district,i)=>{
        const score=Math.floor(random[i]/4294967296*101);
        return {...district,score,level:score>=70?'Alto':score>=40?'Medio':'Bajo'};
      })};
    render();
    $('#demo-status').textContent='Nuevo escenario ficticio generado. No se han creado incidentes ni notificaciones reales.';
  }
  function render() {
    const filter=$('#demo-filter').value;
    const rows=scenario.districts.filter(r=>filter==='Todos'||r.level===filter).sort((a,b)=>b.score-a.score);
    $('#demo-period').textContent=`Escenario ${scenario.id.slice(0,8)} · Creado ${new Date(scenario.generatedAt).toLocaleString('es-PE',{timeZone:'America/Lima'})} (hora de Perú) · Horizonte ilustrativo: 24 horas`;
    $('#demo-summary').innerHTML=['Alto','Medio','Bajo'].map(level=>`<article class="kpi-card"><h4>Nivel ${level.toLowerCase()} simulado</h4><strong>${scenario.districts.filter(r=>r.level===level).length}</strong><small>Distritos de este escenario ficticio</small></article>`).join('');
    $('#demo-cards').innerHTML=rows.map(row=>`<article class="operation-card"><small>SIMULACIÓN · UBIGEO ${escape(row.ubigeo)}</small><h3>${escape(row.name)}</h3><span class="badge ${row.level==='Alto'?'alert':row.level==='Medio'?'warn':'good'}">${row.level} · ficticio</span><p><strong>${row.score}/100</strong> · Índice aleatorio</p><meter min="0" max="100" value="${row.score}" aria-label="Índice simulado de ${escape(row.name)}">${row.score}</meter><p>No representa probabilidad de incendio. ${row.level==='Alto'?'En una demostración, este distrito aparecería primero para revisión.':'Escenario de ejemplo para probar la visualización.'}</p></article>`).join('')||'<p class="empty-state">No hay distritos de ese nivel en este escenario. Puedes generar otro.</p>';
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
    <p class="reference-note"><strong>Estos resultados son aleatorios.</strong> Sirven para demostrar el funcionamiento del panel. No proceden del modelo, de NASA ni de sensores; no anuncian incendios reales. Los nombres de los distritos sí corresponden a Satipo.</p>
    <p id="demo-period"></p><div id="demo-summary" class="kpis-grid"></div>
    <div class="reading-toolbar"><label for="demo-filter">Nivel simulado</label><select id="demo-filter"><option>Todos</option><option>Alto</option><option>Medio</option><option>Bajo</option></select><button type="button" id="demo-generate" class="secondary-button">Generar otro escenario</button><button type="button" id="demo-download" class="secondary-button">Exportar simulación</button></div>
    <output id="demo-status" class="operations-status" aria-live="polite"></output><p id="demo-count"></p><div id="demo-cards" class="operation-cards"></div>`;
    $('#demo-filter').addEventListener('change',render);
    $('#demo-generate').addEventListener('click',generate);
    $('#demo-download').addEventListener('click',download);
    generate();
  }
  return {init};
})();
