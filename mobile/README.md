# Alerta Satipo Android

## Alcance vigente: aplicativo para pobladores

Desde el 29/10/2026, el registro local crea únicamente POBLADOR. Se rechazan cuentas ADMINISTRADOR/OPERADOR en el acceso móvil, incluidas las cuentas de prueba antiguas; no se convierten ni se eliminan. La gestión administrativa queda en la web. Se retiraron gestión de usuarios, importación y laboratorio de simulación de la interfaz; se conserva recepción BLE, consulta, exportación local y reportes.

**Tus alertas** corresponde a los eventos locales del teléfono (compartidos por sus cuentas locales), no a una asignación personal por comunidad. **Alertas generales** consulta todos los eventos autorizados del proyecto mediante `resident_pmv1_feed`, exclusivamente de lectura y para usuarios de `clientes` que no pertenezcan a `administradores`. Las tablas administrativas mantienen sus políticas. La consulta omite la identidad de quien cargó los registros; las tarjetas no muestran números de nodo/dispositivo. La pestaña Dispositivo solo permite conexión BLE, no administración.

La migración `202610290001_resident_feed.sql` habilita esta consulta. Para vincular una cuenta remota se necesita una cuenta de poblador existente en Supabase; el registro local no crea esa cuenta. La cuenta administrativa anteriormente usada para pruebas ya no sirve en el móvil. La verificación remota usa `config/resident.local.json`, ignorado por Git.

Las secciones históricas siguientes describen la primera implementación y sus pruebas; cualquier referencia a roles administrativos móviles o simulación desde la interfaz queda sustituida por este alcance.

## Conexión de consulta a Supabase (29/10/2026)

En **Perfil**, vincular una cuenta remota de poblador una vez. Las credenciales locales del emulador no otorgan permisos remotos. Las políticas RLS se mantienen; la consulta requiere pertenecer a `clientes` y rechaza cuentas de `administradores`. Estado, Alertas e Historial no repiten botones de conexión.

La vista **Supabase** consulta hasta 1000 lecturas recientes y, por separado, los 200 eventos más recientes de `EventoAlerta`. Esto evita que lecturas normales recientes oculten alertas anteriores. El resultado conserva la predicción del servidor; no se recalcula ni se inventa latencia. El selector **Este teléfono** vuelve a los registros SQLite. La atención y exportación locales no modifican datos remotos.

Se consulta al conectar, al regresar a primer plano y cada 15 segundos mientras la app está abierta; también hay un botón Actualizar. Es consulta periódica, no Supabase Realtime ni notificaciones de fondo. Si falla la conexión o autorización, se retiran los datos remotos visibles y se informa del error. Las fechas de las lecturas indican su antigüedad, independientemente de la hora de consulta.

La sesión remota se conserva en almacenamiento seguro Android, separada por cuenta local. Después de reiniciar e ingresar a la misma cuenta local, se restaura sin pedir nuevamente las credenciales web y se consulta automáticamente. La recuperación inicial no necesita red; los tokens vencidos se renuevan al consultar. El cierre explícito de sesión o la desvinculación elimina la sesión guardada. No se guardan contraseñas web en SQLite ni en el APK. `assets/supabase-public.json` contiene solo configuración pública. No se incorporan claves administrativas.

Esta integración es de **consulta**: no sube lecturas locales, no sincroniza estados de atención y no fusiona identidades locales con Supabase Auth. Los datos remotos tampoco se almacenan en SQLite. La descripción de funcionamiento offline de abajo corresponde al modo local.

Verificación: `dart run tool/check_cloud.dart --live` usa las credenciales del archivo local del desarrollador, sin imprimirlas; comprueba consulta y cierre de sesión, sin escribir registros. En la prueba se encontraron 3 lecturas y 2 alertas PMV1. Referencia: [consulta de relaciones con el SDK Dart](https://supabase.com/docs/reference/dart/select).

Implementación Flutter/Dart iniciada el 28/10/2026 a partir del documento de conocimientos de ingeniería de 51 páginas. Aplicación nativa Android; no es un contenedor de la web.

## Ejecutar e instalar

```powershell
cd mobile
flutter pub get
flutter analyze
flutter test
flutter build apk --debug
flutter install -d emulator-5554
```

APK de pruebas: `build/app/outputs/flutter-apk/app-debug.apk`. Usa firma de depuración; no es un lanzamiento firmado para Play Store. No contiene credenciales de Supabase ni claves de servicios externos.

Primera instalación: crear la cuenta del responsable local. La primera cuenta es ADMINISTRADOR de **esta instalación**, sin autoridad en Supabase. Las siguientes son POBLADOR; el administrador puede promoverlas a OPERADOR. Esta decisión permite ensayar los tres roles sin servidor y está indicada en la pantalla de registro. Los correos son identificadores locales, no se verifica su propiedad ni existe recuperación por correo.

## Recorrido

1. Crear cuenta e iniciar sesión. Contraseña de 12–128 caracteres, PBKDF2-HMAC-SHA256 con 600000 iteraciones y sal aleatoria; sesión en almacenamiento seguro de Android con expiración de 24 horas. SQLite guarda el hash, nunca la contraseña.
2. En Dispositivo, seleccionar Normal/Advertencia/Emergencia y generar una lectura o diez, o iniciar captura cada dos segundos. Solo operador/administrador pueden adquirir/importar/exportar. Las muestras siempre muestran SIMULACIÓN.
3. Consultar Estado y las cinco variables. No se muestra «Normal» cuando todavía no hay lecturas.
4. Revisar Alertas, filtrar niveles y marcar atención PENDIENTE/ATENDIDO/DESCARTADO. El sonido opcional de Emergencia utiliza un tono Android mientras la aplicación está abierta; depende del volumen/modo del sistema y no es una alarma de fondo.
5. Consultar Historial sin Internet. SQLite conserva lectura, predicción y alerta mediante transacción; repetir un UUID con el mismo contenido no duplica filas, otro contenido se rechaza.
6. Exportar JSON mediante el selector de compartir Android. Importar un arreglo como el producido por `scripts/capture-pmv1-serial.py` o una exportación móvil. Límite de importación: 1000 registros y 10 MB. La importación vuelve a evaluar las lecturas; no restaura estados de atención anteriores.
7. Reportar observaciones desde Estado: lugar, observación, gravedad, descripción, contacto, distancia y referencia. Se guardan en el teléfono; no se envían a terceros. Cada cuenta ve sus reportes, todas las cuentas autorizadas comparten telemetría ambiental de la instalación.
8. En Perfil, consultar evaluación sintética y gestionar roles si corresponde. Cerrar sesión elimina el token, detiene adquisición y BLE, y no borra registros.

## Bluetooth y ESP32-S3

Servicio `6d89e001-2b74-4ec2-9c51-f1a0388b1200`; característica NOTIFY `6d89e002-2b74-4ec2-9c51-f1a0388b1200`. JSON UTF-8 delimitado por salto de línea, fragmentado en paquetes de hasta 20 bytes en el emisor. El receptor reensambla caracteres UTF-8 y limita cada trama a 8192 bytes.

Desde la raíz del repositorio:

```powershell
python -m platformio run -d firmware/pmv1 -e esp32s3-ble-simulation
python -m platformio run -d firmware/pmv1 -e esp32s3-ble-sensors
```

Ambos entornos compilaron. No se ha flasheado ni probado una placa real. El modo físico mantiene los bloqueos de calibración del PMV1. Preparar LittleFS según `docs/PMV1_IMPLEMENTADO.md`; `uploadfs` reemplaza esa partición.

El nombre anunciado es Satipo-PMV1. Activar Bluetooth y conceder los permisos solicitados; Android anterior a 12 puede requerir ubicación para escanear. La búsqueda dura 12 segundos y solo muestra dispositivos con el servicio indicado. La conexión se realiza por selección del usuario y se detiene al salir al fondo. No existe servicio persistente en segundo plano ni reconexión automática.

Protocolo de laboratorio sin emparejamiento autenticado, retransmisión ni confirmación de recepción: no acredita origen confiable del nodo ni entrega garantizada. El almacenamiento del ESP32 sigue siendo local si no hay receptor. La app registra hora de recepción cuando falta UTC del dispositivo. La latencia mostrada corresponde al árbol ejecutado en el móvil, no al enlace ni al modelo físico. No se conservan todavía metadatos completos de latencia/tiempo de arranque del nodo.

## Correspondencia con el PDF y diferencias explícitas

- HU001–003: registro e ingreso locales, roles y restricciones en casos de uso; no autenticación federada con el panel.
- HU004–008: recepción/importación de cinco variables y simulación; inferencia del mismo árbol sintético que PMV1, con paridad comprobada en 40 fixtures. Edge Impulse y validación física siguen pendientes.
- HU009–011 y HU013: nivel visual, tono Android en primer plano, adaptador BLE y estado actual. LED/buzzer externos no se implementan mediante la interfaz móvil; prueba BLE física pendiente.
- HU014–017: historial ordenado, SQLite offline, importación/exportación. Atención de alertas y reportes se conservan localmente. No sincroniza con Supabase y ningún registro se marca sincronizado.
- HU018: consulta de resultados de evaluación sintética existente; evaluación de campo, SUS y protocolo de usuarios siguen pendientes.
- HU012: LoRaWAN requiere radios/gateway y contrato de recepción; no está implementado en esta app.

El PDF páginas 18–20 pide MQ-2 en ppm y PM10, además de RP02/RP03. El modelo actual utiliza índices separados de humo/gas y PM2.5. **No se convierten índices a ppm ni se fabrican PM10 o predicciones binarias**: esos campos permanecen nulos/sin modelo. Las coordenadas también son nulas hasta conocer la instalación; no se dibuja un mapa con ubicaciones falsas. Por ello el PDF no puede declararse implementado al 100 %.

Los wireframes páginas 26–27 se trasladan parcialmente: acceso, estado, alertas, reporte y perfil; faltan mapa con coordenadas verificadas y flujo de apoyo con destinatarios reales. No se muestra confirmación de un envío inexistente.

## Arquitectura y seguridad

`lib/domain`: lectura, árbol y reensamblaje de tramas sin dependencias de Flutter/SQLite/BLE.
`lib/application`: puertos y casos de uso, autorización e ingestión.
`lib/adapters`: SQLite, PBKDF2, almacén seguro y BLE.
`lib/ui`: vistas Flutter y coordinación de acciones. `lib/main.dart`: composición.

La base SQLite reside en el espacio privado Android; no tiene cifrado SQLCipher adicional. Se desactiva copia automática Android. La exportación produce un archivo explícitamente compartido por el usuario. No hay recuperación local de contraseña ni autenticación por biometría; no borrar datos de la app sin exportar lecturas importantes. El rol local no reemplaza autorización de un futuro servidor.

## Evidencia ejecutada

- Análisis estático Flutter sin incidencias.
- Pruebas de paridad, validación, roles, expiración, hashes con sal, transacción/rollback/reapertura SQLite, fragmentación BLE e interfaz de acceso estrecha.
- APK debug compilada e instalada en emulador Android.
- Registro, acceso, diez lecturas y conservación después de detener y reabrir el proceso comprobados en emulador.
- Firmware BLE en modos simulación/sensores compilado.

Pendientes de comprobación en teléfono físico: permisos y enlace BLE, alcance y pérdidas, reproducción audible, importar/compartir con proveedores Android reales, consumo y comportamiento de hardware. No se evaluaron incendios reales.
