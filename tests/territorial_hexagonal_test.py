import json
import sys
import unittest
from pathlib import Path
import pandas as pd

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from territorial.application.prepare import PrepareTerritory
from territorial.application.training import TrainTerritory


class MemoryFiles:
    def __init__(self): self.values={}
    def write_json(self,name,value): self.values[name]=value
    def write_frame(self,name,frame): self.values[name]=frame.copy()
    def hashes(self,names): return {name:'test-digest' for name in names}


class FixtureGeography:
    def __init__(self): self.calls=0
    def boundaries(self):
        return json.loads((ROOT/'data/territorial/2025/districts.geojson').read_text(encoding='utf-8'))
    def weather(self,latitude,longitude,start,end):
        self.calls+=1
        data=json.loads((ROOT/f'data/territorial/2025/12060{self.calls}_weather.json').read_text(encoding='utf-8'))
        return data,{'latitude':latitude,'longitude':longitude}
    def provenance(self): return ['fixture://boundaries','fixture://weather']


class FixedClock:
    def now(self): return '2026-10-02T05:00:00+00:00'


class TerritorialPortsTests(unittest.TestCase):
    def test_prepare_runs_with_injected_sources_and_memory_writer(self):
        source=FixtureGeography();files=MemoryFiles()
        manifest=PrepareTerritory(source,files,None,FixedClock()).execute('2025-01-01','2025-12-31')
        self.assertEqual(source.calls,9)
        self.assertEqual(manifest['rows'],3285)
        self.assertEqual(manifest['retrieved_at'],FixedClock().now())
        self.assertFalse(manifest['training_allowed'])
        self.assertEqual(len(manifest['sha256']),11)
        self.assertTrue(files.values['district_day_research.csv'].confirmed_fire_next_24h.isna().all())
        self.assertEqual(files.values['status.json']['state'],'research_data_ready_not_trainable')

    def test_failed_source_leaves_run_incomplete(self):
        source=FixtureGeography();files=MemoryFiles()
        def fail(*args): raise ConnectionError('fixture failure')
        source.weather=fail
        with self.assertRaises(ConnectionError):
            PrepareTerritory(source,files,None,FixedClock()).execute('2025-01-01','2025-12-31')
        self.assertEqual(files.values['status.json'],{'state':'incomplete','training_allowed':False})
        self.assertNotIn('manifest.json',files.values)

    def test_training_writes_readiness_but_does_not_train_without_evidence(self):
        class Inputs:
            def read_frame(self,path,**options):
                return pd.read_csv(ROOT/'data/territorial/2025/district_day_research.csv',**options)
            def digest(self,path): return 'fixture-sha'
        class Learner:
            def fit_predict(self,*args): raise AssertionError('No se debe entrenar sin evidencia')
        files=MemoryFiles()
        app=TrainTerritory(Inputs(),files,Learner())
        with self.assertRaises(ValueError): app.execute('fixture',experiment=True)
        self.assertFalse(files.values['readiness.json']['eligible_for_experiment'])
        self.assertEqual(files.values['readiness.json']['input_sha256'],'fixture-sha')
        self.assertEqual(files.values['status.json']['state'],'incomplete')
        self.assertNotIn('evaluation.json',files.values)


if __name__=='__main__': unittest.main()
