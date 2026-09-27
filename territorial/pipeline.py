"""Preparación territorial de investigación. No genera pronósticos ni etiquetas falsas."""
import argparse,csv,hashlib,json,math
from datetime import date,datetime,timedelta,timezone
from pathlib import Path
import pandas as pd
import requests
from shapely.geometry import shape,Point

BOUNDARIES='https://geoservidorperu.minam.gob.pe/arcgis/rest/services/CS/MapServicesUbigeo/MapServer/0/query'
WEATHER='https://archive-api.open-meteo.com/v1/archive'
DAILY=['temperature_2m_max','relative_humidity_2m_mean','precipitation_sum','wind_speed_10m_max']
EXPECTED={f'12060{i}' for i in range(1,10)}

def fetch(url,params):
    response=requests.get(url,params=params,timeout=(15,90))
    response.raise_for_status();data=response.json()
    if data.get('error'):raise ValueError('La fuente devolvió un error; no se usarán datos parciales')
    return data

def save_json(path,value):
    path.write_text(json.dumps(value,ensure_ascii=False,indent=2),encoding='utf-8')

def validate_boundaries(data):
    features=data.get('features',[])
    codes=[f['properties']['UBIGEO'] for f in features]
    if len(codes)!=9 or set(codes)!=EXPECTED:raise ValueError('Cobertura distrital inesperada')
    for feature in features:
        geometry=shape(feature['geometry'])
        if geometry.is_empty or not geometry.is_valid or geometry.geom_type not in ('Polygon','MultiPolygon'):raise ValueError('Geometría inválida')
        x1,y1,x2,y2=geometry.bounds
        if not (-76<x1<x2<-72 and -14<y1<y2<-9):raise ValueError('Coordenadas fuera de Satipo')
    return features

def weather_frame(data,start,end,ubigeo):
    daily=data.get('daily',{})
    expected=pd.date_range(start,end).strftime('%Y-%m-%d').tolist()
    if daily.get('time')!=expected:raise ValueError('Fechas faltantes o duplicadas en meteorología')
    units=data.get('daily_units',{})
    for key,unit in [('temperature_2m_max','°C'),('relative_humidity_2m_mean','%'),('precipitation_sum','mm'),('wind_speed_10m_max','km/h')]:
        if units.get(key)!=unit:raise ValueError('Unidades meteorológicas inesperadas')
        if len(daily.get(key,[]))!=len(expected) or any(v is None or isinstance(v,bool) or not isinstance(v,(float,int)) or not math.isfinite(v) for v in daily[key]):raise ValueError('Meteorología incompleta')
    frame=pd.DataFrame({key:daily[key] for key in ['time']+DAILY})
    if not frame.relative_humidity_2m_mean.between(0,100).all() or (frame.precipitation_sum<0).any() or (frame.wind_speed_10m_max<0).any():raise ValueError('Mediciones fuera de rango')
    frame.insert(0,'ubigeo',ubigeo)
    # Un día observado se asocia a emisión al inicio del siguiente día local.
    frame['issued_at_local']=(pd.to_datetime(frame.time)+pd.Timedelta(days=1)).dt.strftime('%Y-%m-%dT00:00:00-05:00')
    frame['horizon_hours']=24
    frame['rain_previous_7_days_mm']=frame.precipitation_sum.rolling(7,min_periods=7).sum()
    frame['confirmed_fire_next_24h']=pd.NA
    frame['event_coverage']='unknown'
    frame['weather_source']='Open-Meteo ERA5 reanalysis; retrospective, not operational availability'
    return frame

def assign_detection(latitude,longitude,features):
    if not math.isfinite(latitude) or not math.isfinite(longitude) or not -90<=latitude<=90 or not -180<=longitude<=180:raise ValueError('Coordenadas inválidas')
    matches=[f['properties']['UBIGEO'] for f in features if shape(f['geometry']).covers(Point(longitude,latitude))]
    return matches[0] if len(matches)==1 else None

def import_firms(path,features):
    """Una detección es una anomalía térmica, nunca un incendio confirmado automático."""
    rows=[];seen=set();outside=0;duplicates=0
    with Path(path).open(encoding='utf-8-sig',newline='') as handle:
        reader=csv.DictReader(handle)
        required={'latitude','longitude','acq_date','acq_time','satellite','instrument','confidence'}
        if not required.issubset(reader.fieldnames or []):raise ValueError('CSV FIRMS incompleto')
        for row in reader:
            lat,lon=float(row['latitude']),float(row['longitude'])
            timestamp=datetime.strptime(row['acq_date']+' '+row['acq_time'].zfill(4),'%Y-%m-%d %H%M').replace(tzinfo=timezone.utc)
            key=(lat,lon,timestamp.isoformat(),row['satellite'],row['instrument'])
            if key in seen:duplicates+=1;continue
            seen.add(key)
            code=assign_detection(lat,lon,features)
            if code is None:outside+=1;continue
            rows.append({'ubigeo':code,'latitude':lat,'longitude':lon,'detected_at_utc':timestamp.isoformat(),'satellite':row['satellite'],'instrument':row['instrument'],'confidence_raw':row['confidence'],'classification':'unverified_thermal_anomaly'})
    return rows,{'outside_or_ambiguous':outside,'duplicates':duplicates,'assigned':len(rows)}

def prepare(output,start,end,firms=None):
    if date.fromisoformat(start)>date.fromisoformat(end):raise ValueError('Fechas invertidas')
    output=Path(output);output.mkdir(parents=True,exist_ok=True)
    # Marca la ejecución incompleta antes de consultar; evita reutilizar una aprobación antigua.
    save_json(output/'status.json',{'state':'incomplete','training_allowed':False})
    boundaries=fetch(BOUNDARIES,{'where':"NOMBPROV='SATIPO'",'outFields':'UBIGEO,NOMBDIST,Anio','outSR':4326,'f':'geojson','returnGeometry':'true'})
    features=validate_boundaries(boundaries);save_json(output/'districts.geojson',boundaries)
    frames=[];catalog=[]
    for feature in sorted(features,key=lambda f:f['properties']['UBIGEO']):
        prop=feature['properties'];point=shape(feature['geometry']).representative_point()
        params={'latitude':point.y,'longitude':point.x,'start_date':start,'end_date':end,'daily':','.join(DAILY),'timezone':'America/Lima','models':'era5','wind_speed_unit':'kmh'}
        weather=fetch(WEATHER,params)
        frame=weather_frame(weather,start,end,prop['UBIGEO']);frames.append(frame)
        save_json(output/(prop['UBIGEO']+'_weather.json'),weather)
        catalog.append({'ubigeo':prop['UBIGEO'],'district':prop['NOMBDIST'],'sample_latitude':point.y,'sample_longitude':point.x,'sampling':'one interior point; not a district-wide average','weather_request':params})
    pd.concat(frames,ignore_index=True).to_csv(output/'district_day_research.csv',index=False)
    diagnostics=None
    if firms:
        detections,diagnostics=import_firms(firms,features)
        save_json(output/'thermal_anomalies.json',detections)
    files={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in output.iterdir() if p.name in ['districts.geojson','district_day_research.csv'] or p.name.endswith('_weather.json') or (firms and p.name=='thermal_anomalies.json')}
    manifest={'start':start,'end':end,'districts':catalog,'rows':sum(len(f) for f in frames),'sources':[BOUNDARIES,WEATHER],
        'retrieved_at':datetime.now(timezone.utc).isoformat(),'sha256':files,'firms_diagnostics':diagnostics,
        'firms_input_sha256':hashlib.sha256(Path(firms).read_bytes()).hexdigest() if firms else None,
        'blockers':['No verified event labels or negative observation coverage','Reanalysis availability is retrospective','Vegetation and district-wide weather coverage not integrated','No independent prospective validation'],
        'training_allowed':False,'state':'research_data_ready_not_trainable'}
    save_json(output/'manifest.json',manifest);save_json(output/'status.json',{'state':manifest['state'],'training_allowed':False})
    return manifest

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--start',default='2025-01-01');parser.add_argument('--end',default='2025-12-31')
    parser.add_argument('--output',default='data/territorial/2025');parser.add_argument('--firms-csv')
    args=parser.parse_args()
    result=prepare(args.output,args.start,args.end,args.firms_csv)
    print(json.dumps({'rows':result['rows'],'districts':len(result['districts']),'training_allowed':False}))
