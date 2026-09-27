"""Selección temporal dentro de 240 filas; las 60 publicadas son regresión, no prueba inédita."""
import hashlib
import json
import numpy as np
import pandas as pd
import sklearn
import platform
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.metrics import confusion_matrix, accuracy_score, recall_score, precision_score

FEATURES=['temperature_c','humidity_pct','tvoc_ppb','eco2_ppm','raw_h2','raw_ethanol','pressure_hpa','pm1_0','pm2_5','nc0_5','nc1_0','nc2_5']
THRESHOLDS=(0.3,0.5,0.7)
NAMES=('random_forest','extra_trees','logistic')

def estimator(name):
    if name=='random_forest':return make_pipeline(SimpleImputer(),RandomForestClassifier(n_estimators=300,max_depth=6,min_samples_leaf=3,class_weight='balanced',random_state=20260923,n_jobs=-1))
    if name=='extra_trees':return make_pipeline(SimpleImputer(),ExtraTreesClassifier(n_estimators=300,max_depth=6,min_samples_leaf=3,class_weight='balanced',random_state=20260923,n_jobs=-1))
    if name=='logistic':return make_pipeline(SimpleImputer(),StandardScaler(),LogisticRegression(class_weight='balanced',max_iter=3000,random_state=20260923))
    raise ValueError('Modelo no permitido')

def metrics(y,p):
    tn,fp,fn,tp=confusion_matrix(y,p,labels=[0,1]).ravel()
    return {'accuracy':float(accuracy_score(y,p)),'recall_alarm':float(recall_score(y,p,zero_division=0)),
            'precision_alarm':float(precision_score(y,p,zero_division=0)),
            'false_negatives':int(fn),'false_positives':int(fp),'cost':int(2*fn+fp),
            'confusion_matrix':[[int(tn),int(fp)],[int(fn),int(tp)]]}

def select_model(development):
    """Recibe SOLO desarrollo. Nunca consulta etiquetas de las 60 filas reservadas."""
    if len(development)!=240:raise ValueError('Se requieren 240 filas de desarrollo')
    development=development.sort_values(['utc_seconds','source_row']).reset_index(drop=True)
    X=development[FEATURES].astype(float);y=development.fire_alarm.astype(int)
    if not np.isfinite(X.to_numpy()).all() or y.nunique()!=2:raise ValueError('Datos de desarrollo inválidos')
    folds=[(0,start-5,start,start+40) for start in (80,120,160,200)]
    candidates=[]
    for name in NAMES:
        actual=[];scores=[]
        for lo,end,start,stop in folds:
            if development.iloc[end-1].utc_seconds>=development.iloc[start].utc_seconds:raise ValueError('Fuga temporal')
            model=estimator(name).fit(X.iloc[lo:end],y.iloc[lo:end])
            scores.extend(model.predict_proba(X.iloc[start:stop])[:,list(model.classes_).index(1)])
            actual.extend(y.iloc[start:stop])
        for threshold in THRESHOLDS:
            candidates.append({'name':name,'threshold':threshold,**metrics(actual,np.asarray(scores)>=threshold)})
    # Criterio fijado: FN cuesta 2, FP cuesta 1; desempate reproducible.
    selected=min(candidates,key=lambda r:(r['cost'],r['false_negatives'],r['name'],r['threshold']))
    model=estimator(selected['name']).fit(X,y)
    return model,selected,{'folds':folds,'gap_rows':5,'validation_rows':160,'validation_alarm_rows':int(development.iloc[80:].fire_alarm.sum()),'validation_no_alarm_rows':int((~development.iloc[80:].fire_alarm).sum()),'candidates':candidates,
        'criterion':'minimize 2*FN+FP; exploratory engineering weight, not a validated operational cost'}

def run_experiment(rows):
    df=pd.DataFrame(rows).sort_values(['utc_seconds','source_row']).reset_index(drop=True)
    if len(df)!=300 or df.source_row.nunique()!=300:raise ValueError('Se requieren las 300 filas únicas')
    if not np.isfinite(df[FEATURES].astype(float).to_numpy()).all():raise ValueError('Mediciones no finitas')
    if not all(type(value) is bool for value in df.fire_alarm.tolist()):raise ValueError('Etiquetas inválidas')
    if df.iloc[239].utc_seconds>=df.iloc[240].utc_seconds:raise ValueError('Solapamiento temporal')
    model,selected,validation=select_model(df.iloc[:240].copy())
    X=df.iloc[240:][FEATURES];y=df.iloc[240:].fire_alarm.astype(int)
    score=model.predict_proba(X)[:,list(model.classes_).index(1)]
    prediction=score>=selected['threshold']
    old=estimator('random_forest').fit(df.iloc[:240][FEATURES],df.iloc[:240].fire_alarm.astype(int))
    reference=metrics(y,old.predict(X));candidate=metrics(y,prediction)
    result={'python_version':platform.python_version(),'sklearn_version':sklearn.__version__,'version':'temporal-selection-v2','selected':selected,'validation':validation,
        'published_baseline_regression':reference,'candidate_regression':candidate,
        'promotion':'NOT_APPROVED_REQUIRES_NEW_INDEPENDENT_DATA',
        'limitation':'The 60 rows were previously inspected. Regression results are not an independent generalization estimate. No district or future-fire prediction.',
        'dataset_sha256':hashlib.sha256(json.dumps(rows,sort_keys=True).encode()).hexdigest()}
    output=df.iloc[240:][['source_row','recorded_at','fire_alarm']].copy()
    output['predicted_fire_alarm']=prediction;output['model_score_alarm_uncalibrated']=score
    output['threshold']=selected['threshold']
    return model,result,output
