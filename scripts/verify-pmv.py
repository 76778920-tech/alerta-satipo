"""Run the PMV software validation and preserve real outputs, without remote writes."""
import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import time

ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output',default=f'test-results/pmv-validation-{datetime.now(timezone.utc):%Y%m%dT%H%M%SZ}')
args=parser.parse_args()
output=Path(args.output).resolve()
output.mkdir(parents=True,exist_ok=False)
def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def git(*args):return subprocess.check_output(['git',*args],cwd=ROOT,text=True).strip()
plan=[
 ('build',['npm','run','build'],ROOT),
 ('javascript',['npm','test'],ROOT),
 ('python',[sys.executable,'-m','unittest','discover','-s','tests','-p','*_test.py','-v'],ROOT),
 ('flutter_analyze',['flutter','analyze','--no-pub'],ROOT/'mobile'),
 ('flutter_tests',['flutter','test','--no-pub','--reporter','expanded','--concurrency=1'],ROOT/'mobile'),
 ('browser',['python','tests/browser_hexagonal.py'],ROOT),
]
report={'started_at_utc':datetime.now(timezone.utc).isoformat(),'base_commit':git('rev-parse','HEAD'),
 'dirty_at_start':bool(git('status','--porcelain')),'scope':'software; synthetic ML; temporary databases; no physical sensor/radio tests',
 'source_sha256':{},'runs':[],
 'not_verified':['Physical sensor acquisition/calibration','ESP32-S3 execution and reboot persistence',
 'Physical LED visibility','Physical buzzer activation/audibility','BLE radio range/reconnection on a board',
 'Real Edge Impulse deployment','Field wildfire detection or future geographic prediction']}
for folder in ['backend','frontend/src','mobile/lib','mobile/test','tests']:
 for path in sorted((ROOT/folder).rglob('*')):
  if path.is_file() and path.suffix in ['.mjs','.dart','.py']:
   report['source_sha256'][path.relative_to(ROOT).as_posix()]=digest(path)
for name,command,cwd in plan:
 executable=shutil.which(command[0])
 start=time.monotonic()
 env={**os.environ,'PYTHONIOENCODING':'utf-8','NO_COLOR':'1','CI':'true'}
 try:
  if not executable:raise FileNotFoundError(command[0])
  result=subprocess.run([executable,*command[1:]],cwd=cwd,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=300)
  content=result.stdout.decode('utf-8',errors='replace');code=result.returncode
 except (OSError,subprocess.TimeoutExpired) as error:
  content=f'Execution failed: {type(error).__name__}';code=-1
 logfile=output/f'{name}.log'
 logfile.write_text(content,encoding='utf-8')
 report['runs'].append({'name':name,'command':command,'cwd':cwd.relative_to(ROOT).as_posix(),
   'exit_code':code,'status':'PASS' if code==0 else 'FAIL','seconds':round(time.monotonic()-start,3),
   'log':logfile.name,'log_sha256':digest(logfile)})
 print(f'{name}: {report["runs"][-1]["status"]}',flush=True)
report['finished_at_utc']=datetime.now(timezone.utc).isoformat()
report['status']='PASS' if all(r['exit_code']==0 for r in report['runs']) else 'FAIL'
for source,name in [('colab/pmv1/evaluation.json','synthetic_ml.json'),('colab/resultados_locales/evaluacion.json','historical_ml.json')]:
 shutil.copyfile(ROOT/source,output/name)
 report['source_sha256'][source]=digest(ROOT/source)
(output/'results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'Result: {report["status"]}; evidence: {output}')
sys.exit(0 if report['status']=='PASS' else 1)
