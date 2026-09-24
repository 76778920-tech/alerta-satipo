# Nodos, casos y mantenimiento

Supabase conserva seis nodos virtuales V-01 a V-06. Se ordenan las 300 filas de smoke-detection-iot-300-v1 por source_row y se asignan en lotes de 50. La tabla demo_node_readings contiene una clave foránea compuesta a smoke_readings: cada lectura pertenece a un único lote. No se alteran los datos originales.

Cada lote con etiquetas Fire Alarm positivas tiene un caso de revisión (demo_cases). El total de etiquetas es 214; no son 214 incendios ni se infieren episodios continuos de una muestra dispersa. Los casos están separados de incidentes y reportes reales. Un estado Revisado no confirma un incendio.

Cada nodo tiene una tarea preventiva propuesta en demo_maintenance. Son tareas de demostración: el CSV no informa averías, reparaciones, ubicaciones, técnicos o fechas de visita. Los estados Pendiente, En progreso y Completada se guardan en Supabase; completar una tarea no acredita una reparación física.

Las cuatro tablas tienen RLS: solo administradores pueden consultarlas. Únicamente los estados son editables desde el navegador. Las actualizaciones comprueban el estado anterior para evitar sobrescribir un cambio concurrente. Exportar datos incluye esta sección en demonstration.

Pruebas: npm test valida relaciones y permisos PostgreSQL. python tests/panel_operations.py compara vínculos con la fuente, cambia y restaura estados existentes, verifica persistencia tras recarga, fallos de red y pantallas pequeñas. No crea usuarios. PANEL_TEST_URL permite probar el sitio publicado.
