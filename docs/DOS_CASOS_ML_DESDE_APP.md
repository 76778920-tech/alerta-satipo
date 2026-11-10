# Dos casos de predicción ML desde la aplicación

## Qué está implementado

La aplicación web ejecuta el modelo `pmv1-synthetic-tree-v2` en la sección **PMV1 · Lectura local**. Cada clic en **Leer una vez** genera cinco valores de entrada, los valida, recorre el árbol entrenado y guarda el resultado localmente. La etiqueta del escenario no se entrega al clasificador: este recibe únicamente las mediciones numéricas.

La pantalla **Evaluación de humo** tiene otra función: consulta predicciones históricas guardadas. Mostrar esa pantalla por sí sola no prueba que se haya realizado una nueva inferencia desde la aplicación.

## Recorrido para exponer

1. Abrir https://alerta-satipo-76778920.web.app e iniciar sesión con una cuenta administrativa autorizada. No grabar la contraseña.
2. Entrar en **PMV1 · Lectura local**. Mostrar que se trata de un modelo experimental entrenado con datos sintéticos.
3. **Caso 1:** seleccionar **Normal** y pulsar **Leer una vez**. Mostrar temperatura, humedad, humo, gas y PM2.5, junto con el nivel calculado **Normal** y la versión del modelo.
4. **Caso 2:** seleccionar **Emergencia** y pulsar **Leer una vez**. Mostrar las cinco entradas de la nueva lectura y el nivel calculado **Emergencia**. Comprobar que ambas lecturas aparecen en el historial.
5. Recargar la página, volver a la sección y mostrar que los resultados permanecen guardados.

Las entradas se generan con pequeñas variaciones; los valores exactos de esta ejecución están en el JSON de evidencia. El selector prepara el escenario de prueba, no asigna directamente la salida del árbol.

## Evidencias de la ejecución

Ejecución del 10 de noviembre de 2026, con el modelo `pmv1-synthetic-tree-v2`:

- **Caso 1 → Normal:** temperatura 25.02 °C, humedad 71.45 %, humo 10.9, gas 12.49 y PM2.5 13.36 µg/m³.
- **Caso 2 → Emergencia:** temperatura 50.71 °C, humedad 25.96 %, humo 83.24, gas 83.34 y PM2.5 261.83 µg/m³.

Humo y gas son índices sintéticos de 0 a 100. Se comprobó la permanencia de ambos registros tras recargar y la coincidencia de sus predicciones con la función del backend. La prueba no escribió datos remotos.

- [Caso 1: inferencia Normal](evidencias/ml_dos_casos/caso_1_normal.png).
- [Caso 2: inferencia Emergencia y ambas lecturas](evidencias/ml_dos_casos/caso_2_emergencia.png).
- [Entradas, resultados, versión e identificadores](evidencias/ml_dos_casos/resultados.json).

Las capturas se obtienen del navegador ejecutando la aplicación; no son maquetas. Se utilizan el modelo y el almacenamiento reales de la aplicación. No se sincronizan estos casos con la base de datos ni se generan alertas para pobladores.

## Alcance de la evidencia

Se demuestra **inferencia de clasificación ML desde la aplicación web**, con dos entradas simuladas y resultados distintos. No demuestra pronóstico de incendios futuros, ubicación geográfica de un incendio, adquisición física de sensores ni ejecución de este recorrido en la app Android.

La funcionalidad ya existía; esta entrega añade una prueba reproducible y las evidencias para presentarla. La aceptación del criterio «dos casos de predicción ML» corresponde al evaluador. Si exige datos físicos, pronóstico territorial o el recorrido Android, estas evidencias no cubren ese requisito adicional.

## Trazabilidad técnica

- `frontend/web/js/pmv1.js`: acciones visibles de la pantalla.
- `frontend/src/application/use-cases/pmv1-service.mjs`: preparación de entradas e invocación de la inferencia.
- `frontend/src/domain/pmv1.mjs`: validación y recorrido del modelo entrenado.
- `frontend/src/domain/pmv1-model.mjs`: árbol exportado del entrenamiento.
- `scripts/train_pmv1.py` y `colab/pmv1/evaluation.json`: entrenamiento y evaluación sintéticos.
- `tests/pmv1_two_cases_live.py`: prueba contra la web publicada con una cuenta local existente. Verifica dos resultados distintos, cinco variables, versión del modelo y persistencia tras recargar. Requiere Playwright, Edge y `config/admin.local.json`; no incluir ese archivo privado en la entrega.

Para generar evidencias, definir `ML_EVIDENCE_DIR` con la carpeta de salida y ejecutar `python tests/pmv1_two_cases_live.py`. Por defecto escribe en `test-results/ml_dos_casos`.
