import { AdminPort, AssetsPort } from '../../application/ports/out/gateways.mjs';

export class HttpAdmin extends AdminPort {
  constructor({url, publicKey, identity, request}) { super(); Object.assign(this,{url,publicKey,identity,request}); }
  async send(path, method='GET', body) {
    if (!this.url) throw new Error('API administrativa no configurada.');
    const token = await this.identity.accessToken();
    if (!token) throw new Error('Inicia sesión nuevamente.');
    const response = await this.request(this.url.replace(/\/$/,'') + path, {
      method, headers:{Authorization:`Bearer ${token}`, apikey:this.publicKey, 'Content-Type':'application/json'},
      ...(body === undefined ? {} : {body:JSON.stringify(body)})
    });
    let payload;
    try { payload = await response.json(); } catch { throw new Error('Respuesta inválida de la API.'); }
    if (!response.ok) throw new Error(payload.error || 'No se pudo consultar la API administrativa.');
    return payload;
  }
  readings() { return this.send('/readings'); }
  operations() { return this.send('/operations'); }
  predictions() { return this.send('/predictions'); }
  activity() { return this.send('/activity'); }
  updateState(kind, id, input) { return this.send(`/${encodeURIComponent(kind)}/${encodeURIComponent(id)}`, 'PATCH', input); }
  saveSettings(settings) { return this.send('/settings', 'PATCH', settings); }
}
export class HttpAssets extends AssetsPort {
  constructor(base, request) { super(); this.base = base; this.request = request; }
  async read(path) {
    const response = await this.request(new URL(path, this.base), {cache:'no-store'});
    if (!response.ok) throw new Error(`Recurso no disponible: ${path}`);
    return response.json();
  }
  model() { return this.read('shared/models/satipo_umbrales.json'); }
  readings() { return this.read('data/smoke_detection_300.json'); }
  config() { return this.read('config/public.json'); }
}
