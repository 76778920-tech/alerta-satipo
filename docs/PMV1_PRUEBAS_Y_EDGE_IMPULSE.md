# Continuación del PMV1: Edge Impulse y aceptación

Fecha: 26/10/2026. Preparación de software, sin hardware conectado. No se ha creado ni entrenado un proyecto remoto de Edge Impulse. No hay credencial de ese servicio configurada en el entorno del proyecto.

## Paquete de datos preparado

Ejecutar desde la raíz:

```powershell
python scripts/prepare_pmv1_edge.py
```

Genera `var/pmv1-edge-impulse.zip` sin sobrescribir archivos existentes. Contiene 3000 muestras `training`, 900 `testing`, etiquetas Normal/Advertencia/Emergencia, `info.labels` y un manifiesto de hashes SHA-256. Los datos son exclusivamente sintéticos. El exportador rechaza valores inválidos y muestras repetidas, incluso entre conjuntos.

Cada CSV tiene cabecera y una única fila de cinco valores, sin columna de etiqueta ni tiempo artificial. Este formato corresponde a la [especificación oficial de muestras estáticas multivariable](https://docs.edgeimpulse.com/tools/specifications/data-acquisition/csv). Las etiquetas y categorías también se declaran explícitamente en `info.labels`.

## Importar cuando haya acceso al proyecto

1. Crear o seleccionar un proyecto privado en Edge Impulse Studio, destinado solo a este experimento sintético.
2. Extraer el ZIP en una carpeta nueva. Instalar el CLI oficial siguiendo la [documentación del uploader](https://docs.edgeimpulse.com/tools/clis/edge-impulse-cli/uploader).
3. Desde la carpeta extraída, ejecutar `edge-impulse-uploader --info-file info.labels` y autenticarse en el proyecto correcto. La preparación local no realiza esta subida.
4. Comprobar 3000 muestras de entrenamiento y 900 de prueba y las tres etiquetas. No activar una nueva partición automática que mezcle esos conjuntos.
5. Configurar clasificación estática con las cinco entradas en este orden: `temperature_c`, `humidity_pct`, `smoke_index`, `gas_index`, `dust_ugm3`. No añadir la etiqueta como entrada. Cualquier normalización debe estar incluida en el procesamiento exportado o reproducirse exactamente.
6. Separar validación dentro del entrenamiento para ajustar el modelo. Reservar las 900 muestras de prueba para evaluación final. No ajustar parámetros mirando repetidamente ese test.
7. Guardar ID del proyecto, versión, configuración, matriz de confusión y métricas obtenidas allí. No reutilizar como métricas de Edge Impulse las del árbol local.
8. Exportar biblioteca Arduino. Antes de integrarla, verificar cinco entradas por inferencia, tres etiquetas exactas y paridad con muestras conocidas. La rama `PMV1_EDGE_HEADER` del firmware todavía requiere esa biblioteca real. El backend debe soportar la misma versión antes de sincronizar sus resultados.

El archivo `manifest.json` declara `edge_impulse_uploaded=false` porque documenta el estado al generar el paquete. Conservar la evidencia de importación aparte; no modificar la procedencia sintética.

## Evaluación reproducible de nuevas lecturas

El capturador USB genera registros con cinco valores. Para evaluarlos, agregar a cada registro `expected_label`, una etiqueta de referencia independiente del resultado del modelo. Debe proceder del protocolo/observador, no copiarse de `device_prediction`. Guardar quién la asignó y por qué en el acta de ensayo.

```powershell
node scripts/evaluate-pmv1.mjs lecturas-etiquetadas.json resultado-evaluacion.json
```

No abre red ni modifica lecturas. Rechaza registros inválidos o duplicados y no sobrescribe resultados existentes. Calcula matriz de confusión (filas: referencia; columnas: predicción), exactitud, falsas alarmas entre normales y emergencias no detectadas. Si no existen casos normales o emergencias, la tasa correspondiente queda `null`, nunca un cero que simule éxito. El modelo evaluado es el árbol local identificado en el resultado; este comando no ejecuta una exportación de Edge Impulse.

## Protocolo de aceptación física pendiente

Crear una carpeta por ensayo con fecha, responsable, placa/revisión, módulos, esquema real, UUID, versión y hash del firmware/modelo, calibraciones, alimentación y condiciones del entorno. Registrar resultado `pendiente`, `aprobado` o `fallido` y adjuntar los archivos originales. No registrar aprobado sin ejecutar el paso.

### HU04 y HU05: adquisición e integridad

Con sensores calibrados, capturar diez lecturas consecutivas a dos segundos. Guardar JSON USB y log original. Verificar cinco campos finitos y dentro de rango, UUID únicos, origen sensor, secuencia y ausencia de huecos. Desconectar un sensor durante un ensayo controlado: debe aparecer un error y no persistirse una lectura inventada. Una señal fuera de calibración debe rechazarse. Anotar cantidad de lecturas válidas y descartadas.

### HU06: funcionamiento local

Programar primero la variante de simulación, verificar almacenamiento y después el montaje físico. Desconectar toda conexión a Internet manteniendo alimentación/USB. Capturar diez registros y resultados locales; registrar `latency_us`, versión del modelo y errores. Repetir con la exportación real de Edge Impulse cuando esté disponible. Compilar por sí solo no aprueba este criterio.

### HU07: desempeño

Preparar casos de referencia normales e intermedios y un protocolo de ensayo aprobado por el responsable técnico para condiciones de alarma. No generar fuego para esta prueba. Usar señales de prueba y medios de comprobación compatibles con los sensores; distinguir una señal inyectada de una exposición física real. Recoger perturbaciones normales, por ejemplo humedad y partículas, dentro de los límites de uso del fabricante.

Etiquetar independientemente, separar ensayos/sesiones de entrenamiento y prueba y ejecutar el evaluador. Registrar falsas alarmas y emergencias omitidas con sus denominadores. Los umbrales aceptables de desempeño deben acordarse antes de la prueba; no se inventa un criterio de aprobación a partir del resultado.

### HU08: tres niveles

Verificar los tres textos y colores con fixtures controlados. Luego contrastar salidas físicas contra etiquetas de referencia. Una etiqueta Emergencia por sí sola no demuestra detección de incendio real. Conservar ejemplos correctos y errores.

### HU15: conservación y sincronización

Capturar diez registros, detener adquisición y reiniciar la placa sin ejecutar `uploadfs`. Recuperar y comparar el archivo LittleFS mediante una herramienta de lectura del sistema de archivos; la descarga automática de historial por USB sigue pendiente. Comprobar IDs/contenido antes y después del reinicio. Una prueba de corte durante escritura debe registrar posibles filas incompletas, no asumir atomicidad eléctrica.

Importar las lecturas, sincronizar, cerrar sesión y consultar las tablas al reabrir: diez lecturas, una predicción por lectura y alertas solo para niveles no normales. Reintentar las mismas lecturas y verificar que no se duplican; provocar una interrupción de red y comprobar que la cola conserva pendientes. Anotar qué partes ya pasan por pruebas de software y cuáles se ejecutaron realmente con placa.

## Cierre

Todavía se necesita acceso a un proyecto Edge Impulse para la importación, entrenamiento y exportación reales. También se necesitan placa, módulos seleccionados y calibración para ejecutar el protocolo físico. Este documento y el paquete no sustituyen esas evidencias.
