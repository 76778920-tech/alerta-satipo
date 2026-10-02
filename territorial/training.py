"""Adaptador CLI del experimento; no aprueba despliegues."""
import argparse,json
import sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path: sys.path.insert(0,str(ROOT))

from territorial.bootstrap import training
from territorial.domain.training import FEATURES, inspect, partitions
from territorial.application.training import run_experiment
from territorial.adapters.sklearn_model import SklearnExperiment, evaluate

def train_experiment(frame):
    return run_experiment(frame,SklearnExperiment())

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dataset',required=True)
    parser.add_argument('--output',default='test-results/territorial-training')
    parser.add_argument('--train-experiment',action='store_true')
    args=parser.parse_args()
    print(json.dumps(training(args.output).execute(args.dataset,args.train_experiment),ensure_ascii=False))
