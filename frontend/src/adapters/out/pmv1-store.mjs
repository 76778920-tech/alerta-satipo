export class Pmv1Store {
  constructor(owner) {this.owner=owner;this.db=null;}
  async open() {
    if(this.db)return this.db;
    this.db=await new Promise((resolve,reject)=>{const req=indexedDB.open('satipo-pmv1-'+this.owner,1);req.onupgradeneeded=()=>req.result.createObjectStore('records',{keyPath:'reading.id'});req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(Error('No se pudo abrir el historial local'));});return this.db;
  }
  async put(record){const db=await this.open();return new Promise((resolve,reject)=>{const tx=db.transaction('records','readwrite');tx.objectStore('records').add(record);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(Error('No se guardó la lectura: ID repetido o almacenamiento no disponible.'));});}
  async putMany(records){const db=await this.open();return new Promise((resolve,reject)=>{const tx=db.transaction('records','readwrite');for(const r of records)tx.objectStore('records').add(r);tx.oncomplete=resolve;tx.onerror=()=>reject(Error('Lote rechazado: identificador repetido o fallo de almacenamiento.'));});}
  async all(){const db=await this.open();return new Promise((resolve,reject)=>{const r=db.transaction('records').objectStore('records').getAll();r.onsuccess=()=>resolve(r.result.sort((a,b)=>b.reading.observed_at.localeCompare(a.reading.observed_at)));r.onerror=()=>reject(Error('No se pudo leer el historial'));});}
  async ack(id){const db=await this.open();return new Promise((resolve,reject)=>{const tx=db.transaction('records','readwrite'),store=tx.objectStore('records'),r=store.get(id);r.onsuccess=()=>{if(r.result)store.put({...r.result,synced:true});};tx.oncomplete=resolve;tx.onerror=()=>reject(Error('No se pudo confirmar el registro local'));});}
}
