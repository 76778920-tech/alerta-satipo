# Plan de remediación OWASP Top 10 de Alerta Satipo

**Rol:** arquitecto de seguridad.  
**Fecha:** 13 de noviembre de 2026.  
**Entrada:** `docs/04_auditoria_owasp.md`.  
**Objetivo:** reducir los hallazgos de riesgo medio sin interrumpir autenticación, autorización, consultas comunitarias, administración, persistencia local ni despliegue vigente.

## Principios de preservación de funcionalidad

1. Cada remediación se realiza en un cambio aislado, con revisión y evidencia antes de llegar a producción.
2. Se ejecutan pruebas Node.js, Python, navegador y Flutter antes y después de cada cambio mediante `npm run verify:furps`.
3. Ninguna prueba de seguridad debe imprimir contraseñas, tokens, claves, correos, identificadores personales o valores de variables de entorno.
4. Las políticas RLS y los flujos de poblador y administrador se validan con cuentas de prueba y operaciones de solo lectura antes de cualquier cambio de permisos.
5. Las modificaciones de cabeceras, CORS, autenticación o CI/CD deben disponer de una reversión documentada y no deben mezclar migraciones de datos.

## Roadmap de remediación

**Fase 1 - Configuración y controles de borde.** Resolver cabeceras HTTP, CSP/HSTS y revisión de orígenes CORS en un ambiente de prueba. Es la primera acción porque puede reducir exposición sin modificar lógica de negocio.

**Fase 2 - Identidad, secretos y datos locales.** Revisar configuración efectiva de Supabase y almacenamiento móvil, sin trasladar secretos al repositorio. Documentar evidencia de controles del proveedor y clasificación de datos locales.

**Fase 3 - Integridad de entrega.** Endurecer la cadena CI/CD, revisar fijación de acciones y establecer criterio para APK de producción firmado. Mantener la compilación debug actual hasta que el cambio de distribución haya sido validado.

**Fase 4 - Observabilidad de seguridad.** Incorporar diseño de eventos, retención y alertas; probar primero en ambiente no productivo para evitar registrar secretos o datos personales.

**Fase 5 - Revalidación de controles existentes.** Ejecutar matriz RLS, pruebas negativas, auditoría de dependencias y revisión SSRF después de cada cambio relevante.

## Remediaciones priorizadas

### OWASP-01 Cabeceras de seguridad y CORS de producción

**Riesgo:** configuración HTTP incompleta: no se observó CSP ni HSTS en la configuración versionada y la función Edge incluye orígenes locales junto a dominios publicados.

**Prioridad:** alta.  
**Impacto:** alto si un origen, recurso externo o contenido inyectado se vuelve explotable en producción.  
**Componentes afectados:** `firebase.json`, `backend/edge.mjs`, pruebas HTTP y de navegador, configuración de hosting.

**Estrategia de mitigación:** definir una CSP inicial basada en los recursos efectivamente utilizados; activar HSTS únicamente en el dominio HTTPS confirmado; separar la lista de orígenes locales de la lista de producción mediante configuración por ambiente. Mantener `X-Content-Type-Options`, `X-Frame-Options` y `Referrer-Policy` existentes. No cambiar CORS a comodín.

**Estrategia de validación:** probar navegación, inicio de sesión, carga de Supabase, recursos estáticos y API desde los dominios autorizados. Confirmar rechazo HTTP 403 desde un origen ajeno. Revisar las cabeceras publicadas mediante una solicitud de solo lectura, ocultando cualquier valor sensible.

**Estrategia de rollback:** conservar la configuración previa de cabeceras y orígenes. Si CSP bloquea una funcionalidad legítima, revertir solo la directiva afectada, registrar el recurso requerido y repetir las pruebas antes de ampliarla.

### OWASP-02 Evidencia de autenticación y protección de sesiones

**Riesgo:** no existe evidencia versionada de MFA, verificación de correo, límite de intentos, política de contraseña ni gestión de sesiones configurada en Supabase.

**Prioridad:** alta.  
**Impacto:** alto en caso de toma de cuenta o abuso de inicio de sesión.  
**Componentes afectados:** panel Supabase Auth, backend de autenticación, clientes web y móvil, material de evidencia.

**Estrategia de mitigación:** revisar y documentar en Supabase las configuraciones activas de protección de sesión, verificación de correo, recuperación de contraseña y rate limiting; decidir con el Product Owner si MFA es exigible para administradores. Mantener al poblador con el flujo aprobado y no introducir MFA obligatoria sin prueba de usabilidad y recuperación.

**Estrategia de validación:** efectuar pruebas controladas de sesión válida, token inválido, ausencia de sesión y rol incorrecto. Capturar únicamente códigos de respuesta y estados, nunca credenciales. Confirmar que los controles no impidan acceso al usuario autorizado.

**Estrategia de rollback:** documentar el valor previo de cada ajuste remoto antes de cambiarlo. Si un control rompe recuperación o inicio de sesión, restaurar el ajuste anterior desde Supabase y conservar el log del incidente.

### OWASP-03 Protección de datos locales móviles

**Riesgo:** el dispositivo conserva datos en SQLite; no existe evidencia de cifrado de base local ni clasificación formal de la información persistida.

**Prioridad:** media.  
**Impacto:** medio a alto si un dispositivo comprometido expone lecturas, reportes o información de sesión.  
**Componentes afectados:** `mobile/lib/adapters/local_database.dart`, `mobile/lib/adapters/security.dart`, esquema local y documentación de datos.

**Estrategia de mitigación:** clasificar qué campos deben mantenerse localmente, minimizar retención y determinar si se requiere cifrado de SQLite para el alcance aprobado. Mantener `flutter_secure_storage` para tokens/sesión y `allowBackup=false`. No incorporar un mecanismo de cifrado sin validar migración, rendimiento y recuperación de datos locales.

**Estrategia de validación:** comprobar que cierre de sesión borra la sesión segura, que el contenido persistido corresponde solo a los campos definidos y que la migración de esquema conserva o elimina datos según la política aprobada. Ejecutar pruebas Flutter y una prueba Android nativa antes de declarar cierre.

**Estrategia de rollback:** antes de modificar el esquema, conservar una versión compatible y una migración reversible. Si la migración falla, volver a la versión previa de base local o limpiar únicamente la caché no esencial conforme a la política de datos.

### OWASP-04 Integridad de CI/CD y distribución Android

**Riesgo:** parte de las acciones de GitHub se referencia mediante etiquetas móviles y la herramienta Supabase se invoca mediante una versión semántica; además, el pipeline produce APK de depuración y no evidencia una ruta de firma de producción.

**Prioridad:** media.  
**Impacto:** alto si un artefacto, acción o paquete de entrega se altera.  
**Componentes afectados:** `.github/workflows/checks.yml`, scripts de compilación, secretos CI/CD y proceso de distribución Android.

**Estrategia de mitigación:** fijar por SHA las acciones restantes tras verificar el proveedor oficial; evaluar un mecanismo de instalación reproducible para Supabase; definir en un cambio separado la firma de APK de producción, con claves fuera del repositorio y artefactos debug claramente rotulados como no distribuibles. No sustituir el pipeline actual hasta que el pipeline candidato pase las mismas pruebas.

**Estrategia de validación:** ejecutar CI en una rama de prueba, verificar que los artefactos se generen, confirmar que no se imprimen secretos y validar instalación del APK candidato en un Android de prueba. Comparar el commit publicado con la versión verificada por el workflow.

**Estrategia de rollback:** conservar el workflow anterior y restaurarlo si la acción fijada, firma o herramienta de despliegue falla. Revocar cualquier secreto de firma expuesto accidentalmente y regenerar el artefacto desde un commit conocido.

### OWASP-05 Registro y monitoreo de eventos de seguridad

**Riesgo:** no se observó monitoreo centralizado, alertas de seguridad, retención definida ni procedimiento de respuesta para 401, 403, 429 y 5xx.

**Prioridad:** media.  
**Impacto:** medio a alto si un abuso o fallo repetido no es detectado oportunamente.  
**Componentes afectados:** backend HTTP/Edge, proveedor de logs, operación del proyecto y documentación de incidentes.

**Estrategia de mitigación:** definir un esquema mínimo de eventos sin secretos: fecha, ruta lógica, código de estado, tipo de error, correlación aleatoria y ambiente. Establecer umbrales de alertas, retención, responsables y un procedimiento de respuesta. No registrar tokens, contraseñas, cuerpos de reporte, ubicaciones precisas ni datos personales.

**Estrategia de validación:** emitir solicitudes controladas autorizada, sin sesión, token inválido y origen no permitido; verificar que se registren códigos y categorías correctos sin exponer valores sensibles. Probar alertas primero en ambiente no productivo.

**Estrategia de rollback:** desactivar únicamente el nuevo destino de logs o alerta si genera costo, ruido o filtración; conservar los logs existentes y revisar la configuración antes de reactivarlo.

### OWASP-06 Revalidación de controles existentes

**Riesgo:** los controles A01, A03, A06 y A10 están mitigados en el código revisado, pero pueden degradarse con migraciones, dependencias o integraciones futuras.

**Prioridad:** media.  
**Impacto:** alto si se rompe RLS, se incorpora una consulta dinámica o una URL controlable por usuario.  
**Componentes afectados:** migraciones Supabase, backend, adquisición externa, dependencias y pruebas de seguridad.

**Estrategia de mitigación:** conservar pruebas de roles, validación de entradas, auditoría de dependencias y validación de URLs como condiciones de integración. Toda nueva función `SECURITY DEFINER`, RPC, URL de proveedor o dependencia debe pasar revisión antes de despliegue.

**Estrategia de validación:** ejecutar la prueba RBAC de solo lectura, `npm audit --omit=dev --json`, `npm run verify:furps` y pruebas específicas de ambiente después de cambios que afecten autenticación, SQL o proveedores.

**Estrategia de rollback:** revertir la migración, función o adaptación nueva desde el commit conocido y comprobar nuevamente la matriz de acceso. No borrar evidencia de pruebas fallidas.

## Riesgos de implementación

Los cambios de cabeceras pueden bloquear recursos legítimos; las políticas de autenticación pueden bloquear recuperación de cuentas; el cifrado local puede afectar migraciones y rendimiento; la firma de APK requiere manejo estricto de claves; y los logs pueden introducir exposición de datos o costos. Estos riesgos se controlan mediante ambientes aislados, cambios pequeños, pruebas de regresión, ocultamiento de secretos y rollback documentado.

## Orden recomendado de ejecución

1. Establecer la línea base: `npm run verify:furps`, prueba RBAC de solo lectura y `npm audit --omit=dev --json`.
2. Ejecutar OWASP-01 en un ambiente de prueba y validar cabeceras/CORS.
3. Revisar OWASP-02 en el panel de Supabase y documentar evidencia sin secretos.
4. Definir y validar la política de datos de OWASP-03 antes de cambiar SQLite.
5. Endurecer OWASP-04 en una rama de CI/CD y validar el artefacto candidato.
6. Diseñar OWASP-05 y probar la captura de eventos sin datos sensibles.
7. Repetir OWASP-06 y actualizar la auditoría de implementación.

## Criterio de cierre

Una remediación se considera cerrada únicamente cuando tiene cambio identificado, evidencia de validación, resultado de regresión y rollback comprobable. Las categorías ya mitigadas no requieren cambios por cumplimiento documental; requieren conservar sus pruebas para evitar regresiones.
