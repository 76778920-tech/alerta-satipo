# Auditoría de implementación FURPS de Alerta Satipo

**Rol:** auditor independiente de implementación FURPS.  
**Fecha de verificación:** 13 de noviembre de 2026.  
**Entradas revisadas:** `docs/01_auditoria_furps.md`, `docs/02_plan_furps.md`, código, scripts y resultados observables del repositorio.  
**Alcance:** Functionality, Usability, Reliability, Performance y Supportability. Esta auditoría no incluye OWASP.

## Criterio de verificación

Cada mejora del plan se clasifica como **implementada**, **parcialmente implementada** o **no implementada**. La clasificación se basa exclusivamente en artefactos observables y pruebas ejecutadas. Un archivo de planificación, una pantalla o una prueba unitaria no se consideran sustitutos de una ejecución física, una prueba de carga o una sesión con usuarios cuando el plan los exige.

## Comparación antes y después

Antes de esta implementación, las verificaciones de calidad estaban distribuidas en comandos independientes: `npm test`, `npm run test:python`, `npm run test:browser`, `flutter analyze` y `flutter test`. El proyecto ya tenía las suites, pero no existía un comando único que detuviera y resumiera la verificación FURPS completa.

Después de la implementación, el repositorio contiene `scripts/verify-furps.mjs` y el script npm `verify:furps`. El comando ejecuta las cinco verificaciones en secuencia y muestra un resultado PASS o FAIL para cada una. La ejecución observada posterior al cambio terminó con código cero y cinco resultados PASS. No se detectó una regresión en las suites automatizadas disponibles.

## Estado de mejoras del plan

### FURPS-01 Consolidar la verificación de regresiones

**Estado: implementada.**

La evidencia observable es `scripts/verify-furps.mjs` y la entrada `verify:furps` de `package.json`. El script ejecuta pruebas Node.js, Python y navegador desde la raíz, y `flutter analyze` y `flutter test` desde `mobile`. En Windows utiliza `cmd.exe` para permitir la ejecución compatible de los comandos npm y Flutter distribuidos como `.cmd` o `.bat`.

La prueba posterior se ejecutó con:

```powershell
npm run verify:furps
```

Resultado observado: 48 pruebas Node.js aprobadas; 49 pruebas Python aprobadas; recorrido de navegador aprobado; `flutter analyze` sin incidencias; 18 pruebas Flutter aprobadas. La salida final indicó PASS para los cinco controles y código de salida cero. El log está disponible en `test-results/furps-verificacion-20261113.txt`.

### FURPS-02 Validar el recorrido crítico en Android nativo

**Estado: no implementada.**

El plan exige una ejecución observable en teléfono o AVD Android que registre modelo, versión, resolución y recorrido de Estado, Alertas e Historial, seguido del cierre y reapertura de la aplicación. Durante esta auditoría no se observó un dispositivo Android conectado ni una evidencia de `adb devices -l` con una ejecución exitosa. Las pruebas Flutter en Windows no acreditan Android nativo.

### FURPS-03 Ejecutar prueba de bajos recursos

**Estado: no implementada.**

No se encontró evidencia de un teléfono de 1 a 2 GB de RAM ni un AVD configurado y verificado dentro de ese límite. Tampoco se encontró una salida de `MemTotal`, un recorrido funcional ni una prueba de estabilidad en dicho ambiente. Esta mejora permanece abierta.

### FURPS-04 Realizar campaña de rendimiento no productiva

**Estado: no implementada.**

El repositorio contiene `tests/performance/api-load.k6.js`, pero no se observó durante esta auditoría una campaña con ambiente, versión, endpoints autorizados, datos de prueba, usuarios virtuales, ramp-up, duración, p50, p95, porcentaje de error y criterio de aceptación. La existencia del script no demuestra que la campaña se haya ejecutado. No se publican métricas de capacidad ni rendimiento productivo.

### FURPS-05 Evaluar usabilidad y accesibilidad de alertas

**Estado: no implementada.**

Existen pantallas y pruebas de navegación, pero no se observó una sesión registrada con usuarios objetivo, una matriz anonimizada de tareas, resultados de comprensión, evaluación de contraste, revisión con lector de pantalla ni hallazgos de accesibilidad. La evidencia automatizada de interfaz no reemplaza una evaluación de usabilidad.

### FURPS-06 Centralizar decisiones y versiones de entorno

**Estado: parcialmente implementada.**

La evidencia observable incluye `docs/DECISIONES_VIGENTES.md`, que diferencia Firebase Hosting y Supabase como componentes activos de este repositorio de Vercel y Neon como antecedentes de migración no activos. El archivo `test-results/ambiente-herramientas.txt` registra Node.js 24.14.0, npm 11.9.0, Python 3.12.10, Flutter 3.41.7 y Git 2.53.0. También existen migraciones y scripts versionados.

No obstante, el propio documento de decisiones identifica correcciones manuales pendientes en Gantt, Trello, informe y capturas. La consistencia entre todas esas piezas no fue observada en esta auditoría. La mejora requiere esa revisión editorial final y una fuente de verdad vigente enlazada desde README antes de considerarse cerrada.

## Revisión de regresiones e incompatibilidades

La ejecución posterior a FURPS-01 no mostró pruebas fallidas en Node.js, Python, navegador ni Flutter. `flutter analyze` no reportó incidencias. La modificación es de automatización de verificación y no modifica casos de uso, interfaz, esquema, migraciones ni datos de producción.

Como hallazgo menor, Flutter informó que existen paquetes con versiones más recientes disponibles. Esto no es una incompatibilidad ni un fallo actual. Actualizar dependencias no forma parte de esta implementación porque requeriría un cambio separado, evaluación de compatibilidad y nueva ejecución completa de pruebas.

## Riesgos residuales

Persisten los riesgos identificados en la auditoría base: falta de validación Android nativa, prueba de bajos recursos, rendimiento concurrente, evaluación de usabilidad con usuarios, integración física de sensores, ESP32-S3 y BLE, y validación con datos de campo. Ninguno de estos riesgos debe presentarse como resuelto por la automatización FURPS.

La clasificación PMV1/PMV2 continúa basada en datos sintéticos y clasifica condiciones ambientales. No acredita una detección de incendio real ni debe comunicarse como confirmación de un evento en Satipo.

## Conclusión de cumplimiento

**Cumplimiento parcial del plan FURPS.** FURPS-01 fue implementada y validada sin regresiones observadas. FURPS-06 está parcialmente implementada con evidencia de decisiones y versiones, pero conserva pendientes externos al repositorio. FURPS-02, FURPS-03, FURPS-04 y FURPS-05 no cuentan todavía con la evidencia exigida y permanecen abiertas. Por tanto, la mejora de soportabilidad puede acreditarse, pero no corresponde emitir un dictamen de calidad total ni de preparación productiva.

## Reproducción

Ejecutar desde la raíz del repositorio:

```powershell
npm run verify:furps
```

El resultado solo es satisfactorio si los cinco controles terminan en PASS y el proceso devuelve código cero.
