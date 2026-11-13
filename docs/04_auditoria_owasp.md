# Auditoría OWASP Top 10 de Alerta Satipo

**Rol:** auditor de seguridad de software.  
**Fecha:** 13 de noviembre de 2026.  
**Alcance:** frontend web, backend Node.js y Edge, aplicación Flutter, esquema Supabase, configuración, CI/CD, dependencias y pruebas disponibles en el repositorio.  
**Método:** revisión estática de código y configuración, inspección de migraciones y políticas, y consulta de evidencias de prueba existentes. Esta auditoría no realizó explotación, cambios de configuración, escritura remota ni prueba de penetración.

## Resumen ejecutivo y score global

**Score global estimado: 67 de 100 - riesgo global medio.** El sistema cuenta con controles verificables de autenticación, autorización por rol, RLS, validación de entradas, límites de tamaño, seguridad de sesión y una cadena de CI/CD con pruebas. No obstante, el score no representa una certificación ni una prueba de penetración completa. Las brechas principales son endurecimiento de cabeceras HTTP, configuración verificable de autenticación, protección de la cadena de entrega y monitoreo centralizado.

No se encontraron vulnerabilidades conocidas de producción en `npm audit --omit=dev` al momento de la auditoría. Este resultado no cubre dependencias Flutter, firmware, servicios SaaS ni configuraciones remotas fuera del repositorio.

## A01 Broken Access Control

**Estado:** parcialmente mitigado.  
**Impacto:** alto si una política RLS o una ruta administrativa queda expuesta.  
**Probabilidad:** baja a media dentro del código revisado.  
**Severidad:** medio.

El backend exige un token Bearer fuera de `/health`, autentica el usuario mediante Supabase y verifica el rol administrativo antes de operaciones de administración. Las políticas RLS habilitan restricciones por `auth.uid()` y funciones de verificación de administrador. El feed de pobladores está expuesto mediante `resident_pmv1_feed`, revoca acceso a `public` y `anon`, permite ejecución a `authenticated` y rechaza explícitamente administradores.

La evidencia de ejecución del feed registró HTTP 200 para un poblador, HTTP 403 para administrador y HTTP 401 sin sesión. Esto acredita ese caso de acceso, no todas las rutas ni todas las políticas desplegadas.

**Evidencia:** `backend/adapters/in/http.mjs`; `backend/adapters/out/supabase.mjs`; `database/supabase/migrations/202610290001_resident_feed.sql`; `database/supabase/full_schema.sql`; `tests/resident_feed_rbac_live.mjs`; `test-results/seguridad-rls.txt`.

**Brecha residual:** se requiere ejecutar la matriz de roles contra el proyecto desplegado tras cada migración relevante. La revisión de código no sustituye la inspección de RLS efectiva en la consola Supabase.

## A02 Cryptographic Failures

**Estado:** parcialmente mitigado.  
**Impacto:** alto si se exponen sesiones, contraseñas o datos locales.  
**Probabilidad:** media por ausencia de evidencia sobre todas las configuraciones remotas.  
**Severidad:** medio.

El móvil usa PBKDF2-HMAC-SHA256 con 600 000 iteraciones, sal aleatoria de 16 bytes y comparación de tiempo constante para las credenciales locales. La sesión se almacena mediante `flutter_secure_storage`. El manifiesto Android deshabilita respaldos automáticos con `android:allowBackup="false"`. Las rutas de proveedores revisadas usan HTTPS y las variables sensibles se excluyen mediante `.gitignore`.

No se observó evidencia de cifrado de la base SQLite local, rotación de secretos, política de expiración/recuperación de contraseña configurada en Supabase, MFA ni configuración de transporte remota como HSTS. Las claves no se imprimieron ni se incluyeron en este informe.

**Evidencia:** `mobile/lib/adapters/security.dart`; `mobile/android/app/src/main/AndroidManifest.xml`; `.env.example`; `.gitignore`.

## A03 Injection

**Estado:** mitigado dentro del alcance revisado.  
**Impacto:** alto si se introduce SQL, JSON o comando no validado.  
**Probabilidad:** baja en los flujos examinados.  
**Severidad:** bajo.

El adaptador HTTP exige JSON para escrituras, rechaza cuerpos mayores de 4 096 bytes, valida que la entrada sea un objeto y no expone SQL en los mensajes de error. Las operaciones de persistencia usan el SDK de Supabase y RPC con argumentos tipados, no concatenación de sentencias SQL desde el backend. Las funciones SQL revisadas establecen `search_path=''`. Las rutas de actualización se limitan mediante expresiones regulares y conjuntos de tablas definidos en código.

**Evidencia:** `backend/adapters/in/http.mjs`; `backend/adapters/out/supabase.mjs`; `database/supabase/full_schema.sql`; pruebas Node.js de adaptador HTTP y dominio.

**Brecha residual:** esta auditoría no usó un SAST exhaustivo ni un escáner de inyección sobre dependencias de terceros. Cualquier nueva consulta SQL dinámica o nueva RPC requiere revisión específica.

## A04 Insecure Design

**Estado:** parcialmente mitigado.  
**Impacto:** alto si un flujo comunitario expone facultades administrativas o si una clasificación se interpreta como decisión de emergencia.  
**Probabilidad:** media.  
**Severidad:** medio.

La arquitectura separa los flujos administrativo y de pobladores, aplica casos de uso y puertos, y declara que la clasificación ambiental no confirma un incendio. El feed de residentes oculta la consola administrativa y limita la salida a la información autorizada. Las pruebas validan el rechazo de poblador en la interfaz administrativa y el rechazo de administrador en el feed de poblador.

No se encontró un modelo formal de amenazas, un inventario de activos, un análisis de abuso de funciones o una política de retención de datos documentada para todas las rutas. Los escenarios de notificación, sensores, BLE y respuesta de emergencia aún no cuentan con validación física.

**Evidencia:** `docs/ARQUITECTURA_IMPLEMENTADA.md`; `docs/DECISIONES_VIGENTES.md`; `tests/frontend-hexagonal.test.mjs`; `tests/resident_feed_rbac_live.mjs`.

## A05 Security Misconfiguration

**Estado:** parcialmente mitigado.  
**Impacto:** alto si una configuración de origen, secreto o proveedor se publica incorrectamente.  
**Probabilidad:** media.  
**Severidad:** medio.

Firebase Hosting configura `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` y control de caché. El backend limita orígenes CORS conocidos, métodos, cabeceras, contenido y tamaño de cuerpos. `.gitignore` excluye `.env`, secretos locales, resultados de prueba y directorios temporales. La composición del backend rechaza claves administrativas y requiere una clave pública de Supabase.

No se observó una Content Security Policy en `firebase.json` ni una cabecera HSTS declarada en el repositorio. El backend Edge incluye orígenes de localhost junto con los dominios publicados; debe verificarse que dichos orígenes sean necesarios en producción. La configuración efectiva de Firebase, Supabase y GitHub Secrets no puede probarse solo leyendo el repositorio.

**Evidencia:** `firebase.json`; `backend/edge.mjs`; `backend/bootstrap.mjs`; `backend/adapters/in/http.mjs`; `.gitignore`; `.env.example`.

## A06 Vulnerable and Outdated Components

**Estado:** parcialmente mitigado.  
**Impacto:** variable según la vulnerabilidad de un componente.  
**Probabilidad:** baja para dependencias npm de producción revisadas; desconocida para otros ecosistemas.  
**Severidad:** bajo.

`npm audit --omit=dev --json` informó cero vulnerabilidades conocidas para las dependencias npm de producción revisadas. El workflow usa Node.js 24, Python 3.12, Flutter 3.41.7 y varias acciones de GitHub con SHA fijado. Flutter informó versiones más recientes disponibles para varias dependencias, pero una versión disponible no equivale a vulnerabilidad.

No se encontró un escaneo automatizado de vulnerabilidades para Flutter/Dart, firmware PlatformIO, imágenes de contenedor ni proveedores SaaS. La cobertura de dependencias es por tanto incompleta.

**Evidencia:** `package-lock.json`; `mobile/pubspec.lock`; `.github/workflows/checks.yml`; salida de `npm audit --omit=dev --json`; salida de `flutter analyze`.

## A07 Identification and Authentication Failures

**Estado:** parcialmente mitigado.  
**Impacto:** alto ante robo o abuso de sesión.  
**Probabilidad:** media por ausencia de evidencia de políticas remotas.  
**Severidad:** medio.

El backend valida tokens mediante `auth.getUser`, crea clientes aislados por solicitud, desactiva persistencia de sesión en el cliente de backend y no usa `service_role`. El móvil verifica contraseñas locales con PBKDF2, usa almacenamiento seguro para sesión y las pruebas cubren expiración de sesión, permisos y ausencia de autoascenso de rol. La prueba RBAC rechaza solicitudes sin sesión.

No hay evidencia en el repositorio de la política efectiva de longitud y bloqueo de contraseñas en Supabase, verificación de correo, protección ante fuerza bruta, MFA, expiración remota configurable ni revisión de sesiones revocadas. Esas opciones deben verificarse en el proveedor sin publicar datos personales.

**Evidencia:** `backend/bootstrap.mjs`; `backend/adapters/out/supabase.mjs`; `mobile/lib/adapters/security.dart`; `mobile/test/core_test.dart`; `test-results/seguridad-rls.txt`.

## A08 Software and Data Integrity Failures

**Estado:** parcialmente mitigado.  
**Impacto:** alto si se altera una dependencia, artefacto de despliegue o migración.  
**Probabilidad:** media.  
**Severidad:** medio.

El flujo CI ejecuta pruebas antes del despliegue, compila el backend, prepara el hosting y verifica la versión publicada. Los artefactos de despliegue se identifican con el commit de GitHub. Algunas acciones de GitHub están fijadas por SHA y los paquetes npm se instalan con `npm ci` usando lockfile.

Sin embargo, `actions/checkout@v4` y `actions/setup-node@v4` utilizan etiquetas móviles, y el despliegue de Supabase usa `npx --yes supabase@3.1.0` sin hash de integridad. El pipeline publica un APK de depuración; no hay evidencia de firma y distribución de un APK de producción. Estos puntos no son evidencia de explotación, pero reducen la garantía de integridad de la cadena de entrega.

**Evidencia:** `.github/workflows/checks.yml`; `package-lock.json`; scripts de construcción y despliegue.

## A09 Security Logging and Monitoring Failures

**Estado:** parcialmente mitigado.  
**Impacto:** medio a alto ante incidentes no detectados.  
**Probabilidad:** media.  
**Severidad:** medio.

El proyecto mantiene un registro de auditoría de incidentes en la base de datos y el CI conserva artefactos de pruebas y despliegues por periodos definidos. El backend devuelve códigos HTTP consistentes para condiciones conocidas sin incluir secretos ni mensajes SQL.

No se observó una política de registro de eventos de seguridad, correlación de solicitudes, alertas ante repetidos 401/403/5xx, monitoreo centralizado, retención de logs o procedimiento de respuesta a incidentes. La existencia de un `incident_audit` funcional no acredita monitoreo de seguridad operativo.

**Evidencia:** `database/supabase/full_schema.sql`; `.github/workflows/checks.yml`; `backend/adapters/in/http.mjs`.

## A10 Server Side Request Forgery

**Estado:** mitigado dentro del alcance revisado.  
**Impacto:** alto si un usuario controla destinos de red del servidor.  
**Probabilidad:** baja en los flujos examinados.  
**Severidad:** bajo.

La obtención de clima y focos se dirige exclusivamente a los hosts HTTPS predefinidos Open-Meteo y NASA FIRMS. Los parámetros de coordenadas proceden de un archivo territorial del repositorio, no de la solicitud del usuario. La lectura remota bloquea redirecciones, limita cuerpo a 4 MB y usa timeout de 15 segundos. El adaptador Python también valida esquema HTTPS y permite HTTP únicamente para localhost en entornos locales.

**Evidencia:** `backend/adapters/out/environment.mjs`; `acquisition/adapters/http.py`; pruebas de ambiente Node.js.

**Brecha residual:** nuevas integraciones que acepten URLs, webhooks o destinos configurables deben aplicar lista de permitidos, validación DNS/IP y pruebas SSRF específicas antes de incorporarse.

## Hallazgos priorizados

1. **Medio - Configuración HTTP incompleta:** no se observó CSP ni HSTS en la configuración versionada; los orígenes locales se incluyen en la función Edge. Verificar el entorno publicado antes de endurecerlo.
2. **Medio - Autenticación remota no evidenciada:** el repositorio no prueba MFA, rate limiting, verificación de correo ni política de contraseñas de Supabase. Obtener capturas de configuración sin secretos y pruebas negativas controladas.
3. **Medio - Integridad de CI/CD parcial:** fijar por SHA las acciones restantes y definir una ruta de firma para distribuciones Android de producción, después de una validación de compatibilidad.
4. **Medio - Monitoreo de seguridad no acreditado:** definir registro estructurado y alertas para 401, 403, 429 y 5xx; establecer retención y responsable.
5. **Medio - Protección de datos locales por verificar:** revisar cifrado de SQLite y clasificación de datos almacenados en el móvil antes de aumentar la información guardada fuera de Supabase.

## Conclusión

La revisión no encontró una vulnerabilidad crítica demostrada en el código y configuración inspeccionados. El proyecto evidencia controles importantes de autorización, RLS, validación de entradas, secretos fuera del repositorio y prevención de SSRF en las rutas revisadas. El nivel de riesgo global permanece medio por brechas de configuración, autenticación remota, integridad de entrega y monitoreo. Las mejoras deben planificarse de forma incremental y verificarse sin modificar o exponer los ambientes productivos.
