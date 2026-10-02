import platform
import sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.dummy import DummyClassifier
from sklearn.metrics import confusion_matrix,balanced_accuracy_score,precision_score,recall_score,brier_score_loss
from sklearn.pipeline import make_pipeline
from sklearn.impute import SimpleImputer
from territorial.application.ports import ExperimentModel

def evaluate(actual,predicted,score):
    return {'confusion_matrix':confusion_matrix(actual,predicted,labels=[0,1]).tolist(),
        'balanced_accuracy':float(balanced_accuracy_score(actual,predicted)),
        'precision_alarm':float(precision_score(actual,predicted,zero_division=0)),
        'recall_alarm':float(recall_score(actual,predicted,zero_division=0)),
        'brier_score':float(brier_score_loss(actual,score))}


class SklearnExperiment(ExperimentModel):
    def versions(self):
        return {'python_version':platform.python_version(),'sklearn_version':sklearn.__version__}

    def evaluate(self, actual, predicted, score):
        return evaluate(actual,predicted,score)

    def fit_predict(self,train,test,features):
        model=make_pipeline(SimpleImputer(strategy='median'),RandomForestClassifier(n_estimators=200,max_depth=5,min_samples_leaf=5,class_weight='balanced',random_state=20260929,n_jobs=-1))
        model.fit(train[features],train.target)
        baseline=DummyClassifier(strategy='prior').fit(train[features],train.target)
        scores=model.predict_proba(test[features])[:,list(model.classes_).index(1)]
        reference=baseline.predict_proba(test[features])[:,list(baseline.classes_).index(1)]
        return model,scores,reference
