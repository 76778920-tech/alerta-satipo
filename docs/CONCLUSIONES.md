> **Documento histórico anterior a la integración con Supabase (23/09/2026).** Las afirmaciones de «producción lista», rutas antiguas y pruebas anteriores no describen la versión actual. Consulta [la revisión vigente](REVISION_TECNICA.md) y [la guía de Supabase](SUPABASE.md).

# Conclusiones - Alerta Satipo

## Resultado

El proyecto evolucionó de una maqueta básica a un prototipo demostrable, ahora organizado por experiencia:

- `mobile/` para la app comunitaria
- `web/` para el panel de operadores
- `shared/` para estilos, login y datos comunes

La demo explica una operación completa con sensores, riesgo calculado, reportes comunitarios, incidentes, mantenimiento y configuración de umbrales compartidos entre ambas interfaces.


## Valor principal

La propuesta es relevante para zonas rurales porque no depende de conectividad permanente. El enfoque combina nodos solares, comunicación LoRaWAN, inferencia local y participación comunitaria. Esa mezcla es más creíble que una app de alertas genérica, porque responde a limitaciones reales de Satipo: distancia, energía limitada, geografía compleja y conectividad irregular.

## Lo mejor logrado

- La app móvil muestra riesgo actual con evidencia comprensible.
- El panel administrativo permite priorizar nodos e incidentes.
- Los reportes comunitarios complementan la telemetría automática.
- Los umbrales del modelo pueden modificarse y recalcular la operación.
- La documentación reconoce límites técnicos en lugar de prometer producción completa.

## Límites actuales

- La telemetría es simulada.
- No existe backend ni almacenamiento central.
- No hay mapa geográfico real ni coordenadas verificadas.
- Las credenciales son solo para demo.
- El cálculo de riesgo es una aproximación explicativa, no un modelo TinyML entrenado.
- Falta validación formal de accesibilidad, seguridad y rendimiento.

## Próximo paso recomendado

La siguiente versión debería enfocarse en un backend mínimo con tres endpoints:

- recepción de lecturas de nodos,
- registro de reportes comunitarios,
- consulta de incidentes para el panel admin.

Con eso el proyecto pasaría de prototipo visual a prototipo funcional de sistema distribuido.

## Cierre

Alerta Satipo ya tiene una narrativa técnica defendible: detección temprana local, operación comunitaria y respuesta administrativa. Todavía no es producción, pero sí es una base bastante más seria para presentar, explicar y seguir construyendo.
