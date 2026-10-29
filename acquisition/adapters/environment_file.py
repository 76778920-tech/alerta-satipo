"""Importa capturas del adaptador compartido Node/Edge sin confundir focos y mediciones."""
import hashlib
import json
from pathlib import Path
from datetime import datetime
from math import isfinite
from acquisition.domain.measurement import validate_measurement


def read_environment(path):
    file = Path(path)
    if file.stat().st_size > 10_000_000:
        raise ValueError('Captura demasiado grande')
    data = json.loads(file.read_text(encoding='utf-8'))
    if data.get('version') != 1:
        raise ValueError('Versión de captura inválida')
    stamp = datetime.fromisoformat(data['retrieved_at'].replace('Z', '+00:00'))
    if stamp.tzinfo is None:
        raise ValueError('Fecha sin zona horaria')
    for name in ('weather', 'fires'):
        if data[name]['status'] not in ('ok', 'partial', 'unavailable', 'not_configured') or not isinstance(data[name]['rows'], list):
            raise ValueError('Estado de fuente inválido')
    readings = []
    for row in data['weather']['rows']:
        if row.get('source') != 'Open-Meteo' or row.get('kind') != 'weather_model':
            raise ValueError('Fuente meteorológica inválida')
        values = {k: v for k, v in row['values'].items() if v is not None}
        if not values:
            continue
        # Modelo puede revisar una estimación: conservar versiones por contenido.
        fingerprint = hashlib.sha256(json.dumps(row, sort_keys=True, allow_nan=False).encode()).hexdigest()[:16]
        readings.append({'reading': validate_measurement({
            'source': 'Open-Meteo', 'node_id': row['location']['id'],
            'external_id': row['location']['id'] + ':' + row['observed_at'] + ':' + fingerprint,
            'observed_at': row['observed_at'], 'kind': 'weather', 'values': values, 'units': row['units']}),
            'prediction': None})
    for row in data['fires']['rows']:
        if row.get('source') not in ('VIIRS_NOAA20_NRT', 'VIIRS_NOAA21_NRT') or row.get('confirmed_fire') is not False:
            raise ValueError('Fuente satelital inválida')
        for key, low, high in [('latitude', -90, 90), ('longitude', -180, 180), ('frp_mw', 0, float('inf'))]:
            v = row.get(key)
            if type(v) not in (int, float) or not isfinite(v) or not low <= v <= high:
                raise ValueError('Valor satelital inválido')
        if row.get('confidence') not in ('l', 'n', 'h'):
            raise ValueError('Confianza inválida')
        date = datetime.fromisoformat(row['observed_at'].replace('Z', '+00:00'))
        if date.tzinfo is None or not isinstance(row.get('id'), str) or not row['id']:
            raise ValueError('Identidad satelital inválida')
    return data, readings
