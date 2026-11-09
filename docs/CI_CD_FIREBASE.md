# CI/CD del proyecto original

Repositorio: https://github.com/76778920-tech/alerta-satipo

Hosting: https://alerta-satipo-76778920.web.app

Cada pull request a main ejecuta pruebas JavaScript, Python, recorrido web con Chromium,
analisis y pruebas Flutter y compilacion del APK de prueba. Las versiones del entorno
del modelo estan fijadas en ci-cd/requirements.txt: la referencia fue generada con
scikit-learn 1.5.2 y no se cambia la matriz esperada para ocultar diferencias de version.

Cada push a main ejecuta los mismos controles. Solo cuando ambos trabajos terminan
correctamente se publica en Firebase Hosting el mismo artefacto dist generado por CI.
Despues se consulta el sitio y se compara deployment.json con el commit de la ejecucion.
Tambien se puede iniciar desde Actions > CI/CD Firebase > Run workflow en main.

## Configuracion de GitHub

- Secreto FIREBASE_SERVICE_ACCOUNT: cuenta dedicada a Hosting, almacenada solo en GitHub Secrets.
- Variables SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY y SATIPO_API_URL: configuracion publica.
- Proyecto Firebase: alerta-satipo-76778920. No usa Vercel ni el repositorio de migracion.

El despliegue publica primero la API `admin-api` en Supabase y verifica la huella del
código compilado y el rechazo de peticiones sin sesión. Solo después publica Hosting.
Requiere también el secreto `SUPABASE_ACCESS_TOKEN`. Las migraciones SQL se revisan
y aplican por separado; el workflow no importa ni borra datos.
El APK generado es debug, para pruebas; no es una publicacion en Play Store.
Los tests SQL usan una base temporal y el recorrido web usa adaptadores de prueba.
No acreditan funcionamiento con sensores fisicos ni disponibilidad de todas las rutas reales.

## Evidencias

1. GitHub > Actions > CI/CD Firebase: captura Web y backend, Flutter Android y Publicar en Firebase Hosting en verde.
2. Abre Publicar en Firebase Hosting y captura Comprobar el sitio publicado finalizado.
3. En el resumen, Artifacts permite descargar capturas-web y android-pruebas.
   Las capturas son del recorrido automatizado con datos de prueba, no de produccion.
4. Firebase Console > Hosting > historial de versiones: captura la nueva publicacion.
5. Abre el sitio real y /deployment.json para demostrar la version publicada, sin mostrar credenciales.

Si falla una prueba, Firebase no se publica desde esta ejecucion. Corregir la causa y
subir un nuevo commit. Las ejecuciones previas fallidas se conservan como historial.

Referencia oficial: https://firebase.google.com/docs/hosting/github-integration
