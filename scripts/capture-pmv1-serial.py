"""Captura USB explícita; no flashea, no abre red, no inventa hora del dispositivo."""
import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

parser=argparse.ArgumentParser()
parser.add_argument('--port',required=True)
parser.add_argument('--count',type=int,default=10)
parser.add_argument('--output',required=True)
args=parser.parse_args()
if not 1<=args.count<=1000:parser.error('count entre 1 y 1000')
if Path(args.output).exists():parser.error('El archivo ya existe')
import serial
records=[]
with serial.Serial(args.port,115200,timeout=10) as port:
    for attempt in range(args.count*5):
        raw=port.readline()
        if not raw:continue
        try:row=json.loads(raw)
        except (ValueError,UnicodeDecodeError):continue
        if 'error' in row:print('Dispositivo:',row['error']);continue
        if not all(k in row for k in ('id','node_id','source','values')):continue
        row['observed_at']=datetime.now(timezone.utc).isoformat()
        row['time_basis']='gateway_reception_utc'
        records.append(row)
        if len(records)==args.count:break
if len(records)!=args.count:raise SystemExit('No se recibieron todas las lecturas; no se publica un lote incompleto.')
with open(args.output,'x',encoding='utf-8') as target:json.dump(records,target,indent=2)
print(f'{len(records)} registros capturados. Hora UTC de recepción; no reloj del sensor.')
