// Generado por npm run build:api. Editar backend/, no este archivo.
// backend/application/ports/out/prediction-results.mjs
var PredictionResultsPort = class {
  async results() {
    throw new Error("PredictionResultsPort.results");
  }
};

// backend/adapters/out/prediction-results.json
var prediction_results_default = {
  version: "rf-20261109-1011-eval-v2",
  dataset_id: "smoke-detection-iot-1011-v1",
  evaluation: {
    dataset_sha256: "dcfbb19e3f8e7ba7ab0d7f0d44c9227d3c70b17dd06ab02c1938fac95d3922da",
    train_rows: 808,
    test_rows: 203,
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
      accuracy: 0.9359605911330049,
      balanced_accuracy: 0.9386792452830188,
      precision_alarm: 1,
      recall_alarm: 0.8773584905660378,
      f1_alarm: 0.9346733668341709
    },
    baseline: {
      accuracy: 0.5221674876847291,
      balanced_accuracy: 0.5,
      precision_alarm: 0.5221674876847291,
      recall_alarm: 1,
      f1_alarm: 0.686084142394822
    },
    roc_auc: 0.8915580626337289,
    confusion_matrix: [
      [
        97,
        0
      ],
      [
        13,
        93
      ]
    ],
    sklearn_version: "1.5.2",
    notice: "Experimental historical classification; not calibrated wildfire probability."
  },
  rows: [
    {
      source_row: 43293,
      recorded_at: "2022-06-09T13:00:42+00:00",
      actual: true,
      predicted: true,
      score: 1
    },
    {
      source_row: 43468,
      recorded_at: "2022-06-09T13:03:37+00:00",
      actual: true,
      predicted: true,
      score: 1
    },
    {
      source_row: 43526,
      recorded_at: "2022-06-09T13:04:35+00:00",
      actual: true,
      predicted: true,
      score: 1
    },
    {
      source_row: 43626,
      recorded_at: "2022-06-09T13:06:15+00:00",
      actual: true,
      predicted: true,
      score: 0.9913655559104299
    },
    {
      source_row: 43678,
      recorded_at: "2022-06-09T13:07:07+00:00",
      actual: true,
      predicted: true,
      score: 0.9988386123680241
    },
    {
      source_row: 43754,
      recorded_at: "2022-06-09T13:08:23+00:00",
      actual: true,
      predicted: true,
      score: 0.9971161048689138
    },
    {
      source_row: 43762,
      recorded_at: "2022-06-09T13:08:31+00:00",
      actual: true,
      predicted: true,
      score: 1
    },
    {
      source_row: 43783,
      recorded_at: "2022-06-09T13:08:52+00:00",
      actual: true,
      predicted: true,
      score: 0.9960787557371998
    },
    {
      source_row: 43902,
      recorded_at: "2022-06-09T13:10:51+00:00",
      actual: true,
      predicted: true,
      score: 1
    },
    {
      source_row: 43957,
      recorded_at: "2022-06-09T13:11:46+00:00",
      actual: true,
      predicted: true,
      score: 0.9911415633375418
    },
    {
      source_row: 43972,
      recorded_at: "2022-06-09T13:12:01+00:00",
      actual: true,
      predicted: true,
      score: 0.9960787557371998
    },
    {
      source_row: 44139,
      recorded_at: "2022-06-09T13:14:48+00:00",
      actual: true,
      predicted: true,
      score: 0.9979466666666668
    },
    {
      source_row: 44154,
      recorded_at: "2022-06-09T13:15:03+00:00",
      actual: true,
      predicted: true,
      score: 0.9960787557371998
    },
    {
      source_row: 44221,
      recorded_at: "2022-06-09T13:16:10+00:00",
      actual: true,
      predicted: true,
      score: 0.9940254224038665
    },
    {
      source_row: 44258,
      recorded_at: "2022-06-09T13:16:47+00:00",
      actual: true,
      predicted: true,
      score: 0.9911415633375418
    },
    {
      source_row: 44299,
      recorded_at: "2022-06-09T13:17:28+00:00",
      actual: true,
      predicted: true,
      score: 1
    },
    {
      source_row: 44383,
      recorded_at: "2022-06-09T13:18:52+00:00",
      actual: true,
      predicted: true,
      score: 0.9943561606589
    },
    {
      source_row: 44443,
      recorded_at: "2022-06-09T13:19:52+00:00",
      actual: true,
      predicted: true,
      score: 0.9720802072048893
    },
    {
      source_row: 44607,
      recorded_at: "2022-06-09T13:22:36+00:00",
      actual: true,
      predicted: true,
      score: 1
    },
    {
      source_row: 44646,
      recorded_at: "2022-06-09T13:23:15+00:00",
      actual: true,
      predicted: true,
      score: 0.9499545007119483
    },
    {
      source_row: 44757,
      recorded_at: "2022-06-09T13:25:06+00:00",
      actual: true,
      predicted: true,
      score: 0.9712178414361352
    },
    {
      source_row: 44781,
      recorded_at: "2022-06-09T13:25:30+00:00",
      actual: true,
      predicted: true,
      score: 1
    },
    {
      source_row: 44791,
      recorded_at: "2022-06-09T13:25:40+00:00",
      actual: true,
      predicted: true,
      score: 1
    },
    {
      source_row: 45036,
      recorded_at: "2022-06-09T13:29:45+00:00",
      actual: true,
      predicted: true,
      score: 0.8696720371522187
    },
    {
      source_row: 45110,
      recorded_at: "2022-06-09T13:30:59+00:00",
      actual: true,
      predicted: true,
      score: 0.9918149065334876
    },
    {
      source_row: 45118,
      recorded_at: "2022-06-09T13:31:07+00:00",
      actual: true,
      predicted: true,
      score: 0.9943561606589
    },
    {
      source_row: 45216,
      recorded_at: "2022-06-09T13:32:45+00:00",
      actual: true,
      predicted: true,
      score: 0.9933333333333333
    },
    {
      source_row: 45279,
      recorded_at: "2022-06-09T13:33:48+00:00",
      actual: true,
      predicted: true,
      score: 0.9906920890705332
    },
    {
      source_row: 45302,
      recorded_at: "2022-06-09T13:34:11+00:00",
      actual: true,
      predicted: true,
      score: 0.9927454224038664
    },
    {
      source_row: 45329,
      recorded_at: "2022-06-09T13:34:38+00:00",
      actual: true,
      predicted: true,
      score: 1
    },
    {
      source_row: 45336,
      recorded_at: "2022-06-09T13:34:45+00:00",
      actual: true,
      predicted: true,
      score: 0.99128
    },
    {
      source_row: 45455,
      recorded_at: "2022-06-09T13:36:44+00:00",
      actual: true,
      predicted: true,
      score: 0.9966666666666667
    },
    {
      source_row: 45557,
      recorded_at: "2022-06-09T13:38:26+00:00",
      actual: true,
      predicted: true,
      score: 1
    },
    {
      source_row: 45600,
      recorded_at: "2022-06-09T13:39:09+00:00",
      actual: true,
      predicted: true,
      score: 0.9082821442995392
    },
    {
      source_row: 45822,
      recorded_at: "2022-06-09T13:42:51+00:00",
      actual: true,
      predicted: true,
      score: 0.9841900314573642
    },
    {
      source_row: 45880,
      recorded_at: "2022-06-09T13:43:49+00:00",
      actual: true,
      predicted: true,
      score: 0.9862433647906976
    },
    {
      source_row: 45969,
      recorded_at: "2022-06-09T13:45:18+00:00",
      actual: true,
      predicted: true,
      score: 0.9927913851049022
    },
    {
      source_row: 46025,
      recorded_at: "2022-06-09T13:46:14+00:00",
      actual: true,
      predicted: true,
      score: 0.983034035973188
    },
    {
      source_row: 46119,
      recorded_at: "2022-06-09T13:47:48+00:00",
      actual: true,
      predicted: true,
      score: 0.9873587557371999
    },
    {
      source_row: 46160,
      recorded_at: "2022-06-09T13:48:29+00:00",
      actual: true,
      predicted: true,
      score: 0.9673380918626416
    },
    {
      source_row: 46164,
      recorded_at: "2022-06-09T13:48:33+00:00",
      actual: true,
      predicted: true,
      score: 0.9965548098434005
    },
    {
      source_row: 46294,
      recorded_at: "2022-06-09T13:50:43+00:00",
      actual: true,
      predicted: true,
      score: 1
    },
    {
      source_row: 46410,
      recorded_at: "2022-06-09T13:52:39+00:00",
      actual: true,
      predicted: true,
      score: 1
    },
    {
      source_row: 46435,
      recorded_at: "2022-06-09T13:53:04+00:00",
      actual: true,
      predicted: true,
      score: 0.9894120890705331
    },
    {
      source_row: 46504,
      recorded_at: "2022-06-09T13:54:13+00:00",
      actual: true,
      predicted: true,
      score: 0.9894120890705331
    },
    {
      source_row: 46512,
      recorded_at: "2022-06-09T13:54:21+00:00",
      actual: true,
      predicted: true,
      score: 0.9971161048689138
    },
    {
      source_row: 46523,
      recorded_at: "2022-06-09T13:54:32+00:00",
      actual: true,
      predicted: true,
      score: 1
    },
    {
      source_row: 46570,
      recorded_at: "2022-06-09T13:55:19+00:00",
      actual: true,
      predicted: true,
      score: 0.9971161048689138
    },
    {
      source_row: 46576,
      recorded_at: "2022-06-09T13:55:25+00:00",
      actual: true,
      predicted: true,
      score: 1
    },
    {
      source_row: 46584,
      recorded_at: "2022-06-09T13:55:33+00:00",
      actual: true,
      predicted: true,
      score: 1
    },
    {
      source_row: 46633,
      recorded_at: "2022-06-09T13:56:22+00:00",
      actual: true,
      predicted: true,
      score: 0.9971161048689138
    },
    {
      source_row: 46721,
      recorded_at: "2022-06-09T13:57:50+00:00",
      actual: true,
      predicted: true,
      score: 0.9862433647906976
    },
    {
      source_row: 46806,
      recorded_at: "2022-06-09T13:59:15+00:00",
      actual: true,
      predicted: true,
      score: 0.9833648618074111
    },
    {
      source_row: 46897,
      recorded_at: "2022-06-09T14:00:46+00:00",
      actual: true,
      predicted: true,
      score: 0.9873587557371999
    },
    {
      source_row: 47022,
      recorded_at: "2022-06-09T14:02:51+00:00",
      actual: true,
      predicted: true,
      score: 0.9894120890705331
    },
    {
      source_row: 47084,
      recorded_at: "2022-06-09T14:03:53+00:00",
      actual: true,
      predicted: true,
      score: 0.9894120890705331
    },
    {
      source_row: 47136,
      recorded_at: "2022-06-09T14:04:45+00:00",
      actual: true,
      predicted: true,
      score: 0.9860787557371998
    },
    {
      source_row: 47223,
      recorded_at: "2022-06-09T14:06:12+00:00",
      actual: true,
      predicted: true,
      score: 0.9873587557371999
    },
    {
      source_row: 47229,
      recorded_at: "2022-06-09T14:06:18+00:00",
      actual: true,
      predicted: true,
      score: 0.9923029149047562
    },
    {
      source_row: 47297,
      recorded_at: "2022-06-09T14:07:26+00:00",
      actual: true,
      predicted: true,
      score: 1
    },
    {
      source_row: 47821,
      recorded_at: "2022-06-09T14:16:10+00:00",
      actual: true,
      predicted: true,
      score: 0.9894120890705331
    },
    {
      source_row: 47824,
      recorded_at: "2022-06-09T14:16:13+00:00",
      actual: true,
      predicted: true,
      score: 0.9862433647906976
    },
    {
      source_row: 47826,
      recorded_at: "2022-06-09T14:16:15+00:00",
      actual: true,
      predicted: true,
      score: 0.9834889003076728
    },
    {
      source_row: 47828,
      recorded_at: "2022-06-09T14:16:17+00:00",
      actual: true,
      predicted: true,
      score: 0.9889695815714229
    },
    {
      source_row: 48082,
      recorded_at: "2022-06-09T14:20:31+00:00",
      actual: true,
      predicted: true,
      score: 1
    },
    {
      source_row: 48099,
      recorded_at: "2022-06-09T14:20:48+00:00",
      actual: true,
      predicted: true,
      score: 0.9871407026398548
    },
    {
      source_row: 48163,
      recorded_at: "2022-06-09T14:21:52+00:00",
      actual: true,
      predicted: true,
      score: 0.9894120890705331
    },
    {
      source_row: 48398,
      recorded_at: "2022-06-09T14:25:47+00:00",
      actual: true,
      predicted: true,
      score: 0.9856361606589
    },
    {
      source_row: 48428,
      recorded_at: "2022-06-09T14:26:17+00:00",
      actual: true,
      predicted: true,
      score: 0.9866981951407443
    },
    {
      source_row: 48466,
      recorded_at: "2022-06-09T14:26:55+00:00",
      actual: true,
      predicted: true,
      score: 0.9894120890705331
    },
    {
      source_row: 48500,
      recorded_at: "2022-06-09T14:27:29+00:00",
      actual: true,
      predicted: true,
      score: 0.9979466666666668
    },
    {
      source_row: 48512,
      recorded_at: "2022-06-09T14:27:41+00:00",
      actual: true,
      predicted: true,
      score: 0.9979466666666668
    },
    {
      source_row: 48522,
      recorded_at: "2022-06-09T14:27:51+00:00",
      actual: true,
      predicted: true,
      score: 0.9894120890705331
    },
    {
      source_row: 48603,
      recorded_at: "2022-06-09T14:29:12+00:00",
      actual: true,
      predicted: true,
      score: 0.9894120890705331
    },
    {
      source_row: 48703,
      recorded_at: "2022-06-09T14:30:52+00:00",
      actual: true,
      predicted: true,
      score: 0.9894120890705331
    },
    {
      source_row: 48746,
      recorded_at: "2022-06-09T14:31:35+00:00",
      actual: true,
      predicted: true,
      score: 1
    },
    {
      source_row: 48753,
      recorded_at: "2022-06-09T14:31:42+00:00",
      actual: true,
      predicted: true,
      score: 0.9731175563366031
    },
    {
      source_row: 48781,
      recorded_at: "2022-06-09T14:32:10+00:00",
      actual: true,
      predicted: true,
      score: 0.9894120890705331
    },
    {
      source_row: 48854,
      recorded_at: "2022-06-09T14:33:23+00:00",
      actual: true,
      predicted: true,
      score: 0.9951868100358424
    },
    {
      source_row: 48925,
      recorded_at: "2022-06-09T14:34:34+00:00",
      actual: true,
      predicted: true,
      score: 1
    },
    {
      source_row: 49063,
      recorded_at: "2022-06-09T14:36:52+00:00",
      actual: true,
      predicted: true,
      score: 0.9955052790346908
    },
    {
      source_row: 49146,
      recorded_at: "2022-06-09T14:38:15+00:00",
      actual: true,
      predicted: true,
      score: 0.9905734767025091
    },
    {
      source_row: 49281,
      recorded_at: "2022-06-09T14:40:30+00:00",
      actual: true,
      predicted: true,
      score: 1
    },
    {
      source_row: 49303,
      recorded_at: "2022-06-09T14:40:52+00:00",
      actual: true,
      predicted: true,
      score: 0.9894120890705331
    },
    {
      source_row: 49354,
      recorded_at: "2022-06-09T14:41:43+00:00",
      actual: true,
      predicted: true,
      score: 1
    },
    {
      source_row: 49428,
      recorded_at: "2022-06-09T14:42:57+00:00",
      actual: true,
      predicted: true,
      score: 0.9894120890705331
    },
    {
      source_row: 49431,
      recorded_at: "2022-06-09T14:43:00+00:00",
      actual: true,
      predicted: true,
      score: 0.9894120890705331
    },
    {
      source_row: 49594,
      recorded_at: "2022-06-09T14:45:43+00:00",
      actual: true,
      predicted: true,
      score: 1
    },
    {
      source_row: 49643,
      recorded_at: "2022-06-09T14:46:32+00:00",
      actual: true,
      predicted: true,
      score: 1
    },
    {
      source_row: 49748,
      recorded_at: "2022-06-09T14:48:17+00:00",
      actual: true,
      predicted: true,
      score: 1
    },
    {
      source_row: 49811,
      recorded_at: "2022-06-09T14:49:20+00:00",
      actual: true,
      predicted: true,
      score: 1
    },
    {
      source_row: 49929,
      recorded_at: "2022-06-09T14:51:18+00:00",
      actual: true,
      predicted: true,
      score: 1
    },
    {
      source_row: 50002,
      recorded_at: "2022-06-10T23:16:59+00:00",
      actual: false,
      predicted: false,
      score: 0.23061737167805169
    },
    {
      source_row: 50003,
      recorded_at: "2022-06-10T23:17:00+00:00",
      actual: false,
      predicted: false,
      score: 0.26440482936198
    },
    {
      source_row: 50100,
      recorded_at: "2022-06-10T23:18:37+00:00",
      actual: true,
      predicted: true,
      score: 0.55650108397054
    },
    {
      source_row: 50165,
      recorded_at: "2022-06-10T23:19:42+00:00",
      actual: true,
      predicted: false,
      score: 0.2980817094865499
    },
    {
      source_row: 50194,
      recorded_at: "2022-06-10T23:20:11+00:00",
      actual: true,
      predicted: false,
      score: 0.1705290683406747
    },
    {
      source_row: 50222,
      recorded_at: "2022-06-10T23:20:39+00:00",
      actual: true,
      predicted: false,
      score: 0.2010492907554095
    },
    {
      source_row: 50367,
      recorded_at: "2022-06-10T23:23:04+00:00",
      actual: true,
      predicted: false,
      score: 0.1609427123134699
    },
    {
      source_row: 50391,
      recorded_at: "2022-06-10T23:23:28+00:00",
      actual: true,
      predicted: false,
      score: 0.18233563636698583
    },
    {
      source_row: 50601,
      recorded_at: "2022-06-10T23:26:58+00:00",
      actual: true,
      predicted: false,
      score: 0.03051958005197149
    },
    {
      source_row: 50801,
      recorded_at: "2022-06-10T23:30:18+00:00",
      actual: true,
      predicted: false,
      score: 0.0369108633343284
    },
    {
      source_row: 50824,
      recorded_at: "2022-06-10T23:30:41+00:00",
      actual: true,
      predicted: false,
      score: 0.051867377930660145
    },
    {
      source_row: 50845,
      recorded_at: "2022-06-10T23:31:02+00:00",
      actual: true,
      predicted: false,
      score: 0.027972667617364954
    },
    {
      source_row: 50869,
      recorded_at: "2022-06-10T23:31:26+00:00",
      actual: true,
      predicted: false,
      score: 0.03143100095069828
    },
    {
      source_row: 51051,
      recorded_at: "2022-06-10T23:34:28+00:00",
      actual: true,
      predicted: false,
      score: 0.02393070181564589
    },
    {
      source_row: 51083,
      recorded_at: "2022-06-10T23:35:00+00:00",
      actual: true,
      predicted: false,
      score: 0.05639999487574132
    },
    {
      source_row: 51124,
      recorded_at: "2022-06-10T23:35:41+00:00",
      actual: true,
      predicted: false,
      score: 0.04131476306202186
    },
    {
      source_row: 56899,
      recorded_at: "2022-06-13T12:45:21+00:00",
      actual: false,
      predicted: false,
      score: 0.18710209607891118
    },
    {
      source_row: 56915,
      recorded_at: "2022-06-13T12:45:37+00:00",
      actual: false,
      predicted: false,
      score: 0.1468061660077844
    },
    {
      source_row: 56925,
      recorded_at: "2022-06-13T12:45:47+00:00",
      actual: false,
      predicted: false,
      score: 0.13329340254963779
    },
    {
      source_row: 56971,
      recorded_at: "2022-06-13T12:46:33+00:00",
      actual: false,
      predicted: false,
      score: 0.09320939224970416
    },
    {
      source_row: 56986,
      recorded_at: "2022-06-13T12:46:48+00:00",
      actual: false,
      predicted: false,
      score: 0.13379679367430208
    },
    {
      source_row: 57035,
      recorded_at: "2022-06-13T12:47:37+00:00",
      actual: false,
      predicted: false,
      score: 0.016702127599232296
    },
    {
      source_row: 57040,
      recorded_at: "2022-06-13T12:47:42+00:00",
      actual: false,
      predicted: false,
      score: 0.0790789233274306
    },
    {
      source_row: 57271,
      recorded_at: "2022-06-13T12:51:33+00:00",
      actual: false,
      predicted: false,
      score: 0.08315059095208656
    },
    {
      source_row: 57355,
      recorded_at: "2022-06-13T12:52:57+00:00",
      actual: false,
      predicted: false,
      score: 0.14127163878063853
    },
    {
      source_row: 57417,
      recorded_at: "2022-06-13T12:53:59+00:00",
      actual: false,
      predicted: false,
      score: 0.15224295836300705
    },
    {
      source_row: 57440,
      recorded_at: "2022-06-13T12:54:22+00:00",
      actual: false,
      predicted: false,
      score: 0.1536690937059612
    },
    {
      source_row: 57495,
      recorded_at: "2022-06-13T12:55:17+00:00",
      actual: false,
      predicted: false,
      score: 0.14828242703929453
    },
    {
      source_row: 57516,
      recorded_at: "2022-06-13T12:55:38+00:00",
      actual: false,
      predicted: false,
      score: 0.1672289999845476
    },
    {
      source_row: 57535,
      recorded_at: "2022-06-13T12:55:57+00:00",
      actual: false,
      predicted: false,
      score: 0.14595046902192868
    },
    {
      source_row: 57554,
      recorded_at: "2022-06-13T12:56:16+00:00",
      actual: false,
      predicted: false,
      score: 0.17793796604240014
    },
    {
      source_row: 57577,
      recorded_at: "2022-06-13T12:56:39+00:00",
      actual: false,
      predicted: false,
      score: 0.2343413353721154
    },
    {
      source_row: 57629,
      recorded_at: "2022-06-13T12:57:31+00:00",
      actual: false,
      predicted: false,
      score: 0.274253308742363
    },
    {
      source_row: 57738,
      recorded_at: "2022-06-13T12:59:20+00:00",
      actual: false,
      predicted: false,
      score: 0.31610336165969566
    },
    {
      source_row: 57761,
      recorded_at: "2022-06-13T12:59:43+00:00",
      actual: false,
      predicted: false,
      score: 0.295085138470475
    },
    {
      source_row: 57832,
      recorded_at: "2022-06-13T13:00:54+00:00",
      actual: false,
      predicted: false,
      score: 0.3197912895598405
    },
    {
      source_row: 57863,
      recorded_at: "2022-06-13T13:01:25+00:00",
      actual: false,
      predicted: false,
      score: 0.36643065586500806
    },
    {
      source_row: 57923,
      recorded_at: "2022-06-13T13:02:25+00:00",
      actual: false,
      predicted: false,
      score: 0.37217427164157224
    },
    {
      source_row: 57960,
      recorded_at: "2022-06-13T13:03:02+00:00",
      actual: false,
      predicted: false,
      score: 0.29628092274839807
    },
    {
      source_row: 57978,
      recorded_at: "2022-06-13T13:03:20+00:00",
      actual: false,
      predicted: false,
      score: 0.3429182888458085
    },
    {
      source_row: 58042,
      recorded_at: "2022-06-13T13:04:24+00:00",
      actual: false,
      predicted: false,
      score: 0.3781989815753915
    },
    {
      source_row: 58252,
      recorded_at: "2022-06-13T13:07:54+00:00",
      actual: false,
      predicted: false,
      score: 0.3197912895598405
    },
    {
      source_row: 58354,
      recorded_at: "2022-06-13T13:09:36+00:00",
      actual: false,
      predicted: false,
      score: 0.3165587118940134
    },
    {
      source_row: 58407,
      recorded_at: "2022-06-13T13:10:29+00:00",
      actual: false,
      predicted: false,
      score: 0.3699467430063558
    },
    {
      source_row: 58414,
      recorded_at: "2022-06-13T13:10:36+00:00",
      actual: false,
      predicted: false,
      score: 0.3165587118940134
    },
    {
      source_row: 58493,
      recorded_at: "2022-06-13T13:11:55+00:00",
      actual: false,
      predicted: false,
      score: 0.31645795622650713
    },
    {
      source_row: 58519,
      recorded_at: "2022-06-13T13:12:21+00:00",
      actual: false,
      predicted: false,
      score: 0.3655175192620636
    },
    {
      source_row: 58521,
      recorded_at: "2022-06-13T13:12:23+00:00",
      actual: false,
      predicted: false,
      score: 0.3688508525953969
    },
    {
      source_row: 58634,
      recorded_at: "2022-06-13T13:14:16+00:00",
      actual: false,
      predicted: false,
      score: 0.36963301751615973
    },
    {
      source_row: 58642,
      recorded_at: "2022-06-13T13:14:24+00:00",
      actual: false,
      predicted: false,
      score: 0.3688508525953969
    },
    {
      source_row: 58655,
      recorded_at: "2022-06-13T13:14:37+00:00",
      actual: false,
      predicted: false,
      score: 0.3197912895598405
    },
    {
      source_row: 58687,
      recorded_at: "2022-06-13T13:15:09+00:00",
      actual: false,
      predicted: false,
      score: 0.3204282756156888
    },
    {
      source_row: 58696,
      recorded_at: "2022-06-13T13:15:18+00:00",
      actual: false,
      predicted: false,
      score: 0.3809799691519299
    },
    {
      source_row: 58721,
      recorded_at: "2022-06-13T13:15:43+00:00",
      actual: false,
      predicted: false,
      score: 0.3124067195135673
    },
    {
      source_row: 58788,
      recorded_at: "2022-06-13T13:16:50+00:00",
      actual: false,
      predicted: false,
      score: 0.31299495480768497
    },
    {
      source_row: 58923,
      recorded_at: "2022-06-13T13:19:05+00:00",
      actual: false,
      predicted: false,
      score: 0.3237616089490221
    },
    {
      source_row: 58951,
      recorded_at: "2022-06-13T13:19:33+00:00",
      actual: false,
      predicted: false,
      score: 0.31414243541635095
    },
    {
      source_row: 58986,
      recorded_at: "2022-06-13T13:20:08+00:00",
      actual: false,
      predicted: false,
      score: 0.3171469471881311
    },
    {
      source_row: 59062,
      recorded_at: "2022-06-13T13:21:24+00:00",
      actual: false,
      predicted: false,
      score: 0.39707100858670435
    },
    {
      source_row: 59096,
      recorded_at: "2022-06-13T13:21:58+00:00",
      actual: false,
      predicted: false,
      score: 0.31299495480768497
    },
    {
      source_row: 59209,
      recorded_at: "2022-06-13T13:23:51+00:00",
      actual: false,
      predicted: false,
      score: 0.3304282756156888
    },
    {
      source_row: 59264,
      recorded_at: "2022-06-13T13:24:46+00:00",
      actual: false,
      predicted: false,
      score: 0.3201072000376113
    },
    {
      source_row: 59313,
      recorded_at: "2022-06-13T13:25:35+00:00",
      actual: false,
      predicted: false,
      score: 0.3204282756156888
    },
    {
      source_row: 59387,
      recorded_at: "2022-06-13T13:26:49+00:00",
      actual: false,
      predicted: false,
      score: 0.28688372911705884
    },
    {
      source_row: 59486,
      recorded_at: "2022-06-13T13:28:28+00:00",
      actual: false,
      predicted: false,
      score: 0.2953932437801355
    },
    {
      source_row: 59487,
      recorded_at: "2022-06-13T13:28:29+00:00",
      actual: false,
      predicted: false,
      score: 0.3049149321057881
    },
    {
      source_row: 59513,
      recorded_at: "2022-06-13T13:28:55+00:00",
      actual: false,
      predicted: false,
      score: 0.16030937859802977
    },
    {
      source_row: 59638,
      recorded_at: "2022-06-13T13:31:00+00:00",
      actual: false,
      predicted: false,
      score: 0.15424265576973606
    },
    {
      source_row: 59667,
      recorded_at: "2022-06-13T13:31:29+00:00",
      actual: false,
      predicted: false,
      score: 0.30453287567691056
    },
    {
      source_row: 59743,
      recorded_at: "2022-06-13T13:32:45+00:00",
      actual: false,
      predicted: false,
      score: 0.15379321756748884
    },
    {
      source_row: 59864,
      recorded_at: "2022-06-13T13:34:46+00:00",
      actual: false,
      predicted: false,
      score: 0.15705869678716655
    },
    {
      source_row: 60007,
      recorded_at: "2022-06-13T13:37:09+00:00",
      actual: false,
      predicted: false,
      score: 0.23846066290736345
    },
    {
      source_row: 60018,
      recorded_at: "2022-06-13T13:37:20+00:00",
      actual: false,
      predicted: false,
      score: 0.35321247445146914
    },
    {
      source_row: 60175,
      recorded_at: "2022-06-13T13:39:57+00:00",
      actual: false,
      predicted: false,
      score: 0.17412079073993217
    },
    {
      source_row: 60192,
      recorded_at: "2022-06-13T13:40:14+00:00",
      actual: false,
      predicted: false,
      score: 0.2913822354439552
    },
    {
      source_row: 60292,
      recorded_at: "2022-06-13T13:41:54+00:00",
      actual: false,
      predicted: false,
      score: 0.15258260912893337
    },
    {
      source_row: 60421,
      recorded_at: "2022-06-13T13:44:03+00:00",
      actual: false,
      predicted: false,
      score: 0.20623703882155023
    },
    {
      source_row: 60437,
      recorded_at: "2022-06-13T13:44:19+00:00",
      actual: false,
      predicted: false,
      score: 0.22905419399179985
    },
    {
      source_row: 60537,
      recorded_at: "2022-06-13T13:45:59+00:00",
      actual: false,
      predicted: false,
      score: 0.23154850552666104
    },
    {
      source_row: 60539,
      recorded_at: "2022-06-13T13:46:01+00:00",
      actual: false,
      predicted: false,
      score: 0.22534399043000017
    },
    {
      source_row: 60546,
      recorded_at: "2022-06-13T13:46:08+00:00",
      actual: false,
      predicted: false,
      score: 0.1868183151448162
    },
    {
      source_row: 60610,
      recorded_at: "2022-06-13T13:47:12+00:00",
      actual: false,
      predicted: false,
      score: 0.2381471146121608
    },
    {
      source_row: 60620,
      recorded_at: "2022-06-13T13:47:22+00:00",
      actual: false,
      predicted: false,
      score: 0.23280453266942042
    },
    {
      source_row: 60757,
      recorded_at: "2022-06-13T13:49:39+00:00",
      actual: false,
      predicted: false,
      score: 0.2334847086782464
    },
    {
      source_row: 60768,
      recorded_at: "2022-06-13T13:49:50+00:00",
      actual: false,
      predicted: false,
      score: 0.26383254167561565
    },
    {
      source_row: 60807,
      recorded_at: "2022-06-13T13:50:29+00:00",
      actual: false,
      predicted: false,
      score: 0.44576190565649587
    },
    {
      source_row: 60847,
      recorded_at: "2022-06-13T13:51:09+00:00",
      actual: false,
      predicted: false,
      score: 0.309182392206988
    },
    {
      source_row: 60867,
      recorded_at: "2022-06-13T13:51:29+00:00",
      actual: false,
      predicted: false,
      score: 0.2675897636022515
    },
    {
      source_row: 60898,
      recorded_at: "2022-06-13T13:52:00+00:00",
      actual: false,
      predicted: false,
      score: 0.37291081712548696
    },
    {
      source_row: 60901,
      recorded_at: "2022-06-13T13:52:03+00:00",
      actual: false,
      predicted: false,
      score: 0.3279365317358459
    },
    {
      source_row: 60915,
      recorded_at: "2022-06-13T13:52:17+00:00",
      actual: false,
      predicted: false,
      score: 0.25587107102293033
    },
    {
      source_row: 60998,
      recorded_at: "2022-06-13T13:53:40+00:00",
      actual: false,
      predicted: false,
      score: 0.26034914959983835
    },
    {
      source_row: 61027,
      recorded_at: "2022-06-13T13:54:09+00:00",
      actual: false,
      predicted: false,
      score: 0.39950919187454614
    },
    {
      source_row: 61097,
      recorded_at: "2022-06-13T13:55:19+00:00",
      actual: false,
      predicted: false,
      score: 0.2545061058663221
    },
    {
      source_row: 61191,
      recorded_at: "2022-06-13T13:56:53+00:00",
      actual: false,
      predicted: false,
      score: 0.2353411689136066
    },
    {
      source_row: 61213,
      recorded_at: "2022-06-13T13:57:15+00:00",
      actual: false,
      predicted: false,
      score: 0.2761690863394347
    },
    {
      source_row: 61258,
      recorded_at: "2022-06-13T13:58:00+00:00",
      actual: false,
      predicted: false,
      score: 0.22152397676443064
    },
    {
      source_row: 61418,
      recorded_at: "2022-06-13T14:00:40+00:00",
      actual: false,
      predicted: false,
      score: 0.25758924607951855
    },
    {
      source_row: 61465,
      recorded_at: "2022-06-13T14:01:27+00:00",
      actual: false,
      predicted: false,
      score: 0.2006170329927581
    },
    {
      source_row: 61471,
      recorded_at: "2022-06-13T14:01:33+00:00",
      actual: false,
      predicted: false,
      score: 0.2006170329927581
    },
    {
      source_row: 61473,
      recorded_at: "2022-06-13T14:01:35+00:00",
      actual: false,
      predicted: false,
      score: 0.2006170329927581
    },
    {
      source_row: 61523,
      recorded_at: "2022-06-13T14:02:25+00:00",
      actual: false,
      predicted: false,
      score: 0.21306799596523654
    },
    {
      source_row: 61561,
      recorded_at: "2022-06-13T14:03:03+00:00",
      actual: false,
      predicted: false,
      score: 0.20195566589207586
    },
    {
      source_row: 61899,
      recorded_at: "2022-06-13T14:08:41+00:00",
      actual: false,
      predicted: false,
      score: 0.24023131175094614
    },
    {
      source_row: 61902,
      recorded_at: "2022-06-13T14:08:44+00:00",
      actual: false,
      predicted: false,
      score: 0.24023131175094614
    },
    {
      source_row: 62082,
      recorded_at: "2022-06-13T14:11:44+00:00",
      actual: false,
      predicted: false,
      score: 0.24023131175094614
    },
    {
      source_row: 62181,
      recorded_at: "2022-06-13T14:13:23+00:00",
      actual: false,
      predicted: false,
      score: 0.24689797841761285
    },
    {
      source_row: 62242,
      recorded_at: "2022-06-13T14:14:24+00:00",
      actual: false,
      predicted: false,
      score: 0.2880165773913851
    },
    {
      source_row: 62333,
      recorded_at: "2022-06-13T14:15:55+00:00",
      actual: false,
      predicted: false,
      score: 0.3622670685551837
    },
    {
      source_row: 62437,
      recorded_at: "2022-06-13T14:17:39+00:00",
      actual: false,
      predicted: false,
      score: 0.36640191040665177
    },
    {
      source_row: 62459,
      recorded_at: "2022-06-13T14:18:01+00:00",
      actual: false,
      predicted: false,
      score: 0.3464226977138018
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
var pmv1_model_default = { "version": "pmv1-synthetic-tree-v2", "features": ["temperature_c", "humidity_pct", "smoke_index", "gas_index", "dust_ugm3"], "labels": ["Normal", "Advertencia", "Emergencia"], "experimental": true, "selection": { "max_depth": 8, "min_samples_leaf": 24 }, "left": [1, 2, 3, 4, 5, 6, -1, 8, -1, -1, 11, -1, -1, 14, 15, -1, 17, 18, -1, -1, 21, -1, -1, 24, -1, 26, 27, -1, -1, -1, 31, 32, 33, 34, 35, -1, -1, 38, -1, -1, 41, -1, 43, -1, -1, 46, 47, 48, -1, -1, 51, -1, -1, 54, 55, -1, -1, 58, -1, -1, 61, 62, -1, 64, 65, -1, -1, 68, -1, -1, 71, -1, 73, 74, -1, -1, -1, 78, 79, 80, -1, 82, -1, 84, -1, -1, 87, 88, -1, 90, -1, -1, -1, 94, 95, 96, 97, -1, -1, 100, -1, 102, -1, -1, 105, 106, -1, 108, -1, -1, -1, -1, 113, 114, 115, 116, 117, 118, 119, -1, -1, 122, -1, -1, 125, 126, -1, -1, 129, -1, -1, 132, 133, -1, 135, -1, -1, 138, -1, 140, -1, -1, 143, 144, 145, 146, -1, -1, 149, -1, -1, 152, 153, -1, -1, -1, 157, 158, -1, -1, 161, 162, -1, -1, -1, 166, 167, 168, 169, -1, 171, -1, -1, -1, 175, -1, -1, 178, 179, 180, -1, 182, -1, -1, 185, 186, -1, -1, 189, -1, -1, 192, -1, -1, 195, 196, 197, 198, 199, 200, -1, -1, -1, 204, 205, -1, -1, -1, 209, 210, -1, 212, -1, -1, -1, 216, 217, 218, -1, -1, -1, 222, 223, -1, -1, 226, -1, -1, 229, 230, 231, 232, 233, -1, -1, 236, -1, -1, 239, -1, 241, -1, -1, 244, 245, 246, -1, -1, 249, -1, -1, 252, 253, -1, -1, 256, -1, -1, 259, 260, 261, 262, -1, -1, -1, -1, 267, -1, -1], "right": [112, 77, 30, 13, 10, 7, -1, 9, -1, -1, 12, -1, -1, 23, 16, -1, 20, 19, -1, -1, 22, -1, -1, 25, -1, 29, 28, -1, -1, -1, 60, 45, 40, 37, 36, -1, -1, 39, -1, -1, 42, -1, 44, -1, -1, 53, 50, 49, -1, -1, 52, -1, -1, 57, 56, -1, -1, 59, -1, -1, 70, 63, -1, 67, 66, -1, -1, 69, -1, -1, 72, -1, 76, 75, -1, -1, -1, 93, 86, 81, -1, 83, -1, 85, -1, -1, 92, 89, -1, 91, -1, -1, -1, 111, 104, 99, 98, -1, -1, 101, -1, 103, -1, -1, 110, 107, -1, 109, -1, -1, -1, -1, 194, 165, 142, 131, 124, 121, 120, -1, -1, 123, -1, -1, 128, 127, -1, -1, 130, -1, -1, 137, 134, -1, 136, -1, -1, 139, -1, 141, -1, -1, 156, 151, 148, 147, -1, -1, 150, -1, -1, 155, 154, -1, -1, -1, 160, 159, -1, -1, 164, 163, -1, -1, -1, 177, 174, 173, 170, -1, 172, -1, -1, -1, 176, -1, -1, 191, 184, 181, -1, 183, -1, -1, 188, 187, -1, -1, 190, -1, -1, 193, -1, -1, 228, 215, 208, 203, 202, 201, -1, -1, -1, 207, 206, -1, -1, -1, 214, 211, -1, 213, -1, -1, -1, 221, 220, 219, -1, -1, -1, 225, 224, -1, -1, 227, -1, -1, 258, 243, 238, 235, 234, -1, -1, 237, -1, -1, 240, -1, 242, -1, -1, 251, 248, 247, -1, -1, 250, -1, -1, 255, 254, -1, -1, 257, -1, -1, 266, 265, 264, 263, -1, -1, -1, -1, 268, -1, -1], "feature": [2, 3, 1, 4, 0, 1, -2, 3, -2, -2, 0, -2, -2, 0, 1, -2, 3, 2, -2, -2, 4, -2, -2, 4, -2, 1, 0, -2, -2, -2, 0, 4, 2, 1, 0, -2, -2, 2, -2, -2, 1, -2, 3, -2, -2, 2, 3, 0, -2, -2, 1, -2, -2, 3, 0, -2, -2, 0, -2, -2, 4, 1, -2, 3, 2, -2, -2, 0, -2, -2, 2, -2, 1, 0, -2, -2, -2, 3, 4, 1, -2, 4, -2, 0, -2, -2, 1, 0, -2, 0, -2, -2, -2, 4, 3, 4, 0, -2, -2, 0, -2, 2, -2, -2, 0, 1, -2, 3, -2, -2, -2, -2, 3, 4, 2, 0, 2, 4, 3, -2, -2, 1, -2, -2, 1, 2, -2, -2, 4, -2, -2, 3, 1, -2, 4, -2, -2, 4, -2, 0, -2, -2, 0, 1, 3, 0, -2, -2, 2, -2, -2, 4, 3, -2, -2, -2, 3, 1, -2, -2, 1, 0, -2, -2, -2, 2, 4, 0, 1, -2, 1, -2, -2, -2, 4, -2, -2, 1, 0, 4, -2, 0, -2, -2, 3, 0, -2, -2, 4, -2, -2, 4, -2, -2, 2, 4, 0, 1, 3, 0, -2, -2, -2, 3, 4, -2, -2, -2, 1, 0, -2, 2, -2, -2, -2, 1, 0, 4, -2, -2, -2, 4, 3, -2, -2, 0, -2, -2, 1, 0, 4, 2, 3, -2, -2, 3, -2, -2, 3, -2, 3, -2, -2, 4, 2, 1, -2, -2, 1, -2, -2, 4, 1, -2, -2, 3, -2, -2, 0, 2, 4, 4, -2, -2, -2, -2, 4, -2, -2], "threshold": [27.818031311035156, 35.698843002319336, 41.66471862792969, 45.74428176879883, 32.05373573303223, 25.406970024108887, -2, 22.819982528686523, -2, -2, 35.99358558654785, -2, -2, 31.827890396118164, 24.58867073059082, -2, 16.964407920837402, 12.953646183013916, -2, -2, 140.6507110595703, -2, -2, 103.6440658569336, -2, 31.709339141845703, 37.02201843261719, -2, -2, -2, 39.500539779663086, 53.988990783691406, 25.122300148010254, 50.63532257080078, 34.57794380187988, -2, -2, 17.319133758544922, -2, -2, 51.34057807922363, -2, 23.560096740722656, -2, -2, 22.199219703674316, 27.8134708404541, 36.220680236816406, -2, -2, 57.11247444152832, -2, -2, 21.195088386535645, 30.214167594909668, -2, -2, 21.94908332824707, -2, -2, 45.31077766418457, 55.83174133300781, -2, 16.136326789855957, 13.609479904174805, -2, -2, 40.96331787109375, -2, -2, 13.325960159301758, -2, 65.33412170410156, 43.25226402282715, -2, -2, -2, 40.9417610168457, 32.82729911804199, 53.952199935913086, -2, 4.04845929145813, -2, 26.731017112731934, -2, -2, 77.6248893737793, 24.564929962158203, -2, 31.92695140838623, -2, -2, -2, 240.61727142333984, 45.847381591796875, 37.43859672546387, 28.46952724456787, -2, -2, 23.403882026672363, -2, 8.93614387512207, -2, -2, 51.657257080078125, 13.333791255950928, -2, 47.65524482727051, -2, -2, -2, -2, 58.73307418823242, 217.42725372314453, 71.3840103149414, 52.07775688171387, 32.994102478027344, 42.38353157043457, 26.193997383117676, -2, -2, 62.4078311920166, -2, -2, 17.659403800964355, 63.586172103881836, -2, -2, 143.97113800048828, -2, -2, 39.623016357421875, 32.99263572692871, -2, 118.78662109375, -2, -2, 77.29196548461914, -2, 56.86041259765625, -2, -2, 38.32959747314453, 34.08993911743164, 44.47389221191406, 28.879788398742676, -2, -2, 81.27714920043945, -2, -2, 167.71996307373047, 53.60116958618164, -2, -2, -2, 30.2850923538208, 37.4847412109375, -2, -2, 58.74505615234375, 45.41044235229492, -2, -2, -2, 55.224504470825195, 272.06690979003906, 44.36668395996094, 37.44679069519043, -2, 52.79019737243652, -2, -2, -2, 308.6842041015625, -2, -2, 50.59914970397949, 32.504621505737305, 258.94615173339844, -2, 26.519043922424316, -2, -2, 39.3814640045166, 44.378976821899414, -2, -2, 227.5051040649414, -2, -2, 269.6671600341797, -2, -2, 51.458120346069336, 190.3480682373047, 48.0688591003418, 31.781429290771484, 81.57783126831055, 34.25803565979004, -2, -2, -2, 90.21192169189453, 125.17778015136719, -2, -2, -2, 45.73817253112793, 51.92205238342285, -2, 42.56320571899414, -2, -2, -2, 37.70866584777832, 40.08720016479492, 252.41645050048828, -2, -2, -2, 239.6643295288086, 71.20456314086914, -2, -2, 44.61885452270508, -2, -2, 60.42113494873047, 31.4307861328125, 162.6009521484375, 63.682708740234375, 75.01045608520508, -2, -2, 68.07904052734375, -2, -2, 63.18606185913086, -2, 70.3655014038086, -2, -2, 91.35676956176758, 61.31333923339844, 36.28544807434082, -2, -2, 49.58114051818848, -2, -2, 179.65184020996094, 45.460886001586914, -2, -2, 70.39932632446289, -2, -2, 45.81112289428711, 78.67411422729492, 119.23073959350586, 76.56509017944336, -2, -2, -2, -2, 156.6062240600586, -2, -2], "scores": [[0.3330416666666667, 0.332375, 0.33458333333333334], [0.8068835652264881, 0.18903651009519823, 0.004079924678313631], [0.9127395444136435, 0.08689887911293238, 3615764734241292e-19], [0.475609756097561, 0.5191637630662022, 0.005226480836236935], [0.7546468401486989, 0.241635687732342, 0.0037174721189591076], [0.900523560209424, 0.09947643979057591, 0], [0.5384615384615384, 0.46153846153846156, 0], [0.9575757575757575, 0.04242424242424243, 0], [1, 0, 0], [0.851063829787234, 0.14893617021276595, 0], [0.3974358974358974, 0.5897435897435898, 0.01282051282051282], [0.5945945945945946, 0.40540540540540543, 0], [0.21951219512195122, 0.7560975609756098, 0.024390243902439025], [0.22950819672131148, 0.7639344262295082, 0.006557377049180328], [0.410958904109589, 0.589041095890411, 0], [0, 1, 0], [0.5172413793103449, 0.4827586206896552, 0], [0.7090909090909091, 0.2909090909090909, 0], [0.8333333333333334, 0.16666666666666666, 0], [0.56, 0.44, 0], [0.3442622950819672, 0.6557377049180327, 0], [0.24324324324324326, 0.7567567567567568, 0], [0.5, 0.5, 0], [0.06289308176100629, 0.9245283018867925, 0.012578616352201259], [0, 1, 0], [0.11363636363636363, 0.8636363636363636, 0.022727272727272728], [0, 0.9591836734693877, 0.04081632653061224], [0, 1, 0], [0, 0.9166666666666666, 0.08333333333333333], [0.2564102564102564, 0.7435897435897436, 0], [0.9452285381328499, 0.054771461867150074, 0], [0.9586622073578596, 0.04133779264214047, 0], [0.9871093060215433, 0.012890693978456649, 0], [0.9909843606255749, 0.009015639374425023, 0], [0.9513888888888888, 0.04861111111111111, 0], [0.9746835443037974, 0.02531645569620253, 0], [0.7027027027027027, 0.2972972972972973, 0], [0.9944033579852088, 0.0055966420147911256, 0], [0.9974293059125964, 0.002570694087403599, 0], [0.9838274932614556, 0.016172506738544475, 0], [0.8947368421052632, 0.10526315789473684, 0], [0.5416666666666666, 0.4583333333333333, 0], [0.9362745098039216, 0.06372549019607843, 0], [0.9642857142857143, 0.03571428571428571, 0], [0.8055555555555556, 0.19444444444444445, 0], [0.869757174392936, 0.13024282560706402, 0], [0.9108040201005025, 0.08919597989949749, 0], [0.9381153305203939, 0.06188466947960619, 0], [0.9508562918838421, 0.049143708116157855, 0], [0.7215189873417721, 0.27848101265822783, 0], [0.6823529411764706, 0.3176470588235294, 0], [0.3269230769230769, 0.6730769230769231, 0], [0.8389830508474576, 0.16101694915254236, 0], [0.5727272727272728, 0.42727272727272725, 0], [0.7480916030534351, 0.25190839694656486, 0], [0.8977272727272727, 0.10227272727272728, 0], [0.4418604651162791, 0.5581395348837209, 0], [0.3146067415730337, 0.6853932584269663, 0], [0.72, 0.28, 0], [0.15625, 0.84375, 0], [0.5403225806451613, 0.4596774193548387, 0], [0.7857142857142857, 0.21428571428571427, 0], [0.46153846153846156, 0.5384615384615384, 0], [0.87, 0.13, 0], [0.96, 0.04, 0], [1, 0, 0], [0.9166666666666666, 0.08333333333333333, 0], [0.78, 0.22, 0], [0.92, 0.08, 0], [0.64, 0.36, 0], [0.28688524590163933, 0.7131147540983607, 0], [0.5909090909090909, 0.4090909090909091, 0], [0.11538461538461539, 0.8846153846153846, 0], [0.037037037037037035, 0.9629629629629629, 0], [0.08333333333333333, 0.9166666666666666, 0], [0, 1, 0], [0.2916666666666667, 0.7083333333333334, 0], [0.11093502377179082, 0.8605388272583202, 0.02852614896988907], [0.36042402826855124, 0.6395759717314488, 0], [0.7244897959183674, 0.2755102040816326, 0], [0.3076923076923077, 0.6923076923076923, 0], [0.875, 0.125, 0], [0.7083333333333334, 0.2916666666666667, 0], [0.9583333333333334, 0.041666666666666664, 0], [1, 0, 0], [0.9166666666666666, 0.08333333333333333, 0], [0.16756756756756758, 0.8324324324324325, 0], [0.09937888198757763, 0.9006211180124224, 0], [0.4583333333333333, 0.5416666666666666, 0], [0.0364963503649635, 0.9635036496350365, 0], [0.11363636363636363, 0.8863636363636364, 0], [0, 1, 0], [0.625, 0.375, 0], [0.03881511746680286, 0.9244126659856997, 0.03677221654749745], [0.039832285115303984, 0.9412997903563941, 0.018867924528301886], [0.1650485436893204, 0.8349514563106796, 0], [0.4807692307692308, 0.5192307692307693, 0], [0.76, 0.24, 0], [0.2222222222222222, 0.7777777777777778, 0], [0.05844155844155844, 0.9415584415584416, 0], [0.2916666666666667, 0.7083333333333334, 0], [0.015384615384615385, 0.9846153846153847, 0], [0.08333333333333333, 0.9166666666666666, 0], [0, 1, 0], [0.0053475935828877, 0.9705882352941176, 0.02406417112299465], [0.0055248618784530384, 0.9820441988950276, 0.012430939226519336], [0, 0.8333333333333334, 0.16666666666666666], [0.005714285714285715, 0.9871428571428572, 0.0071428571428571435], [0.046875, 0.9375, 0.015625], [0.0015723270440251573, 0.9921383647798742, 0.006289308176100629], [0, 0.625, 0.375], [0, 0.28, 0.72], [0.019389238972370333, 0.42725573021258917, 0.5533550308150406], [0.03968253968253968, 0.7276077097505669, 0.23270975056689341], [0.04574520413182489, 0.8245614035087719, 0.1296933923594032], [0.05320366132723112, 0.889397406559878, 0.057398932112890926], [0.055566620195180244, 0.9085839474208325, 0.03584943238398725], [0.26147959183673475, 0.7321428571428572, 0.006377551020408164], [0.568904593639576, 0.43109540636042404, 0], [0.8076923076923077, 0.19230769230769232, 0], [0.13861386138613863, 0.8613861386138614, 0], [0.08782435129740519, 0.9021956087824351, 0.00998003992015968], [0.02406417112299465, 0.9625668449197861, 0.013368983957219251], [0.2755905511811024, 0.7244094488188977, 0], [0.01746518763275903, 0.9412320037762568, 0.04130280859098419], [0, 0.7397260273972602, 0.2602739726027397], [0, 0.8287292817679558, 0.1712707182320442], [0, 0.3157894736842105, 0.6842105263157895], [0.01841712294673967, 0.9522150323544052, 0.02936784469885515], [0.01974699166923789, 0.9654427645788337, 0.014810243751928418], [0.01287001287001287, 0.8970398970398971, 0.09009009009009009], [0, 0.45739910313901344, 0.5426008968609866], [0, 0.7727272727272727, 0.22727272727272727], [0, 0.4, 0.6], [0, 0.9206349206349206, 0.07936507936507936], [0, 1, 0], [0, 0.8, 0.2], [0, 0.2518518518518518, 0.7481481481481481], [0, 0.6129032258064516, 0.3870967741935484], [0, 0.14423076923076922, 0.8557692307692307], [0, 0.2978723404255319, 0.7021276595744681], [0, 0.017543859649122806, 0.9824561403508771], [0, 0.4269005847953216, 0.5730994152046783], [0, 0.7708333333333334, 0.22916666666666666], [0, 0.45544554455445546, 0.5445544554455446], [0, 0.7058823529411765, 0.29411764705882354], [0, 0.875, 0.125], [0, 0.5555555555555556, 0.4444444444444444], [0, 0.2, 0.8], [0, 0.32, 0.68], [0, 0.08, 0.92], [0, 0.9063829787234042, 0.09361702127659574], [0, 0.9423076923076923, 0.057692307692307696], [0, 0.9723756906077348, 0.027624309392265192], [0, 0.7407407407407407, 0.25925925925925924], [0, 0.6296296296296297, 0.37037037037037035], [0, 0.20423892100192678, 0.7957610789980732], [0, 0.6984126984126984, 0.30158730158730157], [0, 0.375, 0.625], [0, 0.8974358974358975, 0.10256410256410256], [0, 0.13596491228070176, 0.8640350877192983], [0, 0.10440835266821345, 0.8955916473317865], [0, 0.2459016393442623, 0.7540983606557377], [0, 0.04854368932038835, 0.9514563106796117], [0, 0.68, 0.32], [0.0010449320794148381, 0.109717868338558, 0.8892371995820272], [0.005681818181818182, 0.45454545454545453, 0.5397727272727273], [0.009615384615384618, 0.701923076923077, 0.2884615384615385], [0.013698630136986302, 0.904109589041096, 0.08219178082191782], [0, 0.7916666666666666, 0.20833333333333334], [0.02040816326530612, 0.9591836734693877, 0.02040816326530612], [0, 1, 0], [0.04166666666666667, 0.9166666666666667, 0.04166666666666667], [0, 0.22580645161290322, 0.7741935483870968], [0, 0.09722222222222222, 0.9027777777777778], [0, 0.2916666666666667, 0.7083333333333334], [0, 0, 1], [0, 0.03201024327784891, 0.967989756722151], [0, 0.017735334242837655, 0.9822646657571623], [0, 0.0945945945945946, 0.9054054054054054], [0, 0.25, 0.75], [0, 0.02, 0.98], [0, 0, 1], [0, 0.041666666666666664, 0.9583333333333334], [0, 0.009104704097116844, 0.9908952959028832], [0, 0.045871559633027525, 0.9541284403669725], [0, 0.14705882352941177, 0.8529411764705882], [0, 0, 1], [0, 0.0018181818181818182, 0.9981818181818182], [0, 0.041666666666666664, 0.9583333333333334], [0, 0, 1], [0, 0.25, 0.75], [0, 0.5, 0.5], [0, 0, 1], [0, 0.14028436018957346, 0.8597156398104265], [0, 0.5643044619422573, 0.4356955380577428], [0, 0.7390243902439024, 0.26097560975609757], [0, 0.8571428571428571, 0.14285714285714285], [0, 0.5864197530864198, 0.41358024691358025], [0, 0.6976744186046512, 0.3023255813953488], [0, 0.896551724137931, 0.10344827586206896], [0, 0.5352112676056338, 0.4647887323943662], [0, 0.15151515151515152, 0.8484848484848485], [0, 0.9431372549019608, 0.056862745098039215], [0, 0.9609053497942387, 0.03909465020576132], [0, 0.9882005899705014, 0.011799410029498525], [0, 0.8979591836734694, 0.10204081632653061], [0, 0.5833333333333334, 0.4166666666666667], [0, 0.20270270270270271, 0.7972972972972973], [0, 0.10344827586206896, 0.896551724137931], [0, 0.225, 0.775], [0, 0.039473684210526314, 0.9605263157894737], [0, 0.125, 0.875], [0, 0, 1], [0, 0.5625, 0.4375], [0, 0.12074303405572756, 0.8792569659442725], [0, 0.03286384976525822, 0.9671361502347418], [0, 0.1206896551724138, 0.8793103448275862], [0, 0.25, 0.75], [0, 0.029411764705882353, 0.9705882352941176], [0, 0, 1], [0, 0.2909090909090909, 0.7090909090909091], [0, 0.5294117647058824, 0.47058823529411764], [0, 0.75, 0.25], [0, 0.3333333333333333, 0.6666666666666666], [0, 0.0847457627118644, 0.9152542372881356], [0, 0.20833333333333334, 0.7916666666666666], [0, 0, 1], [0, 0.06264017942966998, 0.9373598205703301], [0, 0.046411403944969336, 0.9535885960550307], [0, 0.23247232472324722, 0.7675276752767528], [0, 0.48497854077253216, 0.5150214592274678], [0, 0.7549019607843137, 0.24509803921568626], [0, 0.9090909090909091, 0.09090909090909091], [0, 0.4722222222222222, 0.5277777777777778], [0, 0.2748091603053435, 0.7251908396946565], [0, 0.5319148936170213, 0.46808510638297873], [0, 0.13095238095238096, 0.8690476190476191], [0, 0.042071197411003236, 0.9579288025889967], [0, 0.20588235294117646, 0.7941176470588235], [0, 0.02181818181818182, 0.9781818181818182], [0, 0.08888888888888889, 0.9111111111111111], [0, 0.008695652173913044, 0.991304347826087], [0, 0.028045893279912585, 0.9719541067200874], [0, 0.12071330589849108, 0.879286694101509], [0, 0.3897058823529412, 0.6102941176470589], [0, 0.1927710843373494, 0.8072289156626506], [0, 0.6981132075471698, 0.3018867924528302], [0, 0.05902192242833052, 0.9409780775716695], [0, 0.038817005545286505, 0.9611829944547134], [0, 0.2692307692307692, 0.7307692307692307], [0, 0.01385972280554389, 0.9861402771944561], [0, 0.039634146341463415, 0.9603658536585366], [0, 0.021551724137931036, 0.978448275862069], [0, 0.17763157894736842, 0.8223684210526315], [0, 0.004057971014492754, 0.9959420289855072], [0, 0.014806378132118452, 0.9851936218678815], [0, 38880248833592535e-20, 0.999611197511664], [0, 0.5311004784688995, 0.4688995215311005], [0, 0.7611940298507462, 0.23880597014925373], [0, 0.8807339449541285, 0.11926605504587157], [0, 0.9705882352941176, 0.029411764705882353], [0, 1, 0], [0, 0.9166666666666666, 0.08333333333333333], [0, 0.7317073170731707, 0.2682926829268293], [0, 0.24, 0.76], [0, 0.12, 0.88], [0, 0.375, 0.625], [0, 0, 1]] };

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

// backend/adapters/out/read-pages.mjs
async function readPages(query, check2) {
  const rows = [], ids = /* @__PURE__ */ new Set();
  let total;
  do {
    const result = await query().range(rows.length, rows.length + 499);
    const page = check2(result);
    if (!Number.isInteger(result.count) || result.count < 0 || result.count > 1e5 || total !== void 0 && total !== result.count || !Array.isArray(page)) throw new Error("Conteo de lecturas inconsistente.");
    total = result.count;
    for (const row of page) {
      if (!Number.isInteger(row.source_row) || ids.has(row.source_row)) throw new Error("Lecturas duplicadas o inv\xE1lidas.");
      ids.add(row.source_row);
    }
    rows.push(...page);
    if (rows.length > total || !page.length && rows.length < total) throw new Error("Consulta de lecturas incompleta.");
  } while (rows.length < total);
  return rows;
}

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
    return readPages(() => this.client.from("smoke_readings").select("*", { count: "exact" }).eq("dataset_id", "smoke-detection-iot-1011-v1").order("source_row"), check);
  }
  async operations() {
    const [nodes, links, cases, maintenance] = (await Promise.all([
      this.client.from("demo_nodes").select("*").order("id"),
      readPages(() => this.client.from("demo_node_readings").select("node_id,source_row,smoke_readings(*)", { count: "exact" }).eq("dataset_id", "smoke-detection-iot-1011-v1").order("source_row"), check).then((data) => ({ data })),
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
    if (path === "/health" && request.method === "GET") return respond({ status: "ok", architecture: "ports-and-adapters", build: true ? "b14ade651aa47486223bd3befa091eee5ba79deb0fbced5c1a413797463d633c" : "development" });
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
