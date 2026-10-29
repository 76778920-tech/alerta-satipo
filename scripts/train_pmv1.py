"""Experimento sintético reproducible; NO entrenado con incendios de campo."""
import json
from pathlib import Path
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import confusion_matrix, accuracy_score, f1_score

FEATURES=['temperature_c','humidity_pct','smoke_index','gas_index','dust_ugm3']
LABELS=['Normal','Advertencia','Emergencia']


def dataset(seed, count):
    rng=np.random.default_rng(seed)
    y=rng.integers(0,3,count)
    centers=np.array([[25,70,12,15,18],[34,48,42,40,90],[49,27,77,75,220]])
    scales=np.array([[7,16,9,10,20],[9,18,19,20,65],[12,16,19,20,110]])
    x=centers[y]+rng.normal(size=(count,5))*scales[y]
    # Polvo aislado en una parte de los escenarios normales: no equivale a fuego.
    mask=(y==0)&(rng.random(count)<0.2);x[mask,4]+=rng.uniform(70,180,mask.sum())
    x=np.clip(x,[-20,0,0,0,0],[80,100,100,100,1000]).astype(np.float32)
    return x,y


def train(output_root='.'):
    root=Path(output_root)
    train_x,train_y=dataset(20261026,3000)
    test_x,test_y=dataset(20261027,900)
    model=DecisionTreeClassifier(max_depth=6,min_samples_leaf=12,random_state=20261026).fit(train_x,train_y)
    predicted=model.predict(test_x)
    tree=model.tree_
    weights=tree.value[:,0,:];weights=weights/weights.sum(axis=1,keepdims=True)
    artifact={'version':'pmv1-synthetic-tree-v1','features':FEATURES,'labels':LABELS,'experimental':True,
        'left':tree.children_left.tolist(),'right':tree.children_right.tolist(),'feature':tree.feature.tolist(),
        'threshold':tree.threshold.tolist(),'scores':weights.tolist()}
    metrics={'version':artifact['version'],'provenance':'SYNTHETIC_ONLY','train_rows':3000,'test_rows':900,
        'train_seed':20261026,'test_seed':20261027,'features':FEATURES,'labels':LABELS,
        'accuracy':float(accuracy_score(test_y,predicted)),'f1_macro':float(f1_score(test_y,predicted,average='macro')),
        'confusion_matrix':confusion_matrix(test_y,predicted,labels=[0,1,2]).tolist(),
        'false_alarms':int(((test_y==0)&(predicted>0)).sum()),'normal_test_rows':int((test_y==0).sum()),
        'missed_emergencies':int(((test_y==2)&(predicted!=2)).sum()),
        'limitation':'Escenarios artificiales: no estima desempeño forestal, sensores, Edge Impulse ni ESP32-S3.'}
    for relative in ['backend/domain/pmv1-model.mjs','frontend/src/domain/pmv1-model.mjs']:
        path=root/relative;path.parent.mkdir(parents=True,exist_ok=True)
        path.write_text('// Generado por scripts/train_pmv1.py; datos exclusivamente sintéticos.\nexport default '+json.dumps(artifact,separators=(',',':'))+';\n',encoding='utf-8')
    folder=root/'colab/pmv1';folder.mkdir(parents=True,exist_ok=True)
    (folder/'evaluation.json').write_text(json.dumps(metrics,indent=2)+'\n',encoding='utf-8')
    fixtures=[{'x':x.tolist(),'expected':int(y)} for x,y in zip(test_x[:40],predicted[:40])]
    (folder/'parity.json').write_text(json.dumps(fixtures,indent=2)+'\n',encoding='utf-8')
    for name,x,y in [('train',train_x,train_y),('test',test_x,test_y)]:
        np.savetxt(folder/(name+'.csv'),np.column_stack([x,y]),delimiter=',',header=','.join(FEATURES+['label']),comments='',fmt='%.6f')
    cpp=['#pragma once','#include <math.h>','// SYNTHETIC_ONLY. No validación de campo.',
         'static constexpr const char* PMV1_MODEL_VERSION="'+artifact['version']+'";',
         'inline int pmv1_predict(const float x[5]) {']
    def emit(node,indent):
        if tree.children_left[node]<0:
            cpp.append(indent+'return '+str(int(weights[node].argmax()))+';');return
        cpp.append(indent+f'if (x[{tree.feature[node]}] <= {tree.threshold[node]:.17g}) {{')
        emit(tree.children_left[node],indent+'  ');cpp.append(indent+'} else {')
        emit(tree.children_right[node],indent+'  ');cpp.append(indent+'}')
    emit(0,'  ');cpp.append('}')
    path=root/'firmware/pmv1/include/generated_model.h';path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text('\n'.join(cpp)+'\n',encoding='utf-8')
    return metrics


if __name__=='__main__':
    print(json.dumps(train(),indent=2))
