/* Estado explícito del pronóstico territorial: no fabrica resultados de un modelo inexistente. */
window.SatipoForecast = (()=>{
  const districts=[{"id": "120601", "name": "SATIPO"}, {"id": "120602", "name": "COVIRIALI"}, {"id": "120603", "name": "LLAYLLA"}, {"id": "120604", "name": "MAZAMARI"}, {"id": "120605", "name": "PAMPA HERMOSA"}, {"id": "120606", "name": "PANGOA"}, {"id": "120607", "name": "RIO NEGRO"}, {"id": "120608", "name": "RIO TAMBO"}, {"id": "120609", "name": "VIZCATAN DEL ENE"}];
  function init(root){
    const esc=window.SatipoBackend.escapeHTML;
    root.innerHTML=`<div class="reading-heading"><div><p class="eyebrow">RIESGO FUTURO POR DISTRITO</p><h2>Pronóstico territorial</h2></div><span class="badge warn">Modelo pendiente de validación</span></div>
    <p class="reference-note">Esta sección está destinada a estimar riesgo de incendio futuro. Todavía no hay un modelo territorial validado ni pronósticos publicados. Las clasificaciones históricas de humo y los escenarios ficticios se consultan en sus secciones respectivas.</p>
    <div class="reading-toolbar"><label for="forecast-district">Distrito</label><select id="forecast-district"><option value="all">Todos los distritos</option>${districts.map(d=>`<option value="${d.id}">${esc(d.name)}</option>`).join('')}</select><label for="forecast-horizon">Horizonte a consultar</label><select id="forecast-horizon"><option value="1">Próximas 24 horas</option><option value="7">Próximos 7 días</option><option value="30">Próximos 30 días</option></select></div>
    <output id="forecast-status" class="operations-status" aria-live="polite"></output>
    <div id="forecast-cards" class="operation-cards"></div>
    <h3>Qué falta para publicar resultados</h3><p>Historial de incendios verificados, cobertura de periodos sin eventos, variables disponibles al emitir el pronóstico y validación independiente. Cada horizonte necesita evaluación propia; no se extrapola una clasificación de humo a semanas o meses.</p>
    <div class="reading-toolbar"><button type="button" id="forecast-demo" class="secondary-button">Abrir simulación ficticia de 24 h</button><button type="button" id="forecast-evaluation" class="secondary-button">Ver evaluación histórica de humo</button></div>`;
    const render=()=>{
      const days=Number(root.querySelector('#forecast-horizon').value);
      const selected=root.querySelector('#forecast-district').value;
      const rows=districts.filter(d=>selected==='all'||d.id===selected);
      root.querySelector('#forecast-status').textContent=`${rows.length} distrito(s) · Horizonte solicitado: ${days===1?'24 horas':days+' días'} · Sin pronósticos publicados. Ausencia de resultado no significa riesgo bajo.`;
      root.querySelector('#forecast-cards').innerHTML=rows.map(d=>`<article class="operation-card"><small>UBIGEO ${d.id}</small><h3>${esc(d.name)}</h3><span class="badge warn">Sin estimación disponible</span><p>Riesgo: no calculado</p><p>Horizonte solicitado: ${days===1?'24 horas':days+' días'}</p><p>Fecha de emisión y versión del modelo: no disponibles.</p></article>`).join('');
    };
    root.querySelector('#forecast-district').addEventListener('change',render);
    root.querySelector('#forecast-horizon').addEventListener('change',render);
    root.querySelector('#forecast-demo').addEventListener('click',()=>document.querySelector('[data-view="district-demo"]').click());
    root.querySelector('#forecast-evaluation').addEventListener('click',()=>document.querySelector('[data-view="predictions"]').click());
    render();
  }
  return {init};
})();
