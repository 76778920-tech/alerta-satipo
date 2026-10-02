/* Generado por npm run build. Editar frontend/src/, no este archivo. */
(() => {
  // frontend/src/application/ports/in/browser-use-cases.mjs
  var BrowserUseCases = class {
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
    if (!value || !Array.isArray(value.rows) || value.rows.length !== 60 || value.evaluation?.train_rows !== 240 || value.evaluation?.test_rows !== 60 || typeof value.version !== "string") throw new Error("Resultados incompletos.");
    const ids = /* @__PURE__ */ new Set();
    for (const row of value.rows) {
      if (!Number.isInteger(row.source_row) || ids.has(row.source_row) || typeof row.actual !== "boolean" || typeof row.predicted !== "boolean" || !Number.isFinite(row.score) || row.score < 0 || row.score > 1 || !Number.isFinite(Date.parse(row.recorded_at))) throw new Error("Resultados inv\xE1lidos.");
      ids.add(row.source_row);
    }
    return value;
  }
  function validateReadings(rows) {
    if (!Array.isArray(rows) || rows.some((r) => !r || typeof r !== "object") || new Set(rows.map((r) => r.source_row)).size !== rows.length) throw new Error("Formato de lecturas inv\xE1lido");
    return rows;
  }
  function validateOperations(value) {
    const { nodes, links, cases, maintenance } = value;
    if (!Array.isArray(nodes) || !Array.isArray(links) || !Array.isArray(cases) || !Array.isArray(maintenance) || nodes.length !== 6 || links.length !== 300 || new Set(links.map((r) => r.source_row)).size !== 300 || links.some((r) => !r.smoke_readings) || nodes.some((n) => links.filter((l) => l.node_id === n.id).length !== 50)) throw new Error("La relaci\xF3n de nodos y lecturas est\xE1 incompleta.");
    return value;
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
      return checked(await this.client.from("smoke_readings").select("*").eq("dataset_id", "smoke-detection-iot-300-v1").order("source_row").limit(300));
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
      return this.read("data/smoke_detection_300.json");
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

  // frontend/src/bootstrap/backend.mjs
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
