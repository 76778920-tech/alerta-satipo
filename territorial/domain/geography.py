import math
from datetime import datetime, timezone
import pandas as pd
from shapely.geometry import shape, Point

DAILY=['temperature_2m_max','relative_humidity_2m_mean','precipitation_sum','wind_speed_10m_max']
EXPECTED={f'12060{i}' for i in range(1,10)}

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


def representative_point(feature):
    point=shape(feature['geometry']).representative_point()
    return point.y,point.x


def classify_detections(original,features):
    rows=[];seen=set();outside=0;duplicates=0
    for row in original:
        lat,lon=float(row['latitude']),float(row['longitude'])
        timestamp=datetime.strptime(row['acq_date']+' '+row['acq_time'].zfill(4),'%Y-%m-%d %H%M').replace(tzinfo=timezone.utc)
        key=(lat,lon,timestamp.isoformat(),row['satellite'],row['instrument'])
        if key in seen:duplicates+=1;continue
        seen.add(key)
        code=assign_detection(lat,lon,features)
        if code is None:outside+=1;continue
        rows.append({'ubigeo':code,'latitude':lat,'longitude':lon,'detected_at_utc':timestamp.isoformat(),'satellite':row['satellite'],'instrument':row['instrument'],'confidence_raw':row['confidence'],'classification':'unverified_thermal_anomaly'})
    return rows,{'outside_or_ambiguous':outside,'duplicates':duplicates,'assigned':len(rows)}
