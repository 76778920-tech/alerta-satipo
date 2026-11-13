# Auditoría FURPS de Alerta Satipo

**Rol:** auditor senior de calidad de software.  
**Fecha:** 13 de noviembre de 2026.  
**Alcance inspeccionado:** frontend web, backend Node.js, aplicación Flutter/Dart, scripts Python, esquema de datos, pruebas, configuración y documentación disponible.  
**Marco aplicado:** Functionality, Usability, Reliability, Performance y Supportability. Por instrucción del proyecto, no se aplica OWASP ni extensiones de seguridad ajenas a estas cinco dimensiones.

## Resumen ejecutivo

Alerta Satipo presenta una base de software modular y verificable para la clasificación ambiental, consulta de estado, historial, alertas comunitarias, administración y persistencia local/remota. La arquitectura separa dominio, aplicación, puertos y adaptadores; el backend expone códigos de error definidos y el cliente móvil conserva información local mediante SQLite. La ejecución controlada más reciente aprobó 48 pruebas Node.js, 49 pruebas Python, un recorrido automatizado de navegador, análisis estático Flutter sin incidencias y 18 pruebas Flutter.

El nivel de cumplimiento global es **parcialmente satisfactorio para software en Windows**. El proyecto no debe declararse listo para operación de campo ni para detección real de incendios: todavía faltan evidencia Android nativa, prueba de bajos recursos, campaña formal de rendimiento, evaluación de usabilidad con usuarios y validación física de sensores, BLE y ESP32-S3.

Los puntajes son una estimación cualitativa de madurez sobre cinco puntos, no una certificación externa ni una medida de cobertura total.

## Puntaje por categoría

**Functionality: 4 de 5.** Hay evidencia de los flujos de negocio y de los casos PMV evaluados en software. La puntuación no alcanza cinco porque las integraciones físicas y la validación en Android nativo no están demostradas.

**Usability: 3 de 5.** Existen pantallas diferenciadas, etiquetas de nivel, navegación por Estado, Alertas e Historial, validaciones y mensajes de estado. Falta evaluación con usuarios objetivo y una revisión formal de accesibilidad.

**Reliability: 3 de 5.** Se verifican validaciones, rollback, cola local, reintento, reapertura, expiración de sesión y errores de red en pruebas controladas. Falta evidencia de estabilidad en Android, memoria limitada, conectividad real y hardware.

**Performance: 1 de 5.** El repositorio contiene una prueba k6, pero no se encontró una campaña documentada con usuarios virtuales, ramp-up, duración, p50, p95 y porcentaje de error. No se debe inferir rendimiento a partir de compilaciones o pruebas unitarias.

**Supportability: 4 de 5.** La estructura separa frontend, backend, móvil, datos, migraciones, firmware, pruebas y documentación. Hay pruebas automatizadas y un comando consolidado de verificación. El puntaje se limita porque las referencias históricas de proveedores requieren conciliación final y la ejecución Android no está documentada.

## Hallazgos y evidencias

### Functionality

**Hallazgo F-01: flujos de software implementados y cubiertos parcialmente por pruebas.**

La arquitectura documenta operaciones de lecturas, mantenimiento, casos, actividad y configuración. En frontend se encuentran casos de uso para autenticación, comunidad, adquisición, historial, simulación, riesgo y preferencias. En móvil se observan pantallas de Estado, Alertas, Historial, Dispositivo y Perfil, además de adaptadores para SQLite, Supabase y recepción BLE. La base local define entidades para usuarios, nodos, lecturas, predicciones, alertas y reportes con restricciones de rango y relaciones.

**Evidencia:** `docs/ARQUITECTURA_IMPLEMENTADA.md`; `backend/application/use-cases/admin-service.mjs`; `frontend/src/domain/`; `mobile/lib/ui/app.dart`; `mobile/lib/adapters/local_database.dart`; `mobile/lib/adapters/cloud_records.dart`.

**Hallazgo F-02: PMV1 y PMV2 están acreditados como software, no como detección física.**

Las pruebas reproducen la evaluación triclase de 3 000 casos reservados, rangos de cinco variables, persistencia de lectura/predicción/alerta y visualización en Flutter. Las pruebas móviles también cubren inferencia Dart, registros remotos, SQLite y tramas BLE fragmentadas. Los datos de PMV1/PMV2 son sintéticos y las pruebas BLE son a nivel de trama de software.

**Evidencia:** `tests/pmv1.test.mjs`; `tests/pmv1-full-evaluation.test.mjs`; `mobile/test/pmv_acceptance_test.dart`; `mobile/test/cloud_records_test.dart`; `mobile/test/core_test.dart`.

**Brecha:** no existe evidencia observada de sensor físico, comunicación BLE real, ESP32-S3 o inferencia desplegada en una placa. Tampoco se puede afirmar detección de incendios reales o desempeño forestal en Satipo.

### Usability

**Hallazgo U-01: la interfaz separa los flujos de poblador y administrador.**

El cliente móvil declara que sus cuentas son de pobladores y no otorga privilegios administrativos de Supabase. La aplicación presenta estado actual, alertas generales, historial, dispositivo y perfil. La interfaz muestra niveles Normal, Advertencia y Emergencia con texto y color; los textos de pantalla incluyen el origen de la lectura y advertencias de conectividad.

**Evidencia:** `mobile/lib/ui/app.dart`; `frontend/web/`; `tests/browser_hexagonal.py`.

**Hallazgo U-02: hay retroalimentación y validaciones, pero no evaluación con personas usuarias.**

Los adaptadores y casos de uso lanzan errores de formato, estado inválido, permisos y datos remotos incompletos; las pruebas de navegador cubren rechazo de usuario no administrador, recuperación y preferencias. No se encontró evidencia de pruebas con pobladores, métricas de éxito de tareas, revisión de contraste, lector de pantalla o comprensión de las alertas.

**Riesgo:** una etiqueta de riesgo puede ser interpretada como confirmación de incendio si no se mantiene visible la fuente o condición de simulación.

### Reliability

**Hallazgo R-01: se observan mecanismos de control de fallos en la capa de software.**

Las pruebas Node.js cubren rechazo de entradas inválidas, errores HTTP, paginación inconsistente, proveedor no disponible, concurrencia y persistencia. La base SQLite móvil incluye transacciones, reintento, rollback y reapertura; las pruebas validan también la expiración de sesión y la reconstrucción de tramas BLE con límite de memoria. El backend traduce condiciones conocidas a 401, 403, 404, 409, 422 y 503.

**Evidencia:** `tests/*.test.mjs`; `mobile/test/core_test.dart`; `backend/adapters/in/http.mjs`; `mobile/lib/adapters/local_database.dart`; `test-results/furps-verificacion-20261113.txt`.

**Brecha:** no se observó una ejecución cerrada en Android nativo, en un equipo de 1 a 2 GB de RAM ni en conectividad móvil intermitente real. Tampoco se evaluó disponibilidad prolongada de servicios externos.

### Performance

**Hallazgo P-01: existe un artefacto de carga, pero no evidencia suficiente de ejecución.**

El proyecto contiene `tests/performance/api-load.k6.js`. Sin embargo, no se encontró durante la auditoría un informe que declare ambiente, versión, endpoints, datos, usuarios virtuales, ramp-up, duración, p50, p95, porcentaje de error y criterio de aceptación. Los tiempos locales de pruebas o inferencia no son sustituto de una campaña concurrente.

**Riesgo:** no es posible estimar capacidad, degradación ni comportamiento de los endpoints bajo concurrencia. Cualquier afirmación de rendimiento productivo sería no sustentada.

### Supportability

**Hallazgo S-01: estructura modular y pruebas reproducibles.**

El repositorio separa backend, frontend, móvil, base de datos, datos, firmware, CI/CD, scripts, pruebas y documentación. La arquitectura describe puertos de entrada y salida, adaptadores y composición. El código mantiene scripts de construcción y pruebas; `package-lock.json` y `pubspec.yaml` registran dependencias.

**Evidencia:** estructura de directorios; `docs/ARQUITECTURA_IMPLEMENTADA.md`; `package.json`; `mobile/pubspec.yaml`; `database/supabase/full_schema.sql`.

**Hallazgo S-02: verificación consolidada disponible.**

El proyecto dispone de `npm run verify:furps`, que ejecuta pruebas Node.js, Python, navegador, análisis estático Flutter y pruebas Flutter. La última ejecución observada terminó con cinco resultados PASS: 48 pruebas Node.js, 49 Python, navegador aprobado, análisis Flutter sin incidencias y 18 pruebas Flutter aprobadas.

**Evidencia:** `scripts/verify-furps.mjs`; `package.json`; `test-results/furps-verificacion-20261113.txt`.

**Brecha:** la documentación histórica incluye referencias a distintos proveedores y necesita una fuente única de decisiones vigentes. Además, Flutter informa dependencias con versiones posteriores disponibles; esto no es un fallo, pero cualquier actualización requiere compatibilidad y regresión controladas.

## Riesgos detectados

1. **Interpretación indebida del modelo.** El modelo triclase clasifica condiciones ambientales sobre datos sintéticos; no confirma incendios reales. Riesgo alto de comunicación si se elimina la advertencia de alcance.
2. **Dependencia de evidencia no física.** La integración BLE y los sensores se prueban a nivel de software. Riesgo medio-alto de que el comportamiento en hardware difiera del esperado.
3. **Rendimiento no caracterizado.** Sin campaña de carga no existe base para estimar capacidad ni latencia bajo concurrencia. Riesgo medio.
4. **Usabilidad no evaluada con población objetivo.** La interfaz puede ser funcional técnicamente sin ser comprensible o accesible en contexto comunitario. Riesgo medio.
5. **Ambientes y proveedores en transición.** Las configuraciones y documentos históricos pueden crear confusión sobre el componente vigente. Riesgo medio de mantenimiento y despliegue.

## Recomendaciones de alto nivel

1. Ejecutar y documentar el recorrido PMV2 en Android nativo; registrar dispositivo, Android, memoria, inicio de sesión, Estado, Alertas, Historial, cierre y reapertura.
2. Configurar y verificar un AVD o teléfono de máximo 2 GB de RAM antes de declarar soporte de bajos recursos.
3. Ejecutar k6 contra un ambiente no productivo con criterios de aceptación definidos y conservar su informe.
4. Realizar una prueba de usabilidad controlada y anonimizada con usuarios objetivo; medir comprensión de niveles, navegación, contraste y advertencia de simulación.
5. Mantener una decisión de arquitectura fechada que diferencie componentes activos, históricos y en migración; actualizar README, informe y tablero con la misma fuente de verdad.
6. Conservar `npm run verify:furps` como control de regresión previo a cualquier cambio y registrar su salida sin secretos.

## Conclusión

La auditoría identifica un proyecto con calidad de software consistente en el alcance ejecutado, especialmente en funcionalidad y soportabilidad. El cumplimiento FURPS no es total: usabilidad y confiabilidad requieren evidencia contextual, y rendimiento permanece pendiente. La continuación responsable consiste en cerrar estas brechas mediante pruebas observables, sin sustituirlas por documentación o métricas no equivalentes.
