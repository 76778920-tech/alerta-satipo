from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
original=json.loads((ROOT/'colab/Alerta_Satipo_300_predicciones.ipynb').read_text(encoding='utf-8'))
cells=[]
def cell(kind,text):return {'cell_type':kind,'metadata':{},'source':text.splitlines(True),**({'execution_count':None,'outputs':[]} if kind=='code' else {})}
cells.append(cell('markdown',"""# Evaluación temporal de candidatos — versión 2
Este notebook mejora el proceso de evaluación; no promete mejores predicciones. Usa las mismas 300 lecturas verificadas en Supabase y los mismos cuatro secretos del notebook original. No publica ni reemplaza automáticamente el modelo web.

Compara Random Forest, Extra Trees y regresión logística con umbrales 0.3, 0.5 y 0.7, solo dentro de las 240 filas de desarrollo. Cuatro bloques ordenados, separados por cinco filas, evalúan 160 observaciones. El intervalo de cinco filas no representa una duración constante ni garantiza independencia entre ensayos. La ponderación exploratoria de dos por falso negativo y uno por falso positivo requiere validación operativa.

Las 60 filas finales ya se inspeccionaron anteriormente: sirven para regresión, no como una prueba independiente inédita. Se requieren datos nuevos para aprobar un modelo. No hay datos geográficos para pronosticar incendios por distrito.
"""))
# Reuse exact verified Supabase connection and stale-state invalidation cells.
for source in original['cells']:
    source=json.loads(json.dumps(source))
    if source['cell_type']=='code' and 'globals().pop' in ''.join(source['source']):
        source['source']=''.join(source['source']).replace("('rows','payload'","('candidate_model','candidate_report','candidate_predictions','rows','payload'").splitlines(True)
    cells.append(source)
    if source['cell_type']=='code' and 'df = pd.DataFrame(rows)' in ''.join(source['source']):break
cells.append(cell('code',(ROOT/'colab/model_selection.py').read_text(encoding='utf-8')))
cells.append(cell('code',"""candidate_model = candidate_report = candidate_predictions = None
candidate_model, candidate_report, candidate_predictions = run_experiment(rows)
print(json.dumps(candidate_report, indent=2))
output_v2 = Path('salida_satipo_v2'); output_v2.mkdir(exist_ok=True)
(output_v2/'evaluacion.json').write_text(json.dumps(candidate_report,indent=2),encoding='utf-8')
candidate_predictions.to_csv(output_v2/'predicciones_regresion.csv',index=False)
print('Candidato no aprobado. El panel conserva la evaluación publicada.')
"""))
# Remove baseline-specific introductory claims from reused first markdown.
cells.pop(1)
nb={'cells':cells,'metadata':original['metadata'],'nbformat':4,'nbformat_minor':5}
(ROOT/'colab/Alerta_Satipo_validacion_v2.ipynb').write_text(json.dumps(nb,ensure_ascii=False,indent=1),encoding='utf-8')
