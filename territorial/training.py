"""Entrenamiento territorial experimental con evidencia; nunca aprueba despliegue automático."""
import argparse,hashlib,json,platform
import sklearn
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.dummy import DummyClassifier
from sklearn.metrics import confusion_matrix,balanced_accuracy_score,precision_score,recall_score,brier_score_loss
from sklearn.pipeline import make_pipeline
from sklearn.impute import SimpleImputer
from pipeline import EXPECTED

FEATURES=['temperature_2m_max','relative_humidity_2m_mean','precipitation_sum','wind_speed_10m_max','rain_previous_7_days_mm']

def inspect(frame):
    problems=[]
    required=set(FEATURES+['ubigeo','issued_at_local','confirmed_fire_next_24h','event_coverage'])
    if not required.issubset(frame.columns):return {'eligible_for_experiment':False,'blockers':['Faltan columnas: '+', '.join(sorted(required-set(frame.columns)))]}
    if frame.empty:problems.append('Conjunto vacío')
    if frame.duplicated(['ubigeo','issued_at_local']).any():problems.append('Filas distrito-fecha duplicadas')
    if not set(frame.ubigeo.astype(str)).issubset(EXPECTED):problems.append('UBIGEO desconocido')
    dates=pd.to_datetime(frame.issued_at_local,utc=True,errors='coerce')
    if dates.isna().any() or ((dates.dt.hour!=5)|(dates.dt.minute!=0)|(dates.dt.second!=0)).any():problems.append('Fechas inválidas: se requiere medianoche de Perú')
    target=pd.to_numeric(frame.confirmed_fire_next_24h,errors='coerce')
    if (frame.confirmed_fire_next_24h.notna() & target.isna()).any():problems.append('Etiqueta no numérica')
    labeled=target.notna()
    if not target[labeled].isin([0,1]).all():problems.append('Etiquetas fuera de 0/1')
    if not frame.loc[labeled,'event_coverage'].eq('verified').all():problems.append('Etiquetas sin cobertura verificada')
    if 'source_reference' not in frame or frame.loc[labeled,'source_reference'].fillna('').astype(str).str.strip().eq('').any():
        if labeled.any():problems.append('Falta evidencia de etiquetas')
    numeric=frame[FEATURES].apply(pd.to_numeric,errors='coerce')
    # Las seis primeras ventanas por distrito no se imputan para inventar historia.
    usable=labeled & numeric.notna().all(axis=1) & np.isfinite(numeric).all(axis=1)
    if labeled.any() and not usable.any():problems.append('No hay etiquetas con meteorología completa')
    if not labeled.any():problems.append('No hay eventos ni ausencias verificadas; no se puede entrenar')
    return {'eligible_for_experiment':not problems,'blockers':problems,'rows':len(frame),
            'verified_label_rows':int(labeled.sum()),'usable_rows':int(usable.sum()),'unlabeled_rows':int((~labeled).sum()),
            'operational_approval':False}

def partitions(frame):
    audit=inspect(frame)
    if not audit['eligible_for_experiment']:raise ValueError('; '.join(audit['blockers']))
    data=frame.copy();data[FEATURES]=data[FEATURES].apply(pd.to_numeric,errors='coerce')
    data['target']=pd.to_numeric(data.confirmed_fire_next_24h,errors='coerce')
    data['issued']=pd.to_datetime(data.issued_at_local,utc=True,errors='raise')
    data=data.dropna(subset=FEATURES+['target']).sort_values(['issued','ubigeo'])
    if not np.isfinite(data[FEATURES]).all().all():raise ValueError('Valores no finitos')
    dates=data.issued.drop_duplicates().sort_values().tolist()
    if len(dates)<30:raise ValueError('Se requieren al menos 30 fechas etiquetadas para un experimento exploratorio')
    cutoff=dates[int(len(dates)*0.8)]
    # Toda la provincia comparte corte; excluir horizontes de entrenamiento que alcancen la prueba.
    train=data[data.issued+pd.Timedelta(hours=24)<cutoff]
    test=data[data.issued>=cutoff]
    for name,part in [('entrenamiento',train),('prueba',test)]:
        counts=part.target.value_counts()
        if any(counts.get(label,0)<5 for label in [0,1]):raise ValueError('Se requieren al menos cinco ejemplos de cada clase en '+name+'; no es un umbral de aprobación operativa')
    return train,test,cutoff

def evaluate(actual,predicted,score):
    return {'confusion_matrix':confusion_matrix(actual,predicted,labels=[0,1]).tolist(),
        'balanced_accuracy':float(balanced_accuracy_score(actual,predicted)),
        'precision_alarm':float(precision_score(actual,predicted,zero_division=0)),
        'recall_alarm':float(recall_score(actual,predicted,zero_division=0)),
        'brier_score':float(brier_score_loss(actual,score))}

def train_experiment(frame):
    train,test,cutoff=partitions(frame)
    model=make_pipeline(SimpleImputer(strategy='median'),RandomForestClassifier(n_estimators=200,max_depth=5,min_samples_leaf=5,class_weight='balanced',random_state=20260929,n_jobs=-1))
    model.fit(train[FEATURES],train.target)
    baseline=DummyClassifier(strategy='prior').fit(train[FEATURES],train.target)
    scores=model.predict_proba(test[FEATURES])[:,list(model.classes_).index(1)]
    predictions=scores>=0.5
    reference=baseline.predict_proba(test[FEATURES])[:,list(baseline.classes_).index(1)]
    report={'python_version':platform.python_version(),'sklearn_version':sklearn.__version__,'scope':'EXPERIMENT_ONLY_NOT_OPERATIONAL','features':FEATURES,'threshold':0.5,'train_rows':len(train),'test_rows':len(test),'cutoff_utc':cutoff.isoformat(),
        'model':evaluate(test.target,predictions,scores),'baseline':evaluate(test.target,reference>=0.5,reference),
        'per_district':{},'operational_approval':False,
        'limitations':['Inputs are retrospective reanalysis, not verified as available at issue time','Small exploratory temporal holdout does not establish safety','Vegetation, spatial coverage and prospective calibration are pending']}
    for code in sorted(test.ubigeo.astype(str).unique()):
        mask=test.ubigeo.astype(str).eq(code).to_numpy()
        report['per_district'][code]={'rows':int(mask.sum()),'positive_rows':int(test.loc[mask,'target'].sum()),**evaluate(test.loc[mask,'target'],predictions[mask],scores[mask])}
    output=test[['ubigeo','issued_at_local']].copy();output['actual']=test.target.astype(int)
    output['predicted']=predictions;output['uncalibrated_score']=scores;output['scope']='EXPERIMENT_ONLY_NOT_OPERATIONAL'
    return model,report,output

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dataset',required=True);parser.add_argument('--output',default='test-results/territorial-training');parser.add_argument('--train-experiment',action='store_true')
    args=parser.parse_args();output=Path(args.output);output.mkdir(parents=True,exist_ok=True)
    frame=pd.read_csv(args.dataset,dtype={'ubigeo':str})
    report=inspect(frame)
    report['input_sha256']=hashlib.sha256(Path(args.dataset).read_bytes()).hexdigest()
    (output/'readiness.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False))
    if args.train_experiment:
        # Estado previo inválido incluso cuando el experimento posterior falla.
        (output/'status.json').write_text('{"state":"incomplete","operational_approval":false}')
        model,report,predictions=train_experiment(frame)
        report['input_sha256']=hashlib.sha256(Path(args.dataset).read_bytes()).hexdigest()
        (output/'evaluation.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
        predictions.to_csv(output/'experimental_predictions.csv',index=False)
        (output/'status.json').write_text('{"state":"experiment_complete","operational_approval":false}')
