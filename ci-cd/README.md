# Integración y despliegue continuos

- `requirements.txt`: versiones de las dependencias Python de las pruebas.
- `check-deployment.mjs`: comprueba el commit, el login y la configuración pública publicados en Firebase.
- `check-api-deployment.mjs`: comprueba la huella exacta del backend y su rechazo de consultas sin sesión.
- El workflow ejecutable está en `../.github/workflows/checks.yml`, ubicación requerida por GitHub Actions.
- El flujo prueba backend, web y Flutter, publica `admin-api` en Supabase, comprueba su versión y después publica Firebase Hosting.
- Requiere los secretos `SUPABASE_ACCESS_TOKEN` y `FIREBASE_SERVICE_ACCOUNT`. Las migraciones se revisan y aplican por separado; el workflow no importa ni borra datos.

Guía y evidencias: [CI/CD Firebase](../docs/CI_CD_FIREBASE.md).
