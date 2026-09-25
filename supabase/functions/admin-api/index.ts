// Generado por npm run build:api. Editar backend/, no este archivo.
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
  const bounds = { temp_critical: [20, 55], smoke_critical: [Number.MIN_VALUE, 100], humidity_dry: [10, 90], wind_risk: [1, 80] };
  const result = {};
  for (const [key, [min, max]] of Object.entries(bounds)) {
    if (typeof value[key] !== "number" || !Number.isFinite(value[key]) || value[key] < min || value[key] > max) throw new ApplicationError("VALIDATION", "Umbrales fuera del rango permitido.");
    result[key] = value[key];
  }
  return Object.freeze(result);
}

// backend/application/ports.mjs
var AdminUseCases = class {
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

// backend/application/admin-service.mjs
var AdminService = class extends AdminUseCases {
  constructor({ identity, repository }) {
    super();
    this.identity = identity;
    this.repository = repository;
  }
  async authorize(token) {
    const actor = await this.identity.authenticate(token);
    if (!actor) throw new ApplicationError("UNAUTHENTICATED", "Inicia sesi\xF3n nuevamente.");
    if (!actor.isAdmin) throw new ApplicationError("FORBIDDEN", "Se requiere autorizaci\xF3n administrativa.");
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
    const path = new URL(request.url).pathname.replace(/^\/functions\/v1\/admin-api|^\/admin-api|^\/api/, "");
    if (path === "/health" && request.method === "GET") return respond({ status: "ok", architecture: "ports-and-adapters" });
    const token = /^Bearer (\S+)$/i.exec(request.headers.get("authorization") || "")?.[1];
    if (!token) return respond({ error: "Inicia sesi\xF3n nuevamente.", code: "UNAUTHENTICATED" }, 401);
    try {
      const service = serviceFactory(token);
      if (request.method === "GET") {
        if (path === "/readings") return respond(await service.listReadings(token));
        if (path === "/operations") return respond(await service.listOperations(token));
        if (path === "/activity") return respond(await service.getActivity(token));
      }
      if (request.method === "PATCH") {
        if (!request.headers.get("content-type")?.startsWith("application/json")) return respond({ error: "Se requiere JSON." }, 415);
        const raw = await request.text();
        if (raw.length > 4096) return respond({ error: "Solicitud demasiado grande." }, 413);
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
  return createHandler({ allowedOrigins, serviceFactory: (token) => {
    const client = createClient(url, publicKey, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
    return new AdminService({ identity: new SupabaseIdentity(client), repository: new SupabaseRepository(client) });
  } });
}

// backend/edge.mjs
var handler = compose({ url: Deno.env.get("SUPABASE_URL"), publicKey: Deno.env.get("SUPABASE_ANON_KEY"), allowedOrigins: ["https://alerta-satipo-76778920.web.app", "https://alerta-satipo-76778920.firebaseapp.com", "http://127.0.0.1:8000", "http://localhost:8000"] });
Deno.serve(handler);
