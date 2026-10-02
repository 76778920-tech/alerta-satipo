"""Adaptador CLI de preparación territorial; conserva la entrada existente."""
import argparse,json
import sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path: sys.path.insert(0,str(ROOT))

from territorial.bootstrap import preparation
from territorial.domain.geography import EXPECTED, DAILY, validate_boundaries, weather_frame, assign_detection, classify_detections
from territorial.adapters.files import LocalResearchInput

def import_firms(path,features):
    return classify_detections(LocalResearchInput().read_firms(path),features)

def prepare(output,start,end,firms=None):
    return preparation(output).execute(start,end,firms)

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--start',default='2025-01-01');parser.add_argument('--end',default='2025-12-31')
    parser.add_argument('--output',default='data/territorial/2025');parser.add_argument('--firms-csv')
    args=parser.parse_args()
    result=prepare(args.output,args.start,args.end,args.firms_csv)
    print(json.dumps({'rows':result['rows'],'districts':len(result['districts']),'training_allowed':False}))
