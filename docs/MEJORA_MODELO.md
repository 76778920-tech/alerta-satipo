# Revisión y evaluación del modelo — versión 2

## Resultado y decisión

Se implementó selección temporal reproducible de modelos y umbrales. No se logró demostrar una mejora predictiva con estas 300 observaciones. El modelo publicado y sus métricas se conservan; el candidato no se despliega ni se sustituye automáticamente. No se promete ausencia de errores de clasificación.

| Evaluación sobre las 60 filas finales | Modelo publicado | Candidato seleccionado internamente |
| --- | ---: | ---: |
| Algoritmo | Random Forest | Extra Trees |
| Umbral de alarma | 0.5 | 0.3 |
| Exactitud | 90 % | 61.67 % |
| Falsos negativos | 5 | 5 |
| Falsos positivos | 1 | 18 |

El candidato logró 97.5 % en la validación interna, pero esa cifra no representa su rendimiento en datos posteriores. Los bloques internos contienen 151 etiquetas positivas y solo nueve negativas. El cambio de distribución y la escasez de negativos limitan la selección. No se siguieron probando combinaciones para optimizar las 60 filas ya observadas.

## Protocolo implementado

- Desarrollo: primeras 240 filas en orden cronológico; las 60 restantes quedan fuera de la selección.
- Cuatro validaciones consecutivas de 40 filas, con entrenamiento expansivo y cinco filas de separación. Esta separación es por filas, no tiempo fijo. No garantiza independencia de experimentos porque no existen identificadores de sesión fiables en la muestra.
- Tres familias fijadas: Random Forest, Extra Trees y regresión logística. Umbrales 0.3, 0.5 y 0.7.
- Imputación y escalado, cuando procede, ajustados exclusivamente al entrenamiento de cada bloque.
- Criterio exploratorio: minimizar 2 × falsos negativos + falsos positivos. Esta ponderación es una decisión experimental, no un costo operativo validado.
- El modelo elegido se ajusta con 240 filas y se compara una vez sobre las 60 finales. Como esas filas ya se inspeccionaron en el proyecto, la comparación se denomina regresión y no prueba independiente inédita.
- La promoción está bloqueada hasta contar con datos nuevos independientes y criterios de aceptación acordados. Incluso un candidato mejor en estas 60 filas necesitaría esa validación.

No se usan tiempo, identificadores, contador o etiqueta como características predictoras. No se sustituyen datos ni se inventan ubicaciones. Las métricas agregadas de los bloques no estiman desempeño operativo ni equivalen a validación anidada.

## Archivos y reproducción

- `colab/model_selection.py`: selección sobre desarrollo, evaluación y trazabilidad de versiones.
- `scripts/evaluate_model_v2.py`: reproduce el experimento desde las 300 filas versionadas, sin red ni escrituras remotas.
- `colab/Alerta_Satipo_validacion_v2.ipynb`: consulta Supabase con los cuatro secretos habituales y ejecuta el mismo experimento. No modifica el notebook original ni publica resultados al panel.
- `scripts/build_model_v2_notebook.py`: regeneración del notebook v2.
- `colab/resultados_v2/`: reporte completo y clasificación de las 60 filas de regresión.
- `python tests/model_v2_test.py`: cuatro pruebas, incluyendo independencia de la selección respecto a las etiquetas finales, separación temporal, rechazo de datos inválidos y ausencia de promoción automática.
- `python tests/model_v2_live.py`: ejecución completa contra Supabase con credenciales locales existentes, sin modificar tablas; también verifica invalidación de estado si una nueva consulta falla.

Verificación realizada: cuatro pruebas unitarias aprobadas y notebook v2 ejecutado localmente contra Supabase. No se afirma ejecución en la cuenta Google del usuario. No se exporta un modelo candidato para uso operativo.

## Pronóstico por distrito: trabajo pendiente y datos necesarios

Objetivo propuesto: estimar riesgo de un evento de incendio confirmado por distrito en las próximas 24 horas. Debe fijarse qué constituye un evento y cómo se verificará antes de entrenar. No es la tarea Fire Alarm del CSV actual.

Tabla analítica propuesta: ubigeo del distrito, instante de emisión, horizonte en horas, temperatura, humedad, viento, lluvia acumulada, sequedad/vegetación, disponibilidad temporal de cada variable, cobertura de observaciones, etiqueta futura confirmada y procedencia. Se necesitan fechas sin incendios con cobertura verificable; ausencia de detección satelital no demuestra ausencia de fuego. Las variables deben haber estado disponibles en el instante del pronóstico, evitando incorporar meteorología futura observada.

Fuentes verificadas como posibles insumos, todavía no descargadas ni integradas:

- [NASA FIRMS: datos de fuego activo](https://firms.modaps.eosdis.nasa.gov/active_fire/): detecciones históricas geolocalizadas. El archivo puede requerir registro Earthdata. No es un servicio de predicción; deben filtrarse anomalías térmicas y revisarse cobertura, duplicación y calidad.
- [NASA: anomalías térmicas estáticas](https://wiki.earthdata.nasa.gov/spaces/FIRMS/blog/2025/02/28/425855667/FIRMS%2Bincorporates%2Bstatic%2Bthermal%2Banomalies%2Bdata%2Bto%2Bhelp%2Busers%2Bdifferentiate%2Bbetween%2Bvegetation%2Band%2Bnon%2Bvegetation%2Bfires.): explica detecciones ajenas a incendios de vegetación.
- [SENAMHI: descarga hidrometeorológica](https://www.senamhi.gob.pe/?p=descarga-datos-hidrometeorologicos): comprobar cobertura y continuidad de estaciones para Satipo.
- [SENAMHI: vigilancia atmosférica de incendios](https://web2.senamhi.gob.pe/site/incendio/): condiciones favorables al fuego; no equivale a certeza de ocurrencia.

También faltan límites distritales oficiales con UBIGEO y un registro de eventos verificados. Se debe evaluar por temporadas posteriores y distritos, informar precisión, sensibilidad, falsas alarmas, calibración y cobertura, y realizar una fase prospectiva antes de alertas operativas. No hay fecha responsable para prometer el pronóstico sin auditar estos insumos.

Referencia metodológica: [scikit-learn: prevención de fuga de datos](https://github.com/scikit-learn/scikit-learn/blob/main/doc/common_pitfalls.rst).

## Avance territorial

Ya se descargaron límites del MINAM y 3.285 registros meteorológicos distrito-día de Open-Meteo para 2025. Ver [datos, reproducibilidad y bloqueos pendientes](DATOS_TERRITORIALES.md). El historial de incendios verificados sigue pendiente; no existe aún un modelo territorial entrenado.
