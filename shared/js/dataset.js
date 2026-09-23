/* Explorador del CSV: mantiene unidades originales, sin mezclarlo con nodos locales. */
window.SatipoDataset = (() => {
  let readings = [], index = 0;
  async function init(container) {
    if (!container) return;
    const Backend = window.SatipoBackend;
    await Backend.ready;
    if (Backend.cloud) readings = Backend.check(await Backend.client.from('smoke_readings').select('*').eq('dataset_id','smoke-detection-iot-300-v1').order('source_row').limit(300));
    else {
      const response = await fetch('../data/smoke_detection_300.json');
      if (!response.ok) throw new Error('No se pudo leer la muestra histórica.');
      readings = await response.json();
    }
    container.innerHTML = '<h3>Datos históricos · Smoke Detection IoT</h3><p>Registros de prueba externos. La etiqueta «alarma» pertenece al dataset; no es una predicción del aplicativo ni una alerta actual en Satipo.</p><p id="dataset-summary"></p><label for="dataset-filter">Etiqueta original</label> <select id="dataset-filter"><option value="all">Todas</option><option value="1">Con alarma</option><option value="0">Sin alarma</option></select><div id="dataset-reading"></div><div class="dataset-controls"><button type="button" id="dataset-prev">Anterior</button><span id="dataset-position"></span><button type="button" id="dataset-next">Siguiente</button></div>';
    document.querySelector('#dataset-summary').textContent = `${readings.length} registros · ${readings.filter(r=>r.fire_alarm).length} con alarma · fuente: ${Backend.cloud?'Supabase':'archivo local de demostración'}`;
    let filtered = readings;
    function render() {
      const row = filtered[index];
      document.querySelector('#dataset-position').textContent = filtered.length ? `${index+1} / ${filtered.length}` : '0 / 0';
      document.querySelector('#dataset-prev').disabled = index===0;
      document.querySelector('#dataset-next').disabled = index>=filtered.length-1;
      const el = document.querySelector('#dataset-reading');
      if (!row) { el.textContent='No hay registros. Importa la muestra de 300 filas.';return; }
      const values = [['Fila original',row.source_row],['Fecha UTC',new Date(row.recorded_at).toISOString()],['Temperatura',`${row.temperature_c} °C`],['Humedad',`${row.humidity_pct} %`],['TVOC',`${row.tvoc_ppb} ppb`],['eCO₂',`${row.eco2_ppm} ppm`],['Presión',`${row.pressure_hpa} hPa`],['PM1.0',row.pm1_0],['PM2.5',row.pm2_5],['Raw H2',row.raw_h2],['Raw Ethanol',row.raw_ethanol],['NC0.5',row.nc0_5],['NC1.0',row.nc1_0],['NC2.5',row.nc2_5],['CNT',row.cnt],['Fire Alarm',row.fire_alarm?'1 · Con alarma':'0 · Sin alarma']];
      el.replaceChildren();
      const dl=document.createElement('dl');dl.className='dataset-values';
      values.forEach(([label,value])=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=String(value);dl.append(dt,dd);});el.append(dl);
    }
    document.querySelector('#dataset-filter').onchange=e=>{filtered=readings.filter(r=>e.target.value==='all'||Number(r.fire_alarm)===Number(e.target.value));index=0;render();};
    document.querySelector('#dataset-prev').onclick=()=>{index=Math.max(0,index-1);render();};
    document.querySelector('#dataset-next').onclick=()=>{index=Math.min(filtered.length-1,index+1);render();};
    render();
  }
  return {init};
})();
