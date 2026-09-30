"""Pruebas de aceptación reproducibles. --live consulta hosting con cuenta existente."""
import argparse,json,os,shutil,subprocess,sys
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--live',action='store_true');args=parser.parse_args()
suites=[('backend',[shutil.which('npm') or 'npm','test']),('territorial-data',[sys.executable,'tests/territorial_test.py']),('territorial-training',[sys.executable,'tests/territorial_training_test.py'])]
if args.live:
    suites += [(name,[sys.executable,'tests/'+file]) for name,file in [('admin-access','admin_access.py'),('readings','panel_readings.py'),('predictions','panel_predictions.py'),('district-demo','district_demo.py')]]
env={**os.environ,'PYTHONIOENCODING':'utf-8','PANEL_TEST_URL':'https://alerta-satipo-76778920.web.app'}
results=[]
for name,command in suites:
    try:
        process=subprocess.run(command,cwd=ROOT,env=env,capture_output=True,text=True,encoding='utf-8',errors='replace',timeout=300)
        code=process.returncode
    except (OSError,subprocess.TimeoutExpired):code=-1
    results.append({'suite':name,'passed':code==0,'exit_code':code})
    print(name+': '+('PASS' if code==0 else 'FAIL (ejecutar la prueba individual para diagnóstico)'))
output=ROOT/'test-results';output.mkdir(exist_ok=True)
(output/'acceptance.json').write_text(json.dumps({'checked_at':datetime.now(timezone.utc).isoformat(),'live':args.live,'results':results},indent=2),encoding='utf-8')
raise SystemExit(0 if all(r['passed'] for r in results) else 1)
