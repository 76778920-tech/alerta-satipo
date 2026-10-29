/* Presentación: catálogo documental y exportaciones del módulo de adquisición API. */
window.SatipoProjectView=(()=>{
  function init(root) {
    const service=window.SatipoProject,c=service.catalog,esc=window.SatipoBackend.escapeHTML;
    root.innerHTML=`<p class="eyebrow">INFORME · 22 OCT 2026</p><h2>Requisitos y adquisición por API</h2>
      <p class="reference-note">${esc(c.adaptation)} Ningún requisito se considera aceptado solo por aparecer en este catálogo.</p>
      <div class="kpis-grid"><article class="kpi-card"><h4>Funcionales</h4><strong>15</strong></article><article class="kpi-card"><h4>Calidad</h4><strong>16</strong></article><article class="kpi-card"><h4>Historias de usuario</h4><strong>18</strong></article><article class="kpi-card"><h4>Predicción</h4><strong>3</strong></article></div>
      <div class="reading-toolbar"><label>Tipo <select id="project-type"><option value="">Todos</option><option>RF</option><option>RNF</option><option>HU</option><option>RP</option></select></label>
      <label>Estado <select id="project-status"><option value="">Todos</option><option>Pendiente</option><option>Parcial</option><option>Adaptado</option></select></label>
      <label>Buscar <input id="project-query" type="search" placeholder="ID o función"></label><button id="project-export" class="secondary-button">Exportar trazabilidad</button></div>
      <p id="project-count" role="status"></p><div class="readings-scroll" tabindex="0" role="region" aria-label="Requisitos y evidencias"><table><thead><tr><th>ID / fuente</th><th>Función</th><th>Estado</th><th>Evidencia y brecha</th></tr></thead><tbody id="project-rows"></tbody></table></div>
      <h3>Evaluaciones de IA: dos experimentos diferentes</h3>
      <p>${esc(c.experiments.report.provenance)} El panel de evaluación de humo conserva el experimento de 300 registros (240 entrenamiento, 60 prueba).</p>
      <div class="readings-scroll" tabindex="0" role="region" aria-label="Métricas declaradas en el informe"><table><caption>PoC declarada: 62 630 registros · 9 variables · partición aleatoria</caption><thead><tr><th>Modelo</th><th>Exactitud</th><th>F1 macro</th><th>Recall alarma</th></tr></thead><tbody>${c.experiments.report.models.map(m=>`<tr><td>${esc(m.name)}</td><td>${m.accuracy}</td><td>${m.f1_macro}</td><td>${m.recall_alarm}</td></tr>`).join('')}</tbody></table></div>
      <p>Random Forest temporal: F1 macro 0,6869 y recall 0,8465. Con ruido simulado del 2 %: F1 macro 0,8351. Latencia reportada en Colab: 45,965 ms; no es una medición en hardware de campo.</p>
      <h3>Historial adquirido por API</h3><p>Importa el JSON exportado por el módulo local. La vista conserva los datos solo mientras está abierta; SQLite mantiene el historial en tu equipo. No consulta todavía un proveedor ni envía avisos.</p>
      <label for="acquisition-file">Exportación JSON (máximo 10 MB)</label> <input id="acquisition-file" type="file" accept="application/json,.json">
      <p id="acquisition-status" role="status">Sin exportación cargada.</p>
      <div class="readings-scroll" tabindex="0" role="region" aria-label="Historial API"><table><thead><tr><th>Fuente / nodo</th><th>Fecha UTC</th><th>Tipo / valores</th><th>Evaluación</th></tr></thead><tbody id="acquisition-rows"></tbody></table></div>
      <button id="acquisition-prev" class="secondary-button" disabled>Anterior</button> <button id="acquisition-next" class="secondary-button" disabled>Siguiente</button>
      <h3>Plan y aceptación</h3><p>16 semanas · 8 sprints · 43 actividades reportadas. Avance administrativo declarado: 37,5349 %. No equivale a aceptación funcional.</p>
      <ul>${c.management.milestones.map(m=>`<li><strong>${esc(m.id)} · semanas ${esc(m.weeks)}</strong>: ${esc(m.scope)}</li>`).join('')}</ul>
      <h3>Riesgos a comprobar</h3><ul>${c.risks.map(r=>`<li>${esc(r)}</li>`).join('')}</ul>
      <h3>Evidencias pendientes</h3><ul>${c.missing_evidence.map(r=>`<li>${esc(r)}</li>`).join('')}</ul>`;
    const $=s=>root.querySelector(s);
    function renderRequirements(){
      const rows=service.requirements({type:$('#project-type').value,status:$('#project-status').value,query:$('#project-query').value});
      $('#project-count').textContent=`${rows.length} elementos · estados de implementación, no actas de aceptación`;
      $('#project-rows').innerHTML=rows.map(r=>`<tr><td>${esc(r.id)}<br>Pág. ${r.page}${r.pmv?` · ${esc(r.pmv)}`:''}</td><td>${esc(r.title)}</td><td>${esc(r.status)}</td><td>${esc(r.gap)}${r.evidence.map(path=>`<br><code>${esc(path)}</code>`).join('')}</td></tr>`).join('')||'<tr><td colspan="4">Sin coincidencias.</td></tr>';
    }
    let rows=[],page=0,revision=0;
    function renderReadings(){
      $('#acquisition-status').textContent=`${rows.length} lecturas · página ${page+1} de ${Math.max(1,Math.ceil(rows.length/15))}. Origen declarado en el archivo; no verificado con proveedor.`;
      $('#acquisition-rows').innerHTML=rows.slice(page*15,page*15+15).map(({reading:r,prediction:p})=>`<tr><td>${esc(r.source)} / ${esc(r.node_id)}</td><td>${esc(new Date(r.observed_at).toISOString())}</td><td>${esc(r.kind)}<br>${Object.entries(r.values).map(([k,v])=>`${esc(k)}: ${v} ${esc(r.units[k])}`).join('<br>')}</td><td>${p?`${p.alarm?'Alarma experimental':'Sin alarma experimental'} · puntaje ${p.score} · ${esc(p.model_version)}`:'Sin inferencia; no indica ausencia de riesgo'}</td></tr>`).join('');
      $('#acquisition-prev').disabled=page===0;$('#acquisition-next').disabled=(page+1)*15>=rows.length;
    }
    $('#acquisition-file').addEventListener('change',async event=>{
      const current=++revision;rows=[];page=0;renderReadings();
      try {const imported=await service.importReadings(event.target.files[0]);if(current!==revision)return;rows=imported;renderReadings();}
      catch {if(current===revision){$('#acquisition-status').textContent='Archivo inválido. Se requiere una exportación compatible del módulo API; no se conservaron resultados anteriores.';}}
    });
    $('#acquisition-prev').addEventListener('click',()=>{page--;renderReadings();});
    $('#acquisition-next').addEventListener('click',()=>{page++;renderReadings();});
    for(const id of ['project-type','project-status','project-query'])$('#'+id).addEventListener('input',renderRequirements);
    $('#project-export').addEventListener('click',()=>service.exportCatalog());
    renderRequirements();
  }
  return {init};
})();
