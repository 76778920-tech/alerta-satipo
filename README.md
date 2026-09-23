# Alerta Satipo

Aplicación web con interfaz móvil para vigilancia comunitaria y panel administrativo. Integra **Supabase Auth + PostgreSQL con RLS** y una muestra histórica de **300 registros** de Smoke Detection IoT.

**Estado:** prototipo funcional conectado a Supabase. Aún no hay sensores de campo, conexión LoRa, notificaciones push ni funcionamiento PWA sin internet.

## Ejecutar

Requisitos: Node.js 22 o superior y Python 3.10 o superior.

```powershell
npm ci
npm run build
# Solo en una copia nueva: copiar .env.example a .env y configurar el modo.
npm run configure
npm start
```

Abre **http://127.0.0.1:8000/**. El servidor incluido bloquea archivos privados. No sirvas la raíz con un servidor estático indiscriminado que permita descargar `.env`.

### Modo Supabase

En `.env`: `SATIPO_MODE=supabase`, `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY`. La clave pública es `publishable` o `anon`, nunca `service_role`. Ejecuta `npm run configure` tras cambiar esos valores.

El proyecto creado es [alerta-satipo](https://supabase.com/dashboard/project/ddfmooylklgwnrmlxqzc). En la computadora original ya existe configuración local. Las credenciales administrativas iniciales están en `config/admin.local.json`, excluido de GitHub; cámbialas desde «Mi cuenta».

### Demostración local

Usa `SATIPO_MODE=demo` y ejecuta `npm run configure`. Solo en ese modo funcionan:

| Perfil | Correo | Contraseña de demo |
| --- | --- | --- |
| Poblador | usuario@satipo.pe | demo123 |
| Administrador | admin@satipo.pe | admin123 |

Estos accesos no son cuentas del proyecto Supabase. Un fallo de Supabase no activa la demo automáticamente.

## Funciones conectadas

- Acceso y registro de pobladores, recuperación y cambio de contraseña con Supabase Auth.
- Perfil individual; tablas `clientes` y `administradores`, sin crear una tabla por persona.
- Reportes privados por usuario; creación transaccional del incidente correspondiente.
- Revisión administrativa, historial de cambios y persistencia de preferencias y umbrales.
- Solicitudes de apoyo registradas para revisión, sin prometer despacho de brigadas.
- Explorador de 300 lecturas históricas conservando unidades y etiqueta original del CSV.
- Wireframes de las siete pantallas en [HTML](docs/wireframes/index.html) y [PDF](docs/wireframes/Alerta-Satipo-Wireframes.pdf).

## Estructura

| Ruta | Contenido |
| --- | --- |
| `mobile/` | Interfaz comunitaria |
| `web/` | Panel administrativo |
| `shared/` | Auth, conexión, lógica compartida y estilos |
| `supabase/migrations/` | Esquema, funciones y permisos versionados |
| `supabase/seed.sql` | Muestra idempotente de 300 filas |
| `data/` | CSV, JSON, diccionario y trazabilidad |
| `scripts/` | Configuración, importación, compilación y servidor seguro |
| `tests/` | Pruebas SQL y recorrido contra Supabase real |
| `docs/` | Guías, revisión y wireframes |

## Verificación

```powershell
npm test
npm audit --omit=dev
```

La prueba de navegador usa Microsoft Edge y Playwright para Python; crea y elimina cuentas temporales en el proyecto configurado:

```powershell
python -m pip install playwright
# Con npm start ejecutándose, y credencial administrativa local:
python tests/e2e_cloud.py --live
```

GitHub Actions ejecuta las pruebas de base de datos y comprobación de sintaxis sin credenciales de Supabase.

## Documentación vigente

- [Conexión, esquema y cuentas en Supabase](docs/SUPABASE.md)
- [Revisión a fondo: cambios, pruebas y pendientes](docs/REVISION_TECNICA.md)
- [Origen y diccionario de los 300 registros](data/README.md)
- [Desarrollo](docs/DESARROLLO.md)

El modelo de `colab/` es una calibración demostrativa con datos sintéticos; no es un modelo entrenado ni validado con el nuevo CSV. Los documentos marcados como históricos describen versiones anteriores.
