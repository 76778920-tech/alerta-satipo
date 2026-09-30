# Demostración distrital

Acceso: iniciar sesión como administrador y elegir **Simulación distrital**. Los nueve nombres y códigos UBIGEO corresponden al catálogo territorial de Satipo; todos los índices son ficticios.

Cada escenario genera temperatura, humedad, lluvia y viento ficticios con el generador del navegador, según el perfil Variable, Seco o Lluvioso. El índice ilustrativo se calcula como round(clamp(2 × (temperatura − 18) + 0.55 × (100 − humedad) + 0.7 × viento − 2 × lluvia, 0, 100)). La fórmula solo da coherencia a la demostración; no está validada ni entrenada. Los niveles son arbitrarios: bajo 0–39, medio 40–69 y alto 70–100. No son probabilidades ni categorías validadas. No depende de meteorología, sensores ni del modelo entrenado. Un escenario puede no contener algún nivel; el filtro muestra un estado vacío explícito.

Se puede generar otro escenario, filtrar por nivel y exportar JSON. La exportación se llama SIMULACION-satipo-<id>.json y contiene type=SIMULATION_ONLY, aviso, identificador, fecha, horizonte ilustrativo de 24 horas y resultados. Se conservan los últimos diez escenarios en localStorage por identificador de administrador. Al recargar se recupera el último escenario válido con su fecha original. No se sincroniza entre dispositivos y borrar los datos del navegador elimina el historial. Si no se puede guardar, se avisa y sigue disponible la exportación; no se guarda en Supabase ni modifica las 300 lecturas, eventos, entrenamiento o resultados históricos. No envía alertas reales.

La función se inicializa después de verificar acceso administrativo. Los controles de datos reales y sus API conservan su autorización. La simulación no agrega rutas al backend; es una interacción local del panel.

Prueba: `python tests/district_demo.py`, con las credenciales administrativas locales existentes. Verifica nueve distritos, regeneración, filtros, exportación identificada, desplazamiento móvil y ausencia de escrituras remotas durante el uso de la simulación. Las capturas quedan en test-results. El pronóstico territorial real sigue pendiente de datos y validación; ver DATOS_TERRITORIALES.md.

La prueba también verifica coherencia del índice con sus variables, recuperación al recargar, cambio de perfil, selección del historial y aislamiento de los mensajes frente a actualizaciones de nodos.
