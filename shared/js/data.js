/**
 * Capa de datos compartida entre mobile/ y web/.
 * Carga el modelo exportado desde Google Colab (shared/models/satipo_umbrales.json)
 * con validación, fallbacks y precedencia:
 * localStorage (operador) > modelo Colab > defaults embebidos.
 */
window.SatipoData = (() => {
  const Backend = window.SatipoBackend;
  let remoteReports = [], remoteIncidents = [], remoteThresholds = null;
  const severityLabels = { low: 'Baja: humo lejano', medium: 'Media: fuego controlable', high: 'Alta: amenaza a viviendas o chacras' };
  const STORAGE = {
    reports: "satipo-reports",
    incidents: "satipo-incidents",
    temp: "satipo-temp-threshold",
    smoke: "satipo-smoke-threshold",
    humidity: "satipo-humidity-threshold",
    wind: "satipo-wind-threshold"
  };

  const defaultThresholds = {
    tempCritical: 39,
    smokeCritical: 65,
    humidityDry: 38,
    windRisk: 18
  };

  const defaultWeights = {
    temp: 30,
    smoke: 34,
    humidity: 18,
    wind: 14,
    recencyMax: 4,
    recencyMin: 1,
    recencyFreshMinutes: 5
  };

  const defaultBands = {
    critical: 76,
    watch: 55
  };

  const modelMeta = {
    loaded: false,
    ok: false,
    source: "defaults",
    modelId: "satipo-risk-defaults",
    version: "0.0.0",
    exportedAt: null,
    notes: "Defaults locales (modelo Colab no cargado).",
    error: null
  };

  let activeWeights = { ...defaultWeights };
  let activeBands = { ...defaultBands };
  let colabThresholds = { ...defaultThresholds };

  const sensors = [
    { id: "N-01", zone: "Satipo Sur", community: "San Francisco", type: "Sensor multimodal", temp: 38.6, smoke: 72, humidity: 31, wind: 21, battery: 86, lastComm: 2, rssi: -89, x: 64, y: 44 },
    { id: "N-02", zone: "Mazamari", community: "Los Pinos", type: "Gateway LoRa", temp: 33.2, smoke: 48, humidity: 42, wind: 17, battery: 78, lastComm: 4, rssi: -92, x: 38, y: 54 },
    { id: "N-03", zone: "Pangoa", community: "Micaela", type: "Sensor multimodal", temp: 34.8, smoke: 55, humidity: 36, wind: 16, battery: 62, lastComm: 6, rssi: -96, x: 73, y: 68 },
    { id: "N-04", zone: "Río Tambo", community: "Puerto Prado", type: "Sensor multimodal", temp: 30.4, smoke: 29, humidity: 58, wind: 12, battery: 91, lastComm: 3, rssi: -84, x: 28, y: 28 },
    { id: "N-05", zone: "Coviriali", community: "Bajo Tziriari", type: "Sensor multimodal", temp: 29.7, smoke: 25, humidity: 61, wind: 9, battery: 94, lastComm: 2, rssi: -81, x: 50, y: 31 },
    { id: "N-06", zone: "Pampa Hermosa", community: "Santa Rosa", type: "Sensor multimodal", temp: 35.1, smoke: 51, humidity: 34, wind: 19, battery: 53, lastComm: 9, rssi: -101, x: 55, y: 72 },
    { id: "N-07", zone: "Llaylla", community: "Alto Kiatari", type: "Sensor multimodal", temp: 28.9, smoke: 19, humidity: 64, wind: 8, battery: 88, lastComm: 5, rssi: -86, x: 19, y: 62 },
    { id: "N-08", zone: "San Martín de Pangoa", community: "Kivinaki", type: "Repetidor solar", temp: 31.6, smoke: 33, humidity: 49, wind: 13, battery: 69, lastComm: 12, rssi: -107, x: 82, y: 30 }
  ];

  const alerts = [
    { id: "A-1042", date: "Hoy 08:42", zone: "Satipo Sur", title: "Humo y subida térmica sostenida", score: 88, state: "critical", eta: "Patrulla sugerida: 12 min" },
    { id: "A-1041", date: "Hoy 08:10", zone: "Pampa Hermosa", title: "Viento acelera en zona seca", score: 63, state: "watch", eta: "Seguimiento automático" },
    { id: "A-1040", date: "Ayer 17:35", zone: "Pangoa", title: "Humo intermitente validado por comunidad", score: 71, state: "critical", eta: "Cerrado por lluvia local" },
    { id: "A-1039", date: "Ayer 10:15", zone: "Mazamari", title: "Quema agrícola reportada", score: 44, state: "resolved", eta: "Falso positivo confirmado" },
    { id: "A-1038", date: "Hace 2 días", zone: "Río Tambo", title: "Sensor sin anomalías", score: 22, state: "resolved", eta: "Sin acción requerida" }
  ];

  const defaultIncidents = [
    { id: "INC-442", date: "2026-09-04 08:42", zone: "Satipo Sur", type: "Humo + calor", nodes: ["N-01", "N-03"], risk: 88, state: "Nuevo", owner: "Operador 1" },
    { id: "INC-441", date: "2026-09-04 08:10", zone: "Pampa Hermosa", type: "Viento en zona seca", nodes: ["N-06"], risk: 63, state: "En revisión", owner: "Brigada Norte" },
    { id: "INC-440", date: "2026-09-03 17:35", zone: "Pangoa", type: "Reporte comunitario", nodes: ["N-03"], risk: 71, state: "Validado", owner: "Defensa Civil" },
    { id: "INC-439", date: "2026-09-03 10:15", zone: "Mazamari", type: "Quema agrícola", nodes: ["N-02"], risk: 44, state: "Falso positivo", owner: "Serenazgo" }
  ];

  const maintenance = [
    { node: "N-06", task: "Revisar batería y panel", priority: "Alta", assigned: "Carlos", state: "Pendiente", due: "Hoy" },
    { node: "N-08", task: "Elevar antena repetidora", priority: "Media", assigned: "Ana", state: "En progreso", due: "Mañana" },
    { node: "N-03", task: "Calibrar MQ-2 y DHT22", priority: "Media", assigned: "Pedro", state: "Pendiente", due: "05 sep" },
    { node: "N-05", task: "Limpieza preventiva", priority: "Baja", assigned: "Rosa", state: "Completada", due: "Ayer" }
  ];

  const riskTrend = [32, 38, 41, 49, 58, 63, 70, 76, 82, 88];

  const toPositiveNumber = (value, fallback) => {
    const num = Number(value);
    return Number.isFinite(num) && num > 0 ? num : fallback;
  };

  const readStoredNumber = (key, fallback) => {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === "") return fallback;
    return toPositiveNumber(raw, fallback);
  };

  const resolveModelUrl = () => {
    try {
      if (document.currentScript?.src) {
        return new URL("../models/satipo_umbrales.json", document.currentScript.src).href;
      }
    } catch {
      // continue
    }
    return new URL("../shared/models/satipo_umbrales.json", window.location.href).href;
  };

  const validateModel = (payload) => {
    if (!payload || typeof payload !== "object") {
      throw new Error("JSON vacío o inválido");
    }

    const thresholds = payload.thresholds || {};
    const weights = payload.weights || {};
    const bands = payload.bands || {};

    const nextThresholds = {
      tempCritical: toPositiveNumber(thresholds.tempCritical, defaultThresholds.tempCritical),
      smokeCritical: toPositiveNumber(thresholds.smokeCritical, defaultThresholds.smokeCritical),
      humidityDry: toPositiveNumber(thresholds.humidityDry, defaultThresholds.humidityDry),
      windRisk: toPositiveNumber(thresholds.windRisk, defaultThresholds.windRisk)
    };

    const nextWeights = {
      temp: toPositiveNumber(weights.temp, defaultWeights.temp),
      smoke: toPositiveNumber(weights.smoke, defaultWeights.smoke),
      humidity: toPositiveNumber(weights.humidity, defaultWeights.humidity),
      wind: toPositiveNumber(weights.wind, defaultWeights.wind),
      recencyMax: toPositiveNumber(weights.recencyMax, defaultWeights.recencyMax),
      recencyMin: toPositiveNumber(weights.recencyMin, defaultWeights.recencyMin),
      recencyFreshMinutes: toPositiveNumber(weights.recencyFreshMinutes, defaultWeights.recencyFreshMinutes)
    };

    const nextBands = {
      critical: toPositiveNumber(bands.critical, defaultBands.critical),
      watch: toPositiveNumber(bands.watch, defaultBands.watch)
    };

    if (nextBands.watch >= nextBands.critical) {
      throw new Error("bands.watch debe ser menor que bands.critical");
    }

    // Prueba de scoring con un sensor sintético para detectar NaN
    const probe = calculateRiskWith(
      { temp: 30, smoke: 40, humidity: 50, wind: 10, lastComm: 3 },
      nextThresholds,
      nextWeights
    );
    if (!Number.isFinite(probe)) {
      throw new Error("El scoring del modelo produjo un valor no numérico");
    }

    return {
      thresholds: nextThresholds,
      weights: nextWeights,
      bands: nextBands,
      modelId: String(payload.modelId || "satipo-risk-v1"),
      version: String(payload.schemaVersion || "1.0.0"),
      source: String(payload.source || "google-colab"),
      exportedAt: payload.exportedAt || null,
      notes: String(payload.notes || "Modelo Colab cargado.")
    };
  };

  const calculateRiskWith = (sensor, thresholds, weights) => {
    const lastSeen = sensor.lastComm ?? sensor.lastSeen ?? 99;
    const temp = Math.min(sensor.temp / thresholds.tempCritical, 1) * weights.temp;
    const smoke = Math.min(sensor.smoke / thresholds.smokeCritical, 1) * weights.smoke;
    const dryness = Math.max((thresholds.humidityDry - sensor.humidity) / thresholds.humidityDry, 0) * weights.humidity;
    const wind = Math.min(sensor.wind / thresholds.windRisk, 1) * weights.wind;
    const recency = lastSeen <= weights.recencyFreshMinutes ? weights.recencyMax : weights.recencyMin;
    return Math.round(temp + smoke + dryness + wind + recency);
  };

  const loadThresholds = () => remoteThresholds || ({
    tempCritical: readStoredNumber(STORAGE.temp, colabThresholds.tempCritical),
    smokeCritical: readStoredNumber(STORAGE.smoke, colabThresholds.smokeCritical),
    humidityDry: readStoredNumber(STORAGE.humidity, colabThresholds.humidityDry),
    windRisk: readStoredNumber(STORAGE.wind, colabThresholds.windRisk)
  });

  const saveThresholds = async (thresholds) => {
    if (Backend.cloud) {
      await Backend.api('/settings',{method:'PATCH',body:{temp_critical:thresholds.tempCritical,smoke_critical:thresholds.smokeCritical,humidity_dry:thresholds.humidityDry,wind_risk:thresholds.windRisk}});
      remoteThresholds = {...thresholds};
      return;
    }
    localStorage.setItem(STORAGE.temp, String(thresholds.tempCritical));
    localStorage.setItem(STORAGE.smoke, String(thresholds.smokeCritical));
    localStorage.setItem(STORAGE.humidity, String(thresholds.humidityDry));
    localStorage.setItem(STORAGE.wind, String(thresholds.windRisk));
  };

  const clearThresholdOverrides = async () => {
    if (Backend.cloud) return saveThresholds(colabThresholds);
    localStorage.removeItem(STORAGE.temp);
    localStorage.removeItem(STORAGE.smoke);
    localStorage.removeItem(STORAGE.humidity);
    localStorage.removeItem(STORAGE.wind);
  };

  const hasLocalOverrides = () =>
    [STORAGE.temp, STORAGE.smoke, STORAGE.humidity, STORAGE.wind]
      .some((key) => localStorage.getItem(key) !== null);

  const calculateRisk = (sensor, thresholds = loadThresholds()) =>
    calculateRiskWith(sensor, thresholds, activeWeights);

  const classifyRisk = (score) => {
    if (score >= activeBands.critical) {
      return {
        text: "Crítico",
        label: "Riesgo crítico",
        className: "alert",
        key: "danger",
        point: "danger",
        detail: "Activar verificación comunitaria y ruta de respuesta."
      };
    }
    if (score >= activeBands.watch) {
      return {
        text: "Vigilancia",
        label: "Vigilancia alta",
        className: "warn",
        key: "warning",
        point: "warning",
        detail: "Mantener observación, confirmar con reportes locales."
      };
    }
    return {
      text: "Normal",
      label: "Estable",
      className: "good",
      key: "safe",
      point: "safe",
      detail: "Sin señales críticas en la red cercana."
    };
  };

  const enrichedSensors = (thresholds = loadThresholds()) =>
    sensors.map((sensor) => ({
      ...sensor,
      lastSeen: sensor.lastComm,
      risk: calculateRisk(sensor, thresholds)
    }));

  const getModelInfo = () => ({
    ...modelMeta,
    thresholds: { ...colabThresholds },
    weights: { ...activeWeights },
    bands: { ...activeBands },
    effectiveThresholds: loadThresholds(),
    hasLocalOverrides: hasLocalOverrides()
  });

  const readReports = () => {
    if (Backend.cloud) return remoteReports;
    try {
      return JSON.parse(localStorage.getItem(STORAGE.reports) || "[]");
    } catch {
      return [];
    }
  };

  const saveReports = (reports) => {
    if (Backend.cloud) throw new Error('Usa createReport para escribir en Supabase.');
    localStorage.setItem(STORAGE.reports, JSON.stringify(reports.slice(0, 20)));
  };

  const readIncidents = () => {
    if (Backend.cloud) return remoteIncidents;
    const stored = localStorage.getItem(STORAGE.incidents);
    if (!stored) return [...defaultIncidents];
    try {
      return JSON.parse(stored);
    } catch {
      return [...defaultIncidents];
    }
  };

  const saveIncidents = (incidents) => {
    if (Backend.cloud) throw new Error('Usa updateIncident para escribir en Supabase.');
    localStorage.setItem(STORAGE.incidents, JSON.stringify(incidents));
  };

  const applyValidatedModel = (validated) => {
    colabThresholds = validated.thresholds;
    activeWeights = validated.weights;
    activeBands = validated.bands;
    modelMeta.ok = true;
    modelMeta.source = validated.source;
    modelMeta.modelId = validated.modelId;
    modelMeta.version = validated.version;
    modelMeta.exportedAt = validated.exportedAt;
    modelMeta.notes = validated.notes;
    modelMeta.error = null;
  };

  const initModel = async () => {
    const url = resolveModelUrl();
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} al cargar ${url}`);
      }
      const payload = await response.json();
      const validated = validateModel(payload);
      applyValidatedModel(validated);
    } catch (error) {
      modelMeta.ok = false;
      modelMeta.source = "defaults";
      modelMeta.modelId = "satipo-risk-defaults";
      modelMeta.version = "0.0.0";
      modelMeta.notes = "Usando defaults locales. El JSON de Colab no se pudo cargar.";
      modelMeta.error = error?.message || String(error);
      colabThresholds = { ...defaultThresholds };
      activeWeights = { ...defaultWeights };
      activeBands = { ...defaultBands };
      console.warn("[SatipoData] Modelo Colab no disponible:", modelMeta.error);
    } finally {
      modelMeta.loaded = true;
    }
    return getModelInfo();
  };

  const refresh = async () => {
    if (!Backend.cloud) return;
    const {reports,incidents,settings} = await Backend.api('/activity');
    remoteReports = reports.map(r=>({...r,type:r.observation,createdAt:r.created_at,severityLabel:severityLabels[r.severity]}));
    remoteIncidents = incidents.map(r=>({...r,date:new Date(r.created_at).toLocaleString('es-PE'),zone:r.location,type:r.kind,nodes:[]}));
    remoteThresholds = {tempCritical:Number(settings.temp_critical),smokeCritical:Number(settings.smoke_critical),humidityDry:Number(settings.humidity_dry),windRisk:Number(settings.wind_risk)};
    alerts.splice(0,alerts.length,...incidents.map(r=>({id:r.id,title:r.kind,date:new Date(r.created_at).toLocaleString('es-PE'),zone:r.location,score:r.risk,state:['Validado','Falso positivo'].includes(r.state)?'resolved':r.risk>=76?'critical':'watch',eta:`Estado: ${r.state} · prioridad del reporte, no lectura de sensor`} )));
  };
  const createReport = async report => {
    if (!Backend.cloud) { saveReports([report,...readReports()]); return; }
    Backend.check(await Backend.client.from('reportes').insert({user_id:Backend.profile.id,location:report.location,observation:report.type,severity:report.severity,description:report.description,contact:report.contact,distance:report.distance}));
  };
  const updateIncident = async (id,state,previousState) => {
    if (!Backend.cloud) {saveIncidents(readIncidents().map(r=>r.id===id?{...r,state}:r));return;}
    await Backend.api(`/incidents/${encodeURIComponent(id)}`,{method:'PATCH',body:{state,expectedState:previousState}});
  };
  const requestHelp = async ({location,visible,safe,reference}) => {
    Backend.check(await Backend.client.rpc('request_help',{location_text:location,visible,safe,reference_known:reference}));
  };
  const ready = (async()=>{
    await Backend.ready;
    await initModel();
    if (Backend.cloud) { sensors.length=0; alerts.length=0; maintenance.length=0; }
  })();
  ready.catch(()=>{});

  return {
    STORAGE,
    sensors,
    alerts,
    maintenance,
    riskTrend,
    defaultThresholds,
    ready,
    initModel,
    getModelInfo,
    loadThresholds,
    saveThresholds,
    clearThresholdOverrides,
    hasLocalOverrides,
    calculateRisk,
    classifyRisk,
    enrichedSensors,
    readReports,
    saveReports,
    readIncidents,
    saveIncidents
    ,refresh,createReport,updateIncident,requestHelp
  };
})();
