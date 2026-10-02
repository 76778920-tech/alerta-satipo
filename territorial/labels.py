"""Adaptador CLI de etiquetado territorial."""
import argparse,json
import sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path: sys.path.insert(0,str(ROOT))

from territorial.bootstrap import labeling
from territorial.domain.labels import attach_labels

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dataset',required=True);parser.add_argument('--labels',required=True);parser.add_argument('--output',required=True)
    args=parser.parse_args()
    destination=Path(args.output)
    if destination.resolve() in (Path(args.dataset).resolve(),Path(args.labels).resolve()):raise ValueError('No sobrescribir entradas')
    data=labeling(destination.parent).execute(args.dataset,args.labels,destination.name)
    print(json.dumps({'rows':len(data),'verified_labels':int(data.confirmed_fire_next_24h.notna().sum()),'operational_training_approved':False}))
