# 07. Auditoria final integral

**Proyecto:** Alerta Satipo  
**Fecha:** 13 de noviembre de 2026  
**Rol:** Auditor Principal de Calidad y Seguridad  
**Entradas:** `03_auditoria_implementacion_furps.md`, `06_auditoria_implementacion_owasp.md` y estado verificable del repositorio.

## 1. Resumen ejecutivo

El proyecto tiene una base de software verificable para una demostracion academica controlada. La arquitectura separa dominio, casos de uso y adaptadores; existen controles de autenticacion, autorizacion, RLS, validacion de entradas, almacenamiento local, clasificacion PMV y una cadena de pruebas automatizadas. La revision mas reciente confirma 49 pruebas Node aprobadas, 49 pruebas Python aprobadas, un recorrido de navegador aprobado, analisis Flutter sin incidencias y 18 pruebas Flutter aprobadas. La auditoria npm de dependencias de produccion no reporto vulnerabilidades conocidas.

La evidencia no permite tratar el producto como un sistema operativo de alerta de incendios. Persisten faltas de validacion Android nativa, equipo de bajos recursos, carga concurrente, evaluacion con usuarios, sensores/ESP32-S3/BLE reales, datos de campo, configuracion remota de autenticacion y observabilidad centralizada. PMV1 y PMV2 clasifican condiciones ambientales; no confirman ni localizan incendios reales.

## 2. Dictamen de calidad FURPS

**Estado: cumple parcialmente.**

| Dimension | Estado | Evidencia | Limite que impide cumplimiento total |
|---|---|---|---|
| Functionality | Parcialmente acreditada | Pruebas de dominio, casos de uso, backend, navegador y Flutter; flujos de estado, alertas, historial, sesion y prediccion. | No existe validacion fisica ni datos de campo para afirmar deteccion real. |
| Usability | Parcialmente acreditada | Interfaces web y movil, etiquetas de nivel y recorridos de navegador. | No hay estudio de usuarios, contraste documentado ni ensayo de accesibilidad asistiva. |
| Reliability | Parcialmente acreditada | Pruebas de cola local, reintento, rollback, persistencia y reanudacion. | Falta prueba Android real, conectividad variable y baja memoria. |
| Performance | No acreditada para produccion | Existen tiempos de pruebas y script k6 en el repositorio. | No hay campana de carga ejecutada con p50/p95, error rate y criterio de aceptacion. |
| Supportability | Acreditada en software, parcial en operacion | `npm run verify:furps`, CI/CD, migraciones, scripts y decisiones de arquitectura. | Gantt, Trello, informe y capturas aun requieren conciliacion; falta evidencia fisica. |

## 3. Dictamen de seguridad OWASP Top 10

**Estado: cumple parcialmente. Riesgo residual medio.**

Se implementaron y verificaron controles de configuracion: CSP que bloquea scripts inline, HSTS, CORS de Edge sin `localhost` por defecto, auditoria npm en CI y eventos HTTP estructurados sin secretos. Las pruebas de regresion confirman que esos controles no rompieron el comportamiento automatizado.

No se declara cumplimiento total de OWASP Top 10. Permanecen pendientes la evidencia de politicas remotas de Supabase, cifrado de SQLite, limitacion de intentos/MFA del proveedor, fijacion completa de actions de CI, firma de APK release, monitoreo central, alertas, retencion de logs y verificacion de cabeceras en el dominio publicado.

## 4. Funcionalidad y regresiones

**Estado: funcionalidad existente preservada en el alcance automatizado.**

La verificacion integral ejecuto las suites Node, Python, navegador y Flutter sin fallos. En Node se validaron tambien respuestas 401, 403, 404, 409, 413 y 422, CORS, token obligatorio, tamano de solicitud y el control OWASP de cabeceras/origenes. No se detecto una regresion automatizada introducida por los cambios FURPS u OWASP.

**Riesgo de regresion restante: medio.** Los cambios de cabeceras y CORS requieren comprobacion posterior al despliegue real; las pruebas locales no sustituyen un navegador contra Firebase/Supabase ni un dispositivo Android. Cualquier modificacion de origenes permitidos debe pasar por `API_ALLOWED_ORIGINS`, una prueba de preflight y una prueba autenticada antes de ser publicada.

## 5. Riesgos pendientes priorizados

| Prioridad | Riesgo pendiente | Impacto | Criterio de cierre verificable |
|---|---|---|---|
| Critica | Presentar clasificacion PMV como incendio confirmado. | Decision comunitaria indebida. | Etiquetas y guion declaran condicion ambiental, fuente y limite; validacion de campo independiente. |
| Alta | Falta de validacion Android, baja memoria y conectividad real. | Fallos no observados en la plataforma objetivo. | Registro de AVD/telefono, version Android, recorrido, reinicio y evidencia de persistencia. |
| Alta | Sin prueba de carga no productiva. | Capacidad y degradacion desconocidas. | Reporte k6/JMeter con ambiente, usuarios, ramp-up, p50/p95 y error rate. |
| Alta | Falta evidencia de seguridad remota y de APK release. | Configuracion insegura fuera del repositorio. | Capturas sin secretos de Supabase, RLS, cabeceras publicadas y APK firmado. |
| Media | Sin pruebas de usuario/accesibilidad. | Alertas incomprensibles o inaccesibles. | Matriz anonimizada de tareas, hallazgos y correcciones verificadas. |
| Media | Sin hardware/sensores/ESP32-S3/BLE reales. | La integracion fisica no esta acreditada. | Video y log de lectura, clasificacion, alerta y recuperacion. |
| Media | Sin monitoreo ni retencion central de seguridad. | Investigacion tardia ante fallos o abuso. | Politica de eventos, destino, retencion, alerta y prueba sin secretos. |

## 6. Observaciones de evidencia

1. La PoC publica binaria, el modelo PMV triclase y las 1,011 lecturas de demostracion son experimentos distintos. Sus metricas no deben mezclarse.
2. La ausencia de vulnerabilidades en `npm audit --omit=dev` cubre solamente dependencias npm de produccion en la ejecucion realizada; no cubre Flutter, firmware ni servicios SaaS.
3. Un resultado de prueba automatizada valida software en el entorno usado, pero no acredita rendimiento productivo, despliegue remoto, sensores ni usuarios reales.
4. El informe, Gantt y Trello deben mantener una sola linea de tiempo y una misma declaracion de proveedores activos antes de una entrega final.

## 7. Recomendacion final

**No apto para produccion como sistema de alerta de incendios.**

**Apto para demostracion academica controlada, con observaciones.** La recomendacion se fundamenta en que las pruebas de software y controles implementados son reproducibles, pero los riesgos pendientes son relevantes para una aplicacion que podria influir en decisiones de seguridad comunitaria. La autorizacion para produccion solo debe reconsiderarse despues de cerrar los riesgos criticos y altos de la seccion 5 con evidencia fechada, reproducible y sin secretos.

## 8. Comandos de reproduccion

Ejecutar desde la raiz del repositorio:

```powershell
npm run verify:furps
npm audit --omit=dev --audit-level=high
npm run build:api
```

El dictamen conserva validez solo si los comandos finalizan sin fallos y la evidencia remota/fisica pendiente se sigue declarando como pendiente.
