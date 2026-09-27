"""Notebook conectado: consulta Supabase sin incluir datos ni credenciales."""
from pathlib import Path
import json
import hashlib
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/"colab"))
from supabase_dataset import canonical_payload

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'colab';OUT.mkdir(exist_ok=True)
rows=json.loads((ROOT/'data/smoke_detection_300.json').read_text(encoding='utf-8'))
payload=canonical_payload(rows)
digest=hashlib.sha256(payload.encode()).hexdigest()
cells=[]
def md(s):cells.append({'cell_type':'markdown','metadata':{},'source':s.splitlines(True)})
def code(s):cells.append({'cell_type':'code','metadata':{},'execution_count':None,'outputs':[],'source':s.splitlines(True)})
md('''# Alerta Satipo — modelo experimental con 300 lecturas
Ejecuta **Entorno de ejecución → Ejecutar todas**. CPU es suficiente. Los 300 registros se consultan directamente en Supabase. Antes de ejecutar, configura los cuatro secretos indicados abajo. No se incluye una copia de respaldo ni se reemplazan datos si falla la conexión.

Objetivo: clasificar `fire_alarm` a partir de mediciones contemporáneas. **No es pronóstico de un incendio futuro ni un sistema validado de alertas.** Los datos son históricos externos, no mediciones de campo en Satipo.

Protocolo fijado antes de evaluar: 240 filas más antiguas para entrenamiento y 60 más recientes para prueba; un Random Forest de configuración fija y un clasificador mayoritario de referencia. No ajustar parámetros tras mirar el resultado de prueba. La ausencia de identificadores de sesión impide garantizar independencia entre ensayos; las métricas solo describen esta partición pequeña.
''')
code('''import json, hashlib, platform, zipfile
from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import sklearn, joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.dummy import DummyClassifier
from sklearn.metrics import (accuracy_score, balanced_accuracy_score, precision_score,
    recall_score, f1_score, roc_auc_score, confusion_matrix, ConfusionMatrixDisplay)
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
try:
    from IPython.display import display
except ImportError:
    display = print
OUT = Path('salida_satipo'); OUT.mkdir(exist_ok=True)
print('Python:', platform.python_version(), '| scikit-learn:', sklearn.__version__)
''')
md("""## 1. Conectar Supabase y verificar las 300 filas
En el panel **Secretos** de Colab (icono de llave), agrega y habilita acceso para este notebook:
- `SUPABASE_URL`: URL HTTPS de tu proyecto, sin barra final.
- `SUPABASE_PUBLISHABLE_KEY`: clave pública publishable o anon, nunca secret/service_role.
- `SATIPO_EMAIL`: correo de una cuenta existente del aplicativo.
- `SATIPO_PASSWORD`: contraseña de esa cuenta; no es la contraseña de PostgreSQL.

La consulta utiliza autenticación de usuario y RLS. No crea cuentas ni escribe lecturas. Los secretos no se imprimen ni se exportan. En ejecución local se leen las mismas variables de entorno.
Se comprueban total remoto, 300 IDs únicos, esquema, fechas, etiquetas y hash normalizado de contenido. Si los datos cambiaron, se detiene el entrenamiento para revisar la nueva versión; no actualizar el hash a ciegas.
""")
code((ROOT/'colab/supabase_dataset.py').read_text(encoding='utf-8'))
code("""def read_secret(name):
    try:
        from google.colab import userdata
    except ImportError:
        import os
        value = os.environ.get(name)
    else:
        try:
            value = userdata.get(name)
        except Exception:
            raise RuntimeError('Configura el secreto ' + name + ' y autoriza su acceso al notebook.') from None
    if not value:
        raise RuntimeError('Falta el secreto ' + name)
    return value
""" + f"""
rows, payload = load_supabase_dataset(
    read_secret('SUPABASE_URL'), read_secret('SUPABASE_PUBLISHABLE_KEY'),
    read_secret('SATIPO_EMAIL'), read_secret('SATIPO_PASSWORD'),
    expected_sha256='{digest}')
df = pd.DataFrame(rows)
df.to_csv(OUT/'lecturas_300.csv', index=False)
print('Supabase: 300 lecturas verificadas; 214 con alarma y 86 sin alarma.')
print('Hash de la instantánea:', hashlib.sha256(payload.encode()).hexdigest())
display(df.head())
""")
md('''## 2. Variables y separación temporal
Se excluyen la etiqueta, el identificador de origen, el contador CNT, el tiempo y el identificador del conjunto de datos. No deben usarse como pistas artificiales de la clase.
Las 12 características conservan las unidades de la fuente. No se inventan porcentajes de humo ni equivalencias con sensores MQ-2. No existe separación física por nodos: los seis nodos del panel son agrupaciones virtuales.
''')
code('''FEATURES = ['temperature_c','humidity_pct','tvoc_ppb','eco2_ppm','raw_h2',
            'raw_ethanol','pressure_hpa','pm1_0','pm2_5','nc0_5','nc1_0','nc2_5']
assert not {'source_row','cnt','utc_seconds','recorded_at','fire_alarm','dataset_id'} & set(FEATURES)
df = df.sort_values(['utc_seconds','source_row']).reset_index(drop=True)
X = df[FEATURES].apply(pd.to_numeric, errors='raise')
assert np.isfinite(X.to_numpy()).all(), 'La muestra original contiene valores no finitos'
y = df['fire_alarm'].astype(int)
train_ids, test_ids = np.arange(240), np.arange(240,300)
X_train, X_test = X.iloc[train_ids], X.iloc[test_ids]
y_train, y_test = y.iloc[train_ids], y.iloc[test_ids]
assert df.iloc[train_ids]['utc_seconds'].max() < df.iloc[test_ids]['utc_seconds'].min()
assert y_train.nunique() == y_test.nunique() == 2
assert set(df.iloc[train_ids].source_row).isdisjoint(df.iloc[test_ids].source_row)
print('Entrenamiento:',len(X_train), y_train.value_counts().to_dict())
print('Prueba:',len(X_test), y_test.value_counts().to_dict())
''')
md('## 3. Entrenar sin utilizar la prueba\nEl preprocesamiento se ajusta solo dentro del entrenamiento mediante Pipeline. La configuración del modelo es fija; no hay selección del mejor modelo usando la prueba.')
code('''model = Pipeline([
    ('imputer',SimpleImputer(strategy='median')),
    ('forest',RandomForestClassifier(n_estimators=300,max_depth=6,min_samples_leaf=3,
                                     class_weight='balanced',random_state=20260923,n_jobs=-1))
])
model.fit(X_train,y_train)
baseline = DummyClassifier(strategy='most_frequent').fit(X_train,y_train)
pred = model.predict(X_test)
score = model.predict_proba(X_test)[:,list(model.classes_).index(1)]
def metrics(actual,predicted):
    return {'accuracy':float(accuracy_score(actual,predicted)),
            'balanced_accuracy':float(balanced_accuracy_score(actual,predicted)),
            'precision_alarm':float(precision_score(actual,predicted,zero_division=0)),
            'recall_alarm':float(recall_score(actual,predicted,zero_division=0)),
            'f1_alarm':float(f1_score(actual,predicted,zero_division=0))}
report = {'dataset_sha256':hashlib.sha256(payload.encode()).hexdigest(),
          'train_rows':240,'test_rows':60,'split':'chronological_80_20',
          'features':FEATURES,'random_forest':metrics(y_test,pred),
          'baseline':metrics(y_test,baseline.predict(X_test)),
          'roc_auc':float(roc_auc_score(y_test,score)),
          'confusion_matrix':confusion_matrix(y_test,pred,labels=[0,1]).tolist(),
          'sklearn_version':sklearn.__version__,
          'notice':'Experimental historical classification; not calibrated wildfire probability.'}
display(pd.DataFrame({'Random Forest':report['random_forest'],'Referencia mayoritaria':report['baseline']}))
print('ROC AUC:',report['roc_auc'])
print('No se han reajustado parámetros ni entrenado sobre las 60 filas de prueba.')
''')
md('''## 4. Evaluar errores y conservar las predicciones de prueba
Filas de la matriz: etiqueta real. Columnas: predicción. Un falso negativo es una lectura con etiqueta positiva clasificada como negativa. No interpretar la exactitud aislada como garantía de seguridad.
El score es la salida no calibrada del clasificador; no es la probabilidad comprobada de incendio en Satipo.
''')
code('''ConfusionMatrixDisplay.from_predictions(y_test,pred,labels=[0,1],display_labels=['Sin alarma','Con alarma'],cmap='Greens')
plt.title('Prueba temporal: 60 lecturas no usadas al entrenar')
plt.tight_layout();plt.savefig(OUT/'matriz_confusion.png',dpi=180);plt.show()
predictions = df.iloc[test_ids][['dataset_id','source_row','recorded_at','fire_alarm']].copy()
predictions['predicted_fire_alarm'] = pred.astype(bool)
predictions['model_score_alarm_uncalibrated'] = score
predictions['correct'] = predictions.fire_alarm == predictions.predicted_fire_alarm
predictions.to_csv(OUT/'predicciones_prueba_60.csv',index=False)
(OUT/'evaluacion.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf-8')
display(predictions.head(10))
print('Errores en prueba:',int((~predictions.correct).sum()))
''')
md('''## 5. Predecir nuevas mediciones con el modelo entrenado
La función exige los mismos 12 campos y valores numéricos finitos. Los valores fuera del rango observado se marcan como fuera de distribución, sin garantizar extrapolación.
El ejemplo siguiente usa una fila de prueba ya evaluada: es una demostración de inferencia, no una observación nueva ni una validación adicional. Sustituye `nueva_medicion` por mediciones compatibles para un ensayo propio.
''')
code('''def predecir_medicion(medicion):
    missing = set(FEATURES) - set(medicion)
    if missing: raise ValueError('Faltan campos: ' + ', '.join(sorted(missing)))
    values = pd.DataFrame([{key:medicion[key] for key in FEATURES}]).apply(pd.to_numeric,errors='raise')
    if not np.isfinite(values.to_numpy()).all(): raise ValueError('Se requieren valores finitos')
    if not 0 <= values.humidity_pct.iloc[0] <= 100: raise ValueError('Humedad fuera de 0–100 %')
    outside = [key for key in FEATURES if not X_train[key].min() <= values[key].iloc[0] <= X_train[key].max()]
    return {'predicted_fire_alarm':bool(model.predict(values)[0]),
            'model_score_alarm_uncalibrated':float(model.predict_proba(values)[0,list(model.classes_).index(1)]),
            'outside_training_range':outside,'model_scope':'experimental_historical_classifier'}
nueva_medicion = X_test.iloc[0].to_dict()  # Ejemplo histórico; reemplazar para otra inferencia.
display(predecir_medicion(nueva_medicion))
try:
    predecir_medicion({})
    raise AssertionError('La validación no rechazó campos ausentes')
except ValueError:
    print('Validación de entrada comprobada.')
''')
md('''## 6. Exportar el modelo y resultados
Se exporta el modelo evaluado, entrenado únicamente con 240 filas. No se reentrena automáticamente con las 300: eso eliminaría el conjunto reservado para comprobar este artefacto.
El archivo joblib requiere versiones compatibles de Python/scikit-learn y solo debe cargarse desde una fuente confiable. No es un archivo ejecutable por el navegador ni sustituye los umbrales JSON del panel. Integrarlo al backend requiere un adaptador de inferencia y validación adicional.
''')
code('''artifact = {'model':model,'features':FEATURES,'evaluation':report,
            'training_min':X_train.min().to_dict(),'training_max':X_train.max().to_dict()}
joblib.dump(artifact,OUT/'modelo_fire_alarm_experimental.joblib')
(OUT/'README.txt').write_text('Modelo experimental. 240 filas de entrenamiento, 60 de prueba.\\n'
    'No usar como alarma operacional. Las probabilidades no están calibradas.\\n'
    'Ver evaluacion.json y versiones antes de reproducir.\\n',encoding='utf-8')
archive = Path('alerta_satipo_modelo_experimental.zip')
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for file in OUT.iterdir(): z.write(file,arcname=file.name)
print('Exportado:',archive.resolve())
try:
    from google.colab import files
except ImportError:
    print('Ejecución local: el ZIP está disponible en el directorio de trabajo.')
else:
    files.download(str(archive))
''')
md('''## Fuentes y limitaciones
- Fuente de los datos: https://raw.githubusercontent.com/HamzaMa96/Smoke-Detection-IOT/main/smoke_detection_iot.csv
- Prevención de fuga de datos: https://scikit-learn.org/1.8/common_pitfalls.html
- Uso de notebooks en Colab: https://research.google.com/colaboratory/faq.html?hl=es

La separación temporal reduce la mezcla de pasado y futuro, pero no elimina toda dependencia entre mediciones. Solo hay 60 filas de prueba y no se conoce aquí la sesión física de cada lectura. Antes de emplear el modelo para alertas: datos independientes de campo, evaluación por sesión/sensor, control de falsas alarmas, calibración y seguimiento de cambios de distribución.
''')
notebook={'nbformat':4,'nbformat_minor':5,'metadata':{'colab':{'name':'Alerta_Satipo_300_predicciones.ipynb'},'kernelspec':{'name':'python3','display_name':'Python 3'},'language_info':{'name':'python'}},'cells':cells}
for i,c in enumerate(cells):c['id']=f'satipo-{i:02d}'
(OUT/'Alerta_Satipo_300_predicciones.ipynb').write_text(json.dumps(notebook,ensure_ascii=False,indent=1),encoding='utf-8')
print('Notebook conectado generado. Hash esperado:',digest)
