"""Experimento sintético reproducible; no está entrenado ni validado con incendios de campo."""
import json
from pathlib import Path

import numpy as np
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score
from sklearn.tree import DecisionTreeClassifier

FEATURES = ['temperature_c', 'humidity_pct', 'smoke_index', 'gas_index', 'dust_ugm3']
LABELS = ['Normal', 'Advertencia', 'Emergencia']
TRAIN_ROWS, VALIDATION_ROWS, TEST_ROWS = 24000, 6000, 3000
TRAIN_SEED, VALIDATION_SEED, TEST_SEED = 20261109, 20261110, 20261111
CANDIDATES = [
    {'max_depth': 6, 'min_samples_leaf': 12},
    {'max_depth': 7, 'min_samples_leaf': 18},
    {'max_depth': 8, 'min_samples_leaf': 24},
    {'max_depth': 9, 'min_samples_leaf': 32},
    {'max_depth': 10, 'min_samples_leaf': 40},
]


def dataset(seed, count):
    rng = np.random.default_rng(seed)
    y = rng.integers(0, 3, count)
    centers = np.array([[25, 70, 12, 15, 18], [34, 48, 42, 40, 90], [49, 27, 77, 75, 220]])
    scales = np.array([[7, 16, 9, 10, 20], [9, 18, 19, 20, 65], [12, 16, 19, 20, 110]])
    x = centers[y] + rng.normal(size=(count, 5)) * scales[y]
    # Polvo aislado en algunos escenarios normales: no equivale a incendio.
    mask = (y == 0) & (rng.random(count) < 0.2)
    x[mask, 4] += rng.uniform(70, 180, mask.sum())
    return np.clip(x, [-20, 0, 0, 0, 0], [80, 100, 100, 100, 1000]).astype(np.float32), y


def evaluate(actual, predicted):
    return {
        'accuracy': float(accuracy_score(actual, predicted)),
        'f1_macro': float(f1_score(actual, predicted, average='macro')),
        'confusion_matrix': confusion_matrix(actual, predicted, labels=[0, 1, 2]).tolist(),
        'false_alarms': int(((actual == 0) & (predicted > 0)).sum()),
        'normal_rows': int((actual == 0).sum()),
        'missed_emergencies': int(((actual == 2) & (predicted != 2)).sum()),
    }


def select_parameters(train_x, train_y, validation_x, validation_y):
    evaluations = []
    for candidate in CANDIDATES:
        model = DecisionTreeClassifier(random_state=TRAIN_SEED, **candidate).fit(train_x, train_y)
        result = {**candidate, **evaluate(validation_y, model.predict(validation_x))}
        evaluations.append(result)
    # La selección usa únicamente validación: mayor F1 macro, luego menos emergencias omitidas y falsas alarmas.
    selected = max(evaluations, key=lambda item: (item['f1_macro'], item['accuracy'], -item['missed_emergencies'], -item['false_alarms']))
    return {key: selected[key] for key in ('max_depth', 'min_samples_leaf')}, evaluations


def train(output_root='.'):
    root = Path(output_root)
    train_x, train_y = dataset(TRAIN_SEED, TRAIN_ROWS)
    validation_x, validation_y = dataset(VALIDATION_SEED, VALIDATION_ROWS)
    test_x, test_y = dataset(TEST_SEED, TEST_ROWS)
    parameters, validation_candidates = select_parameters(train_x, train_y, validation_x, validation_y)
    model = DecisionTreeClassifier(random_state=TRAIN_SEED, **parameters).fit(train_x, train_y)
    predicted = model.predict(test_x)
    tree = model.tree_
    weights = tree.value[:, 0, :]
    weights = weights / weights.sum(axis=1, keepdims=True)
    artifact = {
        'version': 'pmv1-synthetic-tree-v2', 'features': FEATURES, 'labels': LABELS,
        'experimental': True, 'selection': parameters,
        'left': tree.children_left.tolist(), 'right': tree.children_right.tolist(),
        'feature': tree.feature.tolist(), 'threshold': tree.threshold.tolist(), 'scores': weights.tolist(),
    }
    metrics = {
        'version': artifact['version'], 'provenance': 'SYNTHETIC_ONLY',
        'train_rows': TRAIN_ROWS, 'validation_rows': VALIDATION_ROWS, 'test_rows': TEST_ROWS,
        'train_seed': TRAIN_SEED, 'validation_seed': VALIDATION_SEED, 'test_seed': TEST_SEED,
        'features': FEATURES, 'labels': LABELS, 'selection': {
            'rule': 'Mayor F1 macro en validación; desempate por exactitud, menos emergencias omitidas y menos falsas alarmas.',
            'selected': parameters, 'candidates': validation_candidates,
        },
        **evaluate(test_y, predicted),
        'normal_test_rows': int((test_y == 0).sum()),
        'limitation': 'Escenarios artificiales: no estima desempeño forestal, sensores, Edge Impulse ni ESP32-S3. La prueba se mantuvo separada de la selección.',
    }
    for relative in ['backend/domain/pmv1-model.mjs', 'frontend/src/domain/pmv1-model.mjs']:
        path = root / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text('// Generado por scripts/train_pmv1.py; datos exclusivamente sintéticos.\nexport default ' + json.dumps(artifact, separators=(',', ':')) + ';\n', encoding='utf-8')
    folder = root / 'colab/pmv1'
    folder.mkdir(parents=True, exist_ok=True)
    (folder / 'evaluation.json').write_text(json.dumps(metrics, indent=2) + '\n', encoding='utf-8')
    fixtures = [{'x': x.tolist(), 'expected': int(y)} for x, y in zip(test_x[:40], predicted[:40])]
    (folder / 'parity.json').write_text(json.dumps(fixtures, indent=2) + '\n', encoding='utf-8')
    for name, x, y in [('train', train_x, train_y), ('validation', validation_x, validation_y), ('test', test_x, test_y)]:
        np.savetxt(folder / (name + '.csv'), np.column_stack([x, y]), delimiter=',', header=','.join(FEATURES + ['label']), comments='', fmt='%.6f')
    cpp = ['#pragma once', '#include <math.h>', '// SYNTHETIC_ONLY. No validación de campo.',
           f'static constexpr const char* PMV1_MODEL_VERSION="{artifact["version"]}";', 'inline int pmv1_predict(const float x[5]) {']
    def emit(node, indent):
        if tree.children_left[node] < 0:
            cpp.append(indent + 'return ' + str(int(weights[node].argmax())) + ';')
            return
        cpp.append(indent + f'if (x[{tree.feature[node]}] <= {tree.threshold[node]:.17g}) {{')
        emit(tree.children_left[node], indent + '  ')
        cpp.append(indent + '} else {')
        emit(tree.children_right[node], indent + '  ')
        cpp.append(indent + '}')
    emit(0, '  ')
    cpp.append('}')
    path = root / 'firmware/pmv1/include/generated_model.h'
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text('\n'.join(cpp) + '\n', encoding='utf-8')
    return metrics


if __name__ == '__main__':
    print(json.dumps(train(), indent=2))
