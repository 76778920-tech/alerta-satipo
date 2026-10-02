import csv
import json
from pathlib import Path


def sql_literal(value):
    if isinstance(value, bool):
        return str(value).lower()
    if isinstance(value, (int, float)):
        return str(value)
    return "'" + value.replace("'", "''") + "'"


class DatasetFiles:
    def __init__(self, directory, seed_file):
        self.directory = Path(directory)
        self.seed_file = Path(seed_file)

    def write(self, rows, metadata):
        self.directory.mkdir(parents=True, exist_ok=True)
        (self.directory / 'smoke_detection_300.json').write_text(json.dumps(rows, indent=2) + '\n', encoding='utf-8')
        with (self.directory / 'smoke_detection_300.csv').open('w', newline='', encoding='utf-8') as handle:
            writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
            writer.writeheader()
            writer.writerows(rows)
        (self.directory / 'metadata.json').write_text(json.dumps(metadata, indent=2) + '\n', encoding='utf-8')
        columns = list(rows[0])
        sql = f'-- Generado por scripts/prepare_dataset.py. Exactamente {len(rows)} registros.\n'
        sql += 'begin;\ninsert into public.smoke_readings (' + ','.join(columns) + ') values\n'
        sql += ',\n'.join('(' + ','.join(sql_literal(row[c]) for c in columns) + ')' for row in rows)
        sql += '\non conflict (dataset_id, source_row) do nothing;\ncommit;\n'
        self.seed_file.parent.mkdir(parents=True, exist_ok=True)
        self.seed_file.write_text(sql, encoding='utf-8')
