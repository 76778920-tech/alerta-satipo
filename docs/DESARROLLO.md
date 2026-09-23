# Guía de Desarrollo - Alerta Satipo

## Wireframes del aplicativo móvil

La [lámina de wireframes](wireframes/index.html) incluye las siete pantallas del poblador, navegación de demostración y exportación mediante imprimir / guardar como PDF. Puede abrirse directamente en el navegador o en `/docs/wireframes/` con el servidor local.

Consulta las [instrucciones de presentación y alcance](wireframes/README.md).

## Organización por experiencia

El código ya no mezcla móvil y panel en la misma carpeta:

| Carpeta | Responsabilidad |
| --- | --- |
| `mobile/` | App comunitaria: riesgo, alertas, mapa, reportes, apoyo |
| `web/` | Panel operativo: KPIs, triaje, nodos, incidentes, mantenimiento |
| `shared/` | Design system, login y capa de datos común |
| `docs/` | Documentación |

## Flujo

```text
index.html
  → shared/login.html
      → mobile/index.html   (rol poblador)
      → web/index.html      (rol admin)
```

Ambas UIs cargan `shared/js/data.js` (`SatipoData`) para:

- sensores y cálculo de riesgo
- umbrales persistidos
- reportes comunitarios
- incidentes compartidos
- modelo Colab desde `shared/models/satipo_umbrales.json`

Guía: [`COLAB.md`](COLAB.md).

Así un reporte enviado desde `mobile/` aparece en la cola del panel `web/`.

## Cómo ejecutar

```bash
npm ci
npm run build
npm run configure
npm start
```

Rutas útiles:

- `/`
- `/shared/login.html`
- `/mobile/`
- `/web/`
- `/web/architecture.html`

## Supabase

La conexión real utiliza `shared/js/backend.js`, Supabase Auth y RLS. Consulta [SUPABASE.md](SUPABASE.md) para las cuentas, tablas y configuración. Los 300 registros históricos se consultan aparte de la telemetría de campo.

## Credenciales demo (solo con SATIPO_MODE=demo)

- Poblador: `usuario@satipo.pe` / `demo123`
- Admin: `admin@satipo.pe` / `admin123`

## Deuda pendiente

- Backend real de telemetría
- Mapa geográfico real
- PWA offline
- Eliminar definitivamente docs antiguas contradictorias (`VERIFICACION.md`, etc.)
- SMTP y publicación HTTPS
- Notificaciones, GPS y paginación completa

Pruebas disponibles: `npm test` y `python tests/e2e_cloud.py --live`. Evaluación completa: [REVISION_TECNICA.md](REVISION_TECNICA.md).
