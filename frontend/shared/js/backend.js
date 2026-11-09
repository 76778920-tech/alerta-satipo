/* Generado por npm run build. Editar frontend/src/, no este archivo. */
(() => {
  // frontend/src/application/ports/in/browser-use-cases.mjs
  var BrowserUseCases = class {
    async savePmv1(input) {
      throw new Error("BrowserUseCases.savePmv1");
    }
    async pmv1History() {
      throw new Error("BrowserUseCases.pmv1History");
    }
    async identify() {
      throw new Error("BrowserUseCases.identify");
    }
    async login(credentials) {
      throw new Error("BrowserUseCases.login");
    }
    async logout() {
      throw new Error("BrowserUseCases.logout");
    }
    async recover(email) {
      throw new Error("BrowserUseCases.recover");
    }
    async changePassword(password) {
      throw new Error("BrowserUseCases.changePassword");
    }
    async savePreference(key, value) {
      throw new Error("BrowserUseCases.savePreference");
    }
    async listReadings() {
      throw new Error("BrowserUseCases.listReadings");
    }
    async listOperations() {
      throw new Error("BrowserUseCases.listOperations");
    }
    async listPredictions() {
      throw new Error("BrowserUseCases.listPredictions");
    }
    async getActivity() {
      throw new Error("BrowserUseCases.getActivity");
    }
    async updateState(kind, id, input) {
      throw new Error("BrowserUseCases.updateState");
    }
    async saveSettings(settings) {
      throw new Error("BrowserUseCases.saveSettings");
    }
    async createReport(report) {
      throw new Error("BrowserUseCases.createReport");
    }
    async requestHelp(input) {
      throw new Error("BrowserUseCases.requestHelp");
    }
  };

  // frontend/src/domain/account.mjs
  var preferenceFields = Object.freeze({
    "notif-push": "notif_push",
    "notif-sound": "notif_sound",
    "share-location": "share_location"
  });
  function preferenceField(key, value) {
    if (!Object.hasOwn(preferenceFields, key) || typeof value !== "boolean") throw new Error("Preferencia inv\xE1lida.");
    return preferenceFields[key];
  }
  function requireAdmin(profile) {
    if (!profile || profile.role !== "admin") {
      const error = new Error("Acceso denegado. Esta p\xE1gina es exclusiva para administradores autorizados.");
      error.code = "FORBIDDEN";
      throw error;
    }
    return profile;
  }
  function validateReport(report) {
    if (!report || typeof report.location !== "string" || !report.location.trim() || typeof report.description !== "string" || report.description.trim().length < 20 || !["low", "medium", "high"].includes(report.severity) || typeof report.type !== "string" || !report.type.trim()) throw new Error("Reporte incompleto o inv\xE1lido.");
    return report;
  }
  function validateHelp(input) {
    if (!input || typeof input.location !== "string" || !input.location.trim() || typeof input.visible !== "boolean" || typeof input.safe !== "boolean" || typeof input.reference !== "boolean" || input.location.trim().length < 3 || [input.visible, input.safe, input.reference].filter(Boolean).length < 2) throw new Error("Confirma al menos dos condiciones y una referencia del lugar.");
    return input;
  }

  // frontend/src/domain/historical.mjs
  function validatePredictions(value) {
    if (!value || !Array.isArray(value.rows) || value.rows.length !== 203 || value.evaluation?.train_rows !== 808 || value.evaluation?.test_rows !== 203 || typeof value.version !== "string") throw new Error("Resultados incompletos.");
    const ids = /* @__PURE__ */ new Set();
    for (const row of value.rows) {
      if (!Number.isInteger(row.source_row) || ids.has(row.source_row) || typeof row.actual !== "boolean" || typeof row.predicted !== "boolean" || !Number.isFinite(row.score) || row.score < 0 || row.score > 1 || !Number.isFinite(Date.parse(row.recorded_at))) throw new Error("Resultados invalidos.");
      ids.add(row.source_row);
    }
    return value;
  }
  function validateReadings(rows) {
    if (!Array.isArray(rows) || rows.some((r) => !r || typeof r !== "object") || new Set(rows.map((r) => r.source_row)).size !== rows.length) throw new Error("Formato de lecturas invalido");
    return rows;
  }
  function validateOperations(value) {
    const { nodes, links, cases, maintenance } = value;
    const expectedRows = 1011, minimumPerNode = Math.floor(expectedRows / 6), maximumPerNode = Math.ceil(expectedRows / 6);
    if (!Array.isArray(nodes) || !Array.isArray(links) || !Array.isArray(cases) || !Array.isArray(maintenance) || nodes.length !== 6 || links.length !== expectedRows || new Set(links.map((r) => r.source_row)).size !== expectedRows || links.some((r) => !r.smoke_readings) || nodes.some((n) => {
      const total = links.filter((l) => l.node_id === n.id).length;
      return total < minimumPerNode || total > maximumPerNode;
    })) throw new Error("La relacion de nodos y lecturas esta incompleta.");
    return value;
  }

  // frontend/src/domain/environment.mjs
  function validateEnvironment(data) {
    const statuses = ["ok", "unavailable", "not_configured", "partial"];
    if (data?.version !== 1 || !Number.isFinite(Date.parse(data.retrieved_at)) || !data.territory || !Array.isArray(data.territory.bbox) || data.territory.bbox.length !== 4 || !data.territory.bbox.every(Number.isFinite)) throw Error("Respuesta ambiental inv\xE1lida.");
    for (const name of ["weather", "fires"]) if (!data[name] || !statuses.includes(data[name].status) || !Array.isArray(data[name].rows)) throw Error("Proveedor inv\xE1lido.");
    if (data.weather.rows.length > 9 || data.fires.rows.length > 5e4) throw Error("Respuesta demasiado grande.");
    for (const row of data.weather.rows) {
      if (typeof row.location?.id !== "string" || typeof row.location.name !== "string" || !Number.isFinite(Date.parse(row.observed_at)) || row.kind !== "weather_model" || !row.values) throw Error("Meteorolog\xEDa inv\xE1lida.");
      if (!Number.isFinite(row.location.latitude) || !Number.isFinite(row.location.longitude) || !Number.isFinite(row.interval_seconds) || row.interval_seconds <= 0) throw Error("Ubicaci\xF3n o intervalo inv\xE1lidos.");
      for (const key of ["temperature_c", "humidity_pct", "rain_mm", "wind_kmh"]) if (row.values[key] !== null && !Number.isFinite(row.values[key])) throw Error("Medici\xF3n inv\xE1lida.");
    }
    for (const row of data.fires.rows) {
      if (typeof row.source !== "string" || !Number.isFinite(row.latitude) || Math.abs(row.latitude) > 90 || !Number.isFinite(row.longitude) || Math.abs(row.longitude) > 180 || !Number.isFinite(row.frp_mw) || row.frp_mw < 0 || !Number.isFinite(Date.parse(row.observed_at)) || !["l", "n", "h"].includes(row.confidence) || row.confirmed_fire !== false) throw Error("Detecci\xF3n inv\xE1lida.");
    }
    return data;
  }

  // frontend/src/application/use-cases/browser-service.mjs
  var BrowserService = class extends BrowserUseCases {
    constructor({ identity, profiles, community, admin, assets: assets2, session, preferences, cloud }) {
      super();
      Object.assign(this, { identity, profiles, community, admin, assets: assets2, session, preferences, cloud });
      this.profile = null;
    }
    async identify() {
      if (!this.cloud) return null;
      const user = await this.identity.currentUser();
      if (!user) {
        this.signedOut();
        return null;
      }
      this.profile = await this.profiles.find(user);
      if (!this.profile) {
        this.signedOut();
        return null;
      }
      this.session.set("userRole", this.profile.role);
      this.session.set("userEmail", this.profile.email);
      this.session.set("userName", this.profile.name);
      return this.profile;
    }
    signedOut() {
      this.profile = null;
      this.session.clear();
    }
    async login(credentials) {
      if (!this.cloud) throw new Error("Este acceso requiere la conexi\xF3n administrativa configurada.");
      await this.identity.signIn(credentials);
      const profile = await this.identify();
      try {
        return requireAdmin(profile);
      } catch (error) {
        await this.logout();
        throw error;
      }
    }
    async allowed(role) {
      const profile = this.cloud ? await this.identify() : { role: this.session.get("userRole") };
      if (!profile?.role) return { allowed: false, denied: false };
      if (role === "admin" && profile.role !== "admin") {
        await this.logout();
        return { allowed: false, denied: true };
      }
      return { allowed: true, denied: false };
    }
    async logout() {
      try {
        if (this.cloud) await this.identity.signOut();
      } finally {
        this.signedOut();
      }
    }
    async recover(email) {
      if (!this.cloud) throw new Error("La recuperaci\xF3n requiere conexi\xF3n.");
      return this.identity.recover(email);
    }
    async changePassword(password) {
      requireAdmin(await this.identify());
      if (typeof password !== "string" || password.length < 8) throw new Error("La contrase\xF1a debe tener al menos 8 caracteres.");
      return this.identity.changePassword(password);
    }
    userName() {
      return this.profile?.name || this.session.get("userName");
    }
    userEmail() {
      return this.profile?.email || this.session.get("userEmail");
    }
    preference(key, fallback) {
      if (!Object.hasOwn(preferenceFields, key)) throw new Error("Preferencia inv\xE1lida.");
      const value = this.cloud ? this.profile?.[preferenceFields[key]] : this.preferences.get(`satipo-${key}`);
      return value == null ? fallback : value === true || value === "true";
    }
    async savePreference(key, value) {
      const field = preferenceField(key, value);
      if (this.cloud) {
        if (!this.profile) throw new Error("Inicia sesi\xF3n nuevamente.");
        await this.profiles.updatePreference(this.profile.id, field, value);
        this.profile[field] = value;
      } else this.preferences.set(`satipo-${key}`, String(value));
    }
    async listReadings() {
      const rows = !this.cloud ? await this.assets.readings() : this.profile?.role === "user" ? await this.community.readings() : await this.admin.readings();
      return validateReadings(rows);
    }
    async listOperations() {
      return validateOperations(await this.admin.operations());
    }
    async getEnvironment() {
      return validateEnvironment(await this.admin.environment());
    }
    async savePmv1(reading) {
      return this.admin.savePmv1(reading);
    }
    async pmv1History() {
      return this.admin.pmv1History();
    }
    async listPredictions() {
      return validatePredictions(await this.admin.predictions());
    }
    async getActivity() {
      return this.profile?.role === "user" ? this.community.activity(this.profile.id) : this.admin.activity();
    }
    async updateState(kind, id, input) {
      return this.admin.updateState(kind, id, input);
    }
    async saveSettings(settings) {
      return this.admin.saveSettings(settings);
    }
    async createReport(report) {
      validateReport(report);
      if (!this.profile) throw new Error("Inicia sesi\xF3n nuevamente.");
      return this.community.createReport(this.profile.id, report);
    }
    async requestHelp(input) {
      return this.community.requestHelp(validateHelp(input));
    }
  };

  // frontend/src/application/ports/out/gateways.mjs
  var IdentityPort = class {
    async currentUser() {
      throw new Error("IdentityPort.currentUser");
    }
    async signIn(credentials) {
      throw new Error("IdentityPort.signIn");
    }
    async signOut() {
      throw new Error("IdentityPort.signOut");
    }
    async recover(email) {
      throw new Error("IdentityPort.recover");
    }
    async changePassword(password) {
      throw new Error("IdentityPort.changePassword");
    }
    async accessToken() {
      throw new Error("IdentityPort.accessToken");
    }
  };
  var ProfilePort = class {
    async find(user) {
      throw new Error("ProfilePort.find");
    }
    async updatePreference(id, field, value) {
      throw new Error("ProfilePort.updatePreference");
    }
  };
  var CommunityPort = class {
    async readings() {
      throw new Error("CommunityPort.readings");
    }
    async activity(id) {
      throw new Error("CommunityPort.activity");
    }
    async createReport(id, report) {
      throw new Error("CommunityPort.createReport");
    }
    async requestHelp(input) {
      throw new Error("CommunityPort.requestHelp");
    }
  };
  var AdminPort = class {
    async savePmv1(input) {
      throw new Error("AdminPort.savePmv1");
    }
    async pmv1History() {
      throw new Error("AdminPort.pmv1History");
    }
    async environment() {
      throw new Error("AdminPort.environment");
    }
    async readings() {
      throw new Error("AdminPort.readings");
    }
    async operations() {
      throw new Error("AdminPort.operations");
    }
    async predictions() {
      throw new Error("AdminPort.predictions");
    }
    async activity() {
      throw new Error("AdminPort.activity");
    }
    async updateState(kind, id, input) {
      throw new Error("AdminPort.updateState");
    }
    async saveSettings(settings) {
      throw new Error("AdminPort.saveSettings");
    }
  };
  var KeyValuePort = class {
    get(key) {
      throw new Error("KeyValuePort.get");
    }
    set(key, value) {
      throw new Error("KeyValuePort.set");
    }
    remove(key) {
      throw new Error("KeyValuePort.remove");
    }
    clear() {
      throw new Error("KeyValuePort.clear");
    }
  };
  var AssetsPort = class {
    async model() {
      throw new Error("AssetsPort.model");
    }
    async readings() {
      throw new Error("AssetsPort.readings");
    }
  };
  var EntropyPort = class {
    now() {
      throw new Error("EntropyPort.now");
    }
    id() {
      throw new Error("EntropyPort.id");
    }
    numbers(count) {
      throw new Error("EntropyPort.numbers");
    }
  };

  // frontend/src/adapters/out/read-pages.mjs
  async function readPages(query, check) {
    const rows = [], ids = /* @__PURE__ */ new Set();
    let total;
    do {
      const result = await query().range(rows.length, rows.length + 499);
      const page = check(result);
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

  // frontend/src/adapters/out/supabase.mjs
  var checked = (result) => {
    if (result.error) throw result.error;
    return result.data;
  };
  var SupabaseIdentity = class extends IdentityPort {
    constructor(client, recoveryUrl) {
      super();
      this.client = client;
      this.recoveryUrl = recoveryUrl;
    }
    async currentUser() {
      const result = await this.client.auth.getUser();
      if (result.error?.status >= 500) throw result.error;
      const user = result.error ? null : result.data.user;
      return user ? { id: user.id, email: user.email } : null;
    }
    async signIn(credentials) {
      checked(await this.client.auth.signInWithPassword(credentials));
    }
    async signOut() {
      checked(await this.client.auth.signOut({ scope: "local" }));
    }
    async recover(email) {
      checked(await this.client.auth.resetPasswordForEmail(email, { redirectTo: this.recoveryUrl }));
    }
    async changePassword(password) {
      checked(await this.client.auth.updateUser({ password }));
    }
    async accessToken() {
      return checked(await this.client.auth.getSession()).session?.access_token;
    }
    subscribe(callback) {
      return this.client.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_OUT") callback();
      });
    }
  };
  var SupabaseProfiles = class extends ProfilePort {
    constructor(client) {
      super();
      this.client = client;
    }
    async find(user) {
      const admin = checked(await this.client.from("administradores").select("id,display_name").eq("id", user.id).maybeSingle());
      const person = checked(await this.client.from("clientes").select("*").eq("id", user.id).single());
      return { ...person, email: user.email, role: admin ? "admin" : "user", name: admin?.display_name || person.full_name };
    }
    async updatePreference(id, field, value) {
      checked(await this.client.from("clientes").update({ [field]: value }).eq("id", id).select("id").single());
    }
  };
  var SupabaseCommunity = class extends CommunityPort {
    constructor(client) {
      super();
      this.client = client;
    }
    async readings() {
      return readPages(() => this.client.from("smoke_readings").select("*", { count: "exact" }).eq("dataset_id", "smoke-detection-iot-1011-v1").order("source_row"), checked);
    }
    async activity(id) {
      const [reports, incidents, settings] = (await Promise.all([
        this.client.from("reportes").select("*").eq("user_id", id).order("created_at", { ascending: false }).limit(200),
        this.client.from("incidentes").select("*").eq("user_id", id).order("created_at", { ascending: false }).limit(200),
        this.client.from("app_settings").select("*").eq("id", true).single()
      ])).map(checked);
      return { reports, incidents, settings };
    }
    async createReport(id, report) {
      checked(await this.client.from("reportes").insert({ user_id: id, location: report.location, observation: report.type, severity: report.severity, description: report.description, contact: report.contact, distance: report.distance }));
    }
    async requestHelp({ location: location2, visible, safe, reference }) {
      return checked(await this.client.rpc("request_help", { location_text: location2, visible, safe, reference_known: reference }));
    }
  };

  // frontend/src/adapters/out/http.mjs
  var HttpAdmin = class extends AdminPort {
    constructor({ url, publicKey, identity, request }) {
      super();
      Object.assign(this, { url, publicKey, identity, request });
    }
    async send(path, method = "GET", body) {
      if (!this.url) throw new Error("API administrativa no configurada.");
      const token = await this.identity.accessToken();
      if (!token) throw new Error("Inicia sesi\xF3n nuevamente.");
      const response = await this.request(this.url.replace(/\/$/, "") + path, {
        method,
        headers: { Authorization: `Bearer ${token}`, apikey: this.publicKey, "Content-Type": "application/json" },
        ...body === void 0 ? {} : { body: JSON.stringify(body) }
      });
      let payload;
      try {
        payload = await response.json();
      } catch {
        throw new Error("Respuesta inv\xE1lida de la API.");
      }
      if (!response.ok) throw new Error(payload.error || "No se pudo consultar la API administrativa.");
      return payload;
    }
    readings() {
      return this.send("/readings");
    }
    environment() {
      return this.send("/environment");
    }
    savePmv1(reading) {
      return this.send("/pmv1", "PATCH", reading);
    }
    pmv1History() {
      return this.send("/pmv1");
    }
    operations() {
      return this.send("/operations");
    }
    predictions() {
      return this.send("/predictions");
    }
    activity() {
      return this.send("/activity");
    }
    updateState(kind, id, input) {
      return this.send(`/${encodeURIComponent(kind)}/${encodeURIComponent(id)}`, "PATCH", input);
    }
    saveSettings(settings) {
      return this.send("/settings", "PATCH", settings);
    }
  };
  var HttpAssets = class extends AssetsPort {
    constructor(base2, request) {
      super();
      this.base = base2;
      this.request = request;
    }
    async read(path) {
      const response = await this.request(new URL(path, this.base), { cache: "no-store" });
      if (!response.ok) throw new Error(`Recurso no disponible: ${path}`);
      return response.json();
    }
    model() {
      return this.read("shared/models/satipo_umbrales.json");
    }
    readings() {
      return this.read("data/smoke_detection_1011.json");
    }
    config() {
      return this.read("config/public.json");
    }
  };

  // frontend/src/adapters/out/browser.mjs
  var BrowserStorage = class extends KeyValuePort {
    constructor(storage) {
      super();
      this.storage = storage;
    }
    get(key) {
      return this.storage.getItem(key);
    }
    set(key, value) {
      this.storage.setItem(key, value);
    }
    remove(key) {
      this.storage.removeItem(key);
    }
    clear() {
      this.storage.clear();
    }
  };
  var BrowserEntropy = class extends EntropyPort {
    now() {
      return /* @__PURE__ */ new Date();
    }
    id() {
      return crypto.randomUUID();
    }
    numbers(count) {
      return [...crypto.getRandomValues(new Uint32Array(count))].map((value) => value / 4294967296);
    }
  };

  // frontend/src/domain/simulation.mjs
  var districts = [{ "ubigeo": "120601", "name": "SATIPO" }, { "ubigeo": "120602", "name": "COVIRIALI" }, { "ubigeo": "120603", "name": "LLAYLLA" }, { "ubigeo": "120604", "name": "MAZAMARI" }, { "ubigeo": "120605", "name": "PAMPA HERMOSA" }, { "ubigeo": "120606", "name": "PANGOA" }, { "ubigeo": "120607", "name": "RIO NEGRO" }, { "ubigeo": "120608", "name": "RIO TAMBO" }, { "ubigeo": "120609", "name": "VIZCATAN DEL ENE" }];
  function generateScenario(scenarioProfile, random, now, id) {
    if (!["Seco", "Variable", "Lluvioso"].includes(scenarioProfile)) throw new Error("Perfil de simulaci\xF3n inv\xE1lido.");
    return {
      type: "SIMULATION_ONLY",
      notice: "Condiciones e \xEDndice simulados. No es un pron\xF3stico ni una alerta real.",
      version: 2,
      profile: scenarioProfile,
      id,
      generatedAt: now.toISOString(),
      endsAt: new Date(now.getTime() + 864e5).toISOString(),
      horizonHours: 24,
      districts: districts.map((district, i) => {
        const u = (k) => random[i * 4 + k];
        const dry = scenarioProfile === "Seco", wet = scenarioProfile === "Lluvioso";
        const temperatureC = Math.round((dry ? 28 + u(0) * 8 : wet ? 20 + u(0) * 7 : 23 + u(0) * 9) * 10) / 10;
        const humidityPct = Math.round(dry ? 25 + u(1) * 30 : wet ? 75 + u(1) * 23 : 45 + u(1) * 40);
        const rainMm = Math.round((dry ? u(2) * 2 : wet ? 8 + u(2) * 27 : u(2) * 12) * 10) / 10;
        const windKmh = Math.round(4 + u(3) * 24);
        const score = Math.round(Math.max(0, Math.min(100, (temperatureC - 18) * 2 + (100 - humidityPct) * 0.55 + windKmh * 0.7 - rainMm * 2)));
        return { ...district, temperatureC, humidityPct, rainMm, windKmh, score, level: score >= 70 ? "Alto" : score >= 40 ? "Medio" : "Bajo" };
      })
    };
  }
  function validHistory(saved) {
    if (!Array.isArray(saved)) return [];
    return saved.filter((item) => item.version === 2 && item.type === "SIMULATION_ONLY" && typeof item.id === "string" && Number.isFinite(Date.parse(item.generatedAt)) && ["Seco", "Variable", "Lluvioso"].includes(item.profile) && Array.isArray(item.districts) && item.districts.length === 9 && new Set(item.districts.map((r) => r.ubigeo)).size === 9 && item.districts.every((r) => districts.some((d) => d.ubigeo === r.ubigeo) && ["score", "temperatureC", "humidityPct", "rainMm", "windKmh"].every((k) => Number.isFinite(r[k])) && r.score >= 0 && r.score <= 100 && ["Alto", "Medio", "Bajo"].includes(r.level))).slice(0, 10);
  }

  // frontend/src/application/use-cases/simulation-service.mjs
  var SimulationService = class {
    constructor({ store, entropy }) {
      this.store = store;
      this.entropy = entropy;
    }
    history(actor) {
      try {
        return validHistory(JSON.parse(this.store.get(`satipo-demo-v2:${actor}`) || "[]"));
      } catch {
        return [];
      }
    }
    generate(profile, actor) {
      const scenario = generateScenario(profile, this.entropy.numbers(36), this.entropy.now(), this.entropy.id());
      const history = [scenario, ...this.history(actor).filter((item) => item.id !== scenario.id)].slice(0, 10);
      let saved = true;
      try {
        this.store.set(`satipo-demo-v2:${actor}`, JSON.stringify(history));
      } catch {
        saved = false;
      }
      return { scenario, history, saved };
    }
  };

  // frontend/src/adapters/in/browser-presenter.mjs
  function browserPresenter(base2) {
    const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
    const login = (denied) => location.replace(new URL(`shared/login.html${denied ? "?access=denied" : ""}`, base2));
    function fatal(error) {
      console.error("No se pudo iniciar el aplicativo:", error?.message);
      const box = document.createElement("main");
      box.style.cssText = "padding:40px;max-width:650px;margin:auto;font-family:Arial";
      const title = document.createElement("h1");
      title.textContent = "No se pudo conectar";
      const message = document.createElement("p");
      message.textContent = "Revisa la conexi\xF3n y la configuraci\xF3n de Supabase. No se han sustituido los datos por una simulaci\xF3n.";
      const retry = document.createElement("button");
      retry.textContent = "Reintentar";
      retry.onclick = () => location.reload();
      const link = document.createElement("a");
      link.href = new URL("shared/login.html", base2);
      link.textContent = " Volver al acceso";
      box.append(title, message, retry, link);
      document.body.replaceChildren(box);
    }
    return { escapeHTML, login, fatal, signedOut() {
      if (!location.pathname.endsWith("/login.html")) login(false);
    } };
  }

  // frontend/src/adapters/out/report-catalog.json
  var report_catalog_default = {
    version: "report-20261022-pmv1-20261026",
    source: {
      title: "Informe final del proyecto \xB7 Grupo 04",
      date: "2026-10-22",
      pages: 19
    },
    adaptation: "PMV1 ampliado con simulaci\xF3n de cinco variables, inferencia local y firmware ESP32-S3 preparado. El usuario a\xFAn no tiene componentes; pruebas f\xEDsicas y exportaci\xF3n Edge Impulse pendientes. La integraci\xF3n de API ambientales se mantiene separada.",
    requirements: [
      {
        id: "RF-01",
        title: "Recopilar variables ambientales",
        page: 8,
        status: "Parcial",
        evidence: [
          "colab/PMV1_cinco_variables.ipynb",
          "frontend/web/js/pmv1.js",
          "firmware/pmv1/src/main.cpp"
        ],
        gap: "Cinco variables completas, adquisici\xF3n peri\xF3dica y prueba de diez lecturas implementadas. Firmware compilado; no hay placa ni sensores para validaci\xF3n f\xEDsica."
      },
      {
        id: "RF-02",
        title: "Procesar localmente",
        page: 8,
        status: "Parcial",
        evidence: [
          "backend/domain/pmv1.mjs",
          "firmware/pmv1/include/generated_model.h",
          "tests/browser_hexagonal.py"
        ],
        gap: "Inferencia local de \xE1rbol propio probada sin red en navegador. Firmware compilado. Falta exportaci\xF3n real Edge Impulse y ejecuci\xF3n sin Internet en ESP32-S3."
      },
      {
        id: "RF-03",
        title: "Analizar m\xFAltiples variables",
        page: 8,
        status: "Parcial",
        evidence: [
          "colab/PMV1_cinco_variables.ipynb",
          "frontend/web/js/pmv1.js",
          "firmware/pmv1/src/main.cpp"
        ],
        gap: "Cinco variables completas, adquisici\xF3n peri\xF3dica y prueba de diez lecturas implementadas. Firmware compilado; no hay placa ni sensores para validaci\xF3n f\xEDsica."
      },
      {
        id: "RF-04",
        title: "Detectar condiciones de riesgo",
        page: 8,
        status: "Parcial",
        evidence: [
          "scripts/train_pmv1.py",
          "colab/pmv1/evaluation.json"
        ],
        gap: "Tres clases entrenadas con cinco variables sint\xE9ticas; validaci\xF3n de 6000 y prueba separada de 3000 registros sint\xE9ticos. Sin validaci\xF3n con incendios reales ni sensores calibrados."
      },
      {
        id: "RF-05",
        title: "Clasificar Normal/Advertencia/Emergencia",
        page: 8,
        status: "Parcial",
        evidence: [
          "scripts/train_pmv1.py",
          "colab/pmv1/evaluation.json"
        ],
        gap: "Tres clases entrenadas con cinco variables sint\xE9ticas; validaci\xF3n de 6000 y prueba separada de 3000 registros sint\xE9ticos. Sin validaci\xF3n con incendios reales ni sensores calibrados."
      },
      {
        id: "RF-06",
        title: "Generar alertas locales",
        page: 8,
        status: "Pendiente",
        evidence: [],
        gap: "Panel con indicadores demostrativos; no hay alertamiento autom\xE1tico operativo, LED ni buzzer. Definir el canal sustituto en la variante por API."
      },
      {
        id: "RF-07",
        title: "Transmitir alertas inal\xE1mbricas",
        page: 8,
        status: "Adaptado",
        evidence: [
          "acquisition/adapters/http.py",
          "acquisition/application/service.py"
        ],
        gap: "Transporte HTTP y cola con confirmaci\xF3n reemplazan el plan BLE/LoRaWAN para esta variante. Falta receptor real. No implica cumplimiento del enlace f\xEDsico original."
      },
      {
        id: "RF-08",
        title: "Registrar mediciones y eventos",
        page: 8,
        status: "Parcial",
        evidence: [
          "database/supabase/migrations/202610260001_pmv1.sql",
          "tests/pmv1.test.mjs",
          "tests/pmv1_live.mjs"
        ],
        gap: "Cuatro tablas, l\xEDmites, transacci\xF3n e idempotencia; persistencia remota comprobada tras reabrir sesi\xF3n. Falta aceptaci\xF3n con dispositivo f\xEDsico."
      },
      {
        id: "RF-09",
        title: "Visualizar estado y alertas en m\xF3vil",
        page: 8,
        status: "Parcial",
        evidence: [
          "frontend/web/index.html",
          "frontend/mobile/index.html"
        ],
        gap: "Interfaz web y c\xF3digo m\xF3vil local existentes; no hay aplicaci\xF3n Flutter/Android validada. El panel permite inspeccionar exportaciones API sin mezclarlas con sensores reales."
      },
      {
        id: "RF-10",
        title: "Registrar usuarios",
        page: 8,
        status: "Pendiente",
        evidence: [
          "frontend/src/application/use-cases/browser-service.mjs"
        ],
        gap: "El acceso vigente permite solo administradores previamente autorizados. El informe propone registro pero no define aprobaci\xF3n ni alta p\xFAblica; se conserva la restricci\xF3n existente."
      },
      {
        id: "RF-11",
        title: "Autenticar usuarios",
        page: 8,
        status: "Parcial",
        evidence: [
          "frontend/src/application/use-cases/browser-service.mjs",
          "backend/application/use-cases/admin-service.mjs",
          "database/supabase/migrations/202609230001_initial.sql"
        ],
        gap: "Autenticaci\xF3n, autorizaci\xF3n y cierre implementados para el panel. Falta validar recorrido de usuarios finales Android y aceptaci\xF3n del backlog original."
      },
      {
        id: "RF-12",
        title: "Gestionar permisos por tipo",
        page: 8,
        status: "Parcial",
        evidence: [
          "frontend/src/application/use-cases/browser-service.mjs",
          "backend/application/use-cases/admin-service.mjs",
          "database/supabase/migrations/202609230001_initial.sql"
        ],
        gap: "Autenticaci\xF3n, autorizaci\xF3n y cierre implementados para el panel. Falta validar recorrido de usuarios finales Android y aceptaci\xF3n del backlog original."
      },
      {
        id: "RF-13",
        title: "Cerrar sesi\xF3n",
        page: 8,
        status: "Parcial",
        evidence: [
          "frontend/src/application/use-cases/browser-service.mjs",
          "backend/application/use-cases/admin-service.mjs",
          "database/supabase/migrations/202609230001_initial.sql"
        ],
        gap: "Autenticaci\xF3n, autorizaci\xF3n y cierre implementados para el panel. Falta validar recorrido de usuarios finales Android y aceptaci\xF3n del backlog original."
      },
      {
        id: "RF-14",
        title: "Consultar historial",
        page: 8,
        status: "Parcial",
        evidence: [
          "acquisition/adapters/sqlite.py",
          "acquisition/__main__.py",
          "tests/acquisition_test.py"
        ],
        gap: "SQLite conserva lecturas, predicciones opcionales y eventos; consulta sin Internet en equipo local. No es SQLite en Android ni PWA offline. Falta API real y evaluaci\xF3n de retenci\xF3n."
      },
      {
        id: "RF-15",
        title: "Proveer datos para evaluar desempe\xF1o",
        page: 8,
        status: "Parcial",
        evidence: [
          "colab/Alerta_Satipo_1011_predicciones.ipynb",
          "backend/adapters/out/prediction-results.json"
        ],
        gap: "Existe evaluaci\xF3n de 1011 lecturas. La PoC de 62 630 est\xE1 reportada en el PDF; faltan notebook y artefactos originales para reproducirla."
      },
      {
        id: "RNF-01",
        title: "Tiempo de respuesta",
        page: 8,
        status: "Pendiente",
        evidence: [],
        gap: "Requiere aceptaci\xF3n y evidencia espec\xEDfica; no se presume cumplido."
      },
      {
        id: "RNF-02",
        title: "Consumo eficiente de recursos",
        page: 8,
        status: "Pendiente",
        evidence: [],
        gap: "Requiere aceptaci\xF3n y evidencia espec\xEDfica; no se presume cumplido."
      },
      {
        id: "RNF-03",
        title: "Comunicaci\xF3n oportuna",
        page: 8,
        status: "Pendiente",
        evidence: [],
        gap: "Requiere aceptaci\xF3n y evidencia espec\xEDfica; no se presume cumplido."
      },
      {
        id: "RNF-04",
        title: "Funcionamiento sin Internet",
        page: 8,
        status: "Parcial",
        evidence: [
          "backend/domain/pmv1.mjs",
          "firmware/pmv1/include/generated_model.h",
          "tests/browser_hexagonal.py"
        ],
        gap: "Inferencia local de \xE1rbol propio probada sin red en navegador. Firmware compilado. Falta exportaci\xF3n real Edge Impulse y ejecuci\xF3n sin Internet en ESP32-S3."
      },
      {
        id: "RNF-05",
        title: "Continuidad de operaci\xF3n",
        page: 8,
        status: "Pendiente",
        evidence: [],
        gap: "Requiere aceptaci\xF3n y evidencia espec\xEDfica; no se presume cumplido."
      },
      {
        id: "RNF-06",
        title: "Conservaci\xF3n de registros",
        page: 8,
        status: "Parcial",
        evidence: [
          "database/supabase/migrations/202610260001_pmv1.sql",
          "tests/pmv1.test.mjs",
          "tests/pmv1_live.mjs"
        ],
        gap: "Cuatro tablas, l\xEDmites, transacci\xF3n e idempotencia; persistencia remota comprobada tras reabrir sesi\xF3n. Falta aceptaci\xF3n con dispositivo f\xEDsico."
      },
      {
        id: "RNF-07",
        title: "Interfaz comprensible",
        page: 8,
        status: "Pendiente",
        evidence: [],
        gap: "Requiere aceptaci\xF3n y evidencia espec\xEDfica; no se presume cumplido."
      },
      {
        id: "RNF-08",
        title: "Diferenciaci\xF3n clara del riesgo",
        page: 8,
        status: "Pendiente",
        evidence: [],
        gap: "Requiere aceptaci\xF3n y evidencia espec\xEDfica; no se presume cumplido."
      },
      {
        id: "RNF-09",
        title: "Protecci\xF3n de credenciales",
        page: 8,
        status: "Parcial",
        evidence: [
          "frontend/src/application/use-cases/browser-service.mjs",
          "backend/application/use-cases/admin-service.mjs",
          "database/supabase/migrations/202609230001_initial.sql"
        ],
        gap: "Autenticaci\xF3n, autorizaci\xF3n y cierre implementados para el panel. Falta validar recorrido de usuarios finales Android y aceptaci\xF3n del backlog original."
      },
      {
        id: "RNF-10",
        title: "Control de acceso",
        page: 8,
        status: "Parcial",
        evidence: [
          "frontend/src/application/use-cases/browser-service.mjs",
          "backend/application/use-cases/admin-service.mjs",
          "database/supabase/migrations/202609230001_initial.sql"
        ],
        gap: "Autenticaci\xF3n, autorizaci\xF3n y cierre implementados para el panel. Falta validar recorrido de usuarios finales Android y aceptaci\xF3n del backlog original."
      },
      {
        id: "RNF-11",
        title: "Gesti\xF3n de sesiones",
        page: 8,
        status: "Parcial",
        evidence: [
          "frontend/src/application/use-cases/browser-service.mjs",
          "backend/application/use-cases/admin-service.mjs",
          "database/supabase/migrations/202609230001_initial.sql"
        ],
        gap: "Autenticaci\xF3n, autorizaci\xF3n y cierre implementados para el panel. Falta validar recorrido de usuarios finales Android y aceptaci\xF3n del backlog original."
      },
      {
        id: "RNF-12",
        title: "Protecci\xF3n de informaci\xF3n",
        page: 8,
        status: "Pendiente",
        evidence: [],
        gap: "Requiere aceptaci\xF3n y evidencia espec\xEDfica; no se presume cumplido."
      },
      {
        id: "RNF-13",
        title: "Compatibilidad Android",
        page: 8,
        status: "Parcial",
        evidence: [
          "frontend/web/index.html",
          "frontend/mobile/index.html"
        ],
        gap: "Interfaz web y c\xF3digo m\xF3vil local existentes; no hay aplicaci\xF3n Flutter/Android validada. El panel permite inspeccionar exportaciones API sin mezclarlas con sensores reales."
      },
      {
        id: "RNF-14",
        title: "Modularidad",
        page: 8,
        status: "Parcial",
        evidence: [
          "docs/ARQUITECTURA_HEXAGONAL.md",
          "tests/python_architecture_test.py",
          "tests/frontend-hexagonal.test.mjs"
        ],
        gap: "N\xFAcleos separados y repositorio Git. La ampliaci\xF3n API requiere mantener pruebas de integraci\xF3n y revisiones."
      },
      {
        id: "RNF-15",
        title: "Control de versiones",
        page: 8,
        status: "Parcial",
        evidence: [
          "docs/ARQUITECTURA_HEXAGONAL.md",
          "tests/python_architecture_test.py",
          "tests/frontend-hexagonal.test.mjs"
        ],
        gap: "N\xFAcleos separados y repositorio Git. La ampliaci\xF3n API requiere mantener pruebas de integraci\xF3n y revisiones."
      },
      {
        id: "RNF-16",
        title: "Exportaci\xF3n de datos",
        page: 8,
        status: "Parcial",
        evidence: [
          "acquisition/__main__.py",
          "frontend/web/js/admin.js"
        ],
        gap: "Exportaci\xF3n JSON implementada; faltan criterios de aceptaci\xF3n originales y prueba con usuario."
      },
      {
        id: "HU-001",
        title: "Registro de usuario",
        page: 9,
        status: "Pendiente",
        evidence: [
          "frontend/src/application/use-cases/browser-service.mjs"
        ],
        gap: "El acceso vigente permite solo administradores previamente autorizados. El informe propone registro pero no define aprobaci\xF3n ni alta p\xFAblica; se conserva la restricci\xF3n existente.",
        pmv: "PMV3",
        requirements: [
          "RF-10"
        ],
        mapping: "Correspondencia propuesta en esta integraci\xF3n; los ID y PMV proceden del informe."
      },
      {
        id: "HU-002",
        title: "Inicio de sesi\xF3n",
        page: 9,
        status: "Parcial",
        evidence: [
          "frontend/src/application/use-cases/browser-service.mjs",
          "backend/application/use-cases/admin-service.mjs",
          "database/supabase/migrations/202609230001_initial.sql"
        ],
        gap: "Autenticaci\xF3n, autorizaci\xF3n y cierre implementados para el panel. Falta validar recorrido de usuarios finales Android y aceptaci\xF3n del backlog original.",
        pmv: "PMV3",
        requirements: [
          "RF-11"
        ],
        mapping: "Correspondencia propuesta en esta integraci\xF3n; los ID y PMV proceden del informe."
      },
      {
        id: "HU-003",
        title: "Acceso seg\xFAn rol",
        page: 9,
        status: "Parcial",
        evidence: [
          "frontend/src/application/use-cases/browser-service.mjs",
          "backend/application/use-cases/admin-service.mjs",
          "database/supabase/migrations/202609230001_initial.sql"
        ],
        gap: "Autenticaci\xF3n, autorizaci\xF3n y cierre implementados para el panel. Falta validar recorrido de usuarios finales Android y aceptaci\xF3n del backlog original.",
        pmv: "PMV3",
        requirements: [
          "RF-12"
        ],
        mapping: "Correspondencia propuesta en esta integraci\xF3n; los ID y PMV proceden del informe."
      },
      {
        id: "HU-004",
        title: "Captura ambiental",
        page: 9,
        status: "Parcial",
        evidence: [
          "colab/PMV1_cinco_variables.ipynb",
          "frontend/web/js/pmv1.js",
          "firmware/pmv1/src/main.cpp"
        ],
        gap: "Cinco variables completas, adquisici\xF3n peri\xF3dica y prueba de diez lecturas implementadas. Firmware compilado; no hay placa ni sensores para validaci\xF3n f\xEDsica.",
        pmv: "PMV1",
        requirements: [
          "RF-01"
        ],
        mapping: "Correspondencia propuesta en esta integraci\xF3n; los ID y PMV proceden del informe."
      },
      {
        id: "HU-005",
        title: "Integraci\xF3n de variables",
        page: 9,
        status: "Parcial",
        evidence: [
          "colab/PMV1_cinco_variables.ipynb",
          "frontend/web/js/pmv1.js",
          "firmware/pmv1/src/main.cpp"
        ],
        gap: "Cinco variables completas, adquisici\xF3n peri\xF3dica y prueba de diez lecturas implementadas. Firmware compilado; no hay placa ni sensores para validaci\xF3n f\xEDsica.",
        pmv: "PMV1",
        requirements: [
          "RF-03"
        ],
        mapping: "Correspondencia propuesta en esta integraci\xF3n; los ID y PMV proceden del informe."
      },
      {
        id: "HU-006",
        title: "Procesamiento local",
        page: 9,
        status: "Parcial",
        evidence: [
          "backend/domain/pmv1.mjs",
          "firmware/pmv1/include/generated_model.h",
          "tests/browser_hexagonal.py"
        ],
        gap: "Inferencia local de \xE1rbol propio probada sin red en navegador. Firmware compilado. Falta exportaci\xF3n real Edge Impulse y ejecuci\xF3n sin Internet en ESP32-S3.",
        pmv: "PMV1",
        requirements: [
          "RF-02"
        ],
        mapping: "Correspondencia propuesta en esta integraci\xF3n; los ID y PMV proceden del informe."
      },
      {
        id: "HU-007",
        title: "Detecci\xF3n de riesgo",
        page: 9,
        status: "Parcial",
        evidence: [
          "scripts/train_pmv1.py",
          "colab/pmv1/evaluation.json"
        ],
        gap: "Tres clases entrenadas con cinco variables sint\xE9ticas; validaci\xF3n de 6000 y prueba separada de 3000 registros sint\xE9ticos. Sin validaci\xF3n con incendios reales ni sensores calibrados.",
        pmv: "PMV1",
        requirements: [
          "RF-04"
        ],
        mapping: "Correspondencia propuesta en esta integraci\xF3n; los ID y PMV proceden del informe."
      },
      {
        id: "HU-008",
        title: "Clasificaci\xF3n de riesgo",
        page: 9,
        status: "Parcial",
        evidence: [
          "scripts/train_pmv1.py",
          "colab/pmv1/evaluation.json"
        ],
        gap: "Tres clases entrenadas con cinco variables sint\xE9ticas; validaci\xF3n de 6000 y prueba separada de 3000 registros sint\xE9ticos. Sin validaci\xF3n con incendios reales ni sensores calibrados.",
        pmv: "PMV1",
        requirements: [
          "RF-05"
        ],
        mapping: "Correspondencia propuesta en esta integraci\xF3n; los ID y PMV proceden del informe."
      },
      {
        id: "HU-009",
        title: "Alerta visual",
        page: 9,
        status: "Pendiente",
        evidence: [],
        gap: "Panel con indicadores demostrativos; no hay alertamiento autom\xE1tico operativo, LED ni buzzer. Definir el canal sustituto en la variante por API.",
        pmv: "PMV2",
        requirements: [
          "RF-06"
        ],
        mapping: "Correspondencia propuesta en esta integraci\xF3n; los ID y PMV proceden del informe."
      },
      {
        id: "HU-010",
        title: "Alerta sonora",
        page: 9,
        status: "Pendiente",
        evidence: [],
        gap: "Panel con indicadores demostrativos; no hay alertamiento autom\xE1tico operativo, LED ni buzzer. Definir el canal sustituto en la variante por API.",
        pmv: "PMV2",
        requirements: [
          "RF-06"
        ],
        mapping: "Correspondencia propuesta en esta integraci\xF3n; los ID y PMV proceden del informe."
      },
      {
        id: "HU-011",
        title: "Env\xEDo por BLE",
        page: 9,
        status: "Adaptado",
        evidence: [
          "acquisition/adapters/http.py",
          "acquisition/application/service.py"
        ],
        gap: "Transporte HTTP y cola con confirmaci\xF3n reemplazan el plan BLE/LoRaWAN para esta variante. Falta receptor real. No implica cumplimiento del enlace f\xEDsico original.",
        pmv: "PMV2",
        requirements: [
          "RF-07"
        ],
        mapping: "Correspondencia propuesta en esta integraci\xF3n; los ID y PMV proceden del informe."
      },
      {
        id: "HU-012",
        title: "Comunicaci\xF3n a largo alcance",
        page: 9,
        status: "Adaptado",
        evidence: [
          "acquisition/adapters/http.py",
          "acquisition/application/service.py"
        ],
        gap: "Transporte HTTP y cola con confirmaci\xF3n reemplazan el plan BLE/LoRaWAN para esta variante. Falta receptor real. No implica cumplimiento del enlace f\xEDsico original.",
        pmv: "PMV3",
        requirements: [
          "RF-07"
        ],
        mapping: "Correspondencia propuesta en esta integraci\xF3n; los ID y PMV proceden del informe."
      },
      {
        id: "HU-013",
        title: "Visualizar estado actual",
        page: 9,
        status: "Parcial",
        evidence: [
          "frontend/web/index.html",
          "frontend/mobile/index.html"
        ],
        gap: "Interfaz web y c\xF3digo m\xF3vil local existentes; no hay aplicaci\xF3n Flutter/Android validada. El panel permite inspeccionar exportaciones API sin mezclarlas con sensores reales.",
        pmv: "PMV2",
        requirements: [
          "RF-09"
        ],
        mapping: "Correspondencia propuesta en esta integraci\xF3n; los ID y PMV proceden del informe."
      },
      {
        id: "HU-014",
        title: "Consultar historial",
        page: 9,
        status: "Parcial",
        evidence: [
          "acquisition/adapters/sqlite.py",
          "acquisition/__main__.py",
          "tests/acquisition_test.py"
        ],
        gap: "SQLite conserva lecturas, predicciones opcionales y eventos; consulta sin Internet en equipo local. No es SQLite en Android ni PWA offline. Falta API real y evaluaci\xF3n de retenci\xF3n.",
        pmv: "PMV3",
        requirements: [
          "RF-14"
        ],
        mapping: "Correspondencia propuesta en esta integraci\xF3n; los ID y PMV proceden del informe."
      },
      {
        id: "HU-015",
        title: "Registrar evento",
        page: 9,
        status: "Parcial",
        evidence: [
          "database/supabase/migrations/202610260001_pmv1.sql",
          "tests/pmv1.test.mjs",
          "tests/pmv1_live.mjs"
        ],
        gap: "Cuatro tablas, l\xEDmites, transacci\xF3n e idempotencia; persistencia remota comprobada tras reabrir sesi\xF3n. Falta aceptaci\xF3n con dispositivo f\xEDsico.",
        pmv: "PMV1",
        requirements: [
          "RF-08"
        ],
        mapping: "Correspondencia propuesta en esta integraci\xF3n; los ID y PMV proceden del informe."
      },
      {
        id: "HU-016",
        title: "Consultar offline",
        page: 9,
        status: "Parcial",
        evidence: [
          "acquisition/adapters/sqlite.py",
          "acquisition/__main__.py",
          "tests/acquisition_test.py"
        ],
        gap: "SQLite conserva lecturas, predicciones opcionales y eventos; consulta sin Internet en equipo local. No es SQLite en Android ni PWA offline. Falta API real y evaluaci\xF3n de retenci\xF3n.",
        pmv: "PMV3",
        requirements: [
          "RF-08",
          "RF-14"
        ],
        mapping: "Correspondencia propuesta en esta integraci\xF3n; los ID y PMV proceden del informe."
      },
      {
        id: "HU-017",
        title: "Exportar informaci\xF3n",
        page: 9,
        status: "Parcial",
        evidence: [
          "acquisition/__main__.py",
          "frontend/web/js/admin.js"
        ],
        gap: "Exportaci\xF3n JSON implementada; faltan criterios de aceptaci\xF3n originales y prueba con usuario.",
        pmv: "PMV3",
        requirements: [
          "RF-15"
        ],
        mapping: "Correspondencia propuesta en esta integraci\xF3n; los ID y PMV proceden del informe."
      },
      {
        id: "HU-018",
        title: "Evaluar desempe\xF1o",
        page: 9,
        status: "Parcial",
        evidence: [
          "colab/Alerta_Satipo_1011_predicciones.ipynb",
          "backend/adapters/out/prediction-results.json"
        ],
        gap: "Existe evaluaci\xF3n de 1011 lecturas. La PoC de 62 630 est\xE1 reportada en el PDF; faltan notebook y artefactos originales para reproducirla.",
        pmv: "PMV3",
        requirements: [
          "RF-15"
        ],
        mapping: "Correspondencia propuesta en esta integraci\xF3n; los ID y PMV proceden del informe."
      },
      {
        id: "RP-01",
        title: "Normal / Advertencia / Emergencia",
        page: 8,
        status: "Parcial",
        evidence: [
          "scripts/train_pmv1.py",
          "colab/pmv1/evaluation.json"
        ],
        gap: "Tres clases entrenadas con cinco variables sint\xE9ticas; validaci\xF3n de 6000 y prueba separada de 3000 registros sint\xE9ticos. Sin validaci\xF3n con incendios reales ni sensores calibrados."
      },
      {
        id: "RP-02",
        title: "Condici\xF3n compatible con incendio: 0 / 1",
        page: 8,
        status: "Parcial",
        evidence: [
          "colab/Alerta_Satipo_1011_predicciones.ipynb"
        ],
        gap: "Clasificaci\xF3n experimental externa; no validaci\xF3n territorial ni inferencia API operativa."
      },
      {
        id: "RP-03",
        title: "Condici\xF3n an\xF3mala: 0 / 1",
        page: 8,
        status: "Pendiente",
        evidence: [],
        gap: "La perturbaci\xF3n de datos no constituye un detector independiente de anomal\xEDas."
      }
    ],
    experiments: {
      report: {
        provenance: "Valores transcritos del PDF, p\xE1ginas 15\u201316. No ejecutados ni reproducidos en esta integraci\xF3n.",
        rows: 62630,
        features: 9,
        train: 50104,
        test: 12526,
        models: [
          {
            name: "Random Forest",
            accuracy: 0.9976,
            f1_macro: 0.9971,
            recall_alarm: 0.999
          },
          {
            name: "\xC1rbol",
            accuracy: 0.9896,
            f1_macro: 0.9873,
            recall_alarm: 0.9895
          },
          {
            name: "Regresi\xF3n log\xEDstica",
            accuracy: 0.7775,
            f1_macro: 0.6383,
            recall_alarm: 0.9781
          },
          {
            name: "Baseline",
            accuracy: 0.7146,
            f1_macro: 0.4168,
            recall_alarm: 1
          }
        ],
        temporal: {
          f1_macro: 0.6869,
          recall_alarm: 0.8465
        },
        noise_2_percent: {
          f1_macro: 0.8351,
          recall_alarm: 0.8638
        },
        confusion_matrix: [
          [
            3554,
            21
          ],
          [
            9,
            8942
          ]
        ],
        colab_latency_ms: 45.965
      },
      repository: {
        rows: 1011,
        train: 808,
        test: 203,
        correct: 190,
        false_negatives: 13,
        false_positives: 0,
        artifact: "backend/adapters/out/prediction-results.json"
      }
    },
    management: {
      weeks: 16,
      sprints: 8,
      tasks_reported: 43,
      administrative_progress_reported: 37.5349,
      physical_acceptance: false,
      note: "Cifras del informe; no avance calculado a partir del c\xF3digo.",
      milestones: [
        {
          id: "PMV1",
          weeks: "1\u20136",
          scope: "Adquisici\xF3n, tratamiento y primeras pruebas"
        },
        {
          id: "PMV2",
          weeks: "7\u201312",
          scope: "Modelo, alertas y visualizaci\xF3n"
        },
        {
          id: "PMV3",
          weeks: "13\u201316",
          scope: "Comunicaci\xF3n, usuarios, historial, offline y evaluaci\xF3n integral"
        }
      ]
    },
    risks: [
      "Datos externos no representativos de Satipo",
      "Variables o unidades incompatibles con el modelo",
      "Falsos negativos y falsas alarmas",
      "Interrupci\xF3n de API, cuotas o cambios de contrato",
      "P\xE9rdida de conectividad: no hay nuevas lecturas offline",
      "Exposici\xF3n de credenciales o informaci\xF3n personal"
    ],
    missing_evidence: [
      "Notebook y exportaciones originales de la PoC de 62 630 filas",
      "Backlog original con Given/When/Then",
      "Libro Gantt con las 43 actividades",
      "API seleccionada y su contrato",
      "Modelo apto para las variables del proveedor",
      "Pruebas con usuarios, experto y actas de aceptaci\xF3n",
      "Proyecto Flutter o decisi\xF3n de mantener solo web"
    ]
  };

  // frontend/src/adapters/out/project-files.mjs
  var ProjectFiles = class {
    async read(file) {
      if (!file || file.size > 1e7) throw Error("Selecciona un JSON de hasta 10 MB.");
      return JSON.parse(await file.text());
    }
    download(name, data) {
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = name;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1e3);
    }
  };

  // frontend/src/domain/acquisition.mjs
  var units = { temperature_c: "degC", humidity_pct: "%", tvoc_ppb: "ppb", eco2_ppm: "ppm", pm1_0: "ug/m3", pm2_5: "ug/m3", nc0_5: "#/cm3", nc1_0: "#/cm3", nc2_5: "#/cm3", pm10: "ug/m3", wind_kmh: "km/h", rain_mm: "mm" };
  function validateAcquisitionExport(value) {
    if (value?.schema_version !== 1 || value.operational !== false || !Array.isArray(value.rows) || value.rows.length > 1e4) throw Error("Exportaci\xF3n API incompatible. Usa python -m acquisition export.");
    const keys = /* @__PURE__ */ new Set();
    for (const row of value.rows) {
      const r = row?.reading;
      if (!r || !["weather", "smoke"].includes(r.kind) || r.provenance !== "api" || !r.values || !r.units || Array.isArray(r.values) || !Object.keys(r.values).length) throw Error("Lectura API inv\xE1lida.");
      for (const name of ["source", "external_id", "node_id"]) if (typeof r[name] !== "string" || !r[name].trim() || r[name].length > 200) throw Error("Identificador inv\xE1lido.");
      if (typeof r.observed_at !== "string" || !/(Z|[+-]\d{2}:\d{2})$/.test(r.observed_at) || !Number.isFinite(Date.parse(r.observed_at))) throw Error("Fecha sin zona horaria o inv\xE1lida.");
      const key = JSON.stringify([r.source, r.external_id]);
      if (keys.has(key)) throw Error("Lecturas duplicadas.");
      keys.add(key);
      for (const [name, n] of Object.entries(r.values)) if (!Object.hasOwn(units, name) || units[name] !== r.units[name] || typeof n !== "number" || !Number.isFinite(n) || name !== "temperature_c" && n < 0 || name === "humidity_pct" && n > 100) throw Error("Variable, rango o unidad incompatible.");
      if (row.prediction !== null) {
        const p = row.prediction;
        if (!p || r.kind !== "smoke" || p.operational !== false || typeof p.alarm !== "boolean" || typeof p.score !== "number" || !Number.isFinite(p.score) || p.score < 0 || p.score > 1 || typeof p.model_version !== "string" || !p.model_version.trim() || p.risk_level !== null || p.anomaly !== null) throw Error("Predicci\xF3n experimental inv\xE1lida.");
      }
    }
    return value;
  }

  // frontend/src/application/use-cases/project-service.mjs
  var ProjectService = class {
    constructor({ catalog, files }) {
      this.catalog = catalog;
      this.files = files;
      this.rows = [];
    }
    requirements({ type = "", status = "", query = "" } = {}) {
      const term = query.trim().toLocaleLowerCase("es");
      return this.catalog.requirements.filter((r) => (!type || r.id.startsWith(type + "-")) && (!status || r.status === status) && (!term || `${r.id} ${r.title} ${r.gap}`.toLocaleLowerCase("es").includes(term)));
    }
    async importReadings(file) {
      this.rows = [];
      this.rows = validateAcquisitionExport(await this.files.read(file)).rows;
      return this.rows;
    }
    exportCatalog() {
      this.files.download("satipo-trazabilidad-informe.json", this.catalog);
    }
  };

  // frontend/src/domain/pmv1-model.mjs
  var pmv1_model_default = { "version": "pmv1-synthetic-tree-v2", "features": ["temperature_c", "humidity_pct", "smoke_index", "gas_index", "dust_ugm3"], "labels": ["Normal", "Advertencia", "Emergencia"], "experimental": true, "selection": { "max_depth": 8, "min_samples_leaf": 24 }, "left": [1, 2, 3, 4, 5, 6, -1, 8, -1, -1, 11, -1, -1, 14, 15, -1, 17, 18, -1, -1, 21, -1, -1, 24, -1, 26, 27, -1, -1, -1, 31, 32, 33, 34, 35, -1, -1, 38, -1, -1, 41, -1, 43, -1, -1, 46, 47, 48, -1, -1, 51, -1, -1, 54, 55, -1, -1, 58, -1, -1, 61, 62, -1, 64, 65, -1, -1, 68, -1, -1, 71, -1, 73, 74, -1, -1, -1, 78, 79, 80, -1, 82, -1, 84, -1, -1, 87, 88, -1, 90, -1, -1, -1, 94, 95, 96, 97, -1, -1, 100, -1, 102, -1, -1, 105, 106, -1, 108, -1, -1, -1, -1, 113, 114, 115, 116, 117, 118, 119, -1, -1, 122, -1, -1, 125, 126, -1, -1, 129, -1, -1, 132, 133, -1, 135, -1, -1, 138, -1, 140, -1, -1, 143, 144, 145, 146, -1, -1, 149, -1, -1, 152, 153, -1, -1, -1, 157, 158, -1, -1, 161, 162, -1, -1, -1, 166, 167, 168, 169, -1, 171, -1, -1, -1, 175, -1, -1, 178, 179, 180, -1, 182, -1, -1, 185, 186, -1, -1, 189, -1, -1, 192, -1, -1, 195, 196, 197, 198, 199, 200, -1, -1, -1, 204, 205, -1, -1, -1, 209, 210, -1, 212, -1, -1, -1, 216, 217, 218, -1, -1, -1, 222, 223, -1, -1, 226, -1, -1, 229, 230, 231, 232, 233, -1, -1, 236, -1, -1, 239, -1, 241, -1, -1, 244, 245, 246, -1, -1, 249, -1, -1, 252, 253, -1, -1, 256, -1, -1, 259, 260, 261, 262, -1, -1, -1, -1, 267, -1, -1], "right": [112, 77, 30, 13, 10, 7, -1, 9, -1, -1, 12, -1, -1, 23, 16, -1, 20, 19, -1, -1, 22, -1, -1, 25, -1, 29, 28, -1, -1, -1, 60, 45, 40, 37, 36, -1, -1, 39, -1, -1, 42, -1, 44, -1, -1, 53, 50, 49, -1, -1, 52, -1, -1, 57, 56, -1, -1, 59, -1, -1, 70, 63, -1, 67, 66, -1, -1, 69, -1, -1, 72, -1, 76, 75, -1, -1, -1, 93, 86, 81, -1, 83, -1, 85, -1, -1, 92, 89, -1, 91, -1, -1, -1, 111, 104, 99, 98, -1, -1, 101, -1, 103, -1, -1, 110, 107, -1, 109, -1, -1, -1, -1, 194, 165, 142, 131, 124, 121, 120, -1, -1, 123, -1, -1, 128, 127, -1, -1, 130, -1, -1, 137, 134, -1, 136, -1, -1, 139, -1, 141, -1, -1, 156, 151, 148, 147, -1, -1, 150, -1, -1, 155, 154, -1, -1, -1, 160, 159, -1, -1, 164, 163, -1, -1, -1, 177, 174, 173, 170, -1, 172, -1, -1, -1, 176, -1, -1, 191, 184, 181, -1, 183, -1, -1, 188, 187, -1, -1, 190, -1, -1, 193, -1, -1, 228, 215, 208, 203, 202, 201, -1, -1, -1, 207, 206, -1, -1, -1, 214, 211, -1, 213, -1, -1, -1, 221, 220, 219, -1, -1, -1, 225, 224, -1, -1, 227, -1, -1, 258, 243, 238, 235, 234, -1, -1, 237, -1, -1, 240, -1, 242, -1, -1, 251, 248, 247, -1, -1, 250, -1, -1, 255, 254, -1, -1, 257, -1, -1, 266, 265, 264, 263, -1, -1, -1, -1, 268, -1, -1], "feature": [2, 3, 1, 4, 0, 1, -2, 3, -2, -2, 0, -2, -2, 0, 1, -2, 3, 2, -2, -2, 4, -2, -2, 4, -2, 1, 0, -2, -2, -2, 0, 4, 2, 1, 0, -2, -2, 2, -2, -2, 1, -2, 3, -2, -2, 2, 3, 0, -2, -2, 1, -2, -2, 3, 0, -2, -2, 0, -2, -2, 4, 1, -2, 3, 2, -2, -2, 0, -2, -2, 2, -2, 1, 0, -2, -2, -2, 3, 4, 1, -2, 4, -2, 0, -2, -2, 1, 0, -2, 0, -2, -2, -2, 4, 3, 4, 0, -2, -2, 0, -2, 2, -2, -2, 0, 1, -2, 3, -2, -2, -2, -2, 3, 4, 2, 0, 2, 4, 3, -2, -2, 1, -2, -2, 1, 2, -2, -2, 4, -2, -2, 3, 1, -2, 4, -2, -2, 4, -2, 0, -2, -2, 0, 1, 3, 0, -2, -2, 2, -2, -2, 4, 3, -2, -2, -2, 3, 1, -2, -2, 1, 0, -2, -2, -2, 2, 4, 0, 1, -2, 1, -2, -2, -2, 4, -2, -2, 1, 0, 4, -2, 0, -2, -2, 3, 0, -2, -2, 4, -2, -2, 4, -2, -2, 2, 4, 0, 1, 3, 0, -2, -2, -2, 3, 4, -2, -2, -2, 1, 0, -2, 2, -2, -2, -2, 1, 0, 4, -2, -2, -2, 4, 3, -2, -2, 0, -2, -2, 1, 0, 4, 2, 3, -2, -2, 3, -2, -2, 3, -2, 3, -2, -2, 4, 2, 1, -2, -2, 1, -2, -2, 4, 1, -2, -2, 3, -2, -2, 0, 2, 4, 4, -2, -2, -2, -2, 4, -2, -2], "threshold": [27.818031311035156, 35.698843002319336, 41.66471862792969, 45.74428176879883, 32.05373573303223, 25.406970024108887, -2, 22.819982528686523, -2, -2, 35.99358558654785, -2, -2, 31.827890396118164, 24.58867073059082, -2, 16.964407920837402, 12.953646183013916, -2, -2, 140.6507110595703, -2, -2, 103.6440658569336, -2, 31.709339141845703, 37.02201843261719, -2, -2, -2, 39.500539779663086, 53.988990783691406, 25.122300148010254, 50.63532257080078, 34.57794380187988, -2, -2, 17.319133758544922, -2, -2, 51.34057807922363, -2, 23.560096740722656, -2, -2, 22.199219703674316, 27.8134708404541, 36.220680236816406, -2, -2, 57.11247444152832, -2, -2, 21.195088386535645, 30.214167594909668, -2, -2, 21.94908332824707, -2, -2, 45.31077766418457, 55.83174133300781, -2, 16.136326789855957, 13.609479904174805, -2, -2, 40.96331787109375, -2, -2, 13.325960159301758, -2, 65.33412170410156, 43.25226402282715, -2, -2, -2, 40.9417610168457, 32.82729911804199, 53.952199935913086, -2, 4.04845929145813, -2, 26.731017112731934, -2, -2, 77.6248893737793, 24.564929962158203, -2, 31.92695140838623, -2, -2, -2, 240.61727142333984, 45.847381591796875, 37.43859672546387, 28.46952724456787, -2, -2, 23.403882026672363, -2, 8.93614387512207, -2, -2, 51.657257080078125, 13.333791255950928, -2, 47.65524482727051, -2, -2, -2, -2, 58.73307418823242, 217.42725372314453, 71.3840103149414, 52.07775688171387, 32.994102478027344, 42.38353157043457, 26.193997383117676, -2, -2, 62.4078311920166, -2, -2, 17.659403800964355, 63.586172103881836, -2, -2, 143.97113800048828, -2, -2, 39.623016357421875, 32.99263572692871, -2, 118.78662109375, -2, -2, 77.29196548461914, -2, 56.86041259765625, -2, -2, 38.32959747314453, 34.08993911743164, 44.47389221191406, 28.879788398742676, -2, -2, 81.27714920043945, -2, -2, 167.71996307373047, 53.60116958618164, -2, -2, -2, 30.2850923538208, 37.4847412109375, -2, -2, 58.74505615234375, 45.41044235229492, -2, -2, -2, 55.224504470825195, 272.06690979003906, 44.36668395996094, 37.44679069519043, -2, 52.79019737243652, -2, -2, -2, 308.6842041015625, -2, -2, 50.59914970397949, 32.504621505737305, 258.94615173339844, -2, 26.519043922424316, -2, -2, 39.3814640045166, 44.378976821899414, -2, -2, 227.5051040649414, -2, -2, 269.6671600341797, -2, -2, 51.458120346069336, 190.3480682373047, 48.0688591003418, 31.781429290771484, 81.57783126831055, 34.25803565979004, -2, -2, -2, 90.21192169189453, 125.17778015136719, -2, -2, -2, 45.73817253112793, 51.92205238342285, -2, 42.56320571899414, -2, -2, -2, 37.70866584777832, 40.08720016479492, 252.41645050048828, -2, -2, -2, 239.6643295288086, 71.20456314086914, -2, -2, 44.61885452270508, -2, -2, 60.42113494873047, 31.4307861328125, 162.6009521484375, 63.682708740234375, 75.01045608520508, -2, -2, 68.07904052734375, -2, -2, 63.18606185913086, -2, 70.3655014038086, -2, -2, 91.35676956176758, 61.31333923339844, 36.28544807434082, -2, -2, 49.58114051818848, -2, -2, 179.65184020996094, 45.460886001586914, -2, -2, 70.39932632446289, -2, -2, 45.81112289428711, 78.67411422729492, 119.23073959350586, 76.56509017944336, -2, -2, -2, -2, 156.6062240600586, -2, -2], "scores": [[0.3330416666666667, 0.332375, 0.33458333333333334], [0.8068835652264881, 0.18903651009519823, 0.004079924678313631], [0.9127395444136435, 0.08689887911293238, 3615764734241292e-19], [0.475609756097561, 0.5191637630662022, 0.005226480836236935], [0.7546468401486989, 0.241635687732342, 0.0037174721189591076], [0.900523560209424, 0.09947643979057591, 0], [0.5384615384615384, 0.46153846153846156, 0], [0.9575757575757575, 0.04242424242424243, 0], [1, 0, 0], [0.851063829787234, 0.14893617021276595, 0], [0.3974358974358974, 0.5897435897435898, 0.01282051282051282], [0.5945945945945946, 0.40540540540540543, 0], [0.21951219512195122, 0.7560975609756098, 0.024390243902439025], [0.22950819672131148, 0.7639344262295082, 0.006557377049180328], [0.410958904109589, 0.589041095890411, 0], [0, 1, 0], [0.5172413793103449, 0.4827586206896552, 0], [0.7090909090909091, 0.2909090909090909, 0], [0.8333333333333334, 0.16666666666666666, 0], [0.56, 0.44, 0], [0.3442622950819672, 0.6557377049180327, 0], [0.24324324324324326, 0.7567567567567568, 0], [0.5, 0.5, 0], [0.06289308176100629, 0.9245283018867925, 0.012578616352201259], [0, 1, 0], [0.11363636363636363, 0.8636363636363636, 0.022727272727272728], [0, 0.9591836734693877, 0.04081632653061224], [0, 1, 0], [0, 0.9166666666666666, 0.08333333333333333], [0.2564102564102564, 0.7435897435897436, 0], [0.9452285381328499, 0.054771461867150074, 0], [0.9586622073578596, 0.04133779264214047, 0], [0.9871093060215433, 0.012890693978456649, 0], [0.9909843606255749, 0.009015639374425023, 0], [0.9513888888888888, 0.04861111111111111, 0], [0.9746835443037974, 0.02531645569620253, 0], [0.7027027027027027, 0.2972972972972973, 0], [0.9944033579852088, 0.0055966420147911256, 0], [0.9974293059125964, 0.002570694087403599, 0], [0.9838274932614556, 0.016172506738544475, 0], [0.8947368421052632, 0.10526315789473684, 0], [0.5416666666666666, 0.4583333333333333, 0], [0.9362745098039216, 0.06372549019607843, 0], [0.9642857142857143, 0.03571428571428571, 0], [0.8055555555555556, 0.19444444444444445, 0], [0.869757174392936, 0.13024282560706402, 0], [0.9108040201005025, 0.08919597989949749, 0], [0.9381153305203939, 0.06188466947960619, 0], [0.9508562918838421, 0.049143708116157855, 0], [0.7215189873417721, 0.27848101265822783, 0], [0.6823529411764706, 0.3176470588235294, 0], [0.3269230769230769, 0.6730769230769231, 0], [0.8389830508474576, 0.16101694915254236, 0], [0.5727272727272728, 0.42727272727272725, 0], [0.7480916030534351, 0.25190839694656486, 0], [0.8977272727272727, 0.10227272727272728, 0], [0.4418604651162791, 0.5581395348837209, 0], [0.3146067415730337, 0.6853932584269663, 0], [0.72, 0.28, 0], [0.15625, 0.84375, 0], [0.5403225806451613, 0.4596774193548387, 0], [0.7857142857142857, 0.21428571428571427, 0], [0.46153846153846156, 0.5384615384615384, 0], [0.87, 0.13, 0], [0.96, 0.04, 0], [1, 0, 0], [0.9166666666666666, 0.08333333333333333, 0], [0.78, 0.22, 0], [0.92, 0.08, 0], [0.64, 0.36, 0], [0.28688524590163933, 0.7131147540983607, 0], [0.5909090909090909, 0.4090909090909091, 0], [0.11538461538461539, 0.8846153846153846, 0], [0.037037037037037035, 0.9629629629629629, 0], [0.08333333333333333, 0.9166666666666666, 0], [0, 1, 0], [0.2916666666666667, 0.7083333333333334, 0], [0.11093502377179082, 0.8605388272583202, 0.02852614896988907], [0.36042402826855124, 0.6395759717314488, 0], [0.7244897959183674, 0.2755102040816326, 0], [0.3076923076923077, 0.6923076923076923, 0], [0.875, 0.125, 0], [0.7083333333333334, 0.2916666666666667, 0], [0.9583333333333334, 0.041666666666666664, 0], [1, 0, 0], [0.9166666666666666, 0.08333333333333333, 0], [0.16756756756756758, 0.8324324324324325, 0], [0.09937888198757763, 0.9006211180124224, 0], [0.4583333333333333, 0.5416666666666666, 0], [0.0364963503649635, 0.9635036496350365, 0], [0.11363636363636363, 0.8863636363636364, 0], [0, 1, 0], [0.625, 0.375, 0], [0.03881511746680286, 0.9244126659856997, 0.03677221654749745], [0.039832285115303984, 0.9412997903563941, 0.018867924528301886], [0.1650485436893204, 0.8349514563106796, 0], [0.4807692307692308, 0.5192307692307693, 0], [0.76, 0.24, 0], [0.2222222222222222, 0.7777777777777778, 0], [0.05844155844155844, 0.9415584415584416, 0], [0.2916666666666667, 0.7083333333333334, 0], [0.015384615384615385, 0.9846153846153847, 0], [0.08333333333333333, 0.9166666666666666, 0], [0, 1, 0], [0.0053475935828877, 0.9705882352941176, 0.02406417112299465], [0.0055248618784530384, 0.9820441988950276, 0.012430939226519336], [0, 0.8333333333333334, 0.16666666666666666], [0.005714285714285715, 0.9871428571428572, 0.0071428571428571435], [0.046875, 0.9375, 0.015625], [0.0015723270440251573, 0.9921383647798742, 0.006289308176100629], [0, 0.625, 0.375], [0, 0.28, 0.72], [0.019389238972370333, 0.42725573021258917, 0.5533550308150406], [0.03968253968253968, 0.7276077097505669, 0.23270975056689341], [0.04574520413182489, 0.8245614035087719, 0.1296933923594032], [0.05320366132723112, 0.889397406559878, 0.057398932112890926], [0.055566620195180244, 0.9085839474208325, 0.03584943238398725], [0.26147959183673475, 0.7321428571428572, 0.006377551020408164], [0.568904593639576, 0.43109540636042404, 0], [0.8076923076923077, 0.19230769230769232, 0], [0.13861386138613863, 0.8613861386138614, 0], [0.08782435129740519, 0.9021956087824351, 0.00998003992015968], [0.02406417112299465, 0.9625668449197861, 0.013368983957219251], [0.2755905511811024, 0.7244094488188977, 0], [0.01746518763275903, 0.9412320037762568, 0.04130280859098419], [0, 0.7397260273972602, 0.2602739726027397], [0, 0.8287292817679558, 0.1712707182320442], [0, 0.3157894736842105, 0.6842105263157895], [0.01841712294673967, 0.9522150323544052, 0.02936784469885515], [0.01974699166923789, 0.9654427645788337, 0.014810243751928418], [0.01287001287001287, 0.8970398970398971, 0.09009009009009009], [0, 0.45739910313901344, 0.5426008968609866], [0, 0.7727272727272727, 0.22727272727272727], [0, 0.4, 0.6], [0, 0.9206349206349206, 0.07936507936507936], [0, 1, 0], [0, 0.8, 0.2], [0, 0.2518518518518518, 0.7481481481481481], [0, 0.6129032258064516, 0.3870967741935484], [0, 0.14423076923076922, 0.8557692307692307], [0, 0.2978723404255319, 0.7021276595744681], [0, 0.017543859649122806, 0.9824561403508771], [0, 0.4269005847953216, 0.5730994152046783], [0, 0.7708333333333334, 0.22916666666666666], [0, 0.45544554455445546, 0.5445544554455446], [0, 0.7058823529411765, 0.29411764705882354], [0, 0.875, 0.125], [0, 0.5555555555555556, 0.4444444444444444], [0, 0.2, 0.8], [0, 0.32, 0.68], [0, 0.08, 0.92], [0, 0.9063829787234042, 0.09361702127659574], [0, 0.9423076923076923, 0.057692307692307696], [0, 0.9723756906077348, 0.027624309392265192], [0, 0.7407407407407407, 0.25925925925925924], [0, 0.6296296296296297, 0.37037037037037035], [0, 0.20423892100192678, 0.7957610789980732], [0, 0.6984126984126984, 0.30158730158730157], [0, 0.375, 0.625], [0, 0.8974358974358975, 0.10256410256410256], [0, 0.13596491228070176, 0.8640350877192983], [0, 0.10440835266821345, 0.8955916473317865], [0, 0.2459016393442623, 0.7540983606557377], [0, 0.04854368932038835, 0.9514563106796117], [0, 0.68, 0.32], [0.0010449320794148381, 0.109717868338558, 0.8892371995820272], [0.005681818181818182, 0.45454545454545453, 0.5397727272727273], [0.009615384615384618, 0.701923076923077, 0.2884615384615385], [0.013698630136986302, 0.904109589041096, 0.08219178082191782], [0, 0.7916666666666666, 0.20833333333333334], [0.02040816326530612, 0.9591836734693877, 0.02040816326530612], [0, 1, 0], [0.04166666666666667, 0.9166666666666667, 0.04166666666666667], [0, 0.22580645161290322, 0.7741935483870968], [0, 0.09722222222222222, 0.9027777777777778], [0, 0.2916666666666667, 0.7083333333333334], [0, 0, 1], [0, 0.03201024327784891, 0.967989756722151], [0, 0.017735334242837655, 0.9822646657571623], [0, 0.0945945945945946, 0.9054054054054054], [0, 0.25, 0.75], [0, 0.02, 0.98], [0, 0, 1], [0, 0.041666666666666664, 0.9583333333333334], [0, 0.009104704097116844, 0.9908952959028832], [0, 0.045871559633027525, 0.9541284403669725], [0, 0.14705882352941177, 0.8529411764705882], [0, 0, 1], [0, 0.0018181818181818182, 0.9981818181818182], [0, 0.041666666666666664, 0.9583333333333334], [0, 0, 1], [0, 0.25, 0.75], [0, 0.5, 0.5], [0, 0, 1], [0, 0.14028436018957346, 0.8597156398104265], [0, 0.5643044619422573, 0.4356955380577428], [0, 0.7390243902439024, 0.26097560975609757], [0, 0.8571428571428571, 0.14285714285714285], [0, 0.5864197530864198, 0.41358024691358025], [0, 0.6976744186046512, 0.3023255813953488], [0, 0.896551724137931, 0.10344827586206896], [0, 0.5352112676056338, 0.4647887323943662], [0, 0.15151515151515152, 0.8484848484848485], [0, 0.9431372549019608, 0.056862745098039215], [0, 0.9609053497942387, 0.03909465020576132], [0, 0.9882005899705014, 0.011799410029498525], [0, 0.8979591836734694, 0.10204081632653061], [0, 0.5833333333333334, 0.4166666666666667], [0, 0.20270270270270271, 0.7972972972972973], [0, 0.10344827586206896, 0.896551724137931], [0, 0.225, 0.775], [0, 0.039473684210526314, 0.9605263157894737], [0, 0.125, 0.875], [0, 0, 1], [0, 0.5625, 0.4375], [0, 0.12074303405572756, 0.8792569659442725], [0, 0.03286384976525822, 0.9671361502347418], [0, 0.1206896551724138, 0.8793103448275862], [0, 0.25, 0.75], [0, 0.029411764705882353, 0.9705882352941176], [0, 0, 1], [0, 0.2909090909090909, 0.7090909090909091], [0, 0.5294117647058824, 0.47058823529411764], [0, 0.75, 0.25], [0, 0.3333333333333333, 0.6666666666666666], [0, 0.0847457627118644, 0.9152542372881356], [0, 0.20833333333333334, 0.7916666666666666], [0, 0, 1], [0, 0.06264017942966998, 0.9373598205703301], [0, 0.046411403944969336, 0.9535885960550307], [0, 0.23247232472324722, 0.7675276752767528], [0, 0.48497854077253216, 0.5150214592274678], [0, 0.7549019607843137, 0.24509803921568626], [0, 0.9090909090909091, 0.09090909090909091], [0, 0.4722222222222222, 0.5277777777777778], [0, 0.2748091603053435, 0.7251908396946565], [0, 0.5319148936170213, 0.46808510638297873], [0, 0.13095238095238096, 0.8690476190476191], [0, 0.042071197411003236, 0.9579288025889967], [0, 0.20588235294117646, 0.7941176470588235], [0, 0.02181818181818182, 0.9781818181818182], [0, 0.08888888888888889, 0.9111111111111111], [0, 0.008695652173913044, 0.991304347826087], [0, 0.028045893279912585, 0.9719541067200874], [0, 0.12071330589849108, 0.879286694101509], [0, 0.3897058823529412, 0.6102941176470589], [0, 0.1927710843373494, 0.8072289156626506], [0, 0.6981132075471698, 0.3018867924528302], [0, 0.05902192242833052, 0.9409780775716695], [0, 0.038817005545286505, 0.9611829944547134], [0, 0.2692307692307692, 0.7307692307692307], [0, 0.01385972280554389, 0.9861402771944561], [0, 0.039634146341463415, 0.9603658536585366], [0, 0.021551724137931036, 0.978448275862069], [0, 0.17763157894736842, 0.8223684210526315], [0, 0.004057971014492754, 0.9959420289855072], [0, 0.014806378132118452, 0.9851936218678815], [0, 38880248833592535e-20, 0.999611197511664], [0, 0.5311004784688995, 0.4688995215311005], [0, 0.7611940298507462, 0.23880597014925373], [0, 0.8807339449541285, 0.11926605504587157], [0, 0.9705882352941176, 0.029411764705882353], [0, 1, 0], [0, 0.9166666666666666, 0.08333333333333333], [0, 0.7317073170731707, 0.2682926829268293], [0, 0.24, 0.76], [0, 0.12, 0.88], [0, 0.375, 0.625], [0, 0, 1]] };

  // frontend/src/domain/pmv1.mjs
  var ApplicationError = class extends Error {
    constructor(code, message) {
      super(message);
      this.code = code;
    }
  };
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

  // frontend/src/application/use-cases/pmv1-service.mjs
  var Pmv1Service = class {
    constructor({ store, entropy, remote }) {
      Object.assign(this, { store, entropy, remote });
    }
    async capture(scenario = "Normal") {
      const bases = { Normal: [25, 70, 10, 12, 15], Advertencia: [34, 48, 45, 42, 90], Emergencia: [52, 25, 85, 82, 260] };
      if (!bases[scenario]) throw Error("Escenario inv\xE1lido");
      const noise = this.entropy.numbers(5), base2 = bases[scenario];
      const values = Object.fromEntries(["temperature_c", "humidity_pct", "smoke_index", "gas_index", "dust_ugm3"].map((key, i) => [key, Math.round((base2[i] + (noise[i] - 0.5) * (i === 4 ? 10 : 4)) * 100) / 100]));
      return this.ingest({ id: this.entropy.id(), node_id: "00000000-0000-4000-8000-000000000001", source: "simulation", observed_at: this.entropy.now().toISOString(), values });
    }
    async ingest(input) {
      const record = evaluatePmv1(input);
      await this.store.put({ ...record, synced: false });
      return record;
    }
    history() {
      return this.store.all();
    }
    async importRecords(records) {
      if (!Array.isArray(records) || !records.length || records.length > 1e3) throw Error("Se requieren de 1 a 1000 lecturas.");
      const evaluated = records.map((r) => ({ ...evaluatePmv1(r), synced: false }));
      if (new Set(evaluated.map((r) => r.reading.id)).size !== evaluated.length) throw Error("Hay identificadores duplicados.");
      await this.store.putMany(evaluated);
    }
    async synchronize() {
      let synced = 0;
      const rows = await this.store.all();
      for (const row of rows.filter((r) => !r.synced)) {
        const ack = await this.remote.savePmv1(row.reading);
        if (ack?.id !== row.reading.id) throw Error("Confirmaci\xF3n de sincronizaci\xF3n inv\xE1lida");
        await this.store.ack(row.reading.id);
        synced++;
      }
      return synced;
    }
  };

  // frontend/src/adapters/out/pmv1-store.mjs
  var Pmv1Store = class {
    constructor(owner) {
      this.owner = owner;
      this.db = null;
    }
    async open() {
      if (this.db) return this.db;
      this.db = await new Promise((resolve, reject) => {
        const req = indexedDB.open("satipo-pmv1-" + this.owner, 1);
        req.onupgradeneeded = () => req.result.createObjectStore("records", { keyPath: "reading.id" });
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(Error("No se pudo abrir el historial local"));
      });
      return this.db;
    }
    async put(record) {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction("records", "readwrite");
        tx.objectStore("records").add(record);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(Error("No se guard\xF3 la lectura: ID repetido o almacenamiento no disponible."));
      });
    }
    async putMany(records) {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction("records", "readwrite");
        for (const r of records) tx.objectStore("records").add(r);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(Error("Lote rechazado: identificador repetido o fallo de almacenamiento."));
      });
    }
    async all() {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const r = db.transaction("records").objectStore("records").getAll();
        r.onsuccess = () => resolve(r.result.sort((a, b) => b.reading.observed_at.localeCompare(a.reading.observed_at)));
        r.onerror = () => reject(Error("No se pudo leer el historial"));
      });
    }
    async ack(id) {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction("records", "readwrite"), store = tx.objectStore("records"), r = store.get(id);
        r.onsuccess = () => {
          if (r.result) store.put({ ...r.result, synced: true });
        };
        tx.oncomplete = resolve;
        tx.onerror = () => reject(Error("No se pudo confirmar el registro local"));
      });
    }
  };

  // frontend/src/bootstrap/backend.mjs
  window.SatipoProject = new ProjectService({ catalog: report_catalog_default, files: new ProjectFiles() });
  window.SatipoPmv1Files = new ProjectFiles();
  window.createPmv1Service = (owner) => new Pmv1Service({ store: new Pmv1Store(owner), entropy: new BrowserEntropy(), remote: window.SatipoBackend });
  var base = new URL("../../", document.currentScript.src);
  var presenter = browserPresenter(base);
  var assets = new HttpAssets(base, window.fetch.bind(window));
  window.SatipoSimulation = new SimulationService({ store: new BrowserStorage(window.localStorage), entropy: new BrowserEntropy() });
  var service;
  var ready = (async () => {
    const config = await assets.config();
    if (!["demo", "supabase"].includes(config.mode)) throw new Error("Modo de datos no v\xE1lido.");
    const cloud = config.mode === "supabase";
    if (cloud && (!config.supabaseUrl || !config.supabasePublishableKey)) throw new Error("Configuraci\xF3n de Supabase incompleta.");
    const client = cloud ? window.createSupabaseClient(config.supabaseUrl, config.supabasePublishableKey) : null;
    const identity = cloud ? new SupabaseIdentity(client, new URL("shared/account.html", base).href) : null;
    service = new BrowserService({
      cloud,
      identity,
      assets,
      profiles: cloud ? new SupabaseProfiles(client) : null,
      community: cloud ? new SupabaseCommunity(client) : null,
      admin: new HttpAdmin({ url: config.apiUrl, publicKey: config.supabasePublishableKey, identity, request: window.fetch.bind(window) }),
      session: new BrowserStorage(window.sessionStorage),
      preferences: new BrowserStorage(window.localStorage)
    });
    if (identity) identity.subscribe(() => {
      service.signedOut();
      presenter.signedOut();
    });
  })();
  ready.catch(() => {
  });
  var actions = Object.fromEntries([
    "identify",
    "login",
    "recover",
    "changePassword",
    "savePreference",
    "listReadings",
    "listOperations",
    "listPredictions",
    "getEnvironment",
    "savePmv1",
    "pmv1History",
    "getActivity",
    "updateState",
    "saveSettings",
    "createReport",
    "requestHelp"
  ].map((name) => [name, async (...args) => {
    await ready;
    return service[name](...args);
  }]));
  window.SatipoBackend = {
    ...actions,
    ready,
    escapeHTML: presenter.escapeHTML,
    fatal: presenter.fatal,
    get cloud() {
      return service?.cloud || false;
    },
    get profile() {
      return service?.profile || null;
    },
    userName: () => service.userName(),
    userEmail: () => service.userEmail(),
    preference: (...args) => service.preference(...args),
    async guard(role) {
      await ready;
      const decision = await service.allowed(role);
      if (!decision.allowed) presenter.login(decision.denied);
      return decision.allowed;
    },
    async logout() {
      await ready;
      await service.logout();
      presenter.login(false);
    }
  };
})();
