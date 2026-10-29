import json
from pathlib import Path

root=Path(__file__).resolve().parents[1]
mobile=root/'mobile/assets'
if mobile.is_dir():
    model=(root/'backend/domain/pmv1-model.mjs').read_text(encoding='utf-8').split('export default ',1)[1].strip().rstrip(';')
    (mobile/'pmv1-model.json').write_text(json.dumps(json.loads(model)),encoding='utf-8')
    (mobile/'model-evaluation.json').write_bytes((root/'colab/pmv1/evaluation.json').read_bytes())
source=(root/'backend/domain/pmv1.mjs').read_text(encoding='utf-8')
source=source.replace("import {ApplicationError} from './errors.mjs';",'class ApplicationError extends Error { constructor(code,message) { super(message); this.code=code; } }')
(root/'frontend/src/domain/pmv1.mjs').write_text('// Generado desde backend/domain/pmv1.mjs.\n'+source,encoding='utf-8')
trainer=(root/'scripts/train_pmv1.py').read_text(encoding='utf-8')
cells=[{'cell_type':'markdown','metadata':{},'source':['# PMV1: cinco variables simuladas\n','Datos SINTÉTICOS. Tres clases de escenario; no son umbrales de incendio validados. Humo y gas son índices de señal 0–100, no ppm. Polvo se representa como PM2.5 en µg/m³.\n','Ejecutar todas las celdas entrena, evalúa y exporta un árbol local C++/JavaScript. Esta exportación propia NO es una exportación Edge Impulse.']},
 {'cell_type':'code','metadata':{},'execution_count':None,'outputs':[],'source':trainer.splitlines(True)},
 {'cell_type':'code','metadata':{},'execution_count':None,'outputs':[],'source':['import zipfile\n','with zipfile.ZipFile("pmv1-artifacts.zip", "w") as archive:\n','    for folder in ["colab/pmv1", "backend/domain", "frontend/src/domain", "firmware/pmv1/include"]:\n','        for path in Path(folder).glob("*"):\n','            if path.is_file(): archive.write(path)\n','from google.colab import files\n','files.download("pmv1-artifacts.zip")\n']},
 {'cell_type':'markdown','metadata':{},'source':['## Edge Impulse\n','Los CSV train/test preservan las cinco variables en orden y label 0/1/2. Importar con el asistente CSV configurado para datos tabulares estáticos (un registro por muestra); mapear 0=Normal, 1=Advertencia, 2=Emergencia. Conservar el test fuera de entrenamiento. Exportar la biblioteca Arduino desde el proyecto propio después de evaluar. No se afirma haber creado ni ejecutado un proyecto Edge Impulse.']}]
notebook={'nbformat':4,'nbformat_minor':5,'metadata':{'kernelspec':{'name':'python3','display_name':'Python 3'},'language_info':{'name':'python'}},'cells':cells}
(root/'colab/PMV1_cinco_variables.ipynb').write_text(json.dumps(notebook,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
