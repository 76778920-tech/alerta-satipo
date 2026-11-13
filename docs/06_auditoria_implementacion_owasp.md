# 06. Auditoria de implementacion OWASP Top 10

**Proyecto:** Alerta Satipo  
**Fecha de revision:** 13 de noviembre de 2026  
**Alcance:** codigo y configuracion versionados en este repositorio. No sustituye una revision del panel remoto de Supabase/Firebase ni una prueba de penetracion.

## 1. Metodo y criterio de evidencia

La revision contrasta la auditoria inicial (`04_auditoria_owasp.md`) y el plan (`05_plan_owasp.md`) contra el estado actual del repositorio. Un control se marca como **corregido** solo cuando el cambio esta versionado y tiene una verificacion reproducible; **parcialmente corregido** cuando reduce el riesgo pero aun necesita una configuracion, prueba o componente externo; y **no corregido** cuando no se implemento la mitigacion propuesta. No se registran tokens, contrasenas, correos ni identificadores de usuarios como evidencia.

## 2. Resultado de los riesgos planificados

| ID | Riesgo y control planificado | Estado | Evidencia reproducible | Riesgo residual |
|---|---|---|---|---|
| OWASP-01 | Cabeceras CSP/HSTS y CORS de produccion | **Parcialmente corregido** | `firebase.json` incorpora CSP con `script-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'` y HSTS. Las seis redirecciones HTML dejaron de usar scripts inline. `backend/edge.mjs` ya no permite `localhost` por defecto y recibe origenes adicionales solo desde `API_ALLOWED_ORIGINS`. `tests/owasp-security.test.mjs` evita la regresion. | Falta comprobar las cabeceras en el dominio publicado y definir cualquier origen adicional mediante configuracion de despliegue. `style-src` conserva `unsafe-inline` debido a estilos historicos; no debe considerarse cerrado. |
| OWASP-02 | Evidencia de autenticacion remota y limites de sesion | **No corregido** | El codigo sigue usando Supabase Auth/JWT y el ensayo existente del feed de residentes documenta 200 para poblador, 403 para administrador y 401 sin sesion. | Falta evidencia fechada de politicas de contrasena, recuperacion, rate limiting y MFA/protecciones del proveedor. |
| OWASP-03 | Proteccion de datos locales en movil | **No corregido** | `mobile/lib/adapters/security.dart` usa PBKDF2-HMAC-SHA256 con sal aleatoria y el manifiesto deshabilita copias de seguridad. | SQLite no tiene cifrado de base de datos acreditado; se requiere decision de datos y prueba en telefono antes de afirmar proteccion completa en reposo. |
| OWASP-04 | Integridad de CI/CD y artefacto Android | **Parcialmente corregido** | `.github/workflows/checks.yml` ejecuta `npm audit --omit=dev --audit-level=high` despues de `npm ci`; la ejecucion local devolvio `found 0 vulnerabilities`. El workflow conserva pruebas, build y artefactos. | Aun existen actions por etiqueta en vez de SHA y el APK de CI es `--debug`; no hay firma de publicacion ni verificacion de procedencia del APK. |
| OWASP-05 | Registro seguro de eventos de API | **Parcialmente corregido** | `backend/adapters/in/http.mjs` emite un evento estructurado con metodo, ruta, estado y resultado categorico; no incluye cuerpo, token, cabecera Authorization, origen ni respuesta. | El registro es de proceso; falta centralizacion, retencion, alerta y revision operativa. No se declara como SIEM. |
| OWASP-06 | Revalidacion de controles | **Parcialmente corregido** | Se ejecutaron `npm test` (49 aprobadas), `npm audit --omit=dev --audit-level=high` (0 vulnerabilidades), `flutter analyze` (sin incidencias) y `flutter test` (18 aprobadas). | Falta ejecucion remota posterior al despliegue, analisis de dependencias moviles/firmware y una revision manual integral de roles. |

## 3. Evaluacion por categoria OWASP Top 10 (2021)

| Categoria | Estado actualizado | Evidencia | Riesgo residual |
|---|---|---|---|
| A01 Control de acceso roto | Parcialmente corregido | JWT/RLS, feed residente con prueba autorizada, prohibida y sin sesion; CORS de Edge sin localhost implicito. | Medio: falta prueba remota por cada rol y operacion de escritura. |
| A02 Fallos criptograficos | Parcialmente corregido | Hash PBKDF2, almacenamiento seguro de sesion y `allowBackup=false`. | Medio: falta cifrado SQLite y politica remota comprobada. |
| A03 Inyeccion | Mitigado en el alcance revisado | Validacion de JSON y tamano de cuerpo; SDK y funciones SQL con permisos restringidos. | Bajo: se requiere mantener validacion al agregar rutas. |
| A04 Diseno inseguro | Parcialmente corregido | Separacion de interfaz de poblador y consola administrativa; arquitectura de puertos y adaptadores. | Medio: falta modelo de amenazas formal y revision por HU. |
| A05 Configuracion incorrecta | Parcialmente corregido | CSP/HSTS, X-Frame-Options, nosniff, Referrer-Policy y CORS explicito. | Medio: falta comprobar la configuracion realmente desplegada; CSP aun permite estilos inline. |
| A06 Componentes vulnerables | Parcialmente corregido | Auditoria npm de dependencias de produccion sin vulnerabilidades y ejecucion incorporada a CI. | Bajo/medio: no cubre dependencias Flutter, firmware ni proveedor externo. |
| A07 Identificacion/autenticacion | Parcialmente corregido | Supabase Auth, JWT y ensayo de autorizacion del feed. | Medio: faltan limites de intentos y politica de credenciales acreditados desde el proveedor. |
| A08 Integridad de software y datos | Parcialmente corregido | CI ejecuta builds y pruebas; varios actions ya usan SHA. | Medio: quedan referencias por etiqueta y APK debug no firmado. |
| A09 Registro y monitoreo | Parcialmente corregido | Registro estructurado local sin secretos en adaptador HTTP. | Medio: no hay monitoreo central, alertas ni politica de retencion. |
| A10 SSRF | Mitigado en el alcance revisado | Integraciones externas de ambiente usan destinos HTTPS definidos y controles de timeout/tamano. | Bajo: conservar listas permitidas al agregar proveedores. |

## 4. Pruebas ejecutadas

| Comando | Resultado | Que acredita | Que no acredita |
|---|---|---|---|
| `npm test` | 49 pruebas aprobadas | Dominio, adaptadores HTTP, CORS, autenticacion, autorizacion, limites de solicitud y prueba de regresion de cabeceras/CORS. | No prueba Supabase remoto ni Firebase desplegado. |
| `npm audit --omit=dev --audit-level=high` | 0 vulnerabilidades reportadas | Dependencias npm de produccion en el estado ejecutado. | No cubre Flutter, firmware, imagenes de CI ni servicios externos. |
| `flutter analyze` | Sin incidencias | Analisis estatico Dart del movil. | No evalua configuracion de cuentas ni dispositivo fisico. |
| `flutter test` | 18 pruebas aprobadas | Reglas, sesion, cola local, almacenamiento y adaptadores simulados. | No acredita cifrado SQLite, BLE real ni Android fisico. |

## 5. Puntuacion actualizada

La puntuacion de implementacion es **72/100 - riesgo residual medio**. Subio respecto de la auditoria inicial debido a la eliminacion de scripts inline de las redirecciones, la CSP/HSTS versionada, el CORS de produccion explicito, la auditoria npm en CI y las trazas sin secretos. No se eleva a riesgo bajo porque siguen pendientes controles verificables fuera del repositorio: politica remota de autenticacion, cifrado de datos locales, firma Android, fijacion completa de actions, monitoreo central y comprobacion posterior al despliegue.

## 6. Conclusion independiente

La implementacion reduce riesgos concretos sin romper las pruebas automatizadas. No corresponde declarar cumplimiento total de OWASP Top 10: el proyecto tiene controles de base verificables y una lista explicita de riesgos residuales. El siguiente cierre valido es ejecutar y adjuntar evidencia sin secretos de: cabeceras en produccion, configuracion de autenticacion de Supabase, matriz RLS por rol, firma de APK de release y una politica de logs/alertas. Hasta entonces, los estados parciales deben mantenerse como parciales en el informe y en Trello.
