from territorial.domain.training import inspect, partitions, FEATURES
from territorial.application.ports import ResearchInput, ResearchFiles, ExperimentModel

def run_experiment(frame, learner):
    train,test,cutoff=partitions(frame)
    model,scores,reference=learner.fit_predict(train,test,FEATURES)
    predictions=scores>=0.5
    report={**learner.versions(),'scope':'EXPERIMENT_ONLY_NOT_OPERATIONAL','features':FEATURES,'threshold':0.5,'train_rows':len(train),'test_rows':len(test),'cutoff_utc':cutoff.isoformat(),
        'model':learner.evaluate(test.target,predictions,scores),'baseline':learner.evaluate(test.target,reference>=0.5,reference),
        'per_district':{},'operational_approval':False,
        'limitations':['Inputs are retrospective reanalysis, not verified as available at issue time','Small exploratory temporal holdout does not establish safety','Vegetation, spatial coverage and prospective calibration are pending']}
    for code in sorted(test.ubigeo.astype(str).unique()):
        mask=test.ubigeo.astype(str).eq(code).to_numpy()
        report['per_district'][code]={'rows':int(mask.sum()),'positive_rows':int(test.loc[mask,'target'].sum()),**learner.evaluate(test.loc[mask,'target'],predictions[mask],scores[mask])}
    output=test[['ubigeo','issued_at_local']].copy();output['actual']=test.target.astype(int)
    output['predicted']=predictions;output['uncalibrated_score']=scores;output['scope']='EXPERIMENT_ONLY_NOT_OPERATIONAL'
    return model,report,output


class TrainTerritory:
    def __init__(self, inputs: ResearchInput, files: ResearchFiles, learner: ExperimentModel):
        self.inputs,self.files,self.learner=inputs,files,learner

    def execute(self, dataset, experiment=False):
        frame=self.inputs.read_frame(dataset,dtype={'ubigeo':str})
        digest=self.inputs.digest(dataset)
        readiness={**inspect(frame),'input_sha256':digest}
        self.files.write_json('readiness.json',readiness)
        if experiment:
            self.files.write_json('status.json',{'state':'incomplete','operational_approval':False})
            model,report,predictions=run_experiment(frame,self.learner)
            report['input_sha256']=digest
            self.files.write_json('evaluation.json',report)
            self.files.write_frame('experimental_predictions.csv',predictions)
            self.files.write_json('status.json',{'state':'experiment_complete','operational_approval':False})
        return readiness
