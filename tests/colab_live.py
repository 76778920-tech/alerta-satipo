"""Ejecuta el notebook conectado con credenciales locales existentes, sin escribir datos remotos."""
import contextlib
import io
import json
import os
from pathlib import Path
import zipfile

ROOT=Path(__file__).resolve().parents[1]
config=json.loads((ROOT/'config/public.json').read_text())
credentials=json.loads((ROOT/'config/admin.local.json').read_text())
os.environ.update(SUPABASE_URL=config['supabaseUrl'],SUPABASE_PUBLISHABLE_KEY=config['supabasePublishableKey'],SATIPO_EMAIL=credentials['email'],SATIPO_PASSWORD=credentials['password'],MPLBACKEND='Agg')
nb=json.loads((ROOT/'colab/Alerta_Satipo_300_predicciones.ipynb').read_text(encoding='utf-8'))
work=ROOT/'test-results'/'colab-audit';work.mkdir(parents=True,exist_ok=True);os.chdir(work)
(work/'salida_satipo').mkdir(exist_ok=True)
(work/'salida_satipo'/'archivo_ajeno.txt').write_text('No debe exportarse')
scope={}
with contextlib.redirect_stdout(io.StringIO()):
    for i,cell in enumerate(nb['cells']):
        if cell['cell_type']=='code':exec(compile(''.join(cell['source']),f'cell-{i}','exec'),scope)
assert len(scope['df'])==300 and scope['report']['test_rows']==60
for value in [None,[],{**scope['nueva_medicion'],'temperature_c':True}]:
    try:scope['predecir_medicion'](value)
    except ValueError:pass
    else:raise AssertionError('Entrada inválida aceptada')
with zipfile.ZipFile('alerta_satipo_modelo_experimental.zip') as z:
    assert len(z.namelist())==6 and 'archivo_ajeno.txt' not in z.namelist()
# Emula una nueva consulta fallida después de entrenar: no debe conservar modelo ni datos viejos.
def fail(*args,**kwargs):raise RuntimeError('Fallo de red simulado')
scope['load_supabase_dataset']=fail
load_cell=next(''.join(c['source']) for c in nb['cells'] if c['cell_type']=='code' and 'globals().pop' in ''.join(c['source']))
try:exec(load_cell,scope)
except RuntimeError:pass
else:raise AssertionError('No se propagó el fallo')
assert all(name not in scope for name in ['model','df','report','predictions'])
print('PASS: Supabase, todas las celdas, inferencia inválida, ZIP limitado y eliminación de resultados obsoletos. Sin escrituras remotas.')
