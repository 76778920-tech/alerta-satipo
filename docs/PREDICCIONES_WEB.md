# Resultados del modelo en el panel administrativo

En el menú **Predicciones** se muestran los 60 resultados reservados para prueba: etiqueta real, clasificación del modelo, puntaje no calibrado, fecha histórica y fila original. Las 240 lecturas restantes fueron utilizadas para entrenar. No se muestran como predicciones de prueba.

La versión `rf-20260926-eval-v1` reproduce los archivos versionados `colab/resultados_locales/evaluacion.json` y `predicciones_prueba_60.csv`: 54 aciertos, 5 falsos negativos y 1 falso positivo. El entrenamiento/evaluación fue ejecutado localmente con el notebook conectado a Supabase. No se afirma que se ejecutó en la cuenta Google del usuario.

## Flujo y arquitectura

Navegador → GET /predictions → AdminService.listPredictions → PredictionResultsPort → PublishedPredictionResults.

El caso de uso verifica identidad y condición administrativa antes de consultar el adaptador. El núcleo no importa archivos, Supabase ni HTTP. La respuesta tiene Cache-Control: no-store. El archivo de resultados se incluye en la función backend y no se copia al hosting público. El acceso API sin sesión devuelve 401 y para un usuario sin permisos administrativos devuelve 403.

## Alcance de esta entrega

Se publica una evaluación reproducible, no un servicio de inferencia en vivo. No escribe predicciones en las tablas de Supabase, no ejecuta Python desde el navegador ni crea incidentes automáticamente. Actualizar resultados vuelve a consultar la evaluación publicada; ejecutar Colab no cambia automáticamente esta versión. Para publicar una nueva evaluación deben revisarse sus CSV y métricas, actualizar el artefacto `backend/adapters/out/prediction-results.json`, pasar las pruebas y desplegar la API. La inferencia continua y la publicación automática requieren una implementación posterior.

El panel ofrece filtros, paginación de 15 filas, tabla con desplazamiento horizontal y errores de carga explícitos. Una consulta fallida oculta los resultados anteriores; no los presenta como una consulta exitosa. El puntaje no es una probabilidad calibrada de incendio futuro y los nodos de demostración no se presentan como sensores reales.

## Verificación

- `npm test`: incluye permisos, correspondencia exacta de resultados con CSV, etiquetas y matriz de confusión; además de las pruebas existentes.
- `python tests/panel_predictions.py`: usa una cuenta administrativa local existente y verifica el sitio publicado, 60 filas sin duplicados, filtros, métricas, ancho móvil, fallos de red, respuestas inválidas y recuperación. No modifica tablas.
- `npm run build:api` y `npm run build:hosting`: generan los entregables de despliegue.
