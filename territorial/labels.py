"""Incorpora registros verificados; nunca deduce negativos de ausencia de detección."""
import argparse,json
from pathlib import Path
import pandas as pd
from pipeline import EXPECTED

def attach_labels(frame,labels):
    required={'ubigeo','issued_at_local','confirmed_fire_next_24h','coverage_verified','source_reference'}
    if not required.issubset(labels.columns):raise ValueError('Faltan campos de evidencia')
    if labels.duplicated(['ubigeo','issued_at_local']).any():raise ValueError('Etiquetas duplicadas')
    for row in labels.to_dict('records'):
        if str(row['ubigeo']) not in EXPECTED:raise ValueError('Distrito desconocido')
        stamp=pd.Timestamp(row['issued_at_local'])
        if stamp.tzinfo is None or stamp.utcoffset().total_seconds()!=-18000 or any([stamp.hour,stamp.minute,stamp.second,stamp.microsecond]):raise ValueError('La emisión debe ser medianoche UTC-05:00')
        if str(row['confirmed_fire_next_24h']) not in ('0','1'):raise ValueError('Etiqueta debe ser 0 o 1')
        if str(row['coverage_verified']).lower()!='true':raise ValueError('Se requiere cobertura verificada')
        if not isinstance(row['source_reference'],str) or not row['source_reference'].strip():raise ValueError('Falta fuente verificable')
    known=set(zip(frame.ubigeo.astype(str),frame.issued_at_local))
    if any((str(r.ubigeo),r.issued_at_local) not in known for r in labels.itertuples()):raise ValueError('Etiqueta fuera del periodo disponible')
    data=frame.drop(columns=['confirmed_fire_next_24h','event_coverage']).merge(labels[list(required)],on=['ubigeo','issued_at_local'],how='left',validate='one_to_one')
    data['event_coverage']=data.coverage_verified.fillna('').astype(str).str.lower().map({'true':'verified'}).fillna('unknown')
    return data

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dataset',required=True);parser.add_argument('--labels',required=True);parser.add_argument('--output',required=True)
    args=parser.parse_args()
    data=attach_labels(pd.read_csv(args.dataset,dtype={'ubigeo':str}),pd.read_csv(args.labels,dtype=str,keep_default_na=False))
    destination=Path(args.output)
    if destination.resolve() in (Path(args.dataset).resolve(),Path(args.labels).resolve()):raise ValueError('No sobrescribir entradas')
    data.to_csv(destination,index=False)
    print(json.dumps({'rows':len(data),'verified_labels':int(data.confirmed_fire_next_24h.notna().sum()),'operational_training_approved':False}))
