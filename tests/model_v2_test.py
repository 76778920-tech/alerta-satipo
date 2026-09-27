import json,sys,unittest
from pathlib import Path
import pandas as pd
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'colab'))
from model_selection import run_experiment,select_model,FEATURES
class ModelSelectionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows=json.loads((ROOT/'data/smoke_detection_300.json').read_text())
        cls.model,cls.report,cls.predictions=run_experiment(cls.rows)
    def test_selection_never_depends_on_final_labels(self):
        altered=sorted(self.rows,key=lambda r:(r['utc_seconds'],r['source_row']))
        altered=[dict(r) for r in altered]
        for row in altered[240:]:row['fire_alarm']=not row['fire_alarm']
        _,other,_=run_experiment(altered)
        self.assertEqual(self.report['selected'],other['selected'])
        self.assertEqual(self.report['validation'],other['validation'])
    def test_temporal_folds_and_gap(self):
        for lo,end,start,stop in self.report['validation']['folds']:
            self.assertEqual(lo,0);self.assertEqual(start-end,5)
            self.assertLess(end,start);self.assertLessEqual(stop,240)
        self.assertNotIn('source_row',FEATURES);self.assertNotIn('utc_seconds',FEATURES)
    def test_rejects_partial_duplicate_and_invalid_values(self):
        for rows in [self.rows[:299],self.rows[:299]+[self.rows[0]], [{**r,'temperature_c':float('nan')} for r in self.rows]]:
            with self.assertRaises(ValueError):run_experiment(rows)
        with self.assertRaises(ValueError):select_model(pd.DataFrame(self.rows))
    def test_no_automatic_promotion(self):
        self.assertEqual(self.report['promotion'],'NOT_APPROVED_REQUIRES_NEW_INDEPENDENT_DATA')
        self.assertEqual(len(self.predictions),60)
        self.assertEqual(self.report['published_baseline_regression']['confusion_matrix'],[[26,1],[5,28]])
        self.assertTrue(self.predictions.model_score_alarm_uncalibrated.between(0,1).all())
if __name__=='__main__':unittest.main()
