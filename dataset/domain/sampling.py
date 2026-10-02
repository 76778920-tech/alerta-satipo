import random
import math
from collections import Counter
from datetime import datetime, timezone

FIELDS = {'': 'source_row', 'UTC': 'utc_seconds', 'Temperature[C]': 'temperature_c',
          'Humidity[%]': 'humidity_pct', 'TVOC[ppb]': 'tvoc_ppb', 'eCO2[ppm]': 'eco2_ppm',
          'Raw H2': 'raw_h2', 'Raw Ethanol': 'raw_ethanol', 'Pressure[hPa]': 'pressure_hpa',
          'PM1.0': 'pm1_0', 'PM2.5': 'pm2_5', 'NC0.5': 'nc0_5', 'NC1.0': 'nc1_0',
          'NC2.5': 'nc2_5', 'CNT': 'cnt', 'Fire Alarm': 'fire_alarm'}
INTEGERS = {'source_row', 'utc_seconds', 'tvoc_ppb', 'eco2_ppm', 'raw_h2', 'raw_ethanol', 'cnt'}

def sample(rows, size=300, seed=20260923):
    if not rows or any(set(row) != set(FIELDS) for row in rows):
        raise ValueError('El esquema del CSV ha cambiado o está vacío')
    if size < 1 or size > len(rows):
        raise ValueError('Tamaño de muestra inválido')
    if any(row['Fire Alarm'] not in ('0', '1') for row in rows):
        raise ValueError('Etiqueta Fire Alarm inválida')
    if len({int(row['']) for row in rows}) != len(rows):
        raise ValueError('Índices originales duplicados')
    groups = {label: [r for r in rows if r['Fire Alarm'] == label] for label in ['0', '1']}
    rng = random.Random(seed)
    n0 = round(size * len(groups['0']) / len(rows))
    selected = rng.sample(groups['0'], n0) + rng.sample(groups['1'], size - n0)
    selected.sort(key=lambda r: int(r['']))
    result = []
    for row in selected:
        item = {target: (int(row[source]) if target in INTEGERS else bool(int(row[source])) if target == 'fire_alarm' else float(row[source])) for source, target in FIELDS.items()}
        if any(isinstance(value, float) and not math.isfinite(value) for value in item.values()):
            raise ValueError('Medición no finita')
        item['recorded_at'] = datetime.fromtimestamp(item['utc_seconds'], timezone.utc).isoformat()
        item['dataset_id'] = 'smoke-detection-iot-300-v1'
        result.append(item)
    if len(result) != len({r['source_row'] for r in result}):
        raise ValueError('Índices originales duplicados')
    return result


def describe(rows, result, seed):
    metadata = {'source_rows': len(rows), 'sample_rows': len(result), 'seed': seed,
                'method': 'Muestreo aleatorio estratificado proporcional por Fire Alarm, ordenado por indice original',
                'labels': dict(Counter(str(int(r['fire_alarm'])) for r in result)),
                'notice': 'Datos historicos externos. Fire Alarm es etiqueta del dataset, no probabilidad ni prediccion del aplicativo. Sin ubicacion, viento, bateria o porcentaje de humo.'}
    return metadata
