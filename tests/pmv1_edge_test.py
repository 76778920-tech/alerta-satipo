import csv
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
import zipfile

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('pmv1_edge', ROOT / 'scripts/prepare_pmv1_edge.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class EdgePackageTests(unittest.TestCase):
    def test_real_dataset_integrity_and_split(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / 'dataset.zip'
            counts = module.prepare(ROOT / 'colab/pmv1', output)
            self.assertEqual(sum(counts['training'].values()), 3000)
            self.assertEqual(sum(counts['testing'].values()), 900)
            with zipfile.ZipFile(output) as archive:
                info = json.loads(archive.read('info.labels'))
                manifest = json.loads(archive.read('manifest.json'))
                self.assertEqual(len(info['files']), 3900)
                self.assertFalse(manifest['edge_impulse_uploaded'])
                for entry in info['files']:
                    content = archive.read(entry['path'])
                    rows = list(csv.reader(io.StringIO(content.decode())))
                    self.assertEqual(rows[0], module.FEATURES)
                    self.assertEqual(len(rows), 2)
                    self.assertEqual(len(rows[1]), 5)
                    self.assertTrue(entry['path'].startswith(entry['category'] + '/'))
                    self.assertEqual(hashlib.sha256(content).hexdigest(), manifest['files_sha256'][entry['path']])
            digest = output.read_bytes()
            with self.assertRaises(FileExistsError):
                module.prepare(ROOT / 'colab/pmv1', output)
            self.assertEqual(digest, output.read_bytes())

    def test_reject_invalid_or_leaking_data_before_writing(self):
        for invalid in ['nan,50,10,10,10,0', '25,50,10,10,10,9', '25,50,10,10,10,0']:
            with self.subTest(invalid=invalid), tempfile.TemporaryDirectory() as directory:
                source = Path(directory)
                header = ','.join(module.FEATURES + ['label']) + '\n'
                valid = '25,50,10,10,10,0\n35,40,40,40,90,1\n55,20,80,80,250,2\n'
                (source / 'train.csv').write_text(header + valid)
                (source / 'test.csv').write_text(header + invalid + '\n')
                with self.assertRaises(ValueError):
                    module.prepare(source, source / 'out.zip')
                self.assertFalse((source / 'out.zip').exists())


if __name__ == '__main__':
    unittest.main()
