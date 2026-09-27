import csv,json,sys,tempfile,unittest
from pathlib import Path
import pandas as pd
from shapely.geometry import Polygon,mapping
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'territorial'))
from pipeline import weather_frame,import_firms,validate_boundaries
from labels import attach_labels
class TerritorialTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root=ROOT/'data/territorial/2025'
        cls.weather=json.loads((cls.root/'120601_weather.json').read_text(encoding='utf-8'))
        cls.frame=weather_frame(cls.weather,'2025-01-01','2025-12-31','120601')
    def test_real_coverage_and_no_invented_labels(self):
        features=validate_boundaries(json.loads((self.root/'districts.geojson').read_text(encoding='utf-8')))
        self.assertEqual(len(features),9)
        data=pd.read_csv(self.root/'district_day_research.csv')
        self.assertEqual(len(data),3285);self.assertFalse(data.duplicated(['ubigeo','issued_at_local']).any())
        self.assertTrue(data.confirmed_fire_next_24h.isna().all())
    def test_no_future_weather_in_rolling_features(self):
        self.assertEqual(self.frame.iloc[0].issued_at_local,'2025-01-02T00:00:00-05:00')
        self.assertTrue(self.frame.rain_previous_7_days_mm.iloc[:6].isna().all())
        self.assertAlmostEqual(self.frame.iloc[6].rain_previous_7_days_mm,sum(self.weather['daily']['precipitation_sum'][:7]))
    def test_partial_invalid_units_rejected(self):
        for mutation in ('time','units','missing'):
            weather=json.loads(json.dumps(self.weather))
            if mutation=='time':weather['daily']['time'].pop()
            if mutation=='units':weather['daily_units']['wind_speed_10m_max']='m/s'
            if mutation=='missing':weather['daily']['precipitation_sum'][0]=None
            with self.assertRaises(ValueError):weather_frame(weather,'2025-01-01','2025-12-31','120601')
    def test_firms_deduplicates_and_never_confirms_fires(self):
        features=[{'properties':{'UBIGEO':'120601'},'geometry':mapping(Polygon([(0,0),(2,0),(2,2),(0,2)]))}]
        with tempfile.TemporaryDirectory() as directory:
            path=Path(directory)/'fires.csv'
            path.write_text('latitude,longitude,acq_date,acq_time,satellite,instrument,confidence\n1,1,2025-01-01,1230,N,VIIRS,n\n1,1,2025-01-01,1230,N,VIIRS,n\n5,5,2025-01-01,1230,N,VIIRS,n\n')
            rows,report=import_firms(path,features)
            self.assertEqual(report,{'outside_or_ambiguous':1,'duplicates':1,'assigned':1})
            self.assertEqual(rows[0]['classification'],'unverified_thermal_anomaly')
    def test_evidence_required_and_missing_days_stay_unknown(self):
        row={'ubigeo':'120601','issued_at_local':self.frame.iloc[0].issued_at_local,'confirmed_fire_next_24h':'0','coverage_verified':'true','source_reference':'synthetic test evidence'}
        result=attach_labels(self.frame,pd.DataFrame([row]))
        self.assertEqual(result.confirmed_fire_next_24h.notna().sum(),1)
        for patch in ({'coverage_verified':'false'},{'source_reference':''},{'confirmed_fire_next_24h':'yes'},{'issued_at_local':'2025-01-02T00:00:00'}):
            with self.assertRaises(ValueError):attach_labels(self.frame,pd.DataFrame([{**row,**patch}]))
    def test_manifest_hashes(self):
        import hashlib
        manifest=json.loads((self.root/'manifest.json').read_text(encoding='utf-8'))
        self.assertFalse(manifest['training_allowed'])
        for filename,digest in manifest['sha256'].items():self.assertEqual(hashlib.sha256((self.root/filename).read_bytes()).hexdigest(),digest)
if __name__=='__main__':unittest.main()
