> **Documento histórico anterior a la integración con Supabase (23/09/2026).** Las afirmaciones de «producción lista», rutas antiguas y pruebas anteriores no describen la versión actual. Consulta [la revisión vigente](REVISION_TECNICA.md) y [la guía de Supabase](SUPABASE.md).

# Instrucciones de uso - Alerta Satipo

## ¿Cómo ejecutar el proyecto?

### Paso 1: Descargar/clonar

```bash
# Si está en repositorio
git clone <url-repo>
cd "Alerta de Incendios"
```

### Paso 2: Iniciar servidor local

Elige UNA de estas opciones:

#### Opción A: Python 3 (recomendado)
```bash
python -m http.server 8000
```

#### Opción B: Node.js
```bash
npx http-server -p 8000
# O si ya tienes http-server instalado:
http-server -p 8000
```

#### Opción C: PHP
```bash
php -S localhost:8000
```

### Paso 3: Abrir en navegador

```
http://localhost:8000
```

### Paso 4: Explorar la aplicación

---

## Rutas principales

| URL | Descripción | Acceso |
|-----|------------|--------|
| `/` | Página de inicio | Público |
| `/src/pages/login.html` | Autenticación | Público |
| `/src/pages/app-mobile.html` | App móvil | Después de login (Poblador) |
| `/src/pages/admin-panel.html` | Dashboard admin | Después de login (Admin) |
| `/src/pages/architecture.html` | Documentación técnica | Público |

---

## Flujos de usuario

### 🚀 Primeros pasos

1. **Acceder a la aplicación**
   - Abre `http://localhost:8000` en tu navegador

2. **Seleccionar perfil en la página de inicio**
   - Haz clic en "Ir a autenticación"

3. **Completar login**
   - Email: Cualquiera (ej: usuario@satipo.pe)
   - Contraseña: Mínimo 6 caracteres (ej: demo123)
   - Rol: Elige Poblador o Administrador

4. **¡Explorar!**
   - La aplicación carga según tu rol

---

### 👤 Flujo para Pobladores

```
Home → Ir a autenticación → Email + Contraseña + Rol: Poblador
    ↓
App Móvil (Interfaz tipo teléfono)
├─ Pantalla 1: INICIO
│  ├─ Ver riesgo actual (82%)
│  ├─ Estadísticas (Temperatura, Humo, Viento, Batería)
│  ├─ Botones: "Reportar incendio", "Solicitar apoyo"
│  └─ Recomendaciones
│
├─ Pantalla 2: ALERTAS
│  ├─ Historial de últimas 7 alertas
│  └─ Filtro por zona y nivel
│
├─ Pantalla 3: MAPA
│  ├─ Visualización de 4 sensores
│  ├─ Zona de riesgo marcada
│  └─ Información de cada nodo
│
├─ Pantalla 4: REPORTAR
│  ├─ Formulario: Ubicación, Descripción, Severidad
│  └─ Enviar reporte
│
├─ Pantalla 5: SOLICITAR APOYO
│  ├─ Contactos de emergencia
│  │  ├─ Bomberos
│  │  ├─ Policía
│  │  └─ Centro de salud
│  └─ Enviar solicitud
│
└─ Pantalla 6: PERFIL
   ├─ Información del usuario
   ├─ Historial de actividad
   ├─ Configuraciones
   │  ├─ Notificaciones push
   │  ├─ Sonido de alerta
   │  └─ Compartir ubicación
   └─ Cerrar sesión
```

**Controles**:
- Haz clic en los botones del menú inferior para cambiar de pantalla
- Usa "← Atrás" para volver a inicio
- "Cerrar sesión" te lleva a login

---

### ⚙️ Flujo para Administradores

```
Home → Ir a autenticación → Email + Contraseña + Rol: Administrador
    ↓
Dashboard (Interfaz web)
├─ Vista 1: DASHBOARD
│  ├─ KPIs (4 tarjetas)
│  │  ├─ Alertas activas: 05
│  │  ├─ Temperatura media: 31.8°C
│  │  ├─ Nodos críticos: 03
│  │  └─ Disponibilidad: 94.7%
│  ├─ Últimas alertas (timeline)
│  └─ Tabla de estado de sensores
│
├─ Vista 2: NODOS
│  ├─ Tabla de 6 dispositivos
│  ├─ Información: ID, Ubicación, Tipo, Estado, Batería
│  └─ Acciones: Ver detalles
│
├─ Vista 3: INCIDENTES
│  ├─ Tabla de 3 incidentes
│  ├─ Filtros: Todos, Validados, En revisión, Falsos positivos
│  ├─ Información: Fecha, Zona, Tipo, Nodos, Severidad, Estado
│  └─ Acciones: Revisar
│
├─ Vista 4: MANTENIMIENTO
│  ├─ Tabla de 3 tareas
│  ├─ Información: Nodo, Tarea, Prioridad, Asignado, Estado
│  └─ Crear nueva tarea
│
└─ Vista 5: CONFIGURACIÓN
   ├─ Umbral de temperatura crítica: 40°C
   ├─ Umbral de humo crítico: 70 ppm
   ├─ Intervalo de actualización: 30s
   └─ Guardar cambios
```

**Controles**:
- Menú lateral izquierdo para cambiar vistas
- Cada vista se carga dinámicamente
- "Cerrar sesión" en la esquina superior derecha

---

## Datos de demostración

### Sensores (nodos IoT)
```
NODO-01 (San Martín)
├─ Temperatura: 35.4°C
├─ Humo: 68% (Crítico)
├─ Voltaje: 12.8V
└─ Estado: 🔴 Crítico

NODO-02 (Los Pinos)
├─ Temperatura: 29.7°C
├─ Humo: 41% (Alerta)
├─ Voltaje: 13.2V
└─ Estado: 🟡 Alerta

NODO-03 (Mora Roja)
├─ Temperatura: 33.1°C
├─ Humo: 57% (Alerta)
├─ Voltaje: 12.6V
└─ Estado: 🟡 Alerta

NODO-04 (Loma Verde)
├─ Temperatura: 28.3°C
├─ Humo: 26% (Normal)
├─ Voltaje: 13.4V
└─ Estado: 🟢 Normal
```

### Alertas recientes
- Hoy 08:42 - Zona Sur (35.4°C) - Crítico
- Hoy 07:20 - Zona Norte (30.2°C) - Alerta
- Ayer 15:30 - Zona Oeste (28.5°C) - Normal
- ... (más en historial)

---

## Características técnicas

### Validaciones
- ✅ Email debe tener formato válido
- ✅ Contraseña mínimo 6 caracteres
- ✅ Campos requeridos obligatorios
- ✅ Mensajes de error en tiempo real

### Sesiones
- Datos guardados en sessionStorage
- Se pierden al cerrar navegador
- Validación al acceder a app/dashboard

### Responsividad
- Diseño adaptable a cualquier pantalla
- Mobile: 375px a 768px
- Desktop: 768px en adelante

---

## Solución de problemas

### "La página no carga"
1. Verifica que el servidor esté corriendo
2. Intenta `http://localhost:8000/index.html`
3. Abre consola del navegador (F12) para ver errores

### "Estilos no se ven"
1. Revisa la consola del navegador
2. Verifica que `styles.css` exista en `src/assets/css/`
3. Intenta hacer refresh (Ctrl+F5)

### "Scripts no funcionan"
1. Abre consola (F12 → Console)
2. Busca errores en rojo
3. Verifica rutas de los scripts

### "No puedo logearme"
- Cualquier email válido (con @) funciona
- Contraseña debe tener mínimo 6 caracteres
- Selecciona un rol (Poblador o Admin)

### "Se cierra sesión al cambiar de página"
- Esto es normal en modo demo
- Usa el menú de navegación dentro de la app
- Los datos se guardan mientras navegas

---

## Navegación general

```
┌─ index.html (HOME)
│
├─ src/pages/login.html (AUTENTICACIÓN)
│  │
│  ├─→ src/pages/app-mobile.html (APP MÓVIL - Poblador)
│  │
│  └─→ src/pages/admin-panel.html (DASHBOARD - Admin)
│
└─ src/pages/architecture.html (DOCUMENTACIÓN)
```

Desde cualquier página puedes:
- Ir a "Ver arquitectura" para documentación
- Volver al inicio con el logo/título
- Cambiar de rol iniciando sesión nuevamente

---

## Documentación adicional

- **README.md** - Descripción general del proyecto
- **DESARROLLO.md** - Guía técnica para desarrolladores
- **RESUMEN_PROYECTO.md** - Resumen ejecutivo
- **VERIFICACION.md** - Checklist de validación
- **architecture.html** - Documentación interactiva en navegador

---

## Contacto / Soporte

El proyecto es un prototipo demostrativo UNMSM 2026.
Para consultas técnicas, revisa la documentación incluida.

---

**¡Disfruta explorando Alerta Satipo!**
