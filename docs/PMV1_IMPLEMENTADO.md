# PMV1: implementación y pruebas

Continuación: [paquete Edge Impulse, evaluación de lecturas y protocolo de aceptación](PMV1_PRUEBAS_Y_EDGE_IMPULSE.md).

Actualizado: 26/10/2026. El usuario todavía no dispone de placa ni sensores. La demostración de software funciona; la aceptación física del PMV1 sigue pendiente. El modelo integrado es un árbol propio entrenado con datos sintéticos, **no una exportación de Edge Impulse** ni un detector validado de incendios.

## Probar ahora, sin componentes

1. Iniciar sesión administrativa y abrir **PMV1 · Lectura local**.
2. Seleccionar Normal, Advertencia o Emergencia y pulsar **Leer una vez**.
3. Pulsar **Probar 10 lecturas**: aparecen diez registros completos.
4. Iniciar adquisición cada dos segundos y después detenerla.
5. Con la pantalla ya cargada, desconectar Internet: adquisición simulada, clasificación y guardado local siguen funcionando. No se promete cargar o autenticar la aplicación desde cero sin red.
6. Reconectar y pulsar **Sincronizar con Supabase**. Los registros confirmados cambian a «Local + Supabase»; un fallo conserva los pendientes.
7. Recargar la página: IndexedDB conserva el historial por cuenta y navegador. Borrar datos del navegador elimina los registros locales no sincronizados. El servidor mantiene los ya confirmados.

## HU04 y HU05: cinco mediciones completas

Cada registro contiene UUID de lectura, UUID de nodo, origen `simulation` o `sensor`, fecha UTC y cinco valores numéricos finitos:

- `temperature_c`: temperatura, entre −20 y 80 °C.
- `humidity_pct`: humedad relativa, entre 0 y 100 %.
- `smoke_index`: índice de señal de humo, entre 0 y 100.
- `gas_index`: índice de señal de gas, entre 0 y 100.
- `dust_ugm3`: partículas PM2.5, entre 0 y 1000 µg/m³.

Los índices no son ppm y no identifican gases. PM2.5 representa partículas finas, no distingue polvo de humo. Un registro incompleto, no finito o fuera de rango se rechaza; no se sustituye un sensor ausente por cero. El validador se comparte entre navegador y servidor mediante generación de código. La importación JSON valida el lote completo y lo guarda en una transacción local; rechaza identificadores duplicados.

`colab/PMV1_cinco_variables.ipynb` permite generar y entrenar en Colab. Se ejecutó el entrenador local, no una sesión de Colab del usuario. El notebook descarga CSV, evaluación, fixtures y exportaciones JavaScript/C++. `scripts/train_pmv1.py` genera 3000 ejemplos de entrenamiento y 900 de prueba con semillas distintas. Requiere NumPy y scikit-learn. Después de regenerar:

```powershell
python scripts/train_pmv1.py
python scripts/build-pmv1-assets.py
npm run build
npm run build:api
```

## HU06: inferencia sin Internet

El árbol exportado funciona en JavaScript y C++, con las cinco variables en el orden anterior. El navegador no consulta servicios de IA. El firmware no inicializa Wi-Fi y guarda cada registro en LittleFS antes de emitirlo por USB. Ambos entornos PlatformIO, simulación y sensores, compilan.

**Pendiente literal de HU06:** obtener una exportación real del proyecto Edge Impulse, compilarla y ejecutarla en una placa. No se dispone de dicho proyecto ni de hardware. Existe una rama de integración mediante `PMV1_EDGE_HEADER`: biblioteca Arduino dentro de `firmware/pmv1/lib`, cinco entradas estáticas y tres etiquetas exactas `Normal`, `Advertencia`, `Emergencia`. Esa rama no se ha compilado contra una exportación real. Revisar preprocesamiento y orden de variables antes de activarla.

El importador rechaza versiones de modelo del dispositivo distintas de la versión integrada para evitar reemplazar silenciosamente resultados de Edge Impulse por los del árbol propio. Integrar un nuevo modelo también requiere actualizar y validar el backend.

Referencia: [exportación Arduino de Edge Impulse](https://docs.edgeimpulse.com/experts/predictive-maintenance-and-defect-detection-projects/fluid-leak-detection-with-flowmeter-seeed-wio-terminal).

## HU07 y HU08: detección experimental y niveles

Los escenarios de entrenamiento tienen distribuciones superpuestas, incluyendo partículas elevadas aisladas en algunos ejemplos normales. Las etiquetas describen escenarios sintéticos:

- **Normal, verde:** escenario de referencia.
- **Advertencia, amarillo:** escenario intermedio que requiere revisión.
- **Emergencia, rojo:** escenario simulado de mayor intensidad; no confirma fuego real.

Evaluación local reproducida en `colab/pmv1/evaluation.json`: exactitud **90,22 %**, F1 macro **0,9013**, **15 falsas alarmas entre 300 normales** y **23 emergencias clasificadas en otro nivel entre 305 emergencias**. La matriz de confusión está en ese archivo. Estas métricas pertenecen exclusivamente al generador sintético; no estiman desempeño en Satipo. El modelo histórico de 300 lecturas y las cifras del informe original permanecen separados.

## HU15: persistencia y acceso

La migración `202610260001_pmv1.sql` crea las tablas exactas `NodoSensor`, `LecturaAmbiental`, `HistoricoPrediccion` y `EventoAlerta`. Se aplicó al proyecto Supabase vinculado. La función `pmv1_store` realiza una transacción: nodo → lectura → predicción → alerta, esta última solo para Advertencia/Emergencia. Un fallo revierte la operación completa. Repetir el mismo UUID y contenido no duplica filas; cambiar el contenido bajo el mismo UUID se rechaza.

Hay límites en PostgreSQL y validación en aplicación. RLS restringe consulta a administradores; la escritura se realiza mediante RPC autorizado. La API recalcula la predicción, no acepta como autoridad una etiqueta enviada por el navegador. `PATCH /pmv1` guarda y `GET /pmv1` devuelve los últimos 100 registros con sus relaciones. La pantalla muestra su historial local; no descarga automáticamente todo el historial de otros navegadores.

La prueba remota explícita conserva tres registros con origen `simulation`, nodo `a6102600-0000-4000-8000-000000000000`: tres lecturas, tres predicciones y dos alertas comprobadas tras cerrar y reabrir sesión. Las alertas son registros de software, no SMS, llamadas, LED ni buzzer.

## Firmware y propuesta de conexión

Directorio: `firmware/pmv1`. Placa de referencia: ESP32-S3-DevKitC-1. Confirmar modelo y revisión antes de cablear; los pines se pueden ajustar en `include/config.h`.

- BME280 por I²C: SDA GPIO8 y SCL GPIO9, dirección 0x76 o 0x77.
- PMS5003 por UART: TX del sensor hacia RX GPIO18; RX del sensor hacia TX GPIO17 si el módulo lo requiere. El firmware usa 9600 baudios.
- Señal analógica independiente de humo: GPIO4.
- Señal analógica independiente de gas: GPIO5.
- Tierra común y alimentación adecuada a cada módulo según su ficha técnica.

Los canales analógicos requieren seleccionar módulos concretos y acondicionar sus señales al rango del ESP32-S3. **No conectar una salida de 5 V directamente a GPIO/ADC.** Los calentadores de módulos de gas no se alimentan desde un GPIO. La calibración debe corresponder al sensor, circuito y condiciones reales; no se suministran valores ficticios. Consultar el [manual de la placa de Espressif](https://docs.espressif.com/projects/esp-idf/en/v4.4.2/esp32s3/hw-reference/esp32s3/user-guide-devkitc-1.html) y las fichas de los módulos elegidos.

El modo físico permanece bloqueado con `PMV1_CALIBRATED=0`, calentamiento cero y rangos analógicos sin definir. Completar calibración, calentamiento y límites medidos antes de habilitarlo. Cada dispositivo necesita un UUID propio. La simulación de firmware y el modo sensor tienen identificadores separados para no mezclar procedencias.

```powershell
python -m platformio run -d firmware/pmv1 -e esp32s3-simulation
python -m platformio run -d firmware/pmv1 -e esp32s3-sensors
python -m platformio run -d firmware/pmv1 -e esp32s3-simulation -t buildfs
```

No se flasheó ninguna placa. Cuando exista una placa, `upload` carga el programa y `uploadfs` prepara LittleFS. **`uploadfs` reemplaza el contenido de esa partición: usarlo en una placa nueva o después de respaldar los registros.** El firmware no formatea automáticamente. Guarda `/readings.ndjson` y se detiene si el archivo supera aproximadamente 200 KB o falla la escritura. No hay rotación, recuperación automática por USB ni garantía de escritura ante pérdida eléctrica; esas pruebas requieren hardware.

Para capturar diez lecturas nuevas del puerto USB, con Python y pyserial:

```powershell
python scripts/capture-pmv1-serial.py --port COM5 --count 10 --output lecturas-pmv1.json
```

Sustituir COM5 por el puerto real. El archivo se crea sin sobrescribir uno existente y se importa desde la pantalla PMV1. El dispositivo aporta tiempo desde arranque; el capturador asigna UTC de recepción en el ordenador, no una fecha autónoma de medición. Conserva metadatos del dispositivo en el archivo; el registro de aplicación guarda los cinco valores y vuelve a evaluar con el modelo integrado. La transferencia actual requiere el ordenador como puente, no es sincronización inalámbrica autónoma.

## Verificación y pendientes

`npm test` verifica paridad de inferencia, validación, cola y transacciones con PostgreSQL embebido. `npm run test:browser` verifica diez lecturas, los tres niveles, desconexión de red, recarga, sincronización e importación inválida, además de las pantallas existentes. `tests/pmv1_live.mjs --live` requiere credenciales locales y escribe únicamente las tres muestras sintéticas de prueba.

Para cerrar la aceptación física: disponer de placa/módulos concretos, calibrarlos, comprobar diez capturas reales completas, ejecutar inferencia sin red, medir latencia y pérdida de muestras, probar persistencia tras reinicio y evaluar falsas alarmas con un protocolo seguro y datos independientes. La exportación Edge Impulse sigue pendiente. No se debe presentar PMV1 como físicamente terminado con las pruebas actuales.
