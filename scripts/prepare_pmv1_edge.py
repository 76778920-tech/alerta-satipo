"""Exportación local para Edge Impulse. No crea proyectos ni realiza subidas."""
import argparse
import csv
import hashlib
import io
import json
import math
from pathlib import Path
import zipfile

FEATURES = ['temperature_c', 'humidity_pct', 'smoke_index', 'gas_index', 'dust_ugm3']
LABELS = ['Normal', 'Advertencia', 'Emergencia']
BOUNDS = [(-20, 80), (0, 100), (0, 100), (0, 100), (0, 1000)]


def prepare(source, output):
    source, output = Path(source), Path(output)
    entries, samples, fingerprints = {}, [], set()
    counts = {}
    for split, category in [('train', 'training'), ('test', 'testing')]:
        counts[category] = {label: 0 for label in LABELS}
        with (source / f'{split}.csv').open(encoding='utf-8', newline='') as stream:
            reader = csv.DictReader(stream)
            if reader.fieldnames != FEATURES + ['label']:
                raise ValueError(f'{split}: columnas u orden incompatibles')
            for index, row in enumerate(reader):
                if None in row or any(value is None for value in row.values()):
                    raise ValueError(f'{split}:{index}: fila incompleta')
                values = [float(row[key]) for key in FEATURES]
                if any(not math.isfinite(v) or not lo <= v <= hi for v, (lo, hi) in zip(values, BOUNDS)):
                    raise ValueError(f'{split}:{index}: valores fuera de rango')
                label_number = float(row['label'])
                if label_number not in (0, 1, 2):
                    raise ValueError(f'{split}:{index}: etiqueta inválida')
                fingerprint = tuple(values)
                if fingerprint in fingerprints:
                    raise ValueError('Muestra duplicada: posible contaminación entre entrenamiento y prueba')
                fingerprints.add(fingerprint)
                label = LABELS[int(label_number)]
                filename = f'{category}/{label}.{split}-{index:05d}.csv'
                text = io.StringIO(newline='')
                writer = csv.writer(text, lineterminator='\n')
                writer.writerow(FEATURES)
                writer.writerow(values)
                content = text.getvalue().encode('utf-8')
                entries[filename] = content
                samples.append({'path': filename, 'category': category,
                                'label': {'type': 'label', 'label': label},
                                'metadata': {'provenance': 'SYNTHETIC_ONLY', 'source_row': index,
                                             'source_split': split},
                                })
                counts[category][label] += 1
        if any(count == 0 for count in counts[category].values()):
            raise ValueError(f'{split}: falta al menos una de las tres clases')
    manifest = {'version': 1, 'provenance': 'SYNTHETIC_ONLY', 'features': FEATURES,
                'units': ['Cel', '%', 'index_0_100', 'index_0_100', 'ug/m3'],
                'counts': counts, 'edge_impulse_uploaded': False,
                'source_sha256': {f'{split}.csv': hashlib.sha256((source / f'{split}.csv').read_bytes()).hexdigest()
                                  for split in ['train', 'test']},
                'files_sha256': {name: hashlib.sha256(data).hexdigest() for name, data in entries.items()}}
    entries['info.labels'] = json.dumps({'version': 1, 'files': samples}, ensure_ascii=False, indent=2).encode()
    entries['manifest.json'] = json.dumps(manifest, ensure_ascii=False, indent=2).encode()
    entries['README.txt'] = (
        'PMV1 / SYNTHETIC_ONLY / NO FIELD VALIDATION\n'
        'Each CSV contains exactly one independent five-axis sample. No timestamp or target column.\n'
        'Extract into a new folder, then run there: edge-impulse-uploader --info-file info.labels\n'
        'Uploader requires your Edge Impulse project/account. No cloud upload was performed by this exporter.\n'
        'Keep training and testing categories separate. Never fit or tune on testing samples.\n'
        'Configure static five-input classification, labels Normal/Advertencia/Emergencia.\n'
        'Verify DSP frame size, units, order, labels and outputs before deploying firmware.\n'
        'smoke_index and gas_index are relative signals, not ppm. dust_ugm3 is PM2.5.\n'
    ).encode()
    output.parent.mkdir(parents=True, exist_ok=True)
    # Exclusive creation: preserve any previous artifact.
    with output.open('xb') as stream, zipfile.ZipFile(stream, 'w', zipfile.ZIP_DEFLATED) as archive:
        for name, data in entries.items():
            entry = zipfile.ZipInfo(name, (2026, 10, 26, 0, 0, 0))
            entry.compress_type = zipfile.ZIP_DEFLATED
            archive.writestr(entry, data)
    return counts


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', default='colab/pmv1')
    parser.add_argument('--output', default='var/pmv1-edge-impulse.zip')
    args = parser.parse_args()
    print(json.dumps(prepare(args.source, args.output), ensure_ascii=False))
