import csv
import io
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from dataset.domain.sampling import FIELDS, sample
from dataset.application.prepare import PrepareDataset
from dataset.adapters.files import DatasetFiles
from dataset.adapters.http_csv import HttpCsvSource


def fixture():
    return [{name: str(i if name=='' else 1660000000+i if name=='UTC' else
                       int(i>=200) if name=='Fire Alarm' else -12.5 if name=='Temperature[C]' else 42)
             for name in FIELDS} for i in range(600)]


class MemorySource:
    def __init__(self, rows): self.rows=rows
    def read(self): return self.rows,{'source_url':'memory://test','source_sha256':'fixture'}


class MemoryWriter:
    def __init__(self): self.calls=[]
    def write(self,rows,metadata): self.calls.append((rows,metadata))


class DatasetTests(unittest.TestCase):
    def test_stratification_reproducibility_original_units_and_no_mutation(self):
        rows=fixture()
        result=sample(rows)
        self.assertEqual(result,sample(rows))
        self.assertEqual(len(result),300)
        self.assertEqual(sum(r['fire_alarm'] for r in result),200)
        self.assertEqual([r['source_row'] for r in result],sorted(r['source_row'] for r in result))
        self.assertTrue(all(r['temperature_c']==-12.5 for r in result))
        self.assertTrue(all(r['recorded_at'].endswith('+00:00') for r in result))
        self.assertEqual(rows,fixture())

    def test_invalid_source_never_reaches_writer(self):
        for rows in [[],fixture()+[fixture()[0]], [{**r,'Fire Alarm':'2'} for r in fixture()],
                     [{**r,'Temperature[C]':'nan'} for r in fixture()]]:
            writer=MemoryWriter()
            with self.subTest(rows=len(rows)), self.assertRaises(ValueError):
                PrepareDataset(MemorySource(rows),writer).execute()
            self.assertEqual(writer.calls,[])

    def test_use_case_with_memory_ports_and_traceability(self):
        writer=MemoryWriter()
        metadata=PrepareDataset(MemorySource(fixture()),writer).execute()
        self.assertEqual(metadata['source_sha256'],'fixture')
        self.assertEqual(metadata['source_rows'],600)
        self.assertEqual(metadata['labels'],{'0':100,'1':200})
        self.assertEqual(writer.calls[0][1],metadata)

    def test_file_adapter_preserves_existing_300_rows(self):
        expected=json.loads((ROOT/'data/smoke_detection_300.json').read_text(encoding='utf-8'))
        raw=[{source:str(int(row[target])) if source=='Fire Alarm' else str(row[target])
              for source,target in FIELDS.items()} for row in expected]
        with tempfile.TemporaryDirectory() as directory:
            dest=Path(directory)
            PrepareDataset(MemorySource(raw),DatasetFiles(dest/'data',dest/'seed.sql')).execute()
            self.assertEqual(json.loads((dest/'data/smoke_detection_300.json').read_text()),expected)
            with (dest/'data/smoke_detection_300.csv').open(newline='') as handle:
                self.assertEqual(len(list(csv.DictReader(handle))),300)
            sql=(dest/'seed.sql').read_text()
            self.assertIn('on conflict (dataset_id, source_row) do nothing',sql)
            self.assertEqual(sql.count('smoke-detection-iot-300-v1'),300)

    def test_http_adapter_hashes_exact_bytes_without_network(self):
        buffer=io.StringIO()
        writer=csv.DictWriter(buffer,fieldnames=FIELDS)
        writer.writeheader();writer.writerows(fixture())
        raw=buffer.getvalue().encode('utf-8')
        with patch('dataset.adapters.http_csv.urlopen',return_value=io.BytesIO(raw)) as request:
            rows,metadata=HttpCsvSource('https://example.invalid/data.csv').read()
        import hashlib
        self.assertEqual(rows,fixture())
        self.assertEqual(metadata['source_sha256'],hashlib.sha256(raw).hexdigest())
        request.assert_called_once_with('https://example.invalid/data.csv',timeout=60)


if __name__=='__main__': unittest.main()
