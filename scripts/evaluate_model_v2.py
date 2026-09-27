"""Experimento reproducible sin alterar datos, hosting ni modelo publicado."""
import json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'colab'))
from model_selection import run_experiment
from supabase_dataset import canonical_payload
rows=json.loads((ROOT/'data/smoke_detection_300.json').read_text(encoding='utf-8'))
canonical_payload(rows)
model,report,predictions=run_experiment(rows)
output=ROOT/'colab/resultados_v2';output.mkdir(exist_ok=True)
(output/'evaluacion.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
predictions.to_csv(output/'predicciones_regresion.csv',index=False)
print(json.dumps({key:report[key] for key in ['selected','published_baseline_regression','candidate_regression','promotion']},indent=2))
