import { IdentityPort } from '../../application/ports/out/identity.mjs';
import { RepositoryPort } from '../../application/ports/out/repository.mjs';
/** Adaptador de prueba: no se incluye en el punto de composición productivo. */
export class MemoryIdentity extends IdentityPort {
  async authenticate(token) { return token==='admin'?{id:'admin',isAdmin:true}:token==='user'?{id:'user',isAdmin:false}:null; }
}
export class MemoryRepository extends RepositoryPort {
  constructor() { super(); this.settings={};this.items=new Map([['maintenance:V-01',{node_id:'V-01',state:'Pendiente'}],['cases:V-01',{node_id:'V-01',state:'Pendiente'}]]); }
  async readings() { return [{source_row:201,fire_alarm:false}]; }
  async operations() {
    const rows=kind=>[...this.items].filter(([key])=>key.startsWith(kind+':')).map(([,value])=>({...value}));
    return {nodes:[],links:[],cases:rows('cases'),maintenance:rows('maintenance')};
  }
  async activity() { return {reports:[],incidents:[],settings:{...this.settings}}; }
  async compareAndSet({kind,id,expectedState,nextState}) {
    const item=this.items.get(`${kind}:${id}`);
    if(!item || item.state!==expectedState)return null;
    item.state=nextState;return {...item};
  }
  async exists(kind,id) { return this.items.has(`${kind}:${id}`); }
  async saveSettings(settings) { this.settings={...settings};return {...this.settings}; }
}
