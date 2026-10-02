/* Resultados publicados del modelo experimental. Acceso mediante API administrativa. */
window.SatipoPredictions = (() => {
  let root, data=null, page=0;
  const $=selector=>root.querySelector(selector);
  const esc=value=>window.SatipoBackend.escapeHTML(String(value));
  function render() {
    if(!data)return;
    const all=data.rows, correct=all.filter(r=>r.actual===r.predicted).length;
    const fn=all.filter(r=>r.actual&&!r.predicted).length,fp=all.filter(r=>!r.actual&&r.predicted).length;
    $('#prediction-summary').innerHTML=[['Exactitud',`${(correct/all.length*100).toFixed(1)} %`,`${correct} de ${all.length} aciertos`],['Alarmas omitidas',fn,'Falsos negativos'],['Alarmas incorrectas',fp,'Falsos positivos']].map(([title,value,note])=>`<article class="kpi-card"><h4>${title}</h4><strong>${value}</strong><small>${note}</small></article>`).join('');
    const filter=$('#prediction-filter').value;
    const rows=all.filter(r=>filter==='all'||(filter==='errors'&&r.actual!==r.predicted)||(filter==='alarm'&&r.predicted)||(filter==='clear'&&!r.predicted));
    page=Math.min(page,Math.max(0,Math.ceil(rows.length/15)-1));
    $('#prediction-rows').innerHTML=rows.slice(page*15,page*15+15).map(r=>`<tr><td>${r.source_row}</td><td>${esc(new Date(r.recorded_at).toLocaleString('es-PE',{timeZone:'UTC'}))} UTC</td><td>${r.actual?'Alarma':'Sin alarma'}</td><td><span class="badge ${r.predicted?'warn':'good'}">${r.predicted?'Alarma':'Sin alarma'}</span></td><td>${r.score.toFixed(3)}</td><td>${r.actual===r.predicted?'Acierto':r.actual?'Falso negativo':'Falso positivo'}</td></tr>`).join('')||'<tr><td colspan="6">Sin resultados para este filtro.</td></tr>';
    $('#prediction-position').textContent=`${rows.length} resultados · Página ${page+1} de ${Math.max(1,Math.ceil(rows.length/15))}`;
    $('#prediction-prev').disabled=page===0;$('#prediction-next').disabled=(page+1)*15>=rows.length;
    $('#prediction-version').textContent=`Versión: ${data.version} · Random Forest · 240 lecturas de entrenamiento / 60 de prueba`;
  }
  async function load() {
    data=null;$('#prediction-results').hidden=true;$('#prediction-refresh').disabled=true;
    $('#prediction-status').textContent='Consultando resultados…';
    try {
      data=await window.SatipoBackend.listPredictions();page=0;render();
      $('#prediction-results').hidden=false;
      $('#prediction-status').textContent='Evaluación publicada cargada. Actualizar consulta esta versión; no vuelve a entrenar el modelo.';
    } catch {
      $('#prediction-status').textContent='No se pudieron cargar resultados válidos. Comprueba tu sesión y conexión y vuelve a intentar.';
    } finally {$('#prediction-refresh').disabled=false;}
  }
  function init(element) {
    root=element;
    root.innerHTML=`<div class="reading-heading"><div><p class="eyebrow">INTELIGENCIA ARTIFICIAL · EVALUACIÓN</p><h2>Evaluación histórica de humo</h2></div><button type="button" id="prediction-refresh" class="secondary-button">Actualizar resultados</button></div>
    <p class="reference-note">Clasificación histórica experimental de Smoke Detection IoT. Estas 60 lecturas se reservaron para prueba y no se usaron para entrenar. No son alertas actuales ni pronósticos de incendios en Satipo. El puntaje de alarma (0–1) no es una probabilidad calibrada.</p>
    <output id="prediction-status" class="operations-status" aria-live="polite"></output>
    <div id="prediction-results" hidden><p id="prediction-version"></p><div id="prediction-summary" class="kpis-grid"></div>
    <div class="reading-toolbar"><label for="prediction-filter">Mostrar resultados</label><select id="prediction-filter"><option value="all">Todos</option><option value="errors">Errores del modelo</option><option value="alarm">Predicción: alarma</option><option value="clear">Predicción: sin alarma</option></select></div>
    <div class="readings-scroll" tabindex="0" role="region" aria-label="Tabla de predicciones con desplazamiento horizontal"><table><caption>Etiqueta real frente al resultado del modelo · fecha de la lectura original</caption><thead><tr><th scope="col">Fila de origen</th><th scope="col">Fecha histórica</th><th scope="col">Etiqueta real</th><th scope="col">Predicción</th><th scope="col">Puntaje de alarma</th><th scope="col">Evaluación</th></tr></thead><tbody id="prediction-rows"></tbody></table></div>
    <div class="dataset-controls"><button type="button" id="prediction-prev" class="secondary-button">Anterior</button><output id="prediction-position" aria-live="polite"></output><button type="button" id="prediction-next" class="secondary-button">Siguiente</button></div></div>`;
    $('#prediction-refresh').addEventListener('click',load);
    $('#prediction-filter').addEventListener('change',()=>{page=0;render();});
    $('#prediction-prev').addEventListener('click',()=>{page--;render();});
    $('#prediction-next').addEventListener('click',()=>{page++;render();});
    return load();
  }
  return {init};
})();
