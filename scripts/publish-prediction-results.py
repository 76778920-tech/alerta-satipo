"""Publish verified notebook outputs, never train or tune against the test set."""
import csv
import hashlib
import json
import shutil
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'colab'))
from supabase_dataset import canonical_payload

source=Path(sys.argv[1]) if len(sys.argv)>1 else ROOT/'test-results/colab-audit/salida_satipo'
evaluation=json.loads((source/'evaluacion.json').read_text(encoding='utf-8'))
dataset=json.loads((ROOT/'data/smoke_detection_1011.json').read_text(encoding='utf-8'))
assert evaluation['dataset_sha256']==hashlib.sha256(canonical_payload(dataset).encode()).hexdigest()
assert (evaluation['train_rows'],evaluation['test_rows'])==(808,203)
expected=sorted(dataset,key=lambda r:(r['utc_seconds'],r['source_row']))[808:]
with (source/'predicciones_prueba_203.csv').open(encoding='utf-8',newline='') as f:
    results=list(csv.DictReader(f))
assert len(results)==203
rows=[];matrix=[[0,0],[0,0]]
for reference,result in zip(expected,results):
    assert int(result['source_row'])==reference['source_row']
    assert result['recorded_at']==reference['recorded_at']
    assert result['dataset_id']==reference['dataset_id']
    assert result['fire_alarm'] in ('True','False') and result['predicted_fire_alarm'] in ('True','False')
    actual=result['fire_alarm']=='True';predicted=result['predicted_fire_alarm']=='True'
    score=float(result['model_score_alarm_uncalibrated'])
    assert actual==reference['fire_alarm'] and 0<=score<=1
    matrix[int(actual)][int(predicted)]+=1
    rows.append(dict(source_row=reference['source_row'],recorded_at=reference['recorded_at'],actual=actual,predicted=predicted,score=score))
assert matrix==evaluation['confusion_matrix']
assert abs((matrix[0][0]+matrix[1][1])/203-evaluation['random_forest']['accuracy'])<1e-12
artifact=dict(version='rf-20261109-1011-eval-v2',dataset_id='smoke-detection-iot-1011-v1',evaluation=evaluation,rows=rows)
(ROOT/'backend/adapters/out/prediction-results.json').write_text(json.dumps(artifact,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
output=ROOT/'colab/resultados_locales';output.mkdir(exist_ok=True)
for name in ['evaluacion.json','predicciones_prueba_203.csv','matriz_confusion.png']:
    shutil.copyfile(source/name,output/name)
print('Publicación validada: 1011 lecturas, 808 entrenamiento, 203 prueba; matriz',matrix)
