import json
import tempfile
import os
import subprocess
import sys
import unittest
from pathlib import Path
from threading import Thread
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from acquisition.domain.measurement import validate_measurement, model_input, SMOKE_FEATURES, UNITS
from acquisition.application.service import AcquisitionService
from acquisition.adapters.sqlite import SQLiteRepository
from acquisition.adapters.http import HttpSource, validate_url
from acquisition.adapters.environment_file import read_environment


def measurement(external_id='1'):
    return {'source': 'fixture', 'external_id': external_id, 'node_id': 'api-station-1',
            'observed_at': '2026-10-23T10:00:00-05:00', 'kind': 'weather',
            'values': {'temperature_c': 26.0, 'humidity_pct': 70},
            'units': {'temperature_c': 'degC', 'humidity_pct': '%'}}


class Source:
    def __init__(self, rows): self.rows = rows
    def fetch(self): return self.rows


class AcquisitionTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.path = str(Path(self.directory.name) / 'offline.db')
        self.repo = SQLiteRepository(self.path)

    def tearDown(self):
        self.repo.close()
        self.directory.cleanup()

    def service(self, rows, model=None): return AcquisitionService(Source(rows), self.repo, model)

    def test_offline_reopen_deduplication_and_timestamp(self):
        service = self.service([measurement()])
        self.assertEqual(service.ingest(), {'inserted': 1, 'duplicates': 0})
        self.assertEqual(service.ingest(), {'inserted': 0, 'duplicates': 1})
        self.repo.close()
        self.repo = SQLiteRepository(self.path)
        row = self.repo.history()[0]
        self.assertEqual(row['reading']['observed_at'], '2026-10-23T15:00:00+00:00')
        self.assertIsNone(row['prediction'])
        self.assertEqual(len(self.repo.pending()), 1)

    def test_invalid_batch_is_atomic(self):
        invalid = measurement('2'); invalid['values']['humidity_pct'] = 101
        with self.assertRaises(ValueError): self.service([measurement(), invalid]).ingest()
        self.assertEqual(self.repo.history(), [])

    def test_conflicting_duplicate_rolls_back_whole_batch(self):
        self.service([measurement()]).ingest()
        conflicting = measurement(); conflicting['values']['temperature_c'] = 28
        with self.assertRaises(ValueError): self.service([measurement('2'), conflicting]).ingest()
        self.assertEqual(len(self.repo.history()), 1)

    def test_bad_units_nonfinite_and_naive_date(self):
        for field, value in [('units', {'temperature_c': 'F', 'humidity_pct': '%'}),
                             ('values', {'temperature_c': float('nan')}), ('observed_at', '2026-10-23T10:00:00')]:
            row = measurement(); row[field] = value
            with self.assertRaises(ValueError): validate_measurement(row)

    def test_weather_never_sent_to_smoke_model(self):
        class Model:
            def predict(self, features): raise AssertionError('Meteorología enviada al modelo')
        self.service([measurement()], Model()).ingest()
        with self.assertRaises(ValueError): model_input(validate_measurement(measurement()))

    def test_prediction_requires_features_and_is_not_three_class(self):
        class Model:
            def predict(self, features):
                return {'alarm': True, 'score': 0.8, 'model_version': 'test-only'}
        row = measurement(); row['kind'] = 'smoke'
        with self.assertRaises(ValueError): self.service([row], Model()).ingest()
        row['values'] = {name: 1 for name in SMOKE_FEATURES}
        row['units'] = {name: UNITS[name] for name in SMOKE_FEATURES}
        self.service([row], Model()).ingest()
        prediction = self.repo.history()[0]['prediction']
        self.assertIsNone(prediction['risk_level']); self.assertIsNone(prediction['anomaly'])
        self.assertFalse(prediction['operational'])
        self.assertEqual(self.repo.pending()[0]['type'], 'experimental_alarm')

    def test_retry_after_failure_and_acknowledgement(self):
        self.service([measurement()]).ingest()
        class Broken:
            def send(self, event): return 'wrong-id'
        class Working:
            def send(self, event): return event['event_id']
        service = self.service([])
        self.assertEqual(service.synchronize(Broken()), {'sent': 0, 'pending': 1})
        self.assertEqual(service.synchronize(Working()), {'sent': 1, 'pending': 0})
        self.assertEqual(service.synchronize(Working()), {'sent': 0, 'pending': 0})

    def test_real_http_local_api_to_sqlite(self):
        class Handler(BaseHTTPRequestHandler):
            def do_GET(self):
                self.send_response(200); self.send_header('Content-Type', 'application/json'); self.end_headers()
                self.wfile.write(json.dumps([measurement()]).encode())
            def log_message(self, *args): pass
        server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        thread = Thread(target=server.serve_forever, daemon=True); thread.start()
        try:
            app = AcquisitionService(HttpSource(f'http://127.0.0.1:{server.server_port}'), self.repo)
            self.assertEqual(app.ingest()['inserted'], 1)
            env = dict(os.environ, SATIPO_SOURCE_API_URL=f'http://127.0.0.1:{server.server_port}')
            command = [sys.executable, '-m', 'acquisition']
            ingest = subprocess.run(command + ['ingest', '--db', self.path], env=env, capture_output=True, text=True, check=True)
            self.assertEqual(json.loads(ingest.stdout)['duplicates'], 1)
            output = str(Path(self.directory.name) / 'export.json')
            subprocess.run(command + ['export', '--db', self.path, '--output', output], capture_output=True, check=True)
            self.assertEqual(len(json.loads(Path(output).read_text(encoding='utf-8'))['rows']), 1)
            result = subprocess.run(command + ['export', '--db', self.path, '--output', output], capture_output=True)
            self.assertNotEqual(result.returncode, 0)
        finally:
            server.shutdown(); server.server_close(); thread.join()

    def test_transport_rejects_insecure_and_embedded_secrets(self):
        for url in ['http://example.com', 'https://user:secret@example.com', 'file:///etc/passwd']:
            with self.assertRaises(ValueError): validate_url(url)

    def test_environment_weather_and_satellite_history_are_separate(self):
        data={'version':1,'retrieved_at':'2026-10-23T16:00:00Z','weather':{'status':'ok','rows':[{
            'source':'Open-Meteo','kind':'weather_model','location':{'id':'120601'},'observed_at':'2026-10-23T15:45Z',
            'values':{'temperature_c':25,'rain_mm':None},'units':{'temperature_c':'degC','rain_mm':'mm'}}]},
            'fires':{'status':'partial','rows':[{'id':'satellite-1','source':'VIIRS_NOAA20_NRT','confirmed_fire':False,
                'observed_at':'2026-10-23T09:45:00Z','latitude':-11.2,'longitude':-74.5,'frp_mw':3.2,'confidence':'n'}]}}
        path=Path(self.directory.name)/'snapshot.json';path.write_text(json.dumps(data),encoding='utf-8')
        snapshot,records=read_environment(path)
        self.repo.save_environment(snapshot,records)
        result=self.repo.save_environment(snapshot,records)
        self.assertEqual(result['duplicates'],1)
        self.assertEqual(len(self.repo.history()),1)
        self.assertEqual(len(self.repo.fire_history()),1)
        self.assertIsNone(self.repo.history()[0]['prediction'])
        self.assertNotIn('rain_mm',self.repo.history()[0]['reading']['values'])
        data['fires']['rows'][0]['confirmed_fire']=True
        path.write_text(json.dumps(data),encoding='utf-8')
        with self.assertRaises(ValueError):read_environment(path)


if __name__ == '__main__': unittest.main()
