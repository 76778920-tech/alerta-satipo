# Publicación en Firebase Hosting

> **Acceso web vigente:** exclusivamente para administradores previamente autorizados. No hay registro ni creación de cuentas desde la web; el registro público de Supabase está desactivado. La interfaz móvil de pobladores se conserva solo como código local y no se publica en Firebase.

- Proyecto nuevo: `alerta-satipo-76778920`.
- Cuenta propietaria utilizada: `76778920@continental.edu.pe`.
- Aplicativo: https://alerta-satipo-76778920.web.app/
- Acceso: https://alerta-satipo-76778920.web.app/shared/login.html
- Wireframes: https://alerta-satipo-76778920.web.app/docs/wireframes/index.html
- Consola: https://console.firebase.google.com/project/alerta-satipo-76778920/hosting

Firebase aloja los archivos estáticos por HTTPS. Supabase sigue gestionando autenticación, reportes y los 300 registros históricos. No se creó otra base de datos ni se migraron cuentas a Firebase Auth.

## Actualizar el sitio

Desde una sesión de Firebase autorizada y con `.env` configurado para Supabase:

```powershell
npm ci
npm run build:hosting
firebase deploy --only hosting --project alerta-satipo-76778920
```

El script prepara `dist/` desde una lista de carpetas y archivos públicos. No publica `.env`, credenciales iniciales, scripts administrativos, SQL, pruebas o documentación interna. La configuración del navegador incluye solo la URL y clave pública de Supabase.

`firebase.json` no utiliza una redirección global a `index.html`: rutas privadas o inexistentes devuelven 404. Los documentos HTML conservan sus rutas originales. `dist/` y la caché de Firebase están excluidos de Git.

Supabase Auth tiene configurada la URL del sitio publicado y las redirecciones exactas a `shared/login.html` y `shared/account.html` en los dominios `web.app` y `firebaseapp.com`, además de las rutas locales para desarrollo.

La publicación no implementa todavía sensores de campo, PWA offline ni notificaciones. La recepción de correos de confirmación y recuperación sigue requiriendo validar/configurar el servicio de correo.

Referencia: [Firebase Hosting](https://firebase.google.com/docs/hosting/quickstart).
