window.SatipoEnvironment=(()=>{
  function init(root) {
    const B=window.SatipoBackend,esc=B.escapeHTML;
    root.innerHTML=`<div class="reading-heading"><div><p class="eyebrow">FUENTES EXTERNAS · SATIPO</p><h2>Clima y focos satelitales</h2></div><button id="environment-refresh" class="secondary-button">Consultar fuentes</button></div>
      <p class="reference-note">Meteorología modelada y detecciones satelitales. No son sensores locales, pronósticos de incendio ni resultados del Random Forest de humo.</p>
      <p id="environment-status" role="status">Pulsa Consultar fuentes. La API utiliza una caché de 15 minutos para limitar solicitudes.</p>
      <div id="environment-results" hidden>
      <h3>Condiciones meteorológicas</h3><p id="weather-status"></p><p>Un punto interior por distrito; no es un promedio de todo su territorio. Fecha de cada dato en hora de Perú. — significa dato ausente.</p>
      <div class="readings-scroll" tabindex="0" role="region" aria-label="Meteorología por punto distrital"><table><thead><tr><th>Distrito / punto consultado</th><th>Fecha</th><th>Temperatura °C</th><th>Humedad %</th><th>Lluvia mm / intervalo</th><th>Viento km/h</th></tr></thead><tbody id="environment-weather"></tbody></table></div>
      <p>Datos meteorológicos de <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo</a> · atribución CC BY 4.0.</p>
      <h3>Detecciones de NASA FIRMS</h3><p id="fires-status" role="status"></p>
      <p id="fires-scope"></p><p>VIIRS NOAA-20 y NOAA-21 · hoy y ayer UTC. Las nubes, la cobertura y el paso satelital limitan la detección. Un foco térmico requiere revisión: no confirma un incendio forestal. Sin detecciones no significa ausencia de fuego.</p>
      <div class="readings-scroll" tabindex="0" role="region" aria-label="Detecciones satelitales"><table><thead><tr><th>Fecha (Perú)</th><th>Latitud</th><th>Longitud</th><th>Fuente</th><th>Confianza</th><th>Potencia MW</th></tr></thead><tbody id="environment-fires"></tbody></table></div>
      <div class="dataset-controls"><button id="fires-prev" class="secondary-button" disabled>Anterior</button><span id="fires-position"></span><button id="fires-next" class="secondary-button" disabled>Siguiente</button></div>
      <p>Fuente: <a href="https://firms.modaps.eosdis.nasa.gov/" target="_blank" rel="noopener noreferrer">NASA FIRMS</a>. La confianza de detección no es una probabilidad de incendio futuro.</p></div>`;
    const $=s=>root.querySelector(s),date=s=>new Date(s).toLocaleString('es-PE',{timeZone:'America/Lima'}),number=n=>n===null?'—':esc(String(n));
    let snapshot=null,page=0;
    function fires(){
      const rows=snapshot.fires.rows;
      $('#environment-fires').innerHTML=rows.slice(page*25,page*25+25).map(r=>`<tr><td>${esc(date(r.observed_at))}</td><td>${r.latitude}</td><td>${r.longitude}</td><td>${esc(r.source)}</td><td>${({l:'Baja',n:'Nominal',h:'Alta'})[r.confidence]}</td><td>${r.frp_mw}</td></tr>`).join('')||`<tr><td colspan="6">${snapshot.fires.status==='ok'?'Sin detecciones devueltas para esta área y período.':'Sin resultados completos disponibles.'}</td></tr>`;
      $('#fires-position').textContent=`${rows.length} detecciones recibidas · página ${page+1} de ${Math.max(1,Math.ceil(rows.length/25))}`;
      $('#fires-prev').disabled=page===0;$('#fires-next').disabled=(page+1)*25>=rows.length;
    }
    async function load(){
      snapshot=null;page=0;$('#environment-results').hidden=true;$('#environment-refresh').disabled=true;
      $('#environment-status').textContent='Consultando Open-Meteo y NASA FIRMS…';
      try {
        snapshot=await B.getEnvironment();
        $('#environment-status').textContent=`Consulta obtenida: ${date(snapshot.retrieved_at)} (Perú). ${snapshot.cached?'Respuesta en caché.':'Nueva consulta.'} Revisa el estado de cada fuente.`;
        $('#weather-status').textContent=snapshot.weather.status==='ok'?'Open-Meteo: datos cargados.':snapshot.weather.message||'Meteorología no disponible.';
        $('#environment-weather').innerHTML=snapshot.weather.rows.map(r=>`<tr><td>${esc(r.location.name)}<br>${r.location.latitude}, ${r.location.longitude}</td><td>${esc(date(r.observed_at))}</td><td>${number(r.values.temperature_c)}</td><td>${number(r.values.humidity_pct)}</td><td>${number(r.values.rain_mm)} / ${r.interval_seconds/60} min</td><td>${number(r.values.wind_kmh)}</td></tr>`).join('')||'<tr><td colspan="6">Sin datos meteorológicos disponibles.</td></tr>';
        $('#fires-status').textContent=snapshot.fires.status==='not_configured'?'NASA FIRMS pendiente: falta la MAP_KEY en el servidor.':`${snapshot.fires.status==='ok'?'FIRMS conectado':snapshot.fires.status==='partial'?'FIRMS parcial':'FIRMS no disponible'}. ${snapshot.fires.message||''}`;
        $('#fires-scope').textContent=snapshot.territory.scope;fires();$('#environment-results').hidden=false;
      }catch{$('#environment-status').textContent='No se pudo consultar la API administrativa. Revisa tu sesión y conexión; no se muestran resultados antiguos.';}
      finally{$('#environment-refresh').disabled=false;}
    }
    $('#environment-refresh').addEventListener('click',load);
    $('#fires-prev').addEventListener('click',()=>{page--;fires();});
    $('#fires-next').addEventListener('click',()=>{page++;fires();});
  }
  return {init};
})();
