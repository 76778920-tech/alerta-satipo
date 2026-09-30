# Verificación de aceptación del prototipo

Esta acta técnica registra comprobaciones automatizadas, no aceptación firmada por usuarios ni certificación para operación de emergencias.

## Resultado de la revisión

- Backend y base local de pruebas: 18 pruebas aprobadas (`npm test`). Incluyen autorización, arquitectura, operaciones y correspondencia de resultados históricos.
- Datos territoriales: seis pruebas aprobadas.
- Entrenamiento territorial: cinco pruebas aprobadas, con casos sintéticos identificados y rechazo del conjunto real sin etiquetas.
- Web publicada: pruebas de acceso administrativo, lecturas, predicciones y simulación distrital aprobadas. No se crearon cuentas ni se modificaron tablas durante estas comprobaciones. Los inicios de sesión sí utilizan Supabase Auth.

Se corrigió una condición de carrera en `admin_access.py`: la prueba ahora espera que termine la consulta de lecturas antes de comprobar el resumen, en lugar de comprobarlo al aparecer el contenedor.

## Repetir pruebas

```powershell
python scripts/check_acceptance.py
python scripts/check_acceptance.py --live
```

La primera opción ejecuta 29 pruebas locales (18 + 6 + 5). La segunda añade las cuatro pruebas de navegador del sitio publicado. Requiere dependencias Node/Python instaladas, Playwright y Microsoft Edge, conexión y las credenciales existentes en `config/admin.local.json`. No versionar ese archivo.

El ejecutor devuelve código distinto de cero si falla una suite y genera `test-results/acceptance.json` con resultados e instante de ejecución, sin credenciales. Las pruebas individuales proporcionan diagnóstico. No incluye las pruebas de operaciones que escriben y restauran estados: esas deben ejecutarse conscientemente cuando se quiera comprobar persistencia.

## Criterios verificados

| Criterio | Evidencia |
| --- | --- |
| Web sin registro público; acceso administrativo | admin_access.py; autorización backend en npm test |
| 300 lecturas, paginación, filtros y desplazamiento | panel_readings.py |
| 60 resultados históricos y recuperación ante errores | panel_predictions.py |
| Nueve distritos ficticios, filtros y exportación identificada | district_demo.py |
| Datos incompletos, etiquetas sin evidencia y cortes temporales rechazados | territorial_test.py; territorial_training_test.py |

## Pendientes que impiden aprobar un servicio real

- Historial georreferenciado y verificado de eventos y cobertura de periodos sin incendios.
- Disponibilidad temporal real de variables, cobertura meteorológica espacial y vegetación.
- Validación independiente, calibración, seguimiento prospectivo y criterios de aceptación operativos.
- Servicio de inferencia, almacenamiento de nuevas predicciones en Supabase, planificación de ejecución, monitoreo y alertas.

Ninguna prueba del prototipo confirma capacidad de pronosticar incendios reales. El modelo territorial todavía no ha sido entrenado con eventos reales.
