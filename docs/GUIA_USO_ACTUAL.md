# Guía de uso del panel actual

Acceso: https://alerta-satipo-76778920.web.app/

## Entrar

Utiliza una cuenta administrativa previamente autorizada. La web no ofrece registro ni acceso para pobladores. No publiques contraseñas en documentos o capturas. Si no puedes ingresar, comprueba credenciales y permisos con quien administra el proyecto.

## Lecturas

Consulta las 300 lecturas históricas de Smoke Detection IoT almacenadas en Supabase. Puedes filtrar, recorrer páginas y consultar detalles. Fire Alarm es la etiqueta original, no un aviso actual. Si falla la consulta, sigue el mensaje de error y reintenta; no sustituyas la muestra por valores aleatorios.

## Predicciones

Muestra 60 clasificaciones históricas del modelo publicado, reservadas del entrenamiento de 240 lecturas. Se presentan etiqueta real, clasificación, puntaje no calibrado y errores. Hay 54 aciertos, cinco falsos negativos y uno falso positivo. Actualizar consulta la evaluación publicada; no entrena ni procesa sensores nuevos. El modelo no pronostica incendios futuros por distrito.

## Simulación distrital

Presenta nueve distritos reales con índices ficticios. Generar otro escenario produce resultados aleatorios locales; los filtros permiten seleccionar niveles. Exportar simulación descarga un JSON marcado SIMULATION_ONLY. El horizonte de 24 horas es ilustrativo. Esta función no modifica Supabase, no genera incidentes reales ni notifica a personas. Recargar genera un escenario diferente.

## Nodos, incidentes y mantenimiento

Los seis nodos virtuales organizan las 300 lecturas históricas. No son dispositivos físicos conectados. Los casos y tareas de demostración están vinculados a esos nodos. Las modificaciones de estado disponibles en estas secciones sí se guardan en las tablas correspondientes; utiliza únicamente datos autorizados para pruebas.

## Cerrar sesión

Usa Cerrar sesión al terminar, especialmente en un equipo compartido. Para una sustentación, prepara una sesión autorizada sin mostrar sus credenciales.

## Recorrido sugerido para la presentación

1. Explicar el acceso restringido y entrar como administrador.
2. Mostrar las 300 lecturas y su procedencia histórica.
3. Abrir Predicciones; explicar resultados y errores sin presentarlos como pronóstico territorial.
4. Abrir Simulación distrital; generar y filtrar un escenario. Mostrar el aviso de datos ficticios y su exportación.
5. Mostrar la relación de nodos virtuales, lecturas y operaciones.
6. Explicar que ya existen datos meteorológicos territoriales, pero faltan eventos verificados para entrenar el pronóstico real.

## Distinción de datos

| Vista | Fuente | Alcance |
| --- | --- | --- |
| Lecturas | CSV histórico importado a Supabase | Datos externos, sin telemetría actual |
| Predicciones | Evaluación publicada del modelo | Clasificación histórica de humo |
| Simulación distrital | Generador aleatorio del navegador | Demostración ficticia |
| Meteorología territorial (archivos del proyecto) | Open-Meteo ERA5 y límites MINAM | Investigación; sin etiquetas de incendio verificadas |

No existe todavía un servicio automático de pronóstico territorial ni alertas operativas validadas.
