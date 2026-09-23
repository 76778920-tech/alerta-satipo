> **Documento histórico anterior a la integración con Supabase (23/09/2026).** Las afirmaciones de «producción lista», rutas antiguas y pruebas anteriores no describen la versión actual. Consulta [la revisión vigente](REVISION_TECNICA.md) y [la guía de Supabase](SUPABASE.md).

# Conexión Google Colab → Alerta Satipo

Flujo elegido: **offline / archivo JSON** (sin ngrok, sin API en vivo).

```text
sample_sensors.csv
        ↓
Google Colab (export_umbrales.py)
        ↓
satipo_umbrales.json
        ↓
shared/models/satipo_umbrales.json
        ↓
shared/js/data.js  →  mobile/ y web/
```

## Por qué este diseño

- No depende de que Colab esté abierto durante la demo.
- Si el JSON falla, la app **no se rompe**: usa defaults locales.
- El panel web puede ajustar umbrales (localStorage) y luego **restaurar el modelo Colab**.
- Mobile y web comparten el mismo scoring.

## Precedencia de umbrales

1. Ajustes del operador en `localStorage` (panel web)
2. Valores del JSON exportado por Colab
3. Defaults embebidos en `data.js`

## Pasos en Google Colab

1. Crea un notebook nuevo.
2. Sube `colab/sample_sensors.csv` y `colab/export_umbrales.py`.
3. Ejecuta:

```python
%run export_umbrales.py
```

O copia el contenido de `export_umbrales.py` en celdas.

4. Descarga `satipo_umbrales.json`.
5. Reemplaza el archivo del proyecto:

```text
shared/models/satipo_umbrales.json
```

6. Recarga:

- http://127.0.0.1:8000/mobile/
- http://127.0.0.1:8000/web/ → Configuración

En mobile debes ver el chip **Colab 1.0.0**.  
En web, el estado del modelo debe mostrar `satipo-risk-v1`.

## Schema del JSON (obligatorio)

```json
{
  "schemaVersion": "1.0.0",
  "modelId": "satipo-risk-v1",
  "source": "google-colab",
  "exportedAt": "2026-09-04T16:00:00Z",
  "notes": "...",
  "thresholds": {
    "tempCritical": 39,
    "smokeCritical": 65,
    "humidityDry": 38,
    "windRisk": 18
  },
  "weights": {
    "temp": 30,
    "smoke": 34,
    "humidity": 18,
    "wind": 14,
    "recencyMax": 4,
    "recencyMin": 1,
    "recencyFreshMinutes": 5
  },
  "bands": {
    "critical": 76,
    "watch": 55
  }
}
```

Reglas:

- Todos los números deben ser **> 0**
- `bands.watch` < `bands.critical`
- Si falta un campo, se completa con default (no tumba la app)
- Si el JSON está corrupto, se usa fallback y se registra el error en consola

## Cómo probar sin Colab

Desde la raíz del proyecto:

```bash
python colab/export_umbrales.py
```

Luego copia el JSON generado a `shared/models/satipo_umbrales.json` (o deja el que ya está).

## Qué NO es esto

- No es inferencia TinyML en ESP32 todavía.
- No es un backend en Colab.
- Es la calibración/exportación del modelo para la demo web.

## Checklist anti-errores

- [ ] Servidor local activo (`python -m http.server 8000`)
- [ ] Abrir por `http://` (no `file://`) para que `fetch` del JSON funcione
- [ ] Chip mobile = `Colab 1.0.0` (o `Defaults` si falló la carga)
- [ ] Panel web → Configuración muestra el modelo
- [ ] Botón **Restaurar modelo Colab** limpia overrides locales
- [ ] Cambiar umbrales en web afecta el riesgo al recargar mobile
