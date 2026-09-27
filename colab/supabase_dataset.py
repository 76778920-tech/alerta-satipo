"""Consulta de lecturas con sesión de usuario; no realiza escrituras de datos."""
import base64
import hashlib
import json
import math
import re
import urllib.request
import urllib.error
from datetime import datetime, timezone

DATASET = 'smoke-detection-iot-300-v1'
NUMERIC = ['source_row','utc_seconds','temperature_c','humidity_pct','tvoc_ppb','eco2_ppm',
           'raw_h2','raw_ethanol','pressure_hpa','pm1_0','pm2_5','nc0_5','nc1_0','nc2_5','cnt']

def canonical_payload(rows):
    if not isinstance(rows,list) or len(rows)!=300:
        raise ValueError('Se requieren exactamente 300 lecturas; no se entrenará con una respuesta parcial.')
    result=[]
    for row in rows:
        if not isinstance(row,dict) or set(row)!=set(NUMERIC+['dataset_id','recorded_at','fire_alarm']):
            raise ValueError('El esquema de las lecturas no coincide con el esperado.')
        if row['dataset_id']!=DATASET or type(row['fire_alarm']) is not bool:
            raise ValueError('Conjunto de datos o etiqueta inválidos.')
        item={}
        for key in NUMERIC:
            value=row[key]
            if type(value) not in (int,float) or not math.isfinite(value):
                raise ValueError('Hay mediciones no numéricas o no finitas.')
            item[key]=float(value)
        if row['source_row']<0 or row['source_row']!=int(row['source_row']):
            raise ValueError('Identificador de origen inválido.')
        stamp=datetime.fromisoformat(row['recorded_at'].replace('Z','+00:00'))
        if stamp.tzinfo is None or stamp.timestamp()!=row['utc_seconds']:
            raise ValueError('Fecha inconsistente con UTC.')
        item.update(dataset_id=DATASET,recorded_at=stamp.astimezone(timezone.utc).isoformat(),fire_alarm=row['fire_alarm'])
        result.append(item)
    if len({r['source_row'] for r in result})!=300:
        raise ValueError('Se detectaron identificadores duplicados.')
    if sum(r['fire_alarm'] for r in result)!=214:
        raise ValueError('La distribución no coincide con las 214 etiquetas positivas esperadas.')
    return json.dumps(sorted(result,key=lambda r:r['source_row']),sort_keys=True,separators=(',',':'),ensure_ascii=False)

def _request(url, headers, body=None):
    request=urllib.request.Request(url,headers=headers,data=None if body is None else json.dumps(body).encode(),method='GET' if body is None else 'POST')
    try:
        with urllib.request.urlopen(request,timeout=40) as response:
            raw=response.read(2_000_001)
            if len(raw)>2_000_000:raise ValueError('Respuesta demasiado grande.')
            return json.loads(raw),response.headers.get('Content-Range','')
    except urllib.error.HTTPError as error:
        status=error.code
        if status in (400,401,403):message='Acceso rechazado: revisa correo, contraseña, clave pública y permisos de lectura.'
        elif status==429:message='Límite de solicitudes alcanzado; espera antes de reintentar.'
        else:message=f'Supabase respondió HTTP {status}. No se entrenó con datos alternativos.'
        raise RuntimeError(message) from None
    except (urllib.error.URLError,TimeoutError):
        raise RuntimeError('No se pudo conectar con Supabase. Revisa conexión y disponibilidad.') from None

def load_supabase_dataset(url, public_key, email, password, expected_sha256):
    if not re.fullmatch(r'https://[a-z0-9-]+\.supabase\.co',url):
        raise ValueError('Usa la URL HTTPS del proyecto Supabase, sin rutas ni barra final.')
    role=None
    try:
        encoded=public_key.split('.')[1]
        role=json.loads(base64.urlsafe_b64decode(encoded+'='*(-len(encoded)%4)))['role']
    except (ValueError,IndexError,KeyError,TypeError):pass
    if not public_key.startswith('sb_publishable_') and role!='anon':
        raise ValueError('Solo se admite clave pública publishable o anon; nunca service_role o secret.')
    if not email or not password:raise ValueError('Faltan credenciales de una cuenta existente.')
    session,_=_request(url+'/auth/v1/token?grant_type=password',{'apikey':public_key,'Content-Type':'application/json'}, {'email':email,'password':password})
    token=session.get('access_token')
    if not isinstance(token,str) or not token:raise RuntimeError('No se obtuvo una sesión válida.')
    rows,content_range=_request(url+'/rest/v1/smoke_readings?select=*&dataset_id=eq.'+DATASET+'&order=source_row.asc&limit=301',
        {'apikey':public_key,'Authorization':'Bearer '+token,'Prefer':'count=exact','Accept':'application/json'})
    if content_range.rsplit('/',1)[-1]!='300':
        raise ValueError('Supabase no confirma un total exacto de 300 filas visibles.')
    payload=canonical_payload(rows)
    if hashlib.sha256(payload.encode()).hexdigest()!=expected_sha256:
        raise ValueError('Las lecturas cambiaron respecto de la muestra aprobada. Revisa los datos antes de entrenar.')
    return rows,payload
