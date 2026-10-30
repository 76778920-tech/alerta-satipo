# Exposición del PMV2 — Alerta Satipo

**Expositor:** Piero Manuel Espíritu Vilchez  
**Duración aproximada:** 5 a 7 minutos  
**Fecha del documento:** 30 de octubre de 2026  
**Alcance:** demostración del avance del aplicativo móvil y explicación de las pruebas físicas pendientes.

> Las indicaciones «Mostrar» sirven para preparar la grabación. Los bloques de cita son el texto que puedes decir durante la exposición. Este guion no acredita que todo el PMV2 esté terminado.

## 1. Presentación del proyecto

**Mostrar:** aplicativo Alerta Satipo abierto en el emulador o en el celular, con la sesión iniciada.

> Buenos días. Soy Piero Manuel Espíritu Vilchez y presentaré los avances del segundo producto mínimo viable, o PMV2, del proyecto Alerta Satipo.
>
> El propósito de esta etapa es comunicar al usuario el nivel de riesgo detectado. Comprende cuatro historias: HU09, luz de alerta; HU10, sonido de alerta; HU11, alertas en el celular; y HU13, visualización del estado actual.
>
> Voy a mostrar las funciones disponibles en la aplicación y explicar qué pruebas todavía requieren los componentes físicos. Los datos utilizados en esta demostración son simulados.

## 2. HU13 — Visualizar el estado actual

**Mostrar:** pestaña **Estado**. Señalar el nivel, el color, la fecha y las cinco mediciones. Desplazarse si alguna tarjeta queda fuera de la pantalla.

> Esta pantalla permite conocer el último estado disponible. El resultado se presenta con texto y color para que el usuario identifique si corresponde a Normal, Advertencia o Emergencia.
>
> Normal representa condiciones clasificadas sin indicios de riesgo por el modelo; Advertencia indica condiciones que requieren atención; y Emergencia representa la clasificación de mayor gravedad. En esta demostración son resultados de datos simulados, no una confirmación de un incendio real.
>
> Debajo se muestran temperatura, humedad, humo, gas y partículas. También aparece la fecha de la lectura, que permite reconocer cuándo se generó el registro.
>
> La aplicación puede consultar el estado general de Supabase y actualizar la consulta periódicamente mientras está abierta. Para esa consulta se necesita conexión a internet.

**Evidencia que mostrar:** pantalla del nivel con texto y color, mediciones y fecha visibles.

**Si se demuestra una actualización:** incorporar una nueva lectura mediante el flujo autorizado del proyecto y esperar a que aparezca en la app. Comprobar que cambió la fecha o el registro. Si no se realiza esta prueba durante el video, decir:

> En este momento estoy demostrando la visualización del último registro; la prueba de actualización con una nueva lectura debe documentarse por separado.

## 3. HU11 — Alertas en el celular

**Mostrar:** **Alertas → Alertas generales**. Abrir el detalle de una alerta, señalar su nivel y fecha y cambiar el filtro. Después seleccionar **Tus alertas**.

> En esta sección el poblador puede consultar las alertas. Alertas generales muestra los eventos autorizados almacenados en Supabase. Cada tarjeta presenta el nivel y la fecha, y el filtro permite revisar una categoría específica.
>
> Tus alertas corresponde a los eventos guardados localmente en este teléfono. Por ahora, no representa una asignación personal de alertas por usuario o comunidad. Si no hay registros locales, la aplicación informa que no existen alertas para mostrar.
>
> Las tarjetas no muestran números de dispositivos. La información se presenta mediante texto, colores e iconos para facilitar su lectura.
>
> La consulta por internet ya puede demostrarse. Sin embargo, esta consulta no sustituye la recepción por Bluetooth prevista en HU11. La prueba de comunicación con el ESP32-S3 y a distintas distancias continúa pendiente porque todavía no contamos con el equipo físico.

**Evidencia que mostrar:** consulta de alertas generales, detalle de un evento y funcionamiento del filtro.

**Límite de la demostración:** la consulta periódica en primer plano no equivale a notificaciones push ni demuestra recepción con la aplicación cerrada.

## 4. HU09 — Luz de alerta

**Mostrar:** tarjeta de HU09 en Trello con las tareas y su estado real.

> HU09 contempla una señal luminosa en el equipo: verde para Normal, amarillo para Advertencia y rojo para Emergencia.
>
> Para comprobar esta historia necesitamos el ESP32-S3, los LEDs y sus resistencias. La prueba debe verificar que la luz cambie según el nivel y que sea visible desde la distancia prevista.
>
> Actualmente no puedo presentar una validación física porque todavía no contamos con estos componentes. Los colores de la pantalla móvil ayudan a interpretar el estado, pero no sustituyen la prueba de los LEDs.

**Pendiente:** montaje físico, verificación del cambio de luces y evidencia de visibilidad. No marcar estas tareas como terminadas sin la prueba correspondiente.

## 5. HU10 — Sonido de alerta

**Mostrar:** tarjeta de HU10 en Trello.

> HU10 contempla una señal sonora mediante un buzzer cuando el sistema se encuentre en Emergencia.
>
> La validación requiere conectar el componente, registrar el pin utilizado y comprobar que suene únicamente en ese nivel. También debemos revisar que su funcionamiento no afecte la adquisición de las mediciones.
>
> Estas pruebas físicas siguen pendientes por la falta del ESP32-S3, el buzzer y los sensores. Por eso, no presento esta historia como completada.

**Pendiente:** conexión física, activación exclusiva en Emergencia y prueba de funcionamiento junto con las lecturas.

## 6. Mejoras realizadas en el aplicativo

**Mostrar:** alternar entre **Estado** y **Alertas**, señalando las tarjetas y la navegación inferior.

> En la aplicación mejoré los colores, la tipografía y la navegación. Las mediciones se muestran en tarjetas con iconos y valores destacados, y las alertas se diferencian por su nivel.
>
> También ajusté las fechas para facilitar su lectura y dejé la información técnica en una sección desplegable. El objetivo es que el poblador pueda encontrar e interpretar la información con mayor facilidad.
>
> Verifiqué las pantallas Estado y Alertas en el emulador con registros simulados de Supabase. El análisis de Flutter no reportó problemas y las once pruebas automatizadas pasaron. Estos controles respaldan el software probado, pero no reemplazan las pruebas con hardware.

## 7. Evidencias y conclusión

**Mostrar:** evidencias disponibles en Trello y el commit de GitHub. No mostrar archivos de credenciales.

> El avance demostrado del PMV2 se concentra en la visualización del estado actual y la consulta de alertas desde el aplicativo móvil para pobladores.
>
> Para completar la validación del PMV2 faltan las pruebas de luces, sonido y comunicación Bluetooth con el equipo físico. También debemos adjuntar las evidencias de cada criterio de aceptación antes de cerrar las historias.
>
> Los cambios del aplicativo están guardados en GitHub. Con esta demostración podemos distinguir las funciones que ya se pueden revisar de las pruebas que aún están pendientes.

**Cambios publicados:** [Commit dd4f3cb — interfaz móvil y consulta para pobladores](https://github.com/76778920-tech/alerta-satipo/commit/dd4f3cb6e85fe176361b9b6f479d69ff71ce2734).

## Preparación antes de grabar

- Abrir la aplicación e iniciar sesión antes de empezar para no mostrar la contraseña.
- Comprobar la conexión a internet y la cuenta remota vinculada para consultar alertas generales.
- Tener abiertas las tarjetas HU09, HU10, HU11 y HU13 en Trello.
- Identificar los registros como simulados durante la exposición.
- Mostrar únicamente evidencias existentes; no marcar como terminadas pruebas que no se realizaron.
- Mantener fuera de la grabación `.env`, archivos de credenciales y claves privadas.
- Ensayar el recorrido: Estado → Alertas generales → filtro y detalle → Tus alertas → Trello → GitHub.
