import { generateScenario, validHistory } from '../../domain/simulation.mjs';

/** store: KeyValuePort, entropy: EntropyPort. Nunca escribe en servicios remotos. */
export class SimulationService {
  constructor({store, entropy}) { this.store=store; this.entropy=entropy; }
  history(actor) {
    try { return validHistory(JSON.parse(this.store.get(`satipo-demo-v2:${actor}`) || '[]')); }
    catch { return []; }
  }
  generate(profile, actor) {
    const scenario=generateScenario(profile,this.entropy.numbers(36),this.entropy.now(),this.entropy.id());
    const history=[scenario,...this.history(actor).filter(item=>item.id!==scenario.id)].slice(0,10);
    let saved=true;
    try { this.store.set(`satipo-demo-v2:${actor}`,JSON.stringify(history)); }
    catch { saved=false; }
    return {scenario,history,saved};
  }
}
