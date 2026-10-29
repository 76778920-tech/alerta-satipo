import {evaluatePmv1} from '../../domain/pmv1.mjs';
export class Pmv1Service {
  constructor({store,entropy,remote}) {Object.assign(this,{store,entropy,remote});}
  async capture(scenario='Normal') {
    const bases={Normal:[25,70,10,12,15],Advertencia:[34,48,45,42,90],Emergencia:[52,25,85,82,260]};
    if(!bases[scenario])throw Error('Escenario inválido');
    const noise=this.entropy.numbers(5),base=bases[scenario];
    const values=Object.fromEntries(['temperature_c','humidity_pct','smoke_index','gas_index','dust_ugm3'].map((key,i)=>[key,Math.round((base[i]+(noise[i]-0.5)*(i===4?10:4))*100)/100]));
    return this.ingest({id:this.entropy.id(),node_id:'00000000-0000-4000-8000-000000000001',source:'simulation',observed_at:this.entropy.now().toISOString(),values});
  }
  async ingest(input) {
    const record=evaluatePmv1(input);await this.store.put({...record,synced:false});return record;
  }
  history(){return this.store.all();}
  async importRecords(records) {
    if(!Array.isArray(records)||!records.length||records.length>1000)throw Error('Se requieren de 1 a 1000 lecturas.');
    const evaluated=records.map(r=>({...evaluatePmv1(r),synced:false}));
    if(new Set(evaluated.map(r=>r.reading.id)).size!==evaluated.length)throw Error('Hay identificadores duplicados.');
    await this.store.putMany(evaluated);
  }
  async synchronize() {
    let synced=0;const rows=await this.store.all();
    for(const row of rows.filter(r=>!r.synced)) {
      const ack=await this.remote.savePmv1(row.reading);
      if(ack?.id!==row.reading.id)throw Error('Confirmación de sincronización inválida');
      await this.store.ack(row.reading.id);synced++;
    }
    return synced;
  }
}
