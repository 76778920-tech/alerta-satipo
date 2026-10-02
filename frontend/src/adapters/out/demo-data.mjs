export const sensors = [
    { id: "N-01", zone: "Satipo Sur", community: "San Francisco", type: "Sensor multimodal", temp: 38.6, smoke: 72, humidity: 31, wind: 21, battery: 86, lastComm: 2, rssi: -89, x: 64, y: 44 },
    { id: "N-02", zone: "Mazamari", community: "Los Pinos", type: "Gateway LoRa", temp: 33.2, smoke: 48, humidity: 42, wind: 17, battery: 78, lastComm: 4, rssi: -92, x: 38, y: 54 },
    { id: "N-03", zone: "Pangoa", community: "Micaela", type: "Sensor multimodal", temp: 34.8, smoke: 55, humidity: 36, wind: 16, battery: 62, lastComm: 6, rssi: -96, x: 73, y: 68 },
    { id: "N-04", zone: "Río Tambo", community: "Puerto Prado", type: "Sensor multimodal", temp: 30.4, smoke: 29, humidity: 58, wind: 12, battery: 91, lastComm: 3, rssi: -84, x: 28, y: 28 },
    { id: "N-05", zone: "Coviriali", community: "Bajo Tziriari", type: "Sensor multimodal", temp: 29.7, smoke: 25, humidity: 61, wind: 9, battery: 94, lastComm: 2, rssi: -81, x: 50, y: 31 },
    { id: "N-06", zone: "Pampa Hermosa", community: "Santa Rosa", type: "Sensor multimodal", temp: 35.1, smoke: 51, humidity: 34, wind: 19, battery: 53, lastComm: 9, rssi: -101, x: 55, y: 72 },
    { id: "N-07", zone: "Llaylla", community: "Alto Kiatari", type: "Sensor multimodal", temp: 28.9, smoke: 19, humidity: 64, wind: 8, battery: 88, lastComm: 5, rssi: -86, x: 19, y: 62 },
    { id: "N-08", zone: "San Martín de Pangoa", community: "Kivinaki", type: "Repetidor solar", temp: 31.6, smoke: 33, humidity: 49, wind: 13, battery: 69, lastComm: 12, rssi: -107, x: 82, y: 30 }
  ];

export const alerts = [
    { id: "A-1042", date: "Hoy 08:42", zone: "Satipo Sur", title: "Humo y subida térmica sostenida", score: 88, state: "critical", eta: "Patrulla sugerida: 12 min" },
    { id: "A-1041", date: "Hoy 08:10", zone: "Pampa Hermosa", title: "Viento acelera en zona seca", score: 63, state: "watch", eta: "Seguimiento automático" },
    { id: "A-1040", date: "Ayer 17:35", zone: "Pangoa", title: "Humo intermitente validado por comunidad", score: 71, state: "critical", eta: "Cerrado por lluvia local" },
    { id: "A-1039", date: "Ayer 10:15", zone: "Mazamari", title: "Quema agrícola reportada", score: 44, state: "resolved", eta: "Falso positivo confirmado" },
    { id: "A-1038", date: "Hace 2 días", zone: "Río Tambo", title: "Sensor sin anomalías", score: 22, state: "resolved", eta: "Sin acción requerida" }
  ];

export const defaultIncidents = [
    { id: "INC-442", date: "2026-09-04 08:42", zone: "Satipo Sur", type: "Humo + calor", nodes: ["N-01", "N-03"], risk: 88, state: "Nuevo", owner: "Operador 1" },
    { id: "INC-441", date: "2026-09-04 08:10", zone: "Pampa Hermosa", type: "Viento en zona seca", nodes: ["N-06"], risk: 63, state: "En revisión", owner: "Brigada Norte" },
    { id: "INC-440", date: "2026-09-03 17:35", zone: "Pangoa", type: "Reporte comunitario", nodes: ["N-03"], risk: 71, state: "Validado", owner: "Defensa Civil" },
    { id: "INC-439", date: "2026-09-03 10:15", zone: "Mazamari", type: "Quema agrícola", nodes: ["N-02"], risk: 44, state: "Falso positivo", owner: "Serenazgo" }
  ];

export const maintenance = [
    { node: "N-06", task: "Revisar batería y panel", priority: "Alta", assigned: "Carlos", state: "Pendiente", due: "Hoy" },
    { node: "N-08", task: "Elevar antena repetidora", priority: "Media", assigned: "Ana", state: "En progreso", due: "Mañana" },
    { node: "N-03", task: "Calibrar MQ-2 y DHT22", priority: "Media", assigned: "Pedro", state: "Pendiente", due: "05 sep" },
    { node: "N-05", task: "Limpieza preventiva", priority: "Baja", assigned: "Rosa", state: "Completada", due: "Ayer" }
  ];

export const riskTrend = [32, 38, 41, 49, 58, 63, 70, 76, 82, 88];
