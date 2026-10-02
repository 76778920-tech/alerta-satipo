from datetime import date
import pandas as pd
from territorial.application.ports import GeographySource, ResearchFiles, ResearchInput, Clock
from territorial.domain.geography import validate_boundaries, weather_frame, classify_detections, representative_point


class PrepareTerritory:
    def __init__(self, source: GeographySource, files: ResearchFiles, inputs: ResearchInput, clock: Clock):
        self.source,self.files,self.inputs,self.clock=source,files,inputs,clock

    def execute(self, start, end, firms=None):
        if date.fromisoformat(start)>date.fromisoformat(end): raise ValueError('Fechas invertidas')
        self.files.write_json('status.json',{'state':'incomplete','training_allowed':False})
        boundaries=self.source.boundaries()
        features=validate_boundaries(boundaries)
        self.files.write_json('districts.geojson',boundaries)
        names=['districts.geojson','district_day_research.csv']
        frames=[]
        catalog=[]
        for feature in sorted(features,key=lambda f:f['properties']['UBIGEO']):
            prop=feature['properties']
            latitude,longitude=representative_point(feature)
            weather,request=self.source.weather(latitude,longitude,start,end)
            frames.append(weather_frame(weather,start,end,prop['UBIGEO']))
            name=prop['UBIGEO']+'_weather.json'
            self.files.write_json(name,weather)
            names.append(name)
            catalog.append({'ubigeo':prop['UBIGEO'],'district':prop['NOMBDIST'],'sample_latitude':latitude,
                            'sample_longitude':longitude,'sampling':'one interior point; not a district-wide average','weather_request':request})
        self.files.write_frame('district_day_research.csv',pd.concat(frames,ignore_index=True))
        diagnostics=None
        if firms:
            detections,diagnostics=classify_detections(self.inputs.read_firms(firms),features)
            self.files.write_json('thermal_anomalies.json',detections)
            names.append('thermal_anomalies.json')
        manifest={'start':start,'end':end,'districts':catalog,'rows':sum(len(f) for f in frames),
                  'sources':self.source.provenance(),'retrieved_at':self.clock.now(),'sha256':self.files.hashes(names),
                  'firms_diagnostics':diagnostics,'firms_input_sha256':self.inputs.digest(firms) if firms else None,
                  'blockers':['No verified event labels or negative observation coverage','Reanalysis availability is retrospective',
                              'Vegetation and district-wide weather coverage not integrated','No independent prospective validation'],
                  'training_allowed':False,'state':'research_data_ready_not_trainable'}
        self.files.write_json('manifest.json',manifest)
        self.files.write_json('status.json',{'state':manifest['state'],'training_allowed':False})
        return manifest
