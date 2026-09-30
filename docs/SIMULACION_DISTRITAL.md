# Demostración distrital

Acceso: iniciar sesión como administrador y elegir **Simulación distrital**. Los nueve nombres y códigos UBIGEO corresponden al catálogo territorial de Satipo; todos los índices son ficticios.

Cada escenario asigna un entero aleatorio de 0 a 100 por distrito usando el generador del navegador. Los niveles son arbitrarios: bajo 0–39, medio 40–69 y alto 70–100. No son probabilidades ni categorías validadas. No depende de meteorología, sensores ni del modelo entrenado. Un escenario puede no contener algún nivel; el filtro muestra un estado vacío explícito.

Se puede generar otro escenario, filtrar por nivel y exportar JSON. La exportación se llama SIMULACION-satipo-<id>.json y contiene type=SIMULATION_ONLY, aviso, identificador, fecha, horizonte ilustrativo de 24 horas y resultados. Al recargar se genera otro escenario; no se guarda en Supabase ni modifica las 300 lecturas, eventos, entrenamiento o resultados históricos. No envía alertas reales.

La función se inicializa después de verificar acceso administrativo. Los controles de datos reales y sus API conservan su autorización. La simulación no agrega rutas al backend; es una interacción local del panel.

Prueba: `python tests/district_demo.py`, con las credenciales administrativas locales existentes. Verifica nueve distritos, regeneración, filtros, exportación identificada, desplazamiento móvil y ausencia de escrituras remotas durante el uso de la simulación. Las capturas quedan en test-results. El pronóstico territorial real sigue pendiente de datos y validación; ver DATOS_TERRITORIALES.md.
