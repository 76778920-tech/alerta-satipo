# Resultados del modelo en el panel administrativo

En el menú **Predicciones** se muestran los 203 resultados reservados para evaluación: etiqueta real, clasificación del modelo, puntaje no calibrado, fecha histórica y fila original. Las 808 lecturas restantes fueron utilizadas para entrenar. La sección de lecturas contiene el total de 1011 observaciones.

La versión `rf-20261109-1011-eval-v2` reproduce `colab/resultados_locales/evaluacion.json` y `predicciones_prueba_203.csv`: 190 aciertos, 13 falsos negativos y 0 falsos positivos. Se ejecutó localmente con el notebook conectado a Supabase, no en la cuenta Google del usuario. La partición difiere de la anterior de 60 filas; sus porcentajes no constituyen una comparación controlada de mejora. Los datos carecen de identificadores de sesión física.

## Flujo y arquitectura

Navegador → GET /predictions → AdminService.listPredictions → PredictionResultsPort → PublishedPredictionResults.

El caso de uso verifica identidad y condición administrativa antes de consultar el adaptador. El núcleo no importa archivos, Supabase ni HTTP. La respuesta tiene Cache-Control: no-store. El archivo de resultados se incluye en la función backend y no se copia al hosting público. El acceso API sin sesión devuelve 401 y para un usuario sin permisos administrativos devuelve 403.

## Alcance de esta entrega

Se publica una evaluación reproducible, no un servicio de inferencia en vivo. No escribe predicciones en las tablas de Supabase, no ejecuta Python desde el navegador ni crea incidentes automáticamente. Actualizar resultados vuelve a consultar la evaluación publicada; ejecutar Colab no cambia automáticamente esta versión. Para publicar una nueva evaluación deben revisarse sus CSV y métricas, actualizar el artefacto `backend/adapters/out/prediction-results.json`, pasar las pruebas y desplegar la API. La inferencia continua y la publicación automática requieren una implementación posterior.

El panel ofrece filtros, paginación de 15 filas, tabla con desplazamiento horizontal y errores de carga explícitos. Una consulta fallida oculta los resultados anteriores; no los presenta como una consulta exitosa. El puntaje no es una probabilidad calibrada de incendio futuro y los nodos de demostración no se presentan como sensores reales.

## Verificación

- `npm test`: incluye permisos, correspondencia exacta de resultados con CSV, etiquetas y matriz de confusión; además de las pruebas existentes.
- `python tests/panel_predictions.py`: verifica el sitio publicado, 203 filas sin duplicados, filtros, métricas, ancho móvil, fallos de red y recuperación con una cuenta existente. No modifica tablas.
- `npm run build:api` y `npm run build:hosting`: generan los entregables de despliegue.
