// Generado por npm run build:api. Editar backend/, no este archivo.
// backend/application/ports/out/prediction-results.mjs
var PredictionResultsPort = class {
  async results() {
    throw new Error("PredictionResultsPort.results");
  }
};

// backend/adapters/out/prediction-results.json
var prediction_results_default = {
  version: "rf-20260926-eval-v1",
  dataset_id: "smoke-detection-iot-300-v1",
  evaluation: {
    dataset_sha256: "805fc268e338964e489b2e76f39206c4a7b90140d2e9838faafd27c513168a23",
    train_rows: 240,
    test_rows: 60,
    split: "chronological_80_20",
    features: [
      "temperature_c",
      "humidity_pct",
      "tvoc_ppb",
      "eco2_ppm",
      "raw_h2",
      "raw_ethanol",
      "pressure_hpa",
      "pm1_0",
      "pm2_5",
      "nc0_5",
      "nc1_0",
      "nc2_5"
    ],
    random_forest: {
      accuracy: 0.9,
      balanced_accuracy: 0.9057239057239057,
      precision_alarm: 0.9655172413793104,
      recall_alarm: 0.8484848484848485,
      f1_alarm: 0.9032258064516129
    },
    baseline: {
      accuracy: 0.55,
      balanced_accuracy: 0.5,
      precision_alarm: 0.55,
      recall_alarm: 1,
      f1_alarm: 0.7096774193548387
    },
    roc_auc: 0.8754208754208753,
    confusion_matrix: [
      [
        26,
        1
      ],
      [
        5,
        28
      ]
    ],
    sklearn_version: "1.5.2",
    notice: "Experimental historical classification; not calibrated wildfire probability."
  },
  rows: [
    {
      source_row: 43422,
      recorded_at: "2022-06-09T13:02:51+00:00",
      actual: true,
      predicted: true,
      score: 0.9812062384952048
    },
    {
      source_row: 43460,
      recorded_at: "2022-06-09T13:03:29+00:00",
      actual: true,
      predicted: true,
      score: 1
    },
    {
      source_row: 43496,
      recorded_at: "2022-06-09T13:04:05+00:00",
      actual: true,
      predicted: true,
      score: 0.9707134335450868
    },
    {
      source_row: 44621,
      recorded_at: "2022-06-09T13:22:50+00:00",
      actual: true,
      predicted: true,
      score: 0.9840724301024892
    },
    {
      source_row: 44643,
      recorded_at: "2022-06-09T13:23:12+00:00",
      actual: true,
      predicted: true,
      score: 0.95291108274321
    },
    {
      source_row: 44657,
      recorded_at: "2022-06-09T13:23:26+00:00",
      actual: true,
      predicted: true,
      score: 0.9872666100274802
    },
    {
      source_row: 45174,
      recorded_at: "2022-06-09T13:32:03+00:00",
      actual: true,
      predicted: true,
      score: 0.8657885997385036
    },
    {
      source_row: 45220,
      recorded_at: "2022-06-09T13:32:49+00:00",
      actual: true,
      predicted: true,
      score: 0.987244617961904
    },
    {
      source_row: 45260,
      recorded_at: "2022-06-09T13:33:29+00:00",
      actual: true,
      predicted: true,
      score: 0.9940405598383305
    },
    {
      source_row: 45731,
      recorded_at: "2022-06-09T13:41:20+00:00",
      actual: true,
      predicted: true,
      score: 0.9921349405425492
    },
    {
      source_row: 45824,
      recorded_at: "2022-06-09T13:42:53+00:00",
      actual: true,
      predicted: true,
      score: 0.9631093269249467
    },
    {
      source_row: 45858,
      recorded_at: "2022-06-09T13:43:27+00:00",
      actual: true,
      predicted: true,
      score: 0.9968678688334248
    },
    {
      source_row: 46318,
      recorded_at: "2022-06-09T13:51:07+00:00",
      actual: true,
      predicted: true,
      score: 0.9804148821947704
    },
    {
      source_row: 46658,
      recorded_at: "2022-06-09T13:56:47+00:00",
      actual: true,
      predicted: true,
      score: 0.9748280782565732
    },
    {
      source_row: 46681,
      recorded_at: "2022-06-09T13:57:10+00:00",
      actual: true,
      predicted: true,
      score: 0.9587039303301053
    },
    {
      source_row: 46836,
      recorded_at: "2022-06-09T13:59:45+00:00",
      actual: true,
      predicted: true,
      score: 0.9776658122795417
    },
    {
      source_row: 47053,
      recorded_at: "2022-06-09T14:03:22+00:00",
      actual: true,
      predicted: true,
      score: 0.9911968742665545
    },
    {
      source_row: 47924,
      recorded_at: "2022-06-09T14:17:53+00:00",
      actual: true,
      predicted: true,
      score: 0.9795581938024676
    },
    {
      source_row: 48015,
      recorded_at: "2022-06-09T14:19:24+00:00",
      actual: true,
      predicted: true,
      score: 0.9938911473784149
    },
    {
      source_row: 48038,
      recorded_at: "2022-06-09T14:19:47+00:00",
      actual: true,
      predicted: true,
      score: 0.9813717818363473
    },
    {
      source_row: 48084,
      recorded_at: "2022-06-09T14:20:33+00:00",
      actual: true,
      predicted: true,
      score: 0.9955764360190108
    },
    {
      source_row: 48271,
      recorded_at: "2022-06-09T14:23:40+00:00",
      actual: true,
      predicted: true,
      score: 0.9838244670141414
    },
    {
      source_row: 48574,
      recorded_at: "2022-06-09T14:28:43+00:00",
      actual: true,
      predicted: true,
      score: 0.9938911473784149
    },
    {
      source_row: 48611,
      recorded_at: "2022-06-09T14:29:20+00:00",
      actual: true,
      predicted: true,
      score: 0.9896209482293143
    },
    {
      source_row: 49022,
      recorded_at: "2022-06-09T14:36:11+00:00",
      actual: true,
      predicted: true,
      score: 0.961790452592575
    },
    {
      source_row: 49265,
      recorded_at: "2022-06-09T14:40:14+00:00",
      actual: true,
      predicted: true,
      score: 0.9729478502513519
    },
    {
      source_row: 49385,
      recorded_at: "2022-06-09T14:42:14+00:00",
      actual: true,
      predicted: true,
      score: 0.9571533193488068
    },
    {
      source_row: 49633,
      recorded_at: "2022-06-09T14:46:22+00:00",
      actual: true,
      predicted: true,
      score: 0.9954682738758827
    },
    {
      source_row: 50414,
      recorded_at: "2022-06-10T23:23:51+00:00",
      actual: true,
      predicted: false,
      score: 0.2560169630556559
    },
    {
      source_row: 50420,
      recorded_at: "2022-06-10T23:23:57+00:00",
      actual: true,
      predicted: false,
      score: 0.2560169630556559
    },
    {
      source_row: 50750,
      recorded_at: "2022-06-10T23:29:27+00:00",
      actual: true,
      predicted: false,
      score: 0.02103587976325579
    },
    {
      source_row: 51080,
      recorded_at: "2022-06-10T23:34:57+00:00",
      actual: true,
      predicted: false,
      score: 0.036012211365626316
    },
    {
      source_row: 51135,
      recorded_at: "2022-06-10T23:35:52+00:00",
      actual: true,
      predicted: false,
      score: 0.016970562654996413
    },
    {
      source_row: 57318,
      recorded_at: "2022-06-13T12:52:20+00:00",
      actual: false,
      predicted: false,
      score: 0.11653170675995468
    },
    {
      source_row: 58013,
      recorded_at: "2022-06-13T13:03:55+00:00",
      actual: false,
      predicted: false,
      score: 0.2568063992759007
    },
    {
      source_row: 58048,
      recorded_at: "2022-06-13T13:04:30+00:00",
      actual: false,
      predicted: false,
      score: 0.3441057841825618
    },
    {
      source_row: 58260,
      recorded_at: "2022-06-13T13:08:02+00:00",
      actual: false,
      predicted: false,
      score: 0.2479727318305627
    },
    {
      source_row: 58420,
      recorded_at: "2022-06-13T13:10:42+00:00",
      actual: false,
      predicted: false,
      score: 0.32196990251590357
    },
    {
      source_row: 58563,
      recorded_at: "2022-06-13T13:13:05+00:00",
      actual: false,
      predicted: false,
      score: 0.25553230730881993
    },
    {
      source_row: 58650,
      recorded_at: "2022-06-13T13:14:32+00:00",
      actual: false,
      predicted: false,
      score: 0.2652478225836364
    },
    {
      source_row: 58882,
      recorded_at: "2022-06-13T13:18:24+00:00",
      actual: false,
      predicted: false,
      score: 0.35633043900510813
    },
    {
      source_row: 59162,
      recorded_at: "2022-06-13T13:23:04+00:00",
      actual: false,
      predicted: false,
      score: 0.26025640208900425
    },
    {
      source_row: 59435,
      recorded_at: "2022-06-13T13:27:37+00:00",
      actual: false,
      predicted: false,
      score: 0.17943396836435158
    },
    {
      source_row: 59517,
      recorded_at: "2022-06-13T13:28:59+00:00",
      actual: false,
      predicted: false,
      score: 0.23668453704176712
    },
    {
      source_row: 59930,
      recorded_at: "2022-06-13T13:35:52+00:00",
      actual: false,
      predicted: false,
      score: 0.20147814275228143
    },
    {
      source_row: 59937,
      recorded_at: "2022-06-13T13:35:59+00:00",
      actual: false,
      predicted: false,
      score: 0.17698759730223437
    },
    {
      source_row: 60261,
      recorded_at: "2022-06-13T13:41:23+00:00",
      actual: false,
      predicted: false,
      score: 0.4344520735711266
    },
    {
      source_row: 60652,
      recorded_at: "2022-06-13T13:47:54+00:00",
      actual: false,
      predicted: false,
      score: 0.21260730771678002
    },
    {
      source_row: 60931,
      recorded_at: "2022-06-13T13:52:33+00:00",
      actual: false,
      predicted: true,
      score: 0.510556580484293
    },
    {
      source_row: 61394,
      recorded_at: "2022-06-13T14:00:16+00:00",
      actual: false,
      predicted: false,
      score: 0.24340421770202905
    },
    {
      source_row: 61397,
      recorded_at: "2022-06-13T14:00:19+00:00",
      actual: false,
      predicted: false,
      score: 0.24966020019466637
    },
    {
      source_row: 61487,
      recorded_at: "2022-06-13T14:01:49+00:00",
      actual: false,
      predicted: false,
      score: 0.24398207722803078
    },
    {
      source_row: 61658,
      recorded_at: "2022-06-13T14:04:40+00:00",
      actual: false,
      predicted: false,
      score: 0.12879314384072915
    },
    {
      source_row: 61721,
      recorded_at: "2022-06-13T14:05:43+00:00",
      actual: false,
      predicted: false,
      score: 0.37326754776413656
    },
    {
      source_row: 61748,
      recorded_at: "2022-06-13T14:06:10+00:00",
      actual: false,
      predicted: false,
      score: 0.32162605199184974
    },
    {
      source_row: 61755,
      recorded_at: "2022-06-13T14:06:17+00:00",
      actual: false,
      predicted: false,
      score: 0.32162605199184974
    },
    {
      source_row: 61935,
      recorded_at: "2022-06-13T14:09:17+00:00",
      actual: false,
      predicted: false,
      score: 0.32162605199184974
    },
    {
      source_row: 62133,
      recorded_at: "2022-06-13T14:12:35+00:00",
      actual: false,
      predicted: false,
      score: 0.32162605199184974
    },
    {
      source_row: 62263,
      recorded_at: "2022-06-13T14:14:45+00:00",
      actual: false,
      predicted: false,
      score: 0.4009477343020645
    },
    {
      source_row: 62500,
      recorded_at: "2022-06-13T14:18:42+00:00",
      actual: false,
      predicted: false,
      score: 0.41088944262567273
    }
  ]
};

// backend/adapters/out/predictions.mjs
var PublishedPredictionResults = class extends PredictionResultsPort {
  async results() {
    return structuredClone(prediction_results_default);
  }
};

// backend/bootstrap.mjs
import { createClient } from "npm:@supabase/supabase-js@2.117.1";

// backend/domain/errors.mjs
var ApplicationError = class extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
};

// backend/domain/operation.mjs
var states = Object.freeze({
  maintenance: ["Pendiente", "En progreso", "Completada"],
  cases: ["Pendiente", "En revisi\xF3n", "Revisado"],
  incidents: ["Nuevo", "En revisi\xF3n", "Validado", "Falso positivo"]
});
var OperationalRecord = class _OperationalRecord {
  constructor(kind, id, state) {
    const validId = typeof id === "string" && (kind === "incidents" ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) : /^V-0[1-6]$/.test(id));
    if (!validId || !Object.hasOwn(states, kind) || !states[kind].includes(state)) throw new ApplicationError("VALIDATION", "Identificador o estado no permitido.");
    this.kind = kind;
    this.id = id;
    this.state = state;
    Object.freeze(this);
  }
  changeState(state) {
    return new _OperationalRecord(this.kind, this.id, state);
  }
};
function changeCommand(kind, id, expectedState, nextState) {
  const current = new OperationalRecord(kind, id, expectedState);
  const next = current.changeState(nextState);
  return Object.freeze({ kind, id, expectedState: current.state, nextState: next.state });
}
function validateThresholds(value) {
  requireObject(value);
  const bounds2 = { temp_critical: [20, 55], smoke_critical: [Number.MIN_VALUE, 100], humidity_dry: [10, 90], wind_risk: [1, 80] };
  const result = {};
  for (const [key, [min, max]] of Object.entries(bounds2)) {
    if (typeof value[key] !== "number" || !Number.isFinite(value[key]) || value[key] < min || value[key] > max) throw new ApplicationError("VALIDATION", "Umbrales fuera del rango permitido.");
    result[key] = value[key];
  }
  return Object.freeze(result);
}
function requireObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ApplicationError("VALIDATION", "Se requiere un objeto de datos.");
}

// backend/application/ports/in/admin-use-cases.mjs
var AdminUseCases = class {
  async savePmv1(token, input) {
    throw new Error("AdminUseCases.savePmv1");
  }
  async listPmv1(token) {
    throw new Error("AdminUseCases.listPmv1");
  }
  async getEnvironment(token) {
    throw new Error("AdminUseCases.getEnvironment");
  }
  async listPredictions(token) {
    throw new Error("AdminUseCases.listPredictions");
  }
  async listReadings(token) {
    throw new Error("AdminUseCases.listReadings");
  }
  async listOperations(token) {
    throw new Error("AdminUseCases.listOperations");
  }
  async getActivity(token) {
    throw new Error("AdminUseCases.getActivity");
  }
  async updateState(token, kind, id, input) {
    throw new Error("AdminUseCases.updateState");
  }
  async updateSettings(token, input) {
    throw new Error("AdminUseCases.updateSettings");
  }
};

// backend/domain/pmv1-model.mjs
var pmv1_model_default = { "version": "pmv1-synthetic-tree-v1", "features": ["temperature_c", "humidity_pct", "smoke_index", "gas_index", "dust_ugm3"], "labels": ["Normal", "Advertencia", "Emergencia"], "experimental": true, "left": [1, 2, 3, 4, 5, 6, -1, -1, -1, 10, 11, -1, -1, -1, 15, 16, 17, -1, -1, 20, -1, -1, 23, -1, -1, 26, 27, 28, 29, -1, -1, 32, -1, -1, -1, 36, -1, -1, 39, 40, 41, 42, 43, -1, -1, 46, -1, -1, 49, 50, -1, -1, -1, 54, 55, 56, -1, -1, -1, 60, -1, -1, 63, 64, 65, 66, -1, -1, -1, 70, 71, -1, -1, -1, 75, 76, 77, -1, -1, -1, 81, 82, -1, -1, 85, -1, -1], "right": [38, 25, 14, 9, 8, 7, -1, -1, -1, 13, 12, -1, -1, -1, 22, 19, 18, -1, -1, 21, -1, -1, 24, -1, -1, 35, 34, 31, 30, -1, -1, 33, -1, -1, -1, 37, -1, -1, 62, 53, 48, 45, 44, -1, -1, 47, -1, -1, 52, 51, -1, -1, -1, 59, 58, 57, -1, -1, -1, 61, -1, -1, 74, 69, 68, 67, -1, -1, -1, 73, 72, -1, -1, -1, 80, 79, 78, -1, -1, -1, 84, 83, -1, -1, 86, -1, -1], "feature": [2, 3, 1, 4, 2, 0, -2, -2, -2, 0, 3, -2, -2, -2, 0, 0, 2, -2, -2, 4, -2, -2, 4, -2, -2, 1, 3, 4, 0, -2, -2, 0, -2, -2, -2, 4, -2, -2, 3, 4, 2, 2, 4, -2, -2, 0, -2, -2, 1, 0, -2, -2, -2, 0, 4, 4, -2, -2, -2, 2, -2, -2, 2, 4, 0, 1, -2, -2, -2, 1, 1, -2, -2, -2, 0, 1, 3, -2, -2, -2, 1, 2, -2, -2, 2, -2, -2], "threshold": [28.470335960388184, 33.222251892089844, 47.2463321685791, 48.10173416137695, 17.44183349609375, 30.688135147094727, -2, -2, -2, 33.925771713256836, 17.45177936553955, -2, -2, -2, 39.31193733215332, 35.715349197387695, 22.361757278442383, -2, -2, 50.21355438232422, -2, -2, 49.19426918029785, -2, -2, 64.57579803466797, 76.20793914794922, 21.544191360473633, 35.03434181213379, -2, -2, 47.51317024230957, -2, -2, -2, 57.331966400146484, -2, -2, 54.29111289978027, 191.45748901367188, 77.3489875793457, 33.8106575012207, 39.54125213623047, -2, -2, 52.38118553161621, -2, -2, 41.92910575866699, 44.519968032836914, -2, -2, -2, 40.05462074279785, 248.16212463378906, 216.69742584228516, -2, -2, -2, 62.16301155090332, -2, -2, 52.44999885559082, 179.8333282470703, 48.66708755493164, 26.094680786132812, -2, -2, -2, 46.145559310913086, 35.28714179992676, -2, -2, -2, 35.289249420166016, 49.433441162109375, 65.02591323852539, -2, -2, -2, 43.723520278930664, 57.1257438659668, -2, -2, 60.688093185424805, -2, -2], "scores": [[0.334, 0.33266666666666667, 0.3333333333333333], [0.7937551355792933, 0.19967132292522596, 0.00657354149548069], [0.9205103042198234, 0.07948969578017664, 0], [0.576271186440678, 0.423728813559322, 0], [0.8260869565217391, 0.17391304347826086, 0], [0.92, 0.08, 0], [0.9736842105263158, 0.02631578947368421, 0], [0.75, 0.25, 0], [0.5789473684210527, 0.42105263157894735, 0], [0.22448979591836735, 0.7755102040816326, 0], [0.36666666666666664, 0.6333333333333333, 0], [0.5, 0.5, 0], [0.21428571428571427, 0.7857142857142857, 0], [0, 1, 0], [0.9655937846836848, 0.03440621531631521, 0], [0.9827784156142365, 0.01722158438576349, 0], [0.9914841849148418, 0.00851581508515815, 0], [0.9972972972972973, 0.002702702702702703, 0], [0.9390243902439024, 0.06097560975609756, 0], [0.8367346938775511, 0.16326530612244897, 0], [0.9714285714285714, 0.02857142857142857, 0], [0.5, 0.5, 0], [0.4666666666666667, 0.5333333333333333, 0], [0.8571428571428571, 0.14285714285714285, 0], [0.125, 0.875, 0], [0.1414141414141414, 0.8181818181818182, 0.04040404040404041], [0.06172839506172839, 0.8888888888888888, 0.04938271604938271], [0.06711409395973154, 0.9194630872483222, 0.013422818791946308], [0.2692307692307692, 0.7307692307692307, 0], [0.5, 0.5, 0], [0.07142857142857142, 0.9285714285714286, 0], [0.024390243902439025, 0.959349593495935, 0.016260162601626018], [0.02702702702702703, 0.972972972972973, 0], [0, 0.8333333333333334, 0.16666666666666666], [0, 0.5384615384615384, 0.46153846153846156], [0.5, 0.5, 0], [0.9230769230769231, 0.07692307692307693, 0], [0.2608695652173913, 0.7391304347826086, 0], [0.020190689848569827, 0.42344363432417276, 0.5563656758272574], [0.04580152671755725, 0.7659033078880407, 0.18829516539440203], [0.05239520958083832, 0.8592814371257484, 0.08832335329341318], [0.05663430420711974, 0.8996763754045307, 0.043689320388349516], [0.25892857142857145, 0.7410714285714286, 0], [0.6363636363636364, 0.36363636363636365, 0], [0.10126582278481013, 0.8987341772151899, 0], [0.011857707509881422, 0.9347826086956522, 0.0533596837944664], [0.012219959266802445, 0.9490835030549899, 0.03869653767820774], [0, 0.4666666666666667, 0.5333333333333333], [0, 0.36, 0.64], [0, 0.17647058823529413, 0.8235294117647058], [0, 0.375, 0.625], [0, 0, 1], [0, 0.75, 0.25], [0.00847457627118644, 0.23728813559322035, 0.7542372881355932], [0.02631578947368421, 0.631578947368421, 0.34210526315789475], [0.04, 0.84, 0.12], [0.07692307692307693, 0.9230769230769231, 0], [0, 0.75, 0.25], [0, 0.23076923076923078, 0.7692307692307693], [0, 0.05, 0.95], [0, 0.2222222222222222, 0.7777777777777778], [0, 0, 1], [0, 0.1534603811434303, 0.8465396188565697], [0, 0.5573770491803278, 0.4426229508196721], [0, 0.7661290322580645, 0.23387096774193547], [0, 0.8737864077669902, 0.1262135922330097], [0, 0.5, 0.5], [0, 0.9230769230769231, 0.07692307692307693], [0, 0.23809523809523808, 0.7619047619047619], [0, 0.11864406779661017, 0.8813559322033898], [0, 0.02127659574468085, 0.9787234042553191], [0, 0, 1], [0, 0.08333333333333333, 0.9166666666666666], [0, 0.5, 0.5], [0, 0.06265356265356266, 0.9373464373464373], [0, 0.25925925925925924, 0.7407407407407407], [0, 0.17647058823529413, 0.8235294117647058], [0, 0.6111111111111112, 0.3888888888888889], [0, 0.09900990099009901, 0.900990099009901], [0, 0.875, 0.125], [0, 0.023564064801178203, 0.9764359351988218], [0, 0.0034662045060658577, 0.9965337954939342], [0, 0.05555555555555555, 0.9444444444444444], [0, 0, 1], [0, 0.13725490196078433, 0.8627450980392157], [0, 0.4, 0.6], [0, 0.07317073170731707, 0.926829268292683]] };

// backend/domain/pmv1.mjs
var bounds = [[-20, 80], [0, 100], [0, 100], [0, 100], [0, 1e3]];
function validatePmv1(input) {
  const fail = () => {
    throw new ApplicationError("VALIDATION", "Registro PMV1 inv\xE1lido: se requieren cinco variables completas y dentro de rango.");
  };
  if (!input || Array.isArray(input) || !input.values || Array.isArray(input.values)) fail();
  if (input.device_prediction && input.device_prediction.model_version !== pmv1_model_default.version)
    throw new ApplicationError("VALIDATION", "La exportaci\xF3n del dispositivo usa otro modelo. Se requiere integrar y validar esa versi\xF3n antes de importar sus lecturas.");
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuid.test(input.id) || !uuid.test(input.node_id) || !["simulation", "sensor"].includes(input.source)) fail();
  if (typeof input.observed_at !== "string" || !/(Z|[+-]\d{2}:\d{2})$/.test(input.observed_at) || !Number.isFinite(Date.parse(input.observed_at))) fail();
  if (Object.keys(input.values).length !== 5) fail();
  const values = {};
  pmv1_model_default.features.forEach((key, i) => {
    const value = input.values[key];
    if (typeof value !== "number" || !Number.isFinite(value) || value < bounds[i][0] || value > bounds[i][1]) fail();
    values[key] = value;
  });
  return { id: input.id, node_id: input.node_id, source: input.source, observed_at: new Date(input.observed_at).toISOString(), values };
}
function evaluatePmv1(input) {
  const reading = validatePmv1(input), x = pmv1_model_default.features.map((key) => Math.fround(reading.values[key]));
  let n = 0;
  while (pmv1_model_default.left[n] >= 0) n = x[pmv1_model_default.feature[n]] <= pmv1_model_default.threshold[n] ? pmv1_model_default.left[n] : pmv1_model_default.right[n];
  const scores = pmv1_model_default.scores[n], index = scores.indexOf(Math.max(...scores));
  return {
    reading,
    prediction: { level: pmv1_model_default.labels[index], scores, model_version: pmv1_model_default.version, experimental: true },
    alert: index === 0 ? null : { level: pmv1_model_default.labels[index], channel: "software", experimental: true }
  };
}

// backend/application/use-cases/admin-service.mjs
var AdminService = class extends AdminUseCases {
  constructor({ identity, repository, predictions, environment }) {
    super();
    this.identity = identity;
    this.repository = repository;
    this.predictions = predictions;
    this.environment = environment;
  }
  async getEnvironment(token) {
    await this.authorize(token);
    if (!this.environment) throw new ApplicationError("UNAVAILABLE", "Fuentes ambientales no configuradas.");
    return this.environment.snapshot();
  }
  async listPredictions(token) {
    await this.authorize(token);
    if (!this.predictions) throw new ApplicationError("UNAVAILABLE", "Resultados no disponibles.");
    return this.predictions.results();
  }
  async authorize(token) {
    const actor = await this.identity.authenticate(token);
    if (!actor) throw new ApplicationError("UNAUTHENTICATED", "Inicia sesi\xF3n nuevamente.");
    if (actor.isAdmin !== true) throw new ApplicationError("FORBIDDEN", "Se requiere autorizaci\xF3n administrativa.");
    return actor;
  }
  async listReadings(token) {
    await this.authorize(token);
    return this.repository.readings();
  }
  async savePmv1(token, input) {
    await this.authorize(token);
    return this.repository.savePmv1(evaluatePmv1(input));
  }
  async listPmv1(token) {
    await this.authorize(token);
    return this.repository.pmv1History();
  }
  async listOperations(token) {
    await this.authorize(token);
    return this.repository.operations();
  }
  async getActivity(token) {
    await this.authorize(token);
    return this.repository.activity();
  }
  async updateState(token, kind, id, input) {
    await this.authorize(token);
    requireObject(input);
    const command = changeCommand(kind, id, input.expectedState, input.state);
    const updated = await this.repository.compareAndSet(command);
    if (updated) return updated;
    if (!await this.repository.exists(kind, id)) throw new ApplicationError("NOT_FOUND", "Registro no encontrado.");
    throw new ApplicationError("CONFLICT", "El estado cambi\xF3. Actualiza antes de volver a intentarlo.");
  }
  async updateSettings(token, input) {
    await this.authorize(token);
    return this.repository.saveSettings(validateThresholds(input));
  }
};

// backend/application/ports/out/identity.mjs
var IdentityPort = class {
  /** Retorna {id, isAdmin} a partir de una credencial verificada. */
  async authenticate(token) {
    throw new Error("IdentityPort.authenticate");
  }
};

// backend/application/ports/out/repository.mjs
var RepositoryPort = class {
  async savePmv1(record) {
    throw new Error("RepositoryPort.savePmv1");
  }
  async pmv1History() {
    throw new Error("RepositoryPort.pmv1History");
  }
  async readings() {
    throw new Error("RepositoryPort.readings");
  }
  /** {nodes, links, cases, maintenance}; DTO con datos planos. */
  async operations() {
    throw new Error("RepositoryPort.operations");
  }
  async activity() {
    throw new Error("RepositoryPort.activity");
  }
  /** Retorna DTO actualizado o null cuando no coincide el estado esperado. */
  async compareAndSet(command) {
    throw new Error("RepositoryPort.compareAndSet");
  }
  async exists(kind, id) {
    throw new Error("RepositoryPort.exists");
  }
  async saveSettings(settings) {
    throw new Error("RepositoryPort.saveSettings");
  }
};

// backend/adapters/out/supabase.mjs
var tables = { maintenance: ["demo_maintenance", "node_id"], cases: ["demo_cases", "node_id"], incidents: ["incidentes", "id"] };
function check(result) {
  if (result.error) {
    const code = result.error.code;
    if (code === "42501") throw new ApplicationError("FORBIDDEN", "Operaci\xF3n no autorizada.");
    if (["23514", "22P02"].includes(code)) throw new ApplicationError("VALIDATION", "Datos no permitidos.");
    throw new ApplicationError("UNAVAILABLE", "No se pudo consultar la base de datos.");
  }
  return result.data;
}
var SupabaseIdentity = class extends IdentityPort {
  constructor(client) {
    super();
    this.client = client;
  }
  async authenticate(token) {
    if (!token) return null;
    const result = await this.client.auth.getUser(token);
    if (result.error) {
      if (result.error.status >= 500 || !result.error.status) throw new ApplicationError("UNAVAILABLE", "Servicio de identidad no disponible.");
      return null;
    }
    if (!result.data.user) return null;
    const admin = check(await this.client.from("administradores").select("id").eq("id", result.data.user.id).maybeSingle());
    return { id: result.data.user.id, isAdmin: !!admin };
  }
};
var SupabaseRepository = class extends RepositoryPort {
  constructor(client) {
    super();
    this.client = client;
  }
  async savePmv1(record) {
    return check(await this.client.rpc("pmv1_store", { p_record: record }));
  }
  async pmv1History() {
    return check(await this.client.from("LecturaAmbiental").select("*,HistoricoPrediccion(*,EventoAlerta(*))").order("observed_at", { ascending: false }).limit(100));
  }
  async readings() {
    return check(await this.client.from("smoke_readings").select("*").eq("dataset_id", "smoke-detection-iot-300-v1").order("source_row").limit(300));
  }
  async operations() {
    const [nodes, links, cases, maintenance] = (await Promise.all([
      this.client.from("demo_nodes").select("*").order("id"),
      this.client.from("demo_node_readings").select("node_id,source_row,smoke_readings(*)").order("source_row").limit(300),
      this.client.from("demo_cases").select("*").order("node_id"),
      this.client.from("demo_maintenance").select("*").order("node_id")
    ])).map(check);
    return { nodes, links, cases, maintenance };
  }
  async activity() {
    const [reports, incidents, settings] = (await Promise.all([
      this.client.from("reportes").select("*").order("created_at", { ascending: false }).limit(200),
      this.client.from("incidentes").select("*").order("created_at", { ascending: false }).limit(200),
      this.client.from("app_settings").select("*").eq("id", true).single()
    ])).map(check);
    return { reports, incidents, settings };
  }
  async compareAndSet({ kind, id, expectedState, nextState }) {
    const [table, key] = tables[kind];
    const rows = check(await this.client.from(table).update({ state: nextState }).eq(key, id).eq("state", expectedState).select("*"));
    return rows[0] || null;
  }
  async exists(kind, id) {
    const [table, key] = tables[kind];
    return !!check(await this.client.from(table).select(key).eq(key, id).maybeSingle());
  }
  async saveSettings(settings) {
    return check(await this.client.from("app_settings").update(settings).eq("id", true).select().single());
  }
};

// backend/adapters/in/http.mjs
var status = { UNAUTHENTICATED: 401, FORBIDDEN: 403, NOT_FOUND: 404, CONFLICT: 409, VALIDATION: 422, UNAVAILABLE: 503 };
async function boundedBody(request) {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 4096) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}
function createHandler({ serviceFactory, allowedOrigins }) {
  return async (request) => {
    const origin = request.headers.get("origin");
    const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Vary": "Origin", "X-Content-Type-Options": "nosniff" };
    if (origin && !allowedOrigins.includes(origin)) return new Response(JSON.stringify({ error: "Origen no autorizado." }), { status: 403, headers });
    if (origin) headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Headers"] = "authorization, apikey, content-type";
    headers["Access-Control-Allow-Methods"] = "GET, PATCH, OPTIONS";
    const respond = (value, code = 200) => new Response(JSON.stringify(value), { status: code, headers });
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    const pathname = new URL(request.url).pathname;
    const prefix = /^(?:\/functions\/v1\/admin-api|\/admin-api|\/api)(?=\/|$)/.exec(pathname);
    if (!prefix) return respond({ error: "Ruta no disponible." }, 404);
    const path = pathname.slice(prefix[0].length);
    if (path === "/health" && request.method === "GET") return respond({ status: "ok", architecture: "ports-and-adapters" });
    const token = /^Bearer (\S+)$/i.exec(request.headers.get("authorization") || "")?.[1];
    if (!token) return respond({ error: "Inicia sesi\xF3n nuevamente.", code: "UNAUTHENTICATED" }, 401);
    try {
      const service = serviceFactory(token);
      if (request.method === "GET") {
        if (path === "/pmv1") return respond(await service.listPmv1(token));
        if (path === "/environment") return respond(await service.getEnvironment(token));
        if (path === "/predictions") return respond(await service.listPredictions(token));
        if (path === "/readings") return respond(await service.listReadings(token));
        if (path === "/operations") return respond(await service.listOperations(token));
        if (path === "/activity") return respond(await service.getActivity(token));
      }
      if (request.method === "PATCH") {
        if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") return respond({ error: "Se requiere JSON." }, 415);
        const raw = await boundedBody(request);
        if (raw === null) return respond({ error: "Solicitud demasiado grande." }, 413);
        let input;
        try {
          input = JSON.parse(raw);
        } catch {
          return respond({ error: "JSON inv\xE1lido." }, 400);
        }
        if (!input || Array.isArray(input) || typeof input !== "object") return respond({ error: "Objeto JSON requerido." }, 400);
        if (path === "/pmv1") return respond(await service.savePmv1(token, input));
        if (path === "/settings") return respond(await service.updateSettings(token, input));
        const match = /^\/(maintenance|cases|incidents)\/([^/]+)$/.exec(path);
        if (match) return respond(await service.updateState(token, match[1], match[2], input));
      }
      return respond({ error: "Ruta o m\xE9todo no disponible." }, 404);
    } catch (error) {
      if (error instanceof ApplicationError) return respond({ error: error.message, code: error.code }, status[error.code] || 500);
      return respond({ error: "No se pudo completar la solicitud.", code: "INTERNAL" }, 500);
    }
  };
}

// backend/application/ports/out/environment.mjs
var EnvironmentPort = class {
  async snapshot() {
    throw new Error("EnvironmentPort.snapshot");
  }
};

// backend/adapters/out/territory.json
var territory_default = {
  source: "MINAM; data/territorial/2025/manifest.json and districts.geojson",
  bbox: [
    -75.051,
    -12.38699,
    -73.35513,
    -10.73401
  ],
  locations: [
    {
      id: "120601",
      name: "SATIPO",
      latitude: -11.154121,
      longitude: -74.522598
    },
    {
      id: "120602",
      name: "COVIRIALI",
      latitude: -11.319209,
      longitude: -74.659276
    },
    {
      id: "120603",
      name: "LLAYLLA",
      latitude: -11.477792,
      longitude: -74.663441
    },
    {
      id: "120604",
      name: "MAZAMARI",
      latitude: -11.376465,
      longitude: -74.288813
    },
    {
      id: "120605",
      name: "PAMPA HERMOSA",
      latitude: -11.433443,
      longitude: -74.834495
    },
    {
      id: "120606",
      name: "PANGOA",
      latitude: -11.766741,
      longitude: -74.31047
    },
    {
      id: "120607",
      name: "RIO NEGRO",
      latitude: -11.10385,
      longitude: -74.723471
    },
    {
      id: "120608",
      name: "RIO TAMBO",
      latitude: -11.560131,
      longitude: -73.784304
    },
    {
      id: "120609",
      name: "VIZCATAN DEL ENE",
      latitude: -12.198107,
      longitude: -74.176859
    }
  ]
};

// backend/adapters/out/environment.mjs
var WEATHER_FIELDS = ["temperature_2m", "relative_humidity_2m", "rain", "wind_speed_10m"];
var SOURCES = ["VIIRS_NOAA20_NRT", "VIIRS_NOAA21_NRT"];
var finite = (v, min = -Infinity, max = Infinity) => typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
var failed = () => {
  throw Error("Respuesta del proveedor inv\xE1lida");
};
function normalizeWeather(payload, locations = territory_default.locations) {
  const list = Array.isArray(payload) ? payload : [payload];
  if (list.length !== locations.length) failed();
  return list.map((item, i) => {
    const c = item?.current, u = item?.current_units;
    if (!c || !u || u.temperature_2m !== "\xB0C" || u.relative_humidity_2m !== "%" || u.rain !== "mm" || u.wind_speed_10m !== "km/h" || item.utc_offset_seconds !== 0) failed();
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(c.time) || !finite(item.latitude, -90, 90) || !finite(item.longitude, -180, 180) || !finite(c.interval, 1, 86400)) failed();
    const observedAt = c.time + "Z";
    if (!Number.isFinite(Date.parse(observedAt))) failed();
    const values = { temperature_c: c.temperature_2m, humidity_pct: c.relative_humidity_2m, rain_mm: c.rain, wind_kmh: c.wind_speed_10m };
    for (const [key, v] of Object.entries(values)) if (v !== null && !finite(v, key === "temperature_c" ? -100 : 0, key === "humidity_pct" ? 100 : Infinity)) failed();
    if (Object.values(values).some((v) => v === void 0)) failed();
    return {
      location: locations[i],
      grid: { latitude: item.latitude, longitude: item.longitude },
      observed_at: observedAt,
      interval_seconds: c.interval,
      values,
      units: { temperature_c: "degC", humidity_pct: "%", rain_mm: "mm", wind_kmh: "km/h" },
      kind: "weather_model",
      source: "Open-Meteo",
      missing: Object.entries(values).filter(([, v]) => v === null).map(([k]) => k)
    };
  });
}
function parseFirms(csv, source, bbox = territory_default.bbox) {
  if (!SOURCES.includes(source) || typeof csv !== "string") failed();
  const lines = csv.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  const headers = lines.shift().split(",").map((v) => v.trim());
  const required = ["latitude", "longitude", "acq_date", "acq_time", "confidence", "frp", "satellite", "instrument"];
  if (!required.every((v) => headers.includes(v)) || new Set(headers).size !== headers.length) failed();
  const unique = /* @__PURE__ */ new Map();
  for (const line of lines) {
    if (!line.trim()) continue;
    const cells = line.split(",").map((v) => v.trim());
    if (cells.length !== headers.length) failed();
    const row = Object.fromEntries(headers.map((h, i) => [h, cells[i]]));
    if (!row.latitude || !row.longitude || !row.frp) failed();
    const latitude = Number(row.latitude), longitude = Number(row.longitude), frp = Number(row.frp);
    if (!finite(latitude, -90, 90) || !finite(longitude, -180, 180) || !finite(frp, 0) || !["l", "n", "h"].includes(row.confidence)) failed();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.acq_date) || !/^\d{1,4}$/.test(row.acq_time)) failed();
    const hhmm = row.acq_time.padStart(4, "0"), hour = Number(hhmm.slice(0, 2)), minute = Number(hhmm.slice(2));
    if (hour > 23 || minute > 59) failed();
    const observed_at = `${row.acq_date}T${hhmm.slice(0, 2)}:${hhmm.slice(2)}:00Z`;
    if (!Number.isFinite(Date.parse(observed_at)) || new Date(observed_at).toISOString().slice(0, 10) !== row.acq_date) failed();
    if (longitude < bbox[0] || longitude > bbox[2] || latitude < bbox[1] || latitude > bbox[3]) continue;
    const id = [source, observed_at, latitude, longitude].join(":");
    unique.set(id, {
      id,
      source,
      latitude,
      longitude,
      observed_at,
      confidence: row.confidence,
      frp_mw: frp,
      satellite: row.satellite,
      instrument: row.instrument,
      kind: "satellite_hotspot",
      confirmed_fire: false
    });
  }
  return [...unique.values()];
}
var PublicEnvironment = class extends EnvironmentPort {
  constructor({ firmsKey = "", request = globalThis.fetch, clock = () => Date.now(), ttlMs = 9e5 } = {}) {
    super();
    Object.assign(this, { firmsKey, request, clock, ttlMs });
    this.cached = null;
    this.pending = null;
  }
  async read(url, maxBytes = 4e6) {
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 15e3);
    try {
      const response = await this.request(url, { signal: controller.signal, redirect: "error" });
      if (!response.ok || !response.body) failed();
      const reader = response.body.getReader();
      let size = 0;
      const chunks = [];
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.length;
          if (size > maxBytes) {
            await reader.cancel();
            failed();
          }
          chunks.push(value);
        }
      } finally {
        reader.releaseLock();
      }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const part of chunks) {
        bytes.set(part, offset);
        offset += part.length;
      }
      return new TextDecoder().decode(bytes);
    } finally {
      clearTimeout(timer);
    }
  }
  async weather() {
    try {
      const params = new URLSearchParams({ latitude: territory_default.locations.map((r) => r.latitude).join(","), longitude: territory_default.locations.map((r) => r.longitude).join(","), current: WEATHER_FIELDS.join(","), timezone: "GMT", wind_speed_unit: "kmh", temperature_unit: "celsius", precipitation_unit: "mm", forecast_days: "1" });
      return { status: "ok", rows: normalizeWeather(JSON.parse(await this.read("https://api.open-meteo.com/v1/forecast?" + params))) };
    } catch {
      return { status: "unavailable", rows: [], message: "Open-Meteo no respondi\xF3 con datos v\xE1lidos. Intenta m\xE1s tarde." };
    }
  }
  async fires() {
    if (!this.firmsKey) return { status: "not_configured", rows: [], message: "Falta configurar FIRMS_MAP_KEY en el servidor." };
    const results = await Promise.all(SOURCES.map(async (source) => {
      try {
        const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${encodeURIComponent(this.firmsKey)}/${source}/${territory_default.bbox.join(",")}/2`;
        return { source, status: "ok", rows: parseFirms(await this.read(url), source) };
      } catch {
        return { source, status: "unavailable", rows: [] };
      }
    }));
    const count = results.filter((r) => r.status === "ok").length;
    return {
      status: count === 2 ? "ok" : count ? "partial" : "unavailable",
      sources: results.map(({ source, status: status2 }) => ({ source, status: status2 })),
      rows: results.flatMap((r) => r.rows).sort((a, b) => b.observed_at.localeCompare(a.observed_at)),
      message: count === 2 ? "Consulta de hoy y ayer en UTC. Un mismo fuego puede producir varias detecciones." : "Consulta incompleta: uno o m\xE1s productos FIRMS no est\xE1n disponibles; no equivale a ausencia de fuego."
    };
  }
  async snapshot() {
    if (this.cached && this.clock() < this.cached.expires) return { ...this.cached.value, cached: true };
    if (this.pending) return this.pending;
    this.pending = (async () => {
      const [weather, fires] = await Promise.all([this.weather(), this.fires()]);
      const value = {
        version: 1,
        retrieved_at: new Date(this.clock()).toISOString(),
        cached: false,
        cache_seconds: this.ttlMs / 1e3,
        territory: { bbox: territory_default.bbox, locations: territory_default.locations, scope: "Rect\xE1ngulo envolvente de Satipo; puede incluir territorios vecinos. Sin asignaci\xF3n distrital de focos." },
        weather,
        fires,
        attribution: { weather: "https://open-meteo.com/", fires: "https://firms.modaps.eosdis.nasa.gov/" }
      };
      this.cached = { value, expires: this.clock() + this.ttlMs };
      return value;
    })();
    try {
      return await this.pending;
    } finally {
      this.pending = null;
    }
  }
};

// backend/bootstrap.mjs
function compose({ url, publicKey, allowedOrigins, firmsKey = "" }) {
  if (!url || !publicKey) throw new Error("Falta configuraci\xF3n p\xFAblica de Supabase.");
  let role;
  try {
    const payload = publicKey.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    role = JSON.parse(atob(payload)).role;
  } catch {
  }
  if (!publicKey.startsWith("sb_publishable_") && role !== "anon") throw new Error("La API requiere una clave p\xFAblica publishable o anon, nunca una clave administrativa.");
  const environment = new PublicEnvironment({ firmsKey });
  return createHandler({ allowedOrigins, serviceFactory: (token) => {
    const client = createClient(url, publicKey, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
    return new AdminService({ identity: new SupabaseIdentity(client), repository: new SupabaseRepository(client), predictions: new PublishedPredictionResults(), environment });
  } });
}

// backend/edge.mjs
var handler = compose({ url: Deno.env.get("SUPABASE_URL"), publicKey: Deno.env.get("SUPABASE_ANON_KEY"), firmsKey: Deno.env.get("FIRMS_MAP_KEY"), allowedOrigins: ["https://alerta-satipo-76778920.web.app", "https://alerta-satipo-76778920.firebaseapp.com", "http://127.0.0.1:8000", "http://localhost:8000"] });
Deno.serve(handler);
