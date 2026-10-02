import { BrowserService } from '../application/use-cases/browser-service.mjs';
import { SupabaseIdentity, SupabaseProfiles, SupabaseCommunity } from '../adapters/out/supabase.mjs';
import { HttpAdmin, HttpAssets } from '../adapters/out/http.mjs';
import { BrowserStorage, BrowserEntropy } from '../adapters/out/browser.mjs';
import { SimulationService } from '../application/use-cases/simulation-service.mjs';
import { browserPresenter } from '../adapters/in/browser-presenter.mjs';

const base = new URL('../../', document.currentScript.src);
const presenter = browserPresenter(base);
const assets = new HttpAssets(base, window.fetch.bind(window));
window.SatipoSimulation = new SimulationService({store:new BrowserStorage(window.localStorage),entropy:new BrowserEntropy()});
let service;
const ready = (async () => {
  const config = await assets.config();
  if (!['demo','supabase'].includes(config.mode)) throw new Error('Modo de datos no válido.');
  const cloud = config.mode === 'supabase';
  if (cloud && (!config.supabaseUrl || !config.supabasePublishableKey)) throw new Error('Configuración de Supabase incompleta.');
  const client = cloud ? window.createSupabaseClient(config.supabaseUrl, config.supabasePublishableKey) : null;
  const identity = cloud ? new SupabaseIdentity(client, new URL('shared/account.html',base).href) : null;
  service = new BrowserService({cloud, identity, assets,
    profiles: cloud ? new SupabaseProfiles(client) : null,
    community: cloud ? new SupabaseCommunity(client) : null,
    admin: new HttpAdmin({url:config.apiUrl,publicKey:config.supabasePublishableKey,identity,request:window.fetch.bind(window)}),
    session:new BrowserStorage(window.sessionStorage), preferences:new BrowserStorage(window.localStorage)
  });
  if (identity) identity.subscribe(() => {service.signedOut(); presenter.signedOut();});
})();
ready.catch(() => {});
const actions = Object.fromEntries(['identify','login','recover','changePassword','savePreference',
  'listReadings','listOperations','listPredictions','getActivity','updateState','saveSettings','createReport','requestHelp'
].map(name => [name, async (...args) => {await ready; return service[name](...args);} ]));
window.SatipoBackend = {
  ...actions, ready, escapeHTML:presenter.escapeHTML, fatal:presenter.fatal,
  get cloud() { return service?.cloud || false; },
  get profile() { return service?.profile || null; },
  userName: () => service.userName(), userEmail: () => service.userEmail(),
  preference: (...args) => service.preference(...args),
  async guard(role) { await ready; const decision = await service.allowed(role); if (!decision.allowed) presenter.login(decision.denied); return decision.allowed; },
  async logout() { await ready; await service.logout(); presenter.login(false); }
};
