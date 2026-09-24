# Panel administrativo: desplazamiento y lecturas

## Correcciones

- Se define la altura del panel y se habilita un área de contenido desplazable con barra vertical, conservando navegación y cabecera accesibles. Las tablas tienen desplazamiento horizontal propio en pantallas pequeñas.
- La vista principal muestra la muestra histórica disponible: total, etiquetas positivas/negativas y temperatura media calculada sobre valores numéricos válidos.
- La tabla ofrece búsqueda por ID de origen, filtro de etiqueta y páginas de 12 registros. Pulsar un ID abre los 15 campos de detalle con las unidades presentes en el archivo original.
- Las fechas se presentan en UTC. Un dato ausente se indica como «No disponible»; no se transforma en cero. Una etiqueta desconocida no cuenta como positiva ni negativa.
- Los datos de la muestra están separados de la telemetría de campo. Se eliminan de la vista principal los mapas vacíos y los indicadores de batería/riesgo sin fuente; no se muestra una hora de actualización de sensores cuando no existen lecturas.
- La actualización general vuelve a consultar las lecturas. Una consulta fallida conserva la última muestra con aviso explícito; el error de carga inicial no inutiliza las otras secciones.
- La exportación administrativa incluye `historicalReadings`, con los valores originales de la última consulta disponible.
- Incidentes, nodos y mantenimiento muestran estados vacíos comprensibles. La planificación de visitas permanece deshabilitada porque no está implementada.

## Pruebas

`python tests/panel_readings.py` utiliza la cuenta administrativa existente y no crea usuarios ni modifica datos. Compara los campos de las 300 filas con el JSON de origen, recorre toda la paginación sin duplicados, verifica filtros y búsquedas vacías, simula fallos de red y campos inválidos, prueba la recuperación y el desplazamiento en 1440, 1024, 390 y 320 píxeles de ancho.

Para comprobar el sitio publicado, definir `PANEL_TEST_URL=https://alerta-satipo-76778920.web.app` antes de ejecutar la prueba. Las simulaciones de fallo/campos inválidos se interceptan únicamente en el navegador de prueba; no alteran Supabase.

No se agregaron sensores ni predicciones nuevas. La etiqueta del CSV sigue siendo histórica y no equivale a una alarma actual en Satipo. Se mantiene el acceso exclusivamente administrativo, sin registro público.
