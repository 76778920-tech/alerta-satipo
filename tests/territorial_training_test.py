"""Datos sintéticos solo para comprobar código; no prueban capacidad predictiva real."""
import sys,unittest
from pathlib import Path
import pandas as pd
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'territorial'))
from training import inspect,partitions,train_experiment,FEATURES
class TrainingTests(unittest.TestCase):
    def fixture(self):
        rows=[]
        for i,day in enumerate(pd.date_range('2024-01-01',periods=80,tz='America/Lima')):
            for code in ['120601','120602']:
                rows.append({'ubigeo':code,'issued_at_local':day.isoformat(),'confirmed_fire_next_24h':i%2,'event_coverage':'verified','source_reference':'SYNTHETIC TEST ONLY',**{key:float(i%10+1) for key in FEATURES}})
        return pd.DataFrame(rows)
    def test_current_dataset_is_blocked(self):
        data=pd.read_csv(ROOT/'data/territorial/2025/district_day_research.csv',dtype={'ubigeo':str})
        self.assertFalse(inspect(data)['eligible_for_experiment'])
        with self.assertRaises(ValueError):train_experiment(data)
    def test_split_all_districts_and_label_horizon(self):
        train,test,cutoff=partitions(self.fixture())
        self.assertTrue((train.issued+pd.Timedelta(hours=24)<cutoff).all())
        self.assertTrue((test.issued>=cutoff).all())
        self.assertTrue(set(train.issued).isdisjoint(test.issued))
    def test_invalid_labels_and_duplicates_rejected(self):
        for field,value in [('confirmed_fire_next_24h','invented'),('event_coverage','unknown'),('source_reference',''),('ubigeo','999999')]:
            data=self.fixture();data[field]=data[field].astype(object);data.loc[0,field]=value
            self.assertFalse(inspect(data)['eligible_for_experiment'])
        data=self.fixture();data=pd.concat([data,data.iloc[:1]])
        self.assertFalse(inspect(data)['eligible_for_experiment'])
    def test_too_few_dates_or_single_class_rejected(self):
        with self.assertRaises(ValueError):partitions(self.fixture().iloc[:20])
        data=self.fixture();data['confirmed_fire_next_24h']=1
        with self.assertRaises(ValueError):partitions(data)
    def test_end_to_end_synthetic_without_operational_approval(self):
        model,report,output=train_experiment(self.fixture())
        self.assertFalse(report['operational_approval'])
        self.assertEqual(len(output),report['test_rows'])
        self.assertEqual(set(report['per_district']),{'120601','120602'})
        self.assertTrue(output.uncalibrated_score.between(0,1).all())
        self.assertNotIn('ubigeo',report['features'])
if __name__=='__main__':unittest.main()
