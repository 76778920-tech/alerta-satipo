# Integración del informe final y variante con API

Fuente revisada: `Informe_Final_Taller_Proyectos.pdf`, Grupo 04, 22/10/2026,
19 páginas. Integración local: 23/10/2026. El PDF original no se modifica ni
se publica, y sus instrucciones editoriales se consideran contenido del informe.

## Cambio de alcance solicitado

El usuario solicita hacerlo **sin sensores** y buscar una API posteriormente.
Por ello, la variante implementada adquiere datos por HTTP y conserva registros
en SQLite. No implementa ESP32-S3, LED/buzzer, BLE ni LoRaWAN. La inferencia
local no es equivalente a inferencia TinyML en una placa. Sin Internet puede
consultarse lo ya adquirido, pero una fuente remota no aporta nuevas lecturas.

## Cambios implementados

- Vista **Informe y API** del panel administrativo: catálogo de los 15 RF,
  16 RNF, 18 HU y 3 RP, con páginas de origen, PMV, filtros, brechas y
  exportación JSON. Los identificadores HU ahora proceden del informe;
  la relación HU–RF es una propuesta de trazabilidad, no el backlog original.
- Presentación separada de las métricas declaradas de 62 630 registros y
  de la evaluación existente de 300 registros. No se reemplazó el modelo
  publicado ni se inventaron capturas de Colab.
- Paquete `acquisition/`: dominio de mediciones y predicciones, casos de uso,
  puertos, adaptadores HTTP/SQLite y composición. No requiere dependencias
  Python externas para adquirir, guardar, consultar o exportar.
- Adquisición HTTP con HTTPS fuera de localhost, timeout, límite de respuesta,
  token opcional desde entorno y rechazo de redirecciones. Los errores no
  contienen tokens ni cuerpos remotos.
- Validación de unidades, valores finitos, humedad y fechas con zona horaria;
  normalización UTC, identidad de fuente y procedencia.
- Lotes atómicos, claves foráneas, deduplicación por fuente/ID e índices de
  nodo/fecha. Si un proveedor cambia el contenido de un ID ya importado,
  se rechaza el lote; no se modifica silenciosamente el registro histórico.
- Historial persistente offline, exportación JSON sin sobrescribir archivos,
  cola de eventos y reintentos con confirmación por ID. La entrega es al menos
  una vez: el futuro receptor debe deduplicar por `event_id`.
- Importación de exportaciones API en el panel con paginación y descarte de
  datos anteriores si el nuevo archivo es inválido. El navegador no guarda
  credenciales ni escribe estos archivos en Supabase.

El puerto `ModelPort` permite incorporar un modelo compatible. Por defecto
no hay modelo conectado: `prediction` es `null`, lo que **no significa riesgo
cero**. La consulta histórica publicada del panel sigue siendo independiente.

## Revisión detallada del informe

Páginas 1–3: alcance académico, categorías D/E/P y problema territorial.
Se conserva la diferencia entre diseño, evidencia experimental y pendientes.
Las cifras satelitales y de deforestación son contexto documentado, no datos
adquiridos por esta aplicación ni incendios confirmados por el programa.

Páginas 4–5: nueve variables, conocimientos físicos y compatibilidad de sensores.
El contrato del módulo distingue meteorología de mediciones de humo. No se
rellenan TVOC, eCO2 o partículas con ceros ni se convierten salidas MQ-2 en
esas variables. La API que se elija determinará qué modelo puede usarse.

Páginas 5–6: impactos sociales, ambientales, seguridad y marco legal.
Se registran riesgos de falsas alarmas, datos no representativos, privacidad
y continuidad. No se declara certificación, reducción de incendios, ahorro,
consentimiento comunitario ni validación por autoridades.

Páginas 6–7: metodología e instrumentos. El catálogo conserva ocho sprints y
tres PMV. Las herramientas previstas no se presentan como desplegadas. Las
notas rojas solicitan evidencias auténticas; no son autorización para fabricar
capturas, resultados, firmas, reuniones o actas.

Páginas 8–9: todos los IDs RF/RNF/RP/HU se incorporan al catálogo. La tabla
solo aporta títulos y PMV; remite a otro documento para Given/When/Then.
No se inventan criterios oficiales. La autenticación administrativa existente
se conserva. RF-10/HU-001 no abren registro público automáticamente: faltan
definir el flujo de alta, aprobación y permisos de usuarios finales.

Páginas 10–12: esquema y arquitectura. Se revisaron visualmente los diagramas
de datos, componentes y despliegue. SQLite usa las entidades NodoSensor
(identificador lógico de fuente API), LecturaAmbiental, HistoricoPrediccion y
EventoAlerta. Se conserva unicidad lectura/predicción y relación con eventos.
No se inventan latitud/longitud ni códigos hardware; el modelo cambia para
representar la variante API. La identidad de usuario sigue en Supabase Auth;
no se duplican contraseñas en SQLite. La base local es de un operador y depende
de permisos del sistema operativo: no es un servidor multiusuario ni una base
cifrada. La interfaz Flutter, su SQLite y sus permisos siguen pendientes.

Páginas 13–15: equipo, roadmap, gestión, Gantt y riesgos. Se conserva el resumen
de 16 semanas, 43 tareas y 37,5349 % de avance administrativo declarado. No
se reconstruyen las 43 actividades desde una captura de baja resolución ni
se confunde PMV1 100 % administrativo con aceptación funcional. Se necesita
el libro original para incorporar responsables, dependencias y avances exactos.

Páginas 15–16: PoC con 62 630 filas, nueve variables y cuatro clasificadores.
Las métricas son transcripción atribuida al informe; no resultado de una
ejecución nueva. El notebook original no está disponible en el repositorio.
Se muestran la caída temporal y la sensibilidad al ruido. El modelo de tres
clases RP-01 y el detector independiente RP-03 no están acreditados.

Páginas 17–19: conclusiones, referencias y anexos. El informe dice que no se
proporcionó repositorio ni plataforma web funcional a sus autores. En este
workspace sí existe el panel y el remoto Git configurado; esa diferencia de
materiales revisados no justifica borrar funciones existentes. Quedan sin
evidencia la aplicación Flutter, aceptación por usuarios/experto, video/QR,
notebook original y validación integral. Las referencias externas del PDF no
se auditaron como investigación legal o científica nueva.

## Ejecutar y probar sin proveedor real

Primera terminal, en la raíz del proyecto:

```powershell
python scripts/serve-api-example.py
```

Segunda terminal:

```powershell
$env:SATIPO_SOURCE_API_URL = 'http://127.0.0.1:8890/readings'
python -m acquisition ingest
python -m acquisition history
python -m acquisition export --output var/api-export.json
```

La API devuelve una lectura **ficticia** marcada `DEMO_API_NO_REAL`. Repetir
`ingest` no duplica la lectura. Detener la API no impide ejecutar `history`.
La base se guarda en `var/acquisition.sqlite3`, excluida de Git y no publicada
por el servidor web. `export` se limita por defecto a las 100 últimas lecturas;
puede usarse `--limit 10000` y `--node ID`. Se rechaza sobrescribir un archivo.

Tras `npm run build`, iniciar el panel de la forma habitual y abrir
**Informe y API**. Seleccionar `var/api-export.json` para inspeccionar el historial.
El archivo se procesa localmente en el navegador; su origen es declarado,
no una firma verificada del proveedor. La consulta offline completa se realiza
por CLI; no se afirma que el panel pueda arrancar sin conexión.

## Contrato del futuro proveedor

El adaptador espera una lista JSON de hasta 1000 objetos:

```json
[
  {
    "source": "identificador-del-proveedor",
    "external_id": "identificador-estable-de-observacion",
    "node_id": "estacion-o-celda-del-proveedor",
    "observed_at": "2026-10-23T15:00:00Z",
    "kind": "weather",
    "values": {"temperature_c": 26, "humidity_pct": 70},
    "units": {"temperature_c": "degC", "humidity_pct": "%"}
  }
]
```

Configurar `SATIPO_SOURCE_API_URL` y, si hace falta, `SATIPO_SOURCE_API_TOKEN`
en el entorno del proceso. La CLI Python no lee `.env` automáticamente.
Si la API entrega otro formato, debe implementarse su traducción en un
adaptador específico, no dentro del dominio ni del controlador de pantalla.
Faltan acordar paginación, frecuencia, cuotas, licencia, procedencia temporal,
área geográfica y manejo de mediciones ausentes con el proveedor seleccionado.

Variables admitidas: temperature_c (degC), humidity_pct (%), tvoc_ppb (ppb),
eco2_ppm (ppm), pm1_0/pm2_5/pm10 (ug/m3), nc0_5/nc1_0/nc2_5 (#/cm3),
wind_kmh (km/h), rain_mm (mm). Valores ausentes se omiten. Para inferencia
de humo se exigen las nueve variables de `SMOKE_FEATURES`, kind=smoke y un
modelo explícitamente inyectado. No hay adaptador de modelo operativo todavía.

La sincronización opcional requiere `SATIPO_SYNC_API_URL` y opcionalmente
`SATIPO_SYNC_API_TOKEN`. `python -m acquisition sync` envía cada evento
pendiente y exige una respuesta JSON con su mismo `event_id`. No se configura
un destino automáticamente ni se emiten notificaciones a personas. La lectura
y el evento se guardan juntos antes de cualquier envío; fallos dejan pendiente
el evento para el siguiente intento. No hay proceso automático en segundo plano.

## Verificación y límites

Pruebas locales: `npm test`, `npm run test:python`, `npm run test:browser`.
Incluyen API HTTP local real, SQLite reabierto sin conexión, atomicidad,
duplicados, conflictos, unidades, separación weather/smoke, cola y confirmación,
catálogo y filtros, importación inválida y vistas escritorio/móvil.

El endpoint usado en pruebas es una fixture; no certifica disponibilidad de
ninguna API pública. La prueba del modelo usa un doble de prueba identificado;
no constituye entrenamiento, inferencia validada ni nuevo resultado de IA.
No se realizaron despliegues, cambios remotos, nuevas cuentas ni modificaciones
de políticas RLS. El archivo `docs/README.md` ya tenía cambios del usuario y
no se modificó en esta integración.

Pendientes que impiden declarar el informe completamente implementado:
proveedor real y su mapeo; modelo entrenado con variables compatibles;
clasificación de tres niveles y detector de anomalías; política de alertas y
canales; Flutter si sigue requerido; alta de usuarios y consentimiento;
criterios Given/When/Then originales; datos y pruebas territoriales;
evaluación de rendimiento y recuperación a escala; validación humana.
