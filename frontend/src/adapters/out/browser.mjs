import { KeyValuePort, EntropyPort } from '../../application/ports/out/gateways.mjs';

export class BrowserStorage extends KeyValuePort {
  constructor(storage) { super(); this.storage = storage; }
  get(key) { return this.storage.getItem(key); }
  set(key, value) { this.storage.setItem(key, value); }
  remove(key) { this.storage.removeItem(key); }
  clear() { this.storage.clear(); }
}
export class BrowserEntropy extends EntropyPort {
  now() { return new Date(); }
  id() { return crypto.randomUUID(); }
  numbers(count) { return [...crypto.getRandomValues(new Uint32Array(count))].map(value => value / 4294967296); }
}
