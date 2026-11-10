# Pruebas detalladas de PMV1 y PMV2 con ML

Fecha de ejecución: 10/11/2026, 17:44:02–17:44:32 UTC. Proyecto original: Firebase y Supabase.

## Resultado y alcance

Pasaron 115 pruebas automatizadas: 48 JavaScript, 49 Python y 18 Flutter. También finalizaron correctamente la compilación web, el análisis estático de Flutter y el recorrido de navegador. Los registros originales están en [la carpeta de evidencia](evidencias/pmv_pruebas_20261110/); [results.json](evidencias/pmv_pruebas_20261110/results.json) registra comandos, códigos de salida, tiempos y hashes SHA-256.

Se incorporaron una prueba JavaScript de evaluación completa y siete pruebas Flutter de inferencia, presentación y recepción de datos. Se ejecuta el modelo real del proyecto; los escenarios son simulados. No se reentrenó el modelo para mejorar artificialmente los resultados de esta prueba.

Este informe acredita resultados técnicos de software para revisión. No declara completado todo el PMV físico ni sustituye la aprobación del evaluador. La ejecución se realizó sobre cambios todavía sin commit: el informe conserva el commit base y hashes de los archivos comprobados para identificar exactamente esa versión.

## Preparación y repetición

Requisitos: dependencias Node y Python del proyecto instaladas, Flutter disponible con dependencias restauradas mediante `flutter pub get`, y el navegador requerido por `tests/browser_hexagonal.py`. Ejecutar desde la raíz:

```powershell
python scripts/verify-pmv.py --output test-results/pmv-validacion-nueva
```

La carpeta de salida debe ser nueva: el comando no sobrescribe evidencias. Ejecuta todas las fases y termina con error si alguna falla. Usa bases temporales y pruebas controladas; no inserta registros en la base de producción. El recorrido web usa fixtures, por lo que no demuestra disponibilidad del servicio remoto.

## PMV1: casos y resultados

### P1-01 — HU05: integridad y rechazo de lotes

Preparación: sesión de poblador y registros con las cinco variables. Pasos: ingresar un lote válido; probar valores incompletos o inválidos e identificadores duplicados. Esperado: rechazar la entrada inválida sin dejar registros parciales. Resultado: aprobado en la suite móvil y en las validaciones de JavaScript. La prueba nueva usa un puerto de registros en memoria; la prueba SQLite independiente comprueba transacciones, rollback y reapertura con SQLite real temporal.

Evidencias: [Flutter](evidencias/pmv_pruebas_20261110/flutter_tests.log), [JavaScript](evidencias/pmv_pruebas_20261110/javascript.log).

### P1-02 — HU07: separación de conjuntos

Pasos: leer los CSV de entrenamiento, validación y prueba, comprobar cabeceras, cantidades y ausencia de vectores de entrada repetidos entre conjuntos. Esperado: 24,000 / 6,000 / 3,000 filas respectivamente, sin duplicados. Resultado: aprobado. Esto comprueba separación por contenido; no convierte los escenarios sintéticos en datos de campo.

Evidencia: caso `HU07: los 3000 casos reservados reproducen matriz, errores y paridad web/backend` en [JavaScript](evidencias/pmv_pruebas_20261110/javascript.log).

### P1-03 — HU07: evaluación completa y paridad del ML

Pasos: ejecutar las 3,000 filas reservadas con el evaluador del backend y el del frontend, comparar cada resultado y versión; ejecutar las mismas filas con el modelo Dart de la aplicación móvil. Reconstruir la matriz desde las etiquetas independientes del CSV. Esperado: igualdad entre implementaciones y con la evaluación publicada. Resultado: aprobado en JavaScript y Dart.

Modelo: `pmv1-synthetic-tree-v2`. Orden de filas y columnas: Normal, Advertencia, Emergencia. Filas = referencia; columnas = predicción:

```text
945   45    0
 48  933   63
  0   61  905
```

Exactitud: 92.77%; F1 macro: 0.92827. Hubo 45 falsas alarmas entre 990 normales y 61 emergencias omitidas entre 966 emergencias. No se ocultan esos errores: aprobar la prueba significa reproducir fielmente el resultado, no lograr una clasificación perfecta ni certificar seguridad forestal.

Evidencias: [métricas sintéticas](evidencias/pmv_pruebas_20261110/synthetic_ml.json), logs JavaScript y Flutter. La evaluación histórica de 1,011 registros es otro experimento: [métricas históricas](evidencias/pmv_pruebas_20261110/historical_ml.json). No se suman sus filas ni sus métricas a las del modelo sintético.

### P1-04 — HU08: tres clasificaciones desde la aplicación móvil

Preparación: aplicación Flutter real, sesión de poblador, modelo real y persistencia sustituida por memoria para aislar la interfaz. Se inyecta cada lectura por el servicio de ingreso; no se fija manualmente la etiqueta.

Orden de entradas: temperatura °C, humedad %, índice de humo, índice de gas, partículas µg/m³.

- Caso Normal: `[25, 70, 10, 12, 15]`. Esperado y obtenido: Normal, tarjeta `#126458`.
- Caso Advertencia: `[34, 48, 45, 42, 90]`. Esperado y obtenido: Advertencia, tarjeta `#8A5700`.
- Caso Emergencia: `[52, 25, 85, 82, 260]`. Esperado y obtenido: Emergencia, tarjeta `#AE2630`.

Pasos: ingresar lectura, abrir `SatipoApp`, pulsar Comenzar y comprobar texto, color e indicación de simulación. Resultado: los tres casos aprobados, sin excepción de interfaz. Son pruebas de widgets a 390 × 844; no son capturas de un teléfono físico.

Evidencia: tres casos `HU08/HU13` en [Flutter](evidencias/pmv_pruebas_20261110/flutter_tests.log). Para evidencia visual adicional de dos inferencias realmente realizadas desde la web publicada, consultar [Dos casos ML desde la aplicación](DOS_CASOS_ML_DESDE_APP.md), con sus capturas originales y alcance propio.

### P1-05 — HU06 y HU15: operación local y persistencia

Pasos comprobados por las suites: inferencia local, almacenamiento, reintentos, rechazo de duplicados, rollback y reapertura de SQLite; manejo de cola local y sincronización controlada en web. Esperado: conservar registros válidos sin duplicar ni aceptar parcialmente un lote fallido. Resultado: pruebas aprobadas.

Evidencias: logs [Flutter](evidencias/pmv_pruebas_20261110/flutter_tests.log), [JavaScript](evidencias/pmv_pruebas_20261110/javascript.log) y [Python](evidencias/pmv_pruebas_20261110/python.log), que detallan los casos ejecutados. No equivalen a cortar la alimentación de una placa ni a medir su almacenamiento LittleFS.

## PMV2: casos y resultados

### P2-01 — HU13: actualización del estado

Pasos: ingresar Normal y Advertencia, abrir la pantalla de estado, ingresar una nueva Emergencia y simular pausa/reanudación de la aplicación para refrescarla. Esperado: mostrar la clasificación de la lectura nueva. Resultado: Emergencia visible. El caso prueba actualización al refrescar; no demuestra recepción por radio ni notificaciones en segundo plano.

### P2-02 — HU11: presentación y filtros de alertas

Pasos: con esas tres lecturas calculadas por ML, abrir Alertas; contar tarjetas; filtrar Emergencia y después Normal. Esperado: dos alertas inicialmente, una emergencia al filtrar y ninguna alerta normal. Resultado: 2 / 1 / 0, con mensaje de lista vacía cuando corresponde. Normal se conserva como lectura, pero no genera una alerta.

Evidencia de P2-01 y P2-02: caso `HU11/HU13: alertas ML excluyen Normal, filtran y reflejan una nueva lectura` en [Flutter](evidencias/pmv_pruebas_20261110/flutter_tests.log).

### P2-03 — HU11: tramas fragmentadas y modelo compatible

Pasos: serializar tres lecturas, dividirlas en fragmentos de siete bytes, reconstruirlas con `BleFrames` e ingresarlas al servicio móvil. Luego intentar ingresar una lectura con versión de modelo incompatible. Esperado: obtener los tres niveles y rechazar la versión ajena sin agregar registros. Resultado: aprobado. También pasa la prueba existente de UTF-8 fragmentado y límites de memoria.

Esto verifica el procesamiento de tramas, no la radio Bluetooth de una placa. Evidencia: casos BLE en [Flutter](evidencias/pmv_pruebas_20261110/flutter_tests.log).

### P2-04 — HU11: interpretación de datos remotos y acceso

Pasos: probar predicciones remotas con relaciones objeto/lista, conservar su versión sin inventar latencia, rechazar mediciones incompletas y predicciones ausentes; comprobar aislamiento de sesión local, permisos y expiración. Esperado: datos válidos interpretados correctamente y acceso restringido según perfil. Resultado: aprobado en `cloud_records_test.dart` y `core_test.dart`.

Son pruebas controladas de adaptación y sesión. No prueban una conexión actual con Supabase ni entrega automática de notificaciones push. Evidencia: [Flutter](evidencias/pmv_pruebas_20261110/flutter_tests.log).

### P2-05 — HU09 y HU10: señal física

Estado: pendiente. La revisión de `firmware/pmv1/src/main.cpp` no encontró implementación de control del LED y buzzer. Los colores de una tarjeta móvil no satisfacen una señal luminosa física. Es necesario implementar ambas salidas y luego probarlas en el montaje.

## Protocolo físico pendiente para cerrar la evaluación

Registrar fecha, responsable, placa, sensores, calibración, versión/hash de firmware y modelo, conexiones, entradas aplicadas, resultado esperado, resultado observado y archivo de evidencia. Dejar resultado observado como **pendiente** hasta ejecutar cada ensayo.

1. HU04/HU05: capturar diez lecturas consecutivas de sensores calibrados; verificar cinco variables, identificadores únicos y rechazo de un sensor desconectado. Conservar log original.
2. HU06: retirar Internet, procesar diez lecturas nuevas en la placa y comprobar modelo, latencia y persistencia. Si se exige Edge Impulse, integrar primero su exportación real; el árbol propio no acredita esa integración.
3. HU09: después de implementar LED, aplicar casos controlados Normal/Advertencia/Emergencia y grabar lectura, resultado ML y salida verde/amarilla/roja en el mismo ensayo.
4. HU10: después de implementar buzzer, comprobar activación en Emergencia, ausencia en los otros niveles y que la adquisición continúa. Registrar comportamiento y audibilidad real.
5. HU11: transmitir desde ESP32-S3 al teléfono, medir entrega, distancia, interrupción y reconexión; comparar identificadores enviados y recibidos. Las pruebas de fragmentos no sustituyen este ensayo.
6. HU15: reiniciar la placa, recuperar registros y comparar cantidades y contenido; ensayar recuperación tras interrupción de manera controlada. No asumir durabilidad eléctrica por pasar SQLite.

Utilizar señales de prueba controladas; no provocar un incendio. Acordar antes del ensayo los criterios de desempeño y latencia. Conservar fallos y resultados correctos. Ver también [protocolo de PMV1 y Edge Impulse](PMV1_PRUEBAS_Y_EDGE_IMPULSE.md).

## Entrega al evaluador

Adjuntar este informe, `results.json`, los seis logs originales, las dos evaluaciones JSON y las capturas de los dos casos web. Indicar: **pruebas automatizadas de software ejecutadas y aprobadas; validación física pendiente**. No presentar 115 pruebas como 115 ensayos de campo ni los 3,000 ejemplos como mediciones reales.
