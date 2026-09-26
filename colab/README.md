# Predicciones experimentales con las 300 lecturas

[Abrir en Google Colab](https://colab.research.google.com/github/76778920-tech/alerta-satipo/blob/main/colab/Alerta_Satipo_300_predicciones.ipynb)

El repositorio es privado: Colab puede solicitar acceso a GitHub. Si no permite abrirlo, descargar `Alerta_Satipo_300_predicciones.ipynb` y usar **Archivo → Subir notebook** en https://colab.research.google.com/. Guardar una copia en Drive si se desea conservarla en la cuenta Google. No se ha creado una sesión de Colab ni un archivo de Drive desde el asistente.

## Uso

1. Abrir el notebook. Contiene las mismas 300 filas versionadas; no requiere subir un CSV adicional, iniciar sesión en Supabase ni compartir claves.
2. Conectar a un entorno Python de Colab (CPU).
3. Ejecutar todas las celdas en orden.
4. Revisar métricas, matriz de confusión y las 60 predicciones de prueba.
5. Usar `predecir_medicion` con las 12 mediciones requeridas. El ejemplo inicial reutiliza una fila de prueba y está señalado como demostración.
6. Descargar el ZIP generado, que contiene los datos, el modelo joblib, métricas y predicciones.

## Protocolo y resultado local

La etiqueta objetivo es `fire_alarm`; se excluyen identificadores, CNT y tiempos de las características. Se entrena con las 240 filas más antiguas y evalúa con las 60 siguientes. El modelo fijo no se reajusta después de observar la prueba. No se reentrena sobre las 300 filas al exportar.

Validación local de todas las celdas: Python 3.12.10, scikit-learn 1.5.2. Archivos en `resultados_locales/`; no son una ejecución en Colab. Exactitud: 90 % (54/60); 5 falsos negativos y 1 falso positivo. El clasificador mayoritario obtuvo 55 %. Las versiones de Colab pueden producir diferencias; el informe generado registra la versión utilizada.

Este experimento clasifica etiquetas históricas, no predice anticipadamente incendios futuros en Satipo. No hay identificación de sesiones físicas para garantizar independencia total. El score no está calibrado como probabilidad real de incendio. Se requiere validación externa antes de usarlo para alertas.

## Alcance de integración

No modifica las etiquetas originales, no escribe en Supabase y no cambia el modelo de umbrales del panel. Un archivo joblib no se ejecuta directamente en JavaScript. La integración futura requiere un servicio/adaptador de inferencia, esquema de entrada estable y validación de desempeño. El anterior `docs/COLAB.md` documenta un flujo histórico distinto, basado en exportar umbrales.

Regeneración del notebook: `python scripts/build_prediction_notebook.py`. Toma `data/smoke_detection_300.json`, incorpora su contenido y hash, y no extrae credenciales. La separación entre entrenamiento y prueba sigue las recomendaciones de [scikit-learn](https://scikit-learn.org/1.8/common_pitfalls.html). Colab admite notebooks desde GitHub o archivos `.ipynb`, según su [documentación oficial](https://research.google.com/colaboratory/faq.html?hl=es).
