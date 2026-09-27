"""Ejecuta el notebook v2 con la cuenta existente; no escribe datos remotos."""
import contextlib,io,json,os
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
config=json.loads((ROOT/'config/public.json').read_text())
credentials=json.loads((ROOT/'config/admin.local.json').read_text())
os.environ.update(SUPABASE_URL=config['supabaseUrl'],SUPABASE_PUBLISHABLE_KEY=config['supabasePublishableKey'],SATIPO_EMAIL=credentials['email'],SATIPO_PASSWORD=credentials['password'],MPLBACKEND='Agg')
nb=json.loads((ROOT/'colab/Alerta_Satipo_validacion_v2.ipynb').read_text(encoding='utf-8'))
work=ROOT/'test-results/model-v2';work.mkdir(parents=True,exist_ok=True);os.chdir(work)
scope={}
with contextlib.redirect_stdout(io.StringIO()):
    for i,cell in enumerate(nb['cells']):
        if cell['cell_type']=='code':exec(compile(''.join(cell['source']),f'cell-{i}','exec'),scope)
assert len(scope['candidate_predictions'])==60
assert scope['candidate_report']['promotion']=='NOT_APPROVED_REQUIRES_NEW_INDEPENDENT_DATA'
def fail(*args,**kwargs):raise RuntimeError('Red no disponible')
scope['load_supabase_dataset']=fail
load_cell=next(''.join(c['source']) for c in nb['cells'] if 'globals().pop' in ''.join(c['source']))
try:exec(load_cell,scope)
except RuntimeError:pass
else:raise AssertionError('Fallo no propagado')
assert all(name not in scope for name in ['candidate_model','candidate_report','candidate_predictions'])
print('PASS: notebook v2 completo contra Supabase y limpieza de estado tras fallo de consulta.')
