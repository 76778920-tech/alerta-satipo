import csv
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
import pandas as pd
from territorial.application.ports import ResearchFiles, ResearchInput, Clock


class LocalResearchInput(ResearchInput):
    def read_frame(self, path, **options):
        return pd.read_csv(path, **options)

    def read_firms(self, path):
        with Path(path).open(encoding='utf-8-sig',newline='') as handle:
            reader=csv.DictReader(handle)
            required={'latitude','longitude','acq_date','acq_time','satellite','instrument','confidence'}
            if not required.issubset(reader.fieldnames or []): raise ValueError('CSV FIRMS incompleto')
            return list(reader)

    def digest(self, path):
        return hashlib.sha256(Path(path).read_bytes()).hexdigest()


class LocalResearchFiles(ResearchFiles):
    def __init__(self, directory):
        self.directory=Path(directory)
        self.directory.mkdir(parents=True,exist_ok=True)

    def write_json(self, name, value):
        (self.directory/name).write_text(json.dumps(value,ensure_ascii=False,indent=2),encoding='utf-8')

    def write_frame(self, name, frame):
        frame.to_csv(self.directory/name,index=False)

    def hashes(self, names):
        return {name:hashlib.sha256((self.directory/name).read_bytes()).hexdigest() for name in names}


class UtcClock(Clock):
    def now(self):
        return datetime.now(timezone.utc).isoformat()
