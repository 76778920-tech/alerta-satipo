# Integración y despliegue continuos

- `requirements.txt`: versiones de las dependencias Python de las pruebas.
- `check-deployment.mjs`: comprueba el commit, el login y la configuración pública publicados en Firebase.
- El workflow ejecutable está en `../.github/workflows/checks.yml`, ubicación requerida por GitHub Actions.
- El flujo prueba backend, web y Flutter antes de publicar Firebase Hosting.

Guía y evidencias: [CI/CD Firebase](../docs/CI_CD_FIREBASE.md).
