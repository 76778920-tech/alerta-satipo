# Plan de mejora FURPS de Alerta Satipo

**Rol:** arquitecto de software senior.  
**Fecha:** 13 de noviembre de 2026.  
**Entrada:** `docs/01_auditoria_furps.md`.  
**Alcance:** mejoras de Functionality, Usability, Reliability, Performance y Supportability. No incluye remediación OWASP.

## Objetivo del plan

Cerrar de forma incremental las brechas FURPS detectadas sin interrumpir los flujos actuales de administración, poblador, consulta de lecturas, predicciones, historial, alertas ni persistencia local. Cada cambio debe ser reversible, validado en un ambiente identificado y respaldado por evidencia fechada. Ninguna mejora autoriza reemplazar proveedores, migrar datos, actualizar dependencias masivamente o declarar validación física sin una actividad específica aprobada.

## Estrategia de preservación de funcionalidad

1. Crear una rama o conjunto de cambios identificable por mejora; no mezclar ajustes de interfaz, proveedor, modelo y rendimiento en un mismo cambio.
2. Ejecutar `npm run verify:furps` antes de modificar y después de integrar cada mejora. Si alguno de sus controles falla, el cambio no se considera cerrado.
3. Realizar pruebas Android, bajo recurso, carga y usabilidad en ambientes controlados; no ejecutar carga sobre datos productivos ni sobre las 1 011 lecturas de demostración.
4. Conservar las configuraciones anteriores, evidencia y una instrucción de reversión antes de modificar variables, dependencias o despliegues.
5. Mantener las etiquetas de simulación y los límites del modelo: una clasificación ambiental no se comunica como confirmación de incendio.

## Roadmap recomendado

**Fase 0 - Línea base actual.** Conservar la salida satisfactoria de `npm run verify:furps`, el commit asociado y las versiones de herramientas. Esta fase ya cuenta con evidencia local.

**Fase 1 - Confiabilidad de ejecución móvil.** Ejecutar primero Android nativo y después bajo recurso. Ambas actividades dependen de un dispositivo o AVD real, no de pruebas Flutter de escritorio.

**Fase 2 - Usabilidad.** Con la aplicación estable en Android, realizar evaluación controlada con usuarios objetivo y ajustar únicamente los hallazgos confirmados.

**Fase 3 - Rendimiento.** Ejecutar k6 en un ambiente no productivo y establecer límites de aceptación antes de optimizar consultas o infraestructura.

**Fase 4 - Gobernanza técnica.** Consolidar decisiones de proveedores, ambientes y versiones después de que las pruebas anteriores definan el componente activo. No migrar proveedores solo para cerrar documentación.

## Mejoras priorizadas

### FURPS-01 Verificación de regresiones consolidada

**Estado actual:** implementada como línea base.

**Objetivo:** repetir las verificaciones automatizadas principales con un solo comando antes y después de cambios relevantes.

**Justificación:** anteriormente las pruebas se ejecutaban como comandos dispersos. Un orquestador reduce omisiones y permite conocer de manera inmediata si Node.js, Python, navegador o Flutter presentan una regresión.

**Prioridad:** alta.

**Riesgo de ejecución:** bajo. El comando no inicia servicios remotos ni escribe datos de producción; su riesgo principal es fallar por una dependencia local ausente.

**Dependencias:** Node.js, npm, Python, Flutter y dependencias ya declaradas por el proyecto.

**Estrategia de validación:** ejecutar `npm run verify:furps`; el cierre exige código cero y PASS para Node.js, Python, navegador, Flutter analyze y Flutter test.

**Estrategia de rollback:** eliminar la referencia `verify:furps` de `package.json` y `scripts/verify-furps.mjs` en un cambio aislado. Las suites originales permanecen disponibles, por lo que la reversión no afecta casos de uso ni datos.

### FURPS-02 Recorrido crítico en Android nativo

**Objetivo:** acreditar que la aplicación móvil funciona en Android para el recorrido de poblador: inicio de sesión, Estado, Alertas, Historial, cierre y reapertura.

**Justificación:** `flutter test` en Windows prueba lógica y widgets, pero no acredita ciclo de vida, permisos, almacenamiento y renderizado en Android.

**Prioridad:** crítica.

**Riesgo de ejecución:** medio. Pueden aparecer diferencias de permisos, almacenamiento o configuración de Android. No se deben modificar modelos ni tablas mientras se diagnostique un resultado.

**Dependencias:** teléfono Android o AVD, Android Debug Bridge, APK o `flutter run`, cuenta de poblador no privilegiada y datos no sensibles.

**Estrategia de validación:** registrar `adb devices -l`, modelo, versión Android, resolución y recorrido visible. Tras cerrar la aplicación, reabrirla y comprobar la restauración esperada. Capturar resultados sin correos, tokens, contraseñas ni identificadores privados.

**Estrategia de rollback:** si la versión candidata falla, desinstalar solo la compilación de prueba o volver al APK anterior conocido; conservar el log y marcar la actividad como fallida. No eliminar datos ni sustituir la evidencia con una captura de Windows.

### FURPS-03 Prueba en bajos recursos

**Objetivo:** comprobar estabilidad del recorrido móvil en un teléfono o AVD de máximo 2 GB de RAM.

**Justificación:** el público objetivo puede usar dispositivos con recursos limitados; una ejecución en un equipo de desarrollo no demuestra este comportamiento.

**Prioridad:** alta.

**Riesgo de ejecución:** medio. El AVD puede tener más memoria de la declarada, pueden ocurrir cierres o degradación de interfaz y la prueba puede ser inconclusa.

**Dependencias:** dispositivo de 1 a 2 GB de RAM o AVD configurado, salida de `MemTotal`, Android nativo y datos de prueba locales.

**Estrategia de validación:** registrar memoria real, iniciar el recorrido crítico, comprobar estado, alertas e historial, y verificar que no existan cierres inesperados. El resultado solo se marca aprobado si la memoria observable cumple el límite.

**Estrategia de rollback:** no hay cambio de software que revertir. Ante falla, conservar captura y log, restaurar la configuración previa del AVD si fue modificada y dejar la mejora como no implementada.

### FURPS-04 Campaña de rendimiento controlada

**Objetivo:** medir comportamiento de endpoints autorizados bajo concurrencia mediante k6 o una herramienta equivalente.

**Justificación:** la auditoría identificó que no existen métricas de p50, p95, throughput o porcentaje de error obtenidas en una campaña formal.

**Prioridad:** alta.

**Riesgo de ejecución:** alto si se apunta a producción o se usan datos reales. La prueba puede aumentar carga, afectar cuotas o modificar el estado si se seleccionan rutas de escritura.

**Dependencias:** ambiente no productivo, datos aislados, script de carga revisado, endpoints de solo lectura o restaurables, autorización explícita y monitoreo.

**Estrategia de validación:** definir antes de ejecutar versión, ambiente, endpoints, usuarios virtuales, ramp-up, duración, p50, p95, porcentaje de error y criterio de aceptación. Guardar el informe de k6 y comparar con el umbral definido. No publicar métricas sin este contexto.

**Estrategia de rollback:** detener inmediatamente la prueba, revocar el ambiente temporal si corresponde y restaurar la base aislada desde el respaldo. No ejecutar contra la demostración de 1 011 lecturas ni contra datos productivos.

### FURPS-05 Evaluación de usabilidad y accesibilidad

**Objetivo:** verificar que usuarios objetivo comprendan el estado, las alertas, el historial y el límite de interpretación de la clasificación.

**Justificación:** las pruebas automatizadas muestran navegación y validaciones, pero no miden comprensión, contraste, tamaño táctil ni dificultades de uso.

**Prioridad:** media.

**Riesgo de ejecución:** bajo a medio. Puede exponerse información personal o generar expectativas de detección real si no se controla el guion de prueba.

**Dependencias:** participantes voluntarios, consentimiento, dispositivo Android validado, guion de tareas, datos de simulación y formato anonimizado de observación.

**Estrategia de validación:** solicitar tareas de consulta de Estado, filtro de Alertas, revisión de Historial y lectura de la advertencia de simulación. Registrar éxito de tarea, tiempo, dificultad, comprensión de niveles, contraste y observaciones sin identificar personas.

**Estrategia de rollback:** si un cambio de interfaz reduce el éxito de tareas o genera confusión, restaurar la versión anterior de textos o navegación y ejecutar nuevamente las pruebas automatizadas y de usuario.

### FURPS-06 Decisiones técnicas y ambientes vigentes

**Objetivo:** mantener una fuente de verdad sobre proveedores activos, componentes históricos, variables por ambiente sin valores secretos y versiones de herramientas.

**Justificación:** referencias históricas a distintos proveedores pueden producir configuraciones inconsistentes y dificultar la reproducción del proyecto.

**Prioridad:** media.

**Riesgo de ejecución:** medio. Cambiar documentación o configuración sin revisar el componente activo puede inducir a despliegues incorrectos.

**Dependencias:** responsables de arquitectura, acceso de solo lectura a configuración, README, informe, tablero y documento de decisiones vigentes.

**Estrategia de validación:** comparar la página de decisiones con las variables utilizadas por cada ambiente, scripts de despliegue y README. El cierre exige que cada proveedor aparezca como activo, histórico o en transición y que no se publiquen secretos.

**Estrategia de rollback:** mantener historial de decisiones y revertir únicamente el documento o configuración modificada. No migrar base de datos, hosting o autenticación dentro de esta mejora documental.

## Riesgos de ejecución transversales

Los riesgos principales son confundir pruebas de software con validación física, ejecutar cargas en producción, exponer secretos en capturas, actualizar dependencias sin regresión y modificar proveedores sin respaldo. Se mitigan aislando ambientes, usando datos no sensibles, preservando configuraciones previas y obligando una verificación automatizada antes y después de cada cambio.

## Orden de cierre recomendado

1. Mantener FURPS-01 como control obligatorio de regresión.
2. Cerrar FURPS-02 con evidencia Android nativa.
3. Cerrar FURPS-03 solo con memoria verificable de máximo 2 GB.
4. Ejecutar FURPS-05 con el recorrido móvil ya estable.
5. Ejecutar FURPS-04 en ambiente no productivo.
6. Consolidar FURPS-06 cuando los componentes vigentes estén confirmados.

El plan no está completamente implementado hasta que cada mejora tenga evidencia observada, resultado y responsable. La documentación de la actividad no sustituye la ejecución requerida.
