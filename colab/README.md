# Colab conectado a Supabase

[Abrir notebook en Colab](https://colab.research.google.com/github/76778920-tech/alerta-satipo/blob/main/colab/Alerta_Satipo_300_predicciones.ipynb)

El notebook ahora consulta Supabase directamente. No incluye una copia embebida de las lecturas, no escribe en las tablas y no utiliza claves administrativas. El inicio de sesión crea una sesión de Auth para una cuenta existente; sus permisos efectivos siguen siendo los de esa cuenta. El código solo solicita lecturas del conjunto smoke-detection-iot-300-v1.

## Configuración en Colab

1. Abrir el enlace y autorizar acceso al repositorio privado de GitHub. Alternativa: descargar el archivo ipynb y subirlo desde Archivo → Subir notebook.
2. En Secretos (icono de llave) crear estas entradas y habilitar acceso al notebook:
   - SUPABASE_URL: https://ddfmooylklgwnrmlxqzc.supabase.co
   - SUPABASE_PUBLISHABLE_KEY: clave pública publishable o anon del mismo proyecto.
   - SATIPO_EMAIL: correo de una cuenta existente del aplicativo.
   - SATIPO_PASSWORD: contraseña de esa cuenta, no de GitHub ni PostgreSQL.
3. Conectar a CPU y ejecutar todas las celdas. No pegar secretos en las celdas ni sus resultados.
4. Revisar métricas y descargar el ZIP generado con modelo, instantánea de datos y resultados.

No se configuraron secretos ni se inició una sesión en la cuenta Google del usuario desde el asistente. Esa autorización se realiza en su Colab. Si ya tenías una copia guardada en Drive, vuelve a abrir esta versión actualizada.

## Validaciones y errores

La consulta filtra el conjunto aprobado, pide total exacto y hasta 301 filas para detectar exceso. Valida esquema, 300 IDs únicos, fechas/UTC, valores finitos, 214 etiquetas positivas y un hash normalizado contra la muestra aprobada. Diferencias de formato numérico o de representación de zona horaria no cambian el hash.

Si hay fallo de autenticación, red, filas faltantes, duplicadas o contenido cambiado, el entrenamiento se detiene. No existe fallback a datos de ejemplo. No se debe sustituir el hash sin revisar y versionar la nueva muestra.

Se conserva una instantánea CSV para reproducibilidad dentro de salida_satipo y del ZIP. Que Supabase sea la fuente central no elimina la necesidad de documentar los datos exactos usados al entrenar. Ejecutar nuevamente consulta la base; no hay entrenamiento continuo en segundo plano.

## Evaluación

Protocolo fijo: 240 filas cronológicamente anteriores para entrenamiento y 60 posteriores para prueba; se excluyen IDs, contador, tiempo y etiqueta de las 12 características. Validación local conectada a Supabase: Python 3.12.10 y scikit-learn 1.5.2, 54/60 aciertos, 5 falsos negativos y 1 falso positivo. Los resultados locales están en resultados_locales; no se presentan como ejecución en Colab.

El modelo clasifica Fire Alarm histórico; no pronostica incendios futuros en Satipo. Su score no está calibrado. No escribe predicciones en Supabase. Los 60 resultados de esta evaluación están publicados en la sección Predicciones del panel mediante una API administrativa; la inferencia de nuevas lecturas requiere un servicio adicional. Ver [Predicciones web](../docs/PREDICCIONES_WEB.md). No reemplaza el JSON histórico de umbrales.

## Archivos y pruebas

- supabase_dataset.py: consulta, autenticación y validación. Su código se incorpora al notebook para que no dependa de descargar archivos auxiliares privados.
- scripts/build_prediction_notebook.py: regenera el notebook y hash esperado desde la muestra versionada.
- python tests/colab_dataset_test.py: nueve pruebas que cubren formato equivalente, datos inválidos, claves privadas, cambios de contenido, operaciones permitidas, configuración, respuestas inesperadas y redirecciones HTTP.

Ejecución local: las mismas cuatro variables se leen del entorno. No se imprimen ni se exportan credenciales. El conjunto consultado en Supabase está sujeto a las políticas RLS actuales. La cuenta usada conserva sus propios permisos; este notebook no crea un rol nuevo de base de datos.

### Revisión del 26 de septiembre de 2026

Se corrigieron respuestas de autenticación inesperadas, fechas inválidas y respuestas que no contienen JSON para generar errores comprensibles. Se bloquean redirecciones HTTP para evitar enviar credenciales a otra dirección. Al repetir la consulta se eliminan los datos y el modelo anteriores de la memoria antes de descargar; si falla, el entrenamiento se detiene. La inferencia rechaza entradas que no sean un diccionario y valores booleanos como mediciones.

El ZIP exporta únicamente los seis archivos previstos; no incorpora archivos ajenos de la carpeta. Los archivos exportados en ejecuciones anteriores no se borran automáticamente: siguen siendo resultados de aquella ejecución.

Prueba de integración: `python tests/colab_live.py`. Requiere las dependencias del notebook, `config/public.json` y las credenciales locales existentes en `config/admin.local.json` (archivo privado, nunca versionarlo). Ejecuta todas las celdas, comprueba 300 lecturas y 60 filas de prueba, entradas inválidas, contenido del ZIP y una consulta fallida después del entrenamiento. Escribe resultados locales en `test-results/colab-audit`; no modifica las tablas remotas. El inicio de sesión sí crea una sesión de Auth.

Resultado de la revisión: nueve pruebas unitarias y la integración completa contra Supabase aprobadas. Esta verificación se realizó localmente; el acceso a Secretos y la ejecución dentro de la cuenta Google Colab deben verificarse allí. La inferencia continua sigue pendiente; la consulta de los 60 resultados publicados ya está disponible en el panel.
