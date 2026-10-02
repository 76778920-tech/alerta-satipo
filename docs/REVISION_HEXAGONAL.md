# Revisión de arquitectura hexagonal

Fecha: 25 de septiembre de 2026. Alcance: backend del panel administrativo y su integración publicada. No comprende proyectos Flutter o WeatherSatipo externos a este repositorio.

## Conclusión

El componente tiene una separación verificable de puertos y adaptadores: el dominio no importa aplicación ni infraestructura; aplicación define contratos y coordina reglas; los adaptadores implementan persistencia, identidad y transporte; bootstrap ensambla un cliente aislado por solicitud. Esto no implica que todo el proyecto original, incluido el código móvil local, se haya migrado a esa arquitectura.

## Hallazgos reproducidos y corregidos

| Hallazgo | Consecuencia anterior | Corrección |
|---|---|---|
| Entradas nulas al invocar directamente los casos de uso | TypeError en lugar de error de validación; dependía de la protección del adaptador HTTP | Validación dentro del núcleo, independiente del transporte |
| Repositorio en memoria no conservaba configuración y mezclaba casos con tareas | El doble de prueba incumplía parte del contrato | Configuración persistida en memoria, colecciones separadas y copias aisladas |
| HTTP medía caracteres tras cargar todo el cuerpo | Diferencia con el límite en bytes de Node y lectura sin límite previo en Edge | Lectura incremental limitada a 4096 bytes; JSON sin sensibilidad a mayúsculas en Content-Type |
| Composición admitía cualquier clave no vacía | No impedía una configuración accidental con una clave administrativa | Rechazo temprano de secret y service_role; solo publishable o anon |

Las cuatro pruebas iniciales de auditoría fallaron antes de las correcciones. Ahora pasan y quedan versionadas en tests/audit.test.mjs. También se exige isAdmin === true y se delimitan los prefijos válidos del adaptador HTTP.

## Evidencia

- npm test: 16 pruebas aprobadas. Incluye PostgreSQL/PGlite, dominio, autorización, casos de uso, conflictos, transporte y adaptadores.
- Análisis con esbuild: el grafo transitivo de las entradas de dominio y aplicación no contiene infraestructura ni dependencias externas. Complementa el chequeo de importaciones de los módulos actuales; no pretende analizar llamadas dinámicas arbitrarias.
- tests/api_live.mjs: comprobación real de Node y Supabase Edge, sin escribir filas. Verifica 300 lecturas, 214 etiquetas positivas, seis nodos, actividad y respuestas 401/403/413/422, incluido token falso y origen no autorizado.
- tests/panel_readings.py y tests/panel_operations.py: regresión del panel publicado. La segunda cambia temporalmente estados demostrativos y los restaura; no crea cuentas.

## Límites que permanecen

1. La concurrencia se controla comparando estado previo. No hay columna de versión y no se detecta el ciclo A→B→A. No se promete bloqueo ni serialización de todas las acciones.
2. La API REST directa de Supabase sigue disponible según RLS y permisos existentes. Los estados permitidos están restringidos en PostgreSQL. Nuevas reglas que deban ser imposibles de eludir también necesitarán restricciones de base de datos o limitar las rutas de escritura.
3. Hay auditoría de incidentes, pero no historial de cambios para casos y mantenimiento demostrativos.
4. Login, recuperación de contraseña y perfil conservan integración directa con Supabase. El móvil local no se migró a la API administrativa.
5. Los contratos son clases JavaScript y pruebas, no interfaces comprobadas por TypeScript. Esto no impide inversión de dependencias, pero la comprobación de tipos es dinámica.
6. El repositorio de operaciones agrupa varias consultas y devuelve DTO de datos planos. Es una implementación compacta; si aumenta el alcance conviene separar puertos por capacidad. No hay requisito de un repositorio por tabla para considerar hexagonal una arquitectura.
7. No se realizaron ensayos de carga, revisión criptográfica ni una auditoría exhaustiva de seguridad. Las pruebas descritas acreditan los escenarios ejecutados, no ausencia absoluta de errores.

Para sustentar: mostrar backend/application/ports/, AdminService, OperationalRecord, SupabaseRepository, bootstrap.mjs y la ejecución de npm test. La evidencia principal es que la aplicación funciona con MemoryRepository sin navegador o base externa y que el núcleo no importa los adaptadores. La ampliación a navegador, dataset y territorio se documenta en [Arquitectura hexagonal](ARQUITECTURA_HEXAGONAL.md).
