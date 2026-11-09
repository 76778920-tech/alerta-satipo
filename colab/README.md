# Evaluación histórica con 1011 lecturas

[Abrir notebook en Colab](https://colab.research.google.com/github/76778920-tech/alerta-satipo/blob/main/colab/Alerta_Satipo_1011_predicciones.ipynb)

El notebook consulta `smoke-detection-iot-1011-v1` en Supabase mediante una cuenta existente. Descarga páginas de hasta 500 filas y verifica 1011 identificadores únicos, 722 etiquetas positivas, 289 negativas, fechas, campos numéricos y hash del contenido. Una respuesta parcial o modificada detiene el entrenamiento.

## Configuración

En Secretos de Colab, habilita `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SATIPO_EMAIL` y `SATIPO_PASSWORD`. Usa la clave pública y una cuenta autorizada del aplicativo; no una clave administrativa. Ejecuta todas las celdas con CPU. Si guardaste una copia anterior en Drive, abre el notebook nuevo.

La ejecución local utiliza las mismas variables de entorno. No se imprimen credenciales ni se escriben lecturas en la base. La autenticación crea una sesión de usuario. Los resultados se exportan a `salida_satipo` y al ZIP indicado en el notebook.

## Evaluación vigente

Las primeras 808 lecturas cronológicas entrenan un Random Forest de configuración fija y las 203 siguientes lo evalúan. Las 12 características excluyen etiqueta, tiempo, IDs y contador. La muestra ampliada se solapa con datos examinados anteriormente y no identifica sesiones físicas: la separación temporal no demuestra independencia entre ensayos.

La ejecución local contra Supabase, con scikit-learn 1.5.2, produjo **190/203 aciertos (93.60 %), 13 falsos negativos y 0 falsos positivos**. Matriz: `[[97,0],[13,93]]` (filas reales, columnas predichas, orden sin/con alarma). No comparar directamente con el anterior 90 % sobre 60 filas: las particiones son distintas.

Estos resultados clasifican etiquetas históricas externas; no pronostican incendios futuros ni acreditan desempeño forestal en Satipo. El modelo sintético PMV1 de cinco variables es otro experimento: sus archivos están en `pmv1/` y sus métricas no proceden de estas 1011 lecturas.

## Reproducción y publicación

1. `python scripts/build_prediction_notebook.py`: genera el notebook y su hash desde la muestra versionada.
2. `python tests/colab_live.py`: ejecuta todas sus celdas contra Supabase con las credenciales locales privadas de `config/`; comprueba errores de entrada, exportación y descarte de resultados tras un fallo de red.
3. `python scripts/publish-prediction-results.py`: valida CSV y matriz y actualiza el artefacto del backend desde la salida comprobada.
4. `python scripts/integrate-report-catalog.py` y `npm run build`: actualizan el catálogo y el navegador.
5. Pruebas y despliegue de backend y web mediante CI/CD.

Los resultados actuales están en `resultados_locales/`; los anteriores de 300 registros, en `archivo_300/`. El panel muestra las 203 predicciones de evaluación; la sección de lecturas contiene las 1011 observaciones. Consultar el panel no reentrena ni genera nuevas predicciones. Ver [Predicciones web](../docs/PREDICCIONES_WEB.md).

## Selección de candidatos

[Alerta_Satipo_validacion_v2.ipynb](Alerta_Satipo_validacion_v2.ipynb) compara tres familias y tres umbrales solo dentro de las 808 filas de desarrollo, con 480 observaciones de validación temporal y separaciones de cinco filas. El candidato seleccionado obtuvo 74.38 % sobre las 203 finales y **no se publicó**. El panel conserva la referencia fija de 93.60 %. Ver [protocolo y limitaciones](../docs/MEJORA_MODELO.md).

`python tests/model_v2_live.py` verifica este notebook contra Supabase; `python tests/colab_dataset_test.py` verifica paginación y errores. Estas ejecuciones se realizaron localmente, no en la cuenta Google del usuario.
