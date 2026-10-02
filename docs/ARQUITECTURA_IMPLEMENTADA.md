# Arquitectura hexagonal implementada — panel administrativo

Estado: API implementada el 25 de septiembre de 2026; separación ampliada el 2 de octubre de 2026. Esta página describe el servidor administrativo. El mapa vigente de navegador, dataset y herramientas territoriales está en [Arquitectura hexagonal](ARQUITECTURA_HEXAGONAL.md). Flutter y WeatherSatipo no forman parte de este repositorio ni de esta verificación.

## Estructura y dirección de dependencias

```text
backend/
  domain/
    operation.mjs          OperationalRecord, estados y umbrales
    errors.mjs             Errores propios sin códigos HTTP
  application/
    ports/in/              AdminUseCases
    ports/out/             IdentityPort, RepositoryPort, PredictionResultsPort
    use-cases/             AdminService: implementación de casos de uso
  adapters/
    in/http.mjs            Adaptador de entrada Request/Response
    out/supabase.mjs       Adaptadores de identidad y persistencia
    out/memory.mjs         Adaptadores de prueba sin red
    out/predictions.mjs    Lectura de la evaluación publicada
    out/prediction-results.json  Artefacto de evaluación
  bootstrap.mjs            Composición e inyección por solicitud
  server.mjs               Host HTTP Node.js para desarrollo
  edge.mjs                 Host Supabase Edge para producción
```

Organización revisada el 2 de octubre de 2026. Las interfaces y entradas HTML
se agrupan en `frontend/`; las rutas públicas se mantienen mediante el servidor
local y el empaquetado de Hosting. Los puertos de entrada y salida pertenecen a
la aplicación, y las implementaciones externas se agrupan según su dirección.
Las pruebas recorren también los subdirectorios del núcleo para detectar
dependencias hacia adaptadores, SDK o APIs de entorno.

El dominio no importa aplicación ni infraestructura. La aplicación importa dominio y define los puertos. SupabaseIdentity y SupabaseRepository implementan los puertos de salida; AdminService implementa el puerto de entrada AdminUseCases. El adaptador HTTP recibe una fábrica de servicios y no conoce tablas. bootstrap.mjs instancia los adaptadores e inyecta sus contratos en el caso de uso. La arquitectura se basa en estas dependencias, no en nombres de carpetas.

## Operaciones implementadas y trazabilidad

| Caso de uso | Endpoint relativo a la API | Vista / persistencia |
|---|---|---|
| listReadings | GET /readings | Lecturas / smoke_readings |
| listOperations | GET /operations | Nodos, casos y mantenimiento / cuatro tablas demo |
| updateState (maintenance) | PATCH /maintenance/:id | Mantenimiento / demo_maintenance |
| updateState (cases) | PATCH /cases/:id | Casos / demo_cases |
| getActivity | GET /activity | Reportes, incidentes y configuración |
| updateState (incidents) | PATCH /incidents/:id | Incidentes / incidentes y disparador de auditoría existente |
| updateSettings | PATCH /settings | Configuración / app_settings |

Los identificadores de historias de usuario deben vincularse al backlog aprobado; esta tabla no inventa códigos HU. Inicio de sesión, recuperación, contraseña, perfil y operaciones comunitarias pertenecen a los casos de uso de `frontend/src/application/`. Sus adaptadores encapsulan Supabase Auth y persistencia bajo RLS. Las consultas comunitarias usan su puerto de salida; los endpoints de esta API mantienen la autorización exclusiva de administradores.

## Flujo ejecutable

El navegador inicia sesión con Supabase Auth. SatipoBackend.api obtiene el JWT de esa sesión y llama la API. HTTP invoca AdminService. IdentityPort verifica el token con getUser y comprueba administradores. El dominio valida el identificador y los estados. RepositoryPort ejecuta la actualización condicional. HTTP traduce el resultado a JSON y estado HTTP.

Errores: 401 identidad inválida; 403 sin autorización; 404 registro ausente o ruta desconocida; 409 conflicto; 422 dato de dominio inválido; 503 proveedor no disponible. JSON inválido devuelve 400 y un formato no JSON devuelve 415. Los errores internos no revelan claves ni mensajes SQL.

## Seguridad y límites explícitos

Cada solicitud crea su propio cliente Supabase con clave pública y JWT del usuario. No se utiliza service_role; RLS sigue aplicándose. CORS permite solo los orígenes publicados y los dos orígenes locales configurados. CORS no sustituye la autorización. La comprobación automática del gateway Edge se desactiva con verify_jwt=false para delegar validación a getUser dentro del adaptador; todos los endpoints de datos exigen token y rol administrativo. /health solo expone estado del servicio.

Las actualizaciones comparan estado previo en una sola sentencia SQL. Detectan conflicto si ya no coincide; no detectan A→B→A. No se agregó versionado ni auditoría de mantenimiento. Los estados permitidos conservan las reglas existentes, incluidas reaperturas. No se modificaron las 300 lecturas, usuarios, políticas RLS ni relaciones.

La API directa de Supabase continúa accesible según sus permisos actuales. Las reglas obligatorias de valores se mantienen en PostgreSQL. Introducir posteriormente reglas más estrictas exigiría reforzarlas también en la base o restringir las rutas de escritura. Arquitectura hexagonal no significa que todas las reglas SQL deban eliminarse.

## Instalación local

Con .env configurado con SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY del mismo proyecto:

```powershell
npm ci
npm run build
# Agregar en .env: SATIPO_API_URL=http://127.0.0.1:8787/api
npm run configure
npm run start:api
```

En otra terminal:

```powershell
npm start
```

Abrir http://127.0.0.1:8000/shared/login.html. El servidor Node escucha en 127.0.0.1:8787; la interfaz Python en 127.0.0.1:8000. Si SATIPO_API_URL queda vacío, configure genera la URL de la función admin-api del proyecto. No se requiere Express: el adaptador HTTP usa Request/Response y el host Node usa node:http; el mismo núcleo funciona en Edge sin duplicarlo.

## Despliegue

```powershell
npm run build:api
npx supabase functions deploy admin-api --project-ref ddfmooylklgwnrmlxqzc
# Dejar SATIPO_API_URL vacío o con la URL HTTPS desplegada.
npm run build:hosting
firebase deploy --only hosting --project alerta-satipo-76778920
```

build:api empaqueta backend/ en supabase/functions/admin-api/index.ts; no editar el archivo generado. Edge utiliza SUPABASE_URL y SUPABASE_ANON_KEY proporcionadas por Supabase. Para otro proyecto, cambiar referencia, orígenes permitidos en edge.mjs y configuración del frontend. La publicación de Firebase rechaza una API local para evitar desplegar localhost.

## Evidencia y pruebas

```powershell
npm test
node --env-file=.env tests/api_live.mjs
python tests/panel_readings.py
python tests/panel_operations.py
```

npm test incluye pruebas de dominio, casos de uso con memoria, concurrencia, autorización, adaptación HTTP, mapeo Supabase y prohibición de dependencias externas en el núcleo, además de las pruebas SQL previas. api_live requiere la API Node activa y config/admin.local.json: consulta Node y Edge con una cuenta existente sin escribir datos. Las pruebas de navegador necesitan el servidor frontend y Microsoft Edge; operaciones modifica temporalmente estados y los restaura.

La verificación de importaciones es un control estático básico para los módulos actuales, no un analizador exhaustivo de JavaScript. Las pruebas del adaptador usan respuestas controladas y se complementan con integración real; no se afirma cobertura total ni ausencia absoluta de errores.

## Auditoría posterior

La revisión detallada y los cuatro hallazgos corregidos están documentados en [REVISION_HEXAGONAL.md](REVISION_HEXAGONAL.md). La suite actual contiene 16 pruebas e incluye análisis transitivo de dependencias del núcleo.
