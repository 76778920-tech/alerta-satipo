# Planeamiento consolidado — Alerta Satipo

Fecha de corte: 25 de septiembre de 2026. Este documento reúne objetivos, decisiones, trabajo ejecutado, validación y próximos pasos del proyecto. Los pendientes son propuestas de continuación; no funcionalidades implementadas ni compromisos con fechas asignadas.

## 1. Objetivo y alcance

Construir un prototipo de vigilancia de incendios para Satipo con un panel web administrativo, persistencia en Supabase y una muestra trazable de datos ambientales. El backend del panel debe demostrar arquitectura hexagonal mediante contratos, inyección de dependencias y pruebas, además de contar con instrucciones reproducibles de instalación.

Requisitos acordados:

- Publicar una web de acceso exclusivo para administradores previamente autorizados, sin registro público.
- Conservar el componente móvil de pobladores como experiencia separada; no publicarlo dentro del sitio administrativo.
- Utilizar Supabase para autenticación y PostgreSQL, y Firebase Hosting para alojar la web.
- Importar exactamente 300 registros del CSV proporcionado, conservar sus valores y evitar duplicados.
- Incorporar nodos, casos y mantenimiento relacionados con la muestra, identificados como demostración.
- Mejorar desplazamiento, legibilidad, filtros, paginación, estados vacíos y recuperación de errores.
- Versionar código, SQL, pruebas, documentos y diagramas en el repositorio privado de GitHub.
- Preparar el apartado 2 de la guía de instalación y evidencia verificable de la arquitectura.

Fuera del alcance implementado: sensores físicos, LoRa, inferencia Edge AI validada, notificaciones push, integración comprobada con Flutter o WeatherSatipo y funcionamiento completo sin Internet. El nombre del proyecto no acredita por sí mismo esas capacidades.

## 2. Decisiones técnicas

| Tema | Decisión y fundamento |
|---|---|
| Interfaz administrativa | HTML, CSS y JavaScript existentes; conservar la experiencia mientras se extraen las operaciones al backend. |
| Persistencia | PostgreSQL administrado por Supabase; relaciones, restricciones y RLS como garantías de datos. |
| Identidad | Supabase Auth; comprobar la pertenencia a administradores, sin confiar en un rol enviado por el navegador. |
| Acceso por poblador | Perfiles vinculados al UUID de Auth y permisos por propietario, no una tabla física nueva por cada persona. La web publicada no admite pobladores. |
| Fuente histórica | CSV de GitHub como origen de importación; Supabase como base consultada por la aplicación. No hay sincronización automática con el CSV. |
| Arquitectura | Núcleo JavaScript independiente; casos de uso y contratos propios; adaptadores HTTP, Supabase y memoria. |
| Ejecución del backend | Mismo núcleo en Node.js local y Supabase Edge. Se utiliza node:http, no Express. |
| Seguridad de persistencia | Cliente por solicitud con clave pública y JWT del usuario; rechazo de claves administrativas en la composición. |
| Publicación | Firebase contiene archivos públicos del frontend; la función admin-api atiende las operaciones administrativas. |

## 3. Datos y trazabilidad

Fuente: https://raw.githubusercontent.com/HamzaMa96/Smoke-Detection-IOT/main/smoke_detection_iot.csv

`scripts/prepare_dataset.py` aplica muestreo estratificado proporcional por Fire Alarm, con semilla 20260923. Genera JSON, CSV, metadatos y SQL. La muestra contiene 300 filas: 214 etiquetas positivas y 86 negativas. La reproducción exacta presupone el mismo contenido de la fuente; los metadatos registran su hash.

`smoke_readings` identifica cada fila mediante `(dataset_id, source_row)`. El importador evita duplicados y no reemplaza filas existentes. Las fechas se muestran en UTC y los valores ausentes no se convierten en cero.

Los seis nodos V-01 a V-06 son lotes virtuales de 50 filas ordenadas por `source_row`. `demo_node_readings` conserva claves foráneas hacia las lecturas. Los casos agrupan etiquetas positivas por lote; las tareas de mantenimiento son propuestas demostrativas. No se atribuyen ubicaciones, dispositivos, averías o reparaciones reales al CSV.

## 4. Arquitectura implementada

```text
Panel administrativo
  → adaptador HTTP
    → AdminUseCases / AdminService
      → dominio: OperationalRecord, estados y umbrales
      → IdentityPort / RepositoryPort
        ← implementados por SupabaseIdentity / SupabaseRepository

bootstrap.mjs ensambla e inyecta los adaptadores por solicitud.
MemoryIdentity y MemoryRepository permiten probar el núcleo sin red.
```

| Responsabilidad | Evidencia en el repositorio |
|---|---|
| Entidad, estados, umbrales y errores | `backend/domain/` |
| Puertos de entrada y salida | `backend/application/ports.mjs` |
| Casos de uso | `backend/application/admin-service.mjs` |
| Adaptador HTTP | `backend/infrastructure/http.mjs` |
| Adaptadores Supabase | `backend/infrastructure/supabase.mjs` |
| Adaptadores de prueba | `backend/infrastructure/memory.mjs` |
| Inyección de dependencias | `backend/bootstrap.mjs` |
| Host local y host desplegado | `backend/server.mjs`, `backend/edge.mjs` |
| Compilación de la función | `scripts/build-api.mjs` |

El dominio no importa aplicación ni infraestructura. La aplicación no importa HTTP o el SDK. Los contratos son clases JavaScript verificadas mediante pruebas, no interfaces TypeScript. Auth, recuperación de contraseña y perfil mantienen su integración directa con Supabase. El móvil local no ha sido migrado a esta API administrativa.

## 5. Casos de uso y endpoints

| Operación | Endpoint de la API | Resultado |
|---|---|---|
| Consultar lecturas | GET `/readings` | Muestra de 300 registros |
| Consultar operación demostrativa | GET `/operations` | Nodos, vínculos, casos y tareas |
| Consultar actividad | GET `/activity` | Reportes, incidentes y configuración |
| Cambiar mantenimiento | PATCH `/maintenance/:id` | Actualización condicionada al estado previo |
| Revisar caso | PATCH `/cases/:id` | Estado persistido del caso |
| Actualizar incidente | PATCH `/incidents/:id` | Estado persistido y auditoría SQL existente |
| Guardar umbrales | PATCH `/settings` | Configuración validada |

No se asignan identificadores HU inventados. La vinculación definitiva con las historias del curso requiere contrastar estos casos con el backlog aprobado del equipo.

## 6. Etapas ejecutadas

| Etapa | Trabajo realizado | Estado |
|---|---|---|
| Prototipado | Wireframes y separación de experiencias web/móvil | Completado dentro del prototipo |
| Persistencia | Supabase, esquema SQL, permisos e importación de 300 filas | Implementado |
| Acceso web | Login administrativo, sin registro público; móvil excluido de Hosting | Implementado |
| Calidad de interfaz | Desplazamiento, filtros, paginación, detalle, errores y reintento | Implementado y probado |
| Operación demostrativa | Seis lotes, casos y mantenimiento persistente | Implementado y probado |
| Documentación | Guía de instalación, apartado 2, figuras, Word y PDF | Entregados; usar versiones vigentes indicadas abajo |
| Arquitectura hexagonal | Extracción del núcleo, puertos, adaptadores e integración del panel | Implementado y desplegado |
| Auditoría | Reproducción y corrección de cuatro hallazgos; ampliación de pruebas | Completada para los escenarios descritos |

## 7. Validación y criterios de aceptación

Evidencia de la última revisión, no de una auditoría exhaustiva:

- `npm test`: 16 pruebas aprobadas de SQL, dominio, aplicación, adaptadores y arquitectura.
- Grafo transitivo de dependencias: las entradas del núcleo no alcanzan infraestructura ni paquetes externos.
- `tests/api_live.mjs`: Node y Supabase Edge devuelven 300 lecturas y seis nodos; rechazan token falso, origen no autorizado, cuerpo excesivo y valores inválidos. No escribe filas.
- `tests/panel_readings.py`: comparación con las 300 filas originales, paginación, filtros, recuperación y cuatro tamaños de pantalla.
- `tests/panel_operations.py`: persistencia tras recarga y recuperación de red; cambia temporalmente estados demostrativos y los restaura.

Hallazgos corregidos: entradas nulas al llamar directamente los casos de uso; configuración y colecciones inconsistentes en el repositorio de memoria; límite HTTP por caracteres en lugar de bytes; ausencia de rechazo explícito de claves administrativas al componer el servidor. Detalle en [REVISION_HEXAGONAL.md](REVISION_HEXAGONAL.md).

Una nueva entrega debe mantener las pruebas pertinentes aprobadas, conservar la muestra, no introducir dependencias de infraestructura en el núcleo y actualizar documentación si modifica comandos o contratos. Las pruebas con mutaciones se deben coordinar o ejecutar en un entorno aislado.

## 8. Instalación y despliegue

Para la base existente, no ejecutar migraciones ni crear cuentas. En una base vacía, el orden es migración 001 → migración 002 → seed de 300 filas → migración 003. Seguir el apartado 2 vigente para autorización y configuración.

Desarrollo local:

```powershell
npm ci
npm run build
# .env: URL y clave pública; SATIPO_API_URL=http://127.0.0.1:8787/api
npm run configure
npm run start:api
# En otra terminal:
npm start
```

Despliegue por el responsable autorizado:

```powershell
npm run build:api
npx supabase functions deploy admin-api --project-ref ddfmooylklgwnrmlxqzc
# .env: API desplegada HTTPS o SATIPO_API_URL vacío; nunca localhost.
npm run build:hosting
firebase deploy --only hosting --project alerta-satipo-76778920
```

La función verifica el token mediante Supabase Auth y exige administrador. `verify_jwt=false` delega esa validación al adaptador; no significa que los endpoints de datos permitan acceso anónimo. No usar claves administrativas para las solicitudes ordinarias.

## 9. Próximos pasos priorizados

| Prioridad | Actividad pendiente | Dependencia | Criterio de cierre |
|---|---|---|---|
| Alta | Contrastar casos de uso con historias del curso | Backlog aprobado | Matriz HU–caso–endpoint–vista con evidencia |
| Alta | Revisar contratos con Flutter y WeatherSatipo | Código y configuración de esos componentes | Prueba integrada real; documentar flujos y errores |
| Media | Evaluar versionado optimista | Definición de concurrencia requerida | Detectar cambios A→B→A con prueba de integración |
| Media | Agregar auditoría de casos/mantenimiento si se requiere | Alcance y retención acordados | Cambio y evento atómicos, consulta autorizada |
| Media | Automatizar CI | Configuración GitHub Actions | Pruebas y dependencias verificadas en cada cambio |
| Media | Evidencias académicas de Postman | Ejecución por el equipo | Capturas reales sin tokens ni contraseñas |
| Posterior | Pruebas de carga y revisión de seguridad ampliada | Entorno aislado y objetivos medibles | Informe con escenarios, resultados y acciones |
| Posterior | Telemetría física y modelo de detección | Hardware, datos y validación | Flujo real demostrado; separar predicción de etiqueta histórica |

Responsables y fechas: por asignar por el equipo. No se presenta ninguna de estas actividades como completada.

## 10. Riesgos y límites

- Comparar estado previo no detecta A→B→A; no hay columna de versión.
- La API REST directa de Supabase sigue accesible según permisos y RLS. Nuevas reglas ineludibles deben reforzarse también en la base o restringir las rutas de escritura.
- La auditoría SQL existente cubre incidentes, no las tablas demostrativas.
- Las 214 etiquetas positivas no equivalen a incendios confirmados y las tareas no acreditan reparaciones.
- La muestra exacta depende del archivo fuente original; instalar usa los datos versionados y no exige volver a muestrear.
- No se han acreditado disponibilidad continua, rendimiento a escala ni seguridad absoluta.

## 11. Documentos vigentes e históricos

Vigentes:

- [Arquitectura implementada](ARQUITECTURA_IMPLEMENTADA.md).
- [Revisión detallada](REVISION_HEXAGONAL.md).
- [Apartado 2 fuente](PARTE_2_BACKEND_INSTALACION.md).
- [Apartado 2 Word](PARTE_2_BACKEND_HEXAGONAL.docx) y [PDF](PARTE_2_BACKEND_HEXAGONAL.pdf).

Los documentos `BACKEND_ALERTA_SATIPO*`, `PARTE_2_BACKEND_CORREGIDA.*` y las láminas de `arquitectura_hexagonal/` registran versiones anteriores o la propuesta inicial. Se conservan como antecedentes; las afirmaciones de arquitectura pendiente ya no describen el backend administrativo actual. La guía general antigua debe leerse junto con su aviso de actualización.

## 12. Versionado y accesos

Repositorio privado: https://github.com/76778920-tech/alerta-satipo

Sitio: https://alerta-satipo-76778920.web.app/

Proyecto Supabase: https://supabase.com/dashboard/project/ddfmooylklgwnrmlxqzc

Hitos del historial: `646bced` implementó e integró el backend hexagonal; `914b789` corrigió los hallazgos de auditoría. Las credenciales y archivos temporales se excluyen mediante .gitignore. Acceso al repositorio, membresía de Supabase y rol administrativo del aplicativo son autorizaciones independientes.
