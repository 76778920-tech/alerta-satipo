# Muestra Smoke Detection IoT: 1,011 registros

La demostración carga **1,011 registros históricos reales** del archivo fuente. Son datos externos de referencia; no son mediciones actuales, sensores activos ni ubicaciones de Satipo.

- Fuente: [HamzaMa96/Smoke-Detection-IOT](https://github.com/HamzaMa96/Smoke-Detection-IOT), archivo [smoke_detection_iot.csv](https://raw.githubusercontent.com/HamzaMa96/Smoke-Detection-IOT/main/smoke_detection_iot.csv).
- Origen consultado: 62,630 filas; 17,873 con `Fire Alarm=0` y 44,757 con `Fire Alarm=1`.
- Muestra estratificada proporcional: **289 sin alarma y 722 con alarma**, semilla `20261109`.
- `metadata.json` guarda URL, hash SHA-256, semilla y recuentos. `source_row` permite ubicar cada fila en la fuente.
- `smoke_detection_1011.csv` y `smoke_detection_1011.json` son la copia reproducible usada por la interfaz y la importación.
- `database/supabase/seed.sql` inserta las 1,011 filas de manera idempotente y reconstruye la asignación demostrativa a seis nodos (168 o 169 filas por nodo).

No se asignaron filas a pobladores ni a ubicaciones de Satipo. La etiqueta `Fire Alarm` pertenece al archivo de origen y no es una probabilidad ni una predicción calculada por esta aplicación.

## Diccionario

| CSV original | Columna en PostgreSQL | Interpretación |
| --- | --- | --- |
| índice sin encabezado | source_row | Índice original |
| UTC | utc_seconds / recorded_at | Marca Unix / fecha UTC derivada |
| Temperature[C] | temperature_c | °C |
| Humidity[%] | humidity_pct | % |
| TVOC[ppb] | tvoc_ppb | Compuestos orgánicos volátiles, ppb |
| eCO2[ppm] | eco2_ppm | CO₂ equivalente, ppm |
| Raw H2 / Raw Ethanol | raw_h2 / raw_ethanol | Lecturas crudas |
| Pressure[hPa] | pressure_hpa | hPa |
| PM1.0 / PM2.5 | pm1_0 / pm2_5 | Valores originales; el encabezado no especifica unidad |
| NC0.5 / NC1.0 / NC2.5 | nc0_5 / nc1_0 / nc2_5 | Valores originales; el encabezado no especifica unidad |
| CNT | cnt | Contador original |
| Fire Alarm | fire_alarm | Etiqueta binaria original, conservada como booleano |

No existe una columna de porcentaje de humo, velocidad del viento, batería, coordenadas o identidad de usuario. TVOC y PM no se convierten arbitrariamente a porcentaje de humo.

## Reproducir e importar

`npm run dataset` descarga la fuente y regenera los archivos. Para importar la muestra en el proyecto Supabase enlazado, aplica primero las migraciones y luego ejecuta `npm run import:dataset` con las credenciales locales necesarias. El importador verifica tanto las 1,011 filas como las 1,011 asignaciones a nodos.

La muestra sirve para verificar importación e interfaz, no para demostrar precisión de detección forestal. La validación de campo requiere sesiones temporales, sensores calibrados y datos recolectados en el entorno objetivo.
