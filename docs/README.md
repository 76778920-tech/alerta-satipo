> **Documento histórico anterior a la integración con Supabase (23/09/2026).** Las afirmaciones de «producción lista», rutas antiguas y pruebas anteriores no describen la versión actual. Consulta [la revisión vigente](REVISION_TECNICA.md) y [la guía de Supabase](SUPABASE.md).

# Alerta Satipo - Documentación del Proyecto

## Descripción general

**Alerta Satipo** es un sistema de detección temprana de incendios forestales desarrollado para comunidades remotas de Satipo, Perú. Combina Edge AI, LoRaWAN y energía solar para operar sin depender de internet centralizado o línea eléctrica.

## Estructura del proyecto

```
Alerta de Incendios/
├── index.html                      # Página de inicio principal
├── src/
│   ├── pages/                      # Archivos HTML
│   │   ├── login.html              # Autenticación con roles
│   │   ├── app-mobile.html         # App móvil (6 pantallas)
│   │   ├── admin-panel.html        # Dashboard administrador
│   │   └── architecture.html       # Documentación técnica
│   ├── assets/
│   │   ├── css/
│   │   │   └── styles.css          # Estilos unificados
│   │   └── js/
│   │       ├── login.js            # Validación y autenticación
│   │       ├── app.js              # Lógica app móvil
│   │       └── admin.js            # Lógica panel admin
│   └── assets/js/modules/          # Módulos reutilizables (futuro)
├── docs/                            # Documentación
└── config/                          # Configuraciones (futuro)
```

## Stack Técnico

### Hardware (Edge Layer)
- **ESP32**: Microcontrolador LoRaWAN
- **Sensores**: Temperatura, Humo, Humedad, Viento
- **Energía**: Panel solar + batería LiFePO4 (autonomía 8-12 meses)

### Procesamiento (Edge AI)
- **Raspberry Pi 4**: Gateway LoRaWAN + servidor local
- **TinyML**: Modelos de inferencia ligeros (<50MB)
- **LoRaWAN**: Comunicación baja energía, 10-15km alcance

### Frontend
- **HTML5/CSS3**: Responsive design
- **JavaScript Vanilla**: Sin dependencias externas
- **Módulos**: Separación de lógica en módulos reutilizables

## Características principales

### Autenticación
- Login con roles (Poblador / Administrador)
- Validación de email y contraseña
- Sesiones con sessionStorage

### App móvil (6 pantallas)
1. **Inicio**: Resumen de riesgos, estadísticas, acciones rápidas
2. **Alertas**: Historial de últimas 7 alertas
3. **Mapa**: Visualización de sensores y zonas de riesgo
4. **Reportar**: Formulario para reportar incendios
5. **Solicitar apoyo**: Contactos de emergencia
6. **Perfil**: Información del usuario y configuración

### Dashboard administrativo (5 vistas)
1. **Dashboard**: KPIs, timeline, estado de sensores
2. **Nodos**: Inventario de dispositivos
3. **Incidentes**: Historial filterable
4. **Mantenimiento**: Tareas de servicio
5. **Configuración**: Umbrales del sistema

### Seguridad y validaciones
- Validación de formularios en tiempo real
- Contraseña mínimo 6 caracteres
- Email con validación básica
- Confirmación en acciones críticas
- Sesiones que se pierden al cerrar navegador

## Cómo usar

### Desarrollo local

1. **Iniciar servidor local**:
   ```bash
   python -m http.server 8000
   # o con Node.js:
   npx http-server
   ```

2. **Acceder en navegador**:
   ```
   http://localhost:8000
   ```

3. **Usuarios de prueba**:
   - Poblador: `usuario@satipo.pe` / `demo123`
   - Admin: `admin@satipo.pe` / `admin123`

### Estructura de módulos JavaScript

Cada módulo usa el patrón IIFE (Immediately Invoked Function Expression):

```javascript
const ModuleName = (() => {
  // Private variables
  const privateVar = ...;
  
  // Private methods
  const privateMethod = () => {...};
  
  // Public API
  return {
    init: () => {...}
  };
})();

// Inicialización
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ModuleName.init);
} else {
  ModuleName.init();
}
```

## Archivos principales

### Estilos (`src/assets/css/styles.css`)
- Variables CSS para colores y espaciado
- Sistema de grid responsive
- Componentes reutilizables
- Mobile-first approach

### Lógica

#### `src/assets/js/login.js` (548 líneas)
- Validación de email
- Validación de contraseña
- Manejo de errores en formularios
- Redirección según rol

#### `src/assets/js/app.js` (250+ líneas)
- Renderización de sensores
- Navegación entre pantallas
- Manejo de reportes
- Validación de sesión

#### `src/assets/js/admin.js` (300+ líneas)
- Renderización de tablas
- Navegación entre vistas
- Datos simulados
- Manejo de sesión admin

## Datos simulados

El sistema incluye datos de demostración:

- **4 nodos sensores** con datos de temperatura, humo, voltaje
- **7 alertas históricas** con diferentes niveles
- **6 nodos en inventario** con estados
- **3 incidentes** con severidades variadas
- **3 tareas** de mantenimiento

## Mejoras implementadas

✅ **Validación mejorada**
- Errores en tiempo real en formularios
- Validación de contraseñas
- Confirmaciones antes de cerrar sesión

✅ **Accesibilidad**
- Fieldset/legend para roles
- Labels correctamente asociados
- ARIA labels donde es necesario
- Contraste de colores mejorado

✅ **Modularidad**
- Separación de lógica en módulos
- Funciones documentadas con JSDoc
- Reutilización de código

✅ **Responsividad**
- Diseño mobile-first
- Media queries para desktop
- Ajustes de grid en pantallas pequeñas

✅ **Documentación**
- Comentarios en código
- README completo
- Arquitectura explicada

## Cómo expandir el proyecto

### Agregar nuevas funcionalidades

1. **Crear nuevo módulo en `src/assets/js/`**:
   ```javascript
   const NewModule = (() => {
     // Implementation
     return { init: () => {} };
   })();
   ```

2. **Incluirlo en el HTML**:
   ```html
   <script src="../assets/js/new-module.js"></script>
   ```

3. **Inicializarlo**:
   ```javascript
   NewModule.init();
   ```

### Conectar con backend real

- Reemplazar datos simulados con API calls
- Usar `fetch()` para obtener datos
- Implementar manejo de errores

### Agregar persistencia

- Usar localStorage para datos locales
- Conectar base de datos (PostgreSQL, MongoDB)
- Implementar sincronización de datos

## Soporte

Para problemas o consultas sobre el proyecto, revisa:
- [Arquitectura técnica](src/pages/architecture.html)
- Comentarios en el código
- Logs en consola del navegador

## Licencia

Proyecto educativo - UNMSM 2026
