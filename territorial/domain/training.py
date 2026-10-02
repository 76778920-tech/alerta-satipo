import numpy as np
import pandas as pd
from territorial.domain.geography import EXPECTED

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
