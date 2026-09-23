# Wireframes del aplicativo móvil — Alerta Satipo

Abre `index.html` directamente en tu navegador, o visita `/docs/wireframes/` con el servidor del proyecto. No requiere instalación ni conexión a internet.

- **Ver todas las pantallas:** lámina con siete wireframes, objetivos y anotaciones.
- **Probar navegación:** recorrido interactivo de acceso, inicio, alertas, reporte, mapa, apoyo y perfil. Puedes completar un reporte y verlo en Perfil.
- **Imprimir / PDF:** utiliza el diálogo del navegador y selecciona «Guardar como PDF», tamaño A4, escala 100 %. Desactiva los encabezados y pies del navegador. Se imprimen todas las pantallas, incluso desde el modo de navegación.

## Para presentar

«Estos wireframes representan la estructura del aplicativo móvil Alerta Satipo para el poblador. Primero se identifica, consulta el riesgo de su comunidad y puede registrar evidencia. El registro aparece en su historial. Las vistas complementarias permiten consultar alertas, identificar nodos y solicitar apoyo. La escala de grises permite evaluar la jerarquía, el contenido y la navegación antes del diseño visual final».

## Correspondencia con el proyecto

| Wireframe | Fuente |
| --- | --- |
| Acceso | `shared/login.html` |
| Inicio | `mobile/index.html` → `screen-home` |
| Alertas | `mobile/index.html` → `screen-alerts` |
| Reportar evidencia | `mobile/index.html` → `screen-report` |
| Mapa de nodos | `mobile/index.html` → `screen-map` |
| Solicitar apoyo | `mobile/index.html` → `screen-help` |
| Perfil y mis reportes | `mobile/index.html` → `screen-profile` |

Reglas de interacción basadas en `mobile/js/app.js`: descripción de 20 caracteres, campos obligatorios, paso del reporte al perfil y dos condiciones para escalar. Zonas y nodos tomados de `shared/js/data.js`.

## Alcance y decisiones

Wireframes de fidelidad media, no capturas de producción. Se conserva la arquitectura y los campos del aplicativo con una presentación simplificada. El acceso compartido se adapta al marco móvil; el rol administrador queda fuera del recorrido. Se muestra una selección de alertas y nodos para facilitar la lectura. El índice de riesgo y las lecturas son ilustrativos, no un cálculo en vivo.

La demostración no autentica, no llama, no envía incidentes y no activa ubicación ni notificaciones. Los reportes viven solo en memoria hasta recargar la página. No accede a `localStorage` ni modifica los datos de la app. El mapa es esquemático y la conectividad LoRa está representada visualmente. No se afirma que exista telemetría real, backend o funcionamiento PWA sin conexión.
