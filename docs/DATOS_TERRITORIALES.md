# Preparación del pronóstico territorial de Satipo

## Entrega implementada

Se descargaron 3.285 registros distrito-día (365 días de 2025 × nueve distritos), la meteorología original y una capa oficial de límites distritales. Los datos están en `data/territorial/2025/`. El CSV contiene datos de investigación, no predicciones ni eventos confirmados. Las etiquetas de incendio permanecen vacías y la cobertura se declara desconocida.

Distritos incluidos: Satipo (120601), Coviriali (120602), Llaylla (120603), Mazamari (120604), Pampa Hermosa (120605), Pangoa (120606), Río Negro (120607), Río Tambo (120608) y Vizcatán del Ene (120609).

Fuentes consultadas y descargadas:

- [MINAM: capa Distritos](https://geoservidorperu.minam.gob.pe/arcgis/rest/services/CS/MapServicesUbigeo/MapServer/0). Se consulta Satipo y se transforma a EPSG:4326. La fuente no informa año en las entidades consultadas: hace falta confirmar vigencia cartográfica antes de uso operativo.
- [Open-Meteo Historical Weather](https://open-meteo.com/en/docs/historical-weather-api), modelo ERA5. Datos de reanálisis meteorológico, no mediciones propias ni registros de SENAMHI. Atribución: Open-Meteo y proveedores ERA5/Copernicus. Revisar términos de uso antes de una explotación comercial.

La extracción utiliza un punto interior por distrito. No representa el promedio espacial del distrito ni resuelve diferencias de altitud. Se guardan coordenadas consultadas, coordenadas de respuesta de la grilla, variables, unidades, fechas, instante de descarga y hashes SHA-256. El manifiesto registra solicitudes reproducibles.

## Ejecutar la preparación

```powershell
python -m pip install -r territorial/requirements.txt
python territorial/pipeline.py --start 2025-01-01 --end 2025-12-31 --output data/territorial/2025
python tests/territorial_test.py
```

Se valida cobertura exacta de nueve UBIGEO, polígonos, coordenadas, fechas completas, unidades, valores finitos y rangos. Un fallo de descarga deja `status.json` como `incomplete`, no como ejecución válida. El manifiesto de la última ejecución completa no debe consumirse sin comprobar el estado y sus hashes.

Variables: temperatura máxima diaria (°C), humedad relativa media (%), lluvia diaria (mm), viento máximo (km/h), y lluvia acumulada de los siete días previos. El día observado se asigna a una emisión a medianoche del día siguiente en UTC−05:00 y horizonte de 24 h. Los primeros seis acumulados semanales quedan vacíos porque no existe suficiente historia, no se rellenan con ceros.

Importante: usar solo días anteriores evita meteorología futura en las variables, pero ERA5 es retrospectivo y su disponibilidad real no equivale a la fecha observada. Antes de validar un servicio en tiempo real se necesitan pronósticos archivados o entradas disponibles en cada instante de emisión y su latencia.

## Importar anomalías térmicas de NASA FIRMS

El adaptador ya recibe un CSV oficial, conserva fecha UTC, satélite, instrumento y confianza original; elimina duplicados exactos y asigna cada punto al distrito por intersección espacial. Detecciones fuera de la provincia o ambiguas en límites se cuentan aparte. No fusiona observaciones de distintos sensores como un solo evento ni interpreta automáticamente una anomalía térmica como incendio forestal confirmado.

[Descarga histórica NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/download/): autenticación mediante Earthdata o código enviado por correo. Solicitar Perú, periodo 2025, formato CSV y documentar producto/satélite. El acceso debe realizarlo el titular; no se creó una cuenta ni se solicitó correo en su nombre. Alternativa futura para automatización: [MAP_KEY](https://firms.modaps.eosdis.nasa.gov/api/map_key/). Esta entrega implementa importación CSV, no un cliente autenticado de la API FIRMS.

```powershell
python territorial/pipeline.py --start 2025-01-01 --end 2025-12-31 --output data/territorial/2025-con-firms --firms-csv C:/ruta/archivo-firms.csv
```

El CSV FIRMS no se ha recibido ni descargado en esta entrega. Las pruebas del importador usan casos sintéticos explícitos, que no se incorporan al conjunto de investigación.

## Etiquetas verificadas

Plantilla vacía: `territorial/verified_events_template.csv`. Cada fila requiere UBIGEO, instante de emisión local a medianoche, etiqueta 0/1 para las siguientes 24 h, cobertura verificada y referencia de evidencia. Un cero solo es admisible si existe cobertura verificada para ese periodo. No se obtiene un cero por ausencia de puntos FIRMS. La herramienta valida la estructura; la veracidad y suficiencia de la evidencia requieren revisión humana.

```powershell
python territorial/labels.py --dataset data/territorial/2025/district_day_research.csv --labels C:/ruta/eventos-verificados.csv --output data/territorial/2025/dataset-etiquetado.csv
```

Las filas sin evidencia conservan etiquetas desconocidas. Se rechazan duplicados, códigos ajenos, fechas fuera del periodo, cobertura no verificada y fuentes vacías. El comando no aprueba automáticamente el entrenamiento.

## Lo que aún bloquea entrenar y publicar

1. Eventos de incendio geolocalizados verificados y cobertura confiable de días sin eventos.
2. Vegetación, humedad/sequedad y representación espacial suficiente dentro de cada distrito.
3. Disponibilidad temporal real de entradas; sustituir o evaluar la latencia del reanálisis.
4. Varios periodos/temporadas para entrenamiento y evaluación temporal independiente, sin usar futuras observaciones al preparar variables.
5. Evaluar calibración, alarmas omitidas y falsas alarmas por distrito, incertidumbre y cobertura; acordar criterios operativos antes del despliegue.

No se ejecuta entrenamiento con etiquetas vacías. `training_allowed` permanece en falso. No se cambió el panel publicado, no se escribieron tablas Supabase y no se afirma contar todavía con pronóstico territorial. Esta entrega cubre adquisición y preparación de datos, no completa el servicio de pronóstico.

## Evidencia de verificación

Se ejecutó la descarga real completa y seis pruebas: cobertura/ausencia de etiquetas inventadas, ventanas temporales, rechazo de datos incompletos o unidades incorrectas, duplicación y asignación FIRMS, exigencia de evidencia y correspondencia de hashes. Las seis aprobaron.

## Flujo de entrenamiento experimental preparado

`territorial/training.py` permite revisar la preparación del dataset y, cuando existan etiquetas verificadas, ejecutar un experimento temporal. Diagnóstico actual:

```powershell
python territorial/training.py --dataset data/territorial/2025/district_day_research.csv
```

Las 3.285 filas actuales carecen de etiquetas; el diagnóstico bloquea el entrenamiento. Con el archivo etiquetado mediante `labels.py`:

```powershell
python territorial/training.py --dataset data/territorial/2025/dataset-etiquetado.csv --train-experiment
```

Se requieren al menos 30 fechas y cinco ejemplos por clase en cada partición como mínimos técnicos exploratorios, no como garantía estadística. El corte es global por fecha (80/20) para todos los distritos; excluye horizontes de entrenamiento que alcancen la prueba. Se omiten filas sin etiqueta o ventana meteorológica completa. No se usa UBIGEO como predictor ni se mezclan filas de la misma fecha entre entrenamiento y prueba.

El modelo de configuración fija se compara con una referencia de frecuencia previa y reporta matriz de confusión, precisión, sensibilidad, exactitud balanceada, Brier score y resultados por distrito. El puntaje no se declara calibrado. No se seleccionan hiperparámetros con la prueba. Las métricas por distrito con una sola clase no bastan para evaluar ambas clases.

La salida se guarda en `test-results/territorial-training/`, marcada EXPERIMENT_ONLY_NOT_OPERATIONAL. No exporta ni despliega automáticamente un modelo, no escribe Supabase y nunca concede aprobación operativa. Cinco pruebas validan el flujo; el ensayo sintético solo comprueba software, no rendimiento territorial real.

El usuario confirmó que aún no tiene acceso ni archivo de NASA FIRMS. Sigue siendo necesario obtener el CSV histórico y contrastarlo con eventos y cobertura verificables. La descarga requiere una sesión del titular o acceso público válido; no se crearon cuentas en su nombre.
