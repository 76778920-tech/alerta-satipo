"""Muestra proporcional reproducible; no convierte unidades ni inventa sensores."""
import csv
import hashlib
import io
import json
import random
import urllib.request
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

URL = 'https://raw.githubusercontent.com/HamzaMa96/Smoke-Detection-IOT/main/smoke_detection_iot.csv'
ROOT = Path(__file__).resolve().parents[1]
FIELDS = {'': 'source_row', 'UTC': 'utc_seconds', 'Temperature[C]': 'temperature_c',
          'Humidity[%]': 'humidity_pct', 'TVOC[ppb]': 'tvoc_ppb', 'eCO2[ppm]': 'eco2_ppm',
          'Raw H2': 'raw_h2', 'Raw Ethanol': 'raw_ethanol', 'Pressure[hPa]': 'pressure_hpa',
          'PM1.0': 'pm1_0', 'PM2.5': 'pm2_5', 'NC0.5': 'nc0_5', 'NC1.0': 'nc1_0',
          'NC2.5': 'nc2_5', 'CNT': 'cnt', 'Fire Alarm': 'fire_alarm'}
INTEGERS = {'source_row', 'utc_seconds', 'tvoc_ppb', 'eco2_ppm', 'raw_h2', 'raw_ethanol', 'cnt'}

def prepare():
    raw = urllib.request.urlopen(URL, timeout=60).read()
    rows = list(csv.DictReader(io.StringIO(raw.decode('utf-8-sig'))))
    assert set(rows[0]) == set(FIELDS), 'El esquema del CSV ha cambiado'
    groups = {label: [r for r in rows if r['Fire Alarm'] == label] for label in ['0', '1']}
    rng = random.Random(20260923)
    n0 = round(300 * len(groups['0']) / len(rows))
    selected = rng.sample(groups['0'], n0) + rng.sample(groups['1'], 300 - n0)
    selected.sort(key=lambda r: int(r['']))
    result = []
    for row in selected:
        item = {target: (int(row[source]) if target in INTEGERS else bool(int(row[source])) if target == 'fire_alarm' else float(row[source])) for source, target in FIELDS.items()}
        item['recorded_at'] = datetime.fromtimestamp(item['utc_seconds'], timezone.utc).isoformat()
        item['dataset_id'] = 'smoke-detection-iot-300-v1'
        result.append(item)
    assert len(result) == len({r['source_row'] for r in result}) == 300
    out = ROOT / 'data'
    out.mkdir(exist_ok=True)
    (out / 'smoke_detection_300.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
    with (out / 'smoke_detection_300.csv').open('w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=list(result[0]))
        writer.writeheader()
        writer.writerows(result)
    metadata = {'source_url': URL, 'source_sha256': hashlib.sha256(raw).hexdigest(),
                'source_rows': len(rows), 'sample_rows': 300, 'seed': 20260923,
                'method': 'Muestreo aleatorio estratificado proporcional por Fire Alarm, ordenado por indice original',
                'labels': dict(Counter(str(int(r['fire_alarm'])) for r in result)),
                'notice': 'Datos historicos externos. Fire Alarm es etiqueta del dataset, no probabilidad ni prediccion del aplicativo. Sin ubicacion, viento, bateria o porcentaje de humo.'}
    (out / 'metadata.json').write_text(json.dumps(metadata, indent=2) + '\n', encoding='utf-8')
    columns = list(result[0])
    def literal(value):
        if isinstance(value, bool): return str(value).lower()
        if isinstance(value, (int, float)): return str(value)
        return "'" + value.replace("'", "''") + "'"
    sql = '-- Generado por scripts/prepare_dataset.py. Exactamente 300 registros.\n'
    sql += 'begin;\ninsert into public.smoke_readings (' + ','.join(columns) + ') values\n'
    sql += ',\n'.join('(' + ','.join(literal(r[c]) for c in columns) + ')' for r in result)
    sql += '\non conflict (dataset_id, source_row) do nothing;\ncommit;\n'
    (ROOT / 'supabase' / 'seed.sql').write_text(sql, encoding='utf-8')
    print(json.dumps(metadata, indent=2))

if __name__ == '__main__': prepare()
