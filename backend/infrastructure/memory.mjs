import { IdentityPort, RepositoryPort } from '../application/ports.mjs';
/** Adaptador de prueba: no se incluye en el punto de composición productivo. */
export class MemoryIdentity extends IdentityPort {
  async authenticate(token) { return token==='admin'?{id:'admin',isAdmin:true}:token==='user'?{id:'user',isAdmin:false}:null; }
}
export class MemoryRepository extends RepositoryPort {
  constructor() { super(); this.items=new Map([['maintenance:V-01',{node_id:'V-01',state:'Pendiente'}],['cases:V-01',{node_id:'V-01',state:'Pendiente'}]]); }
  async readings() { return [{source_row:201,fire_alarm:false}]; }
  async operations() { return {nodes:[],links:[],cases:[],maintenance:[...this.items.values()].map(r=>({...r}))}; }
  async activity() { return {reports:[],incidents:[],settings:{}}; }
  async compareAndSet({kind,id,expectedState,nextState}) {
    const item=this.items.get(`${kind}:${id}`);
    if(!item || item.state!==expectedState)return null;
    item.state=nextState;return {...item};
  }
  async exists(kind,id) { return this.items.has(`${kind}:${id}`); }
  async saveSettings(settings) { return {...settings}; }
}
