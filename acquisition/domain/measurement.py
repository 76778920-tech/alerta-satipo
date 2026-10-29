from datetime import datetime, timezone
from math import isfinite

# Contrato explícito: no convertir MQ-2 en TVOC/eCO2 ni meteorología en humo.
UNITS = {'temperature_c': 'degC', 'humidity_pct': '%', 'tvoc_ppb': 'ppb',
         'eco2_ppm': 'ppm', 'pm1_0': 'ug/m3', 'pm2_5': 'ug/m3',
         'nc0_5': '#/cm3', 'nc1_0': '#/cm3', 'nc2_5': '#/cm3',
         'pm10': 'ug/m3', 'wind_kmh': 'km/h', 'rain_mm': 'mm'}
SMOKE_FEATURES = tuple(list(UNITS)[:9])


def validate_measurement(value):
    if not isinstance(value, dict):
        raise ValueError('La lectura debe ser un objeto')
    result = {}
    for field in ('source', 'external_id', 'node_id'):
        item = value.get(field)
        if not isinstance(item, str) or not item.strip() or len(item) > 200:
            raise ValueError('Identificador inválido: ' + field)
        result[field] = item
    timestamp = value.get('observed_at')
    if not isinstance(timestamp, str):
        raise ValueError('observed_at debe incluir zona horaria')
    date = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
    if date.tzinfo is None:
        raise ValueError('observed_at debe incluir zona horaria')
    result['observed_at'] = date.astimezone(timezone.utc).isoformat()
    if value.get('kind') not in ('weather', 'smoke'):
        raise ValueError('kind debe ser weather o smoke')
    result['kind'] = value['kind']
    measurements, units = value.get('values'), value.get('units')
    if not isinstance(measurements, dict) or not measurements or not isinstance(units, dict):
        raise ValueError('Se requieren values y units')
    for name, number in measurements.items():
        if name not in UNITS or units.get(name) != UNITS[name]:
            raise ValueError('Variable o unidad incompatible: ' + name)
        if type(number) not in (float, int) or not isfinite(number):
            raise ValueError('Medición no finita: ' + name)
        if name == 'humidity_pct' and not 0 <= number <= 100:
            raise ValueError('Humedad fuera de rango')
        if name != 'temperature_c' and number < 0:
            raise ValueError('Medición negativa: ' + name)
    result['values'] = dict(measurements)
    result['units'] = {name: units[name] for name in measurements}
    result['provenance'] = 'api'
    return result


def model_input(reading):
    if reading['kind'] != 'smoke':
        raise ValueError('El modelo de humo no acepta meteorología como sustituto')
    missing = set(SMOKE_FEATURES) - reading['values'].keys()
    if missing:
        raise ValueError('Faltan variables del modelo: ' + ', '.join(sorted(missing)))
    return [reading['values'][name] for name in SMOKE_FEATURES]


def validate_prediction(result):
    if not isinstance(result, dict) or type(result.get('alarm')) is not bool:
        raise ValueError('Predicción binaria inválida')
    score = result.get('score')
    if type(score) not in (int, float) or not isfinite(score) or not 0 <= score <= 1:
        raise ValueError('Puntaje inválido')
    if not isinstance(result.get('model_version'), str) or not result['model_version'].strip():
        raise ValueError('Falta versión del modelo')
    # RP-01 y RP-03 no se deducen de un clasificador binario.
    return {**{key: result[key] for key in ('alarm', 'score', 'model_version')},
            'risk_level': None, 'anomaly': None, 'operational': False}
