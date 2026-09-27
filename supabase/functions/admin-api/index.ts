// Generado por npm run build:api. Editar backend/, no este archivo.
// backend/application/ports.mjs
var AdminUseCases = class {
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
var IdentityPort = class {
  /** Retorna {id, isAdmin} a partir de una credencial verificada. */
  async authenticate(token) {
    throw new Error("IdentityPort.authenticate");
  }
};
var RepositoryPort = class {
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
var PredictionResultsPort = class {
  async results() {
    throw new Error("PredictionResultsPort.results");
  }
};

// backend/infrastructure/prediction-results.json
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

// backend/infrastructure/predictions.mjs
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
  const bounds = { temp_critical: [20, 55], smoke_critical: [Number.MIN_VALUE, 100], humidity_dry: [10, 90], wind_risk: [1, 80] };
  const result = {};
  for (const [key, [min, max]] of Object.entries(bounds)) {
    if (typeof value[key] !== "number" || !Number.isFinite(value[key]) || value[key] < min || value[key] > max) throw new ApplicationError("VALIDATION", "Umbrales fuera del rango permitido.");
    result[key] = value[key];
  }
  return Object.freeze(result);
}
function requireObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ApplicationError("VALIDATION", "Se requiere un objeto de datos.");
}

// backend/application/admin-service.mjs
var AdminService = class extends AdminUseCases {
  constructor({ identity, repository, predictions }) {
    super();
    this.identity = identity;
    this.repository = repository;
    this.predictions = predictions;
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

// backend/infrastructure/supabase.mjs
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

// backend/infrastructure/http.mjs
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

// backend/bootstrap.mjs
function compose({ url, publicKey, allowedOrigins }) {
  if (!url || !publicKey) throw new Error("Falta configuraci\xF3n p\xFAblica de Supabase.");
  let role;
  try {
    const payload = publicKey.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    role = JSON.parse(atob(payload)).role;
  } catch {
  }
  if (!publicKey.startsWith("sb_publishable_") && role !== "anon") throw new Error("La API requiere una clave p\xFAblica publishable o anon, nunca una clave administrativa.");
  return createHandler({ allowedOrigins, serviceFactory: (token) => {
    const client = createClient(url, publicKey, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
    return new AdminService({ identity: new SupabaseIdentity(client), repository: new SupabaseRepository(client), predictions: new PublishedPredictionResults() });
  } });
}

// backend/edge.mjs
var handler = compose({ url: Deno.env.get("SUPABASE_URL"), publicKey: Deno.env.get("SUPABASE_ANON_KEY"), allowedOrigins: ["https://alerta-satipo-76778920.web.app", "https://alerta-satipo-76778920.firebaseapp.com", "http://127.0.0.1:8000", "http://localhost:8000"] });
Deno.serve(handler);
