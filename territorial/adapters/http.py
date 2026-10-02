import requests
from territorial.application.ports import GeographySource

BOUNDARIES='https://geoservidorperu.minam.gob.pe/arcgis/rest/services/CS/MapServicesUbigeo/MapServer/0/query'
WEATHER='https://archive-api.open-meteo.com/v1/archive'


class PublicGeography(GeographySource):
    def _get(self, url, params):
        response=requests.get(url,params=params,timeout=(15,90))
        response.raise_for_status()
        data=response.json()
        if data.get('error'): raise ValueError('La fuente devolvió un error; no se usarán datos parciales')
        return data

    def boundaries(self):
        return self._get(BOUNDARIES,{'where':"NOMBPROV='SATIPO'",'outFields':'UBIGEO,NOMBDIST,Anio','outSR':4326,'f':'geojson','returnGeometry':'true'})

    def weather(self, latitude, longitude, start, end):
        params={'latitude':latitude,'longitude':longitude,'start_date':start,'end_date':end,
                'daily':'temperature_2m_max,relative_humidity_2m_mean,precipitation_sum,wind_speed_10m_max',
                'timezone':'America/Lima','models':'era5','wind_speed_unit':'kmh'}
        return self._get(WEATHER,params),params

    def provenance(self):
        return [BOUNDARIES,WEATHER]
