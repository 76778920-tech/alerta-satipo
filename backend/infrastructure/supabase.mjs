import { IdentityPort, RepositoryPort } from '../application/ports.mjs';
import { ApplicationError } from '../domain/errors.mjs';
const tables={maintenance:['demo_maintenance','node_id'], cases:['demo_cases','node_id'], incidents:['incidentes','id']};
function check(result) {
  if(result.error) {
    const code=result.error.code;
    if(code==='42501') throw new ApplicationError('FORBIDDEN','Operación no autorizada.');
    if(['23514','22P02'].includes(code)) throw new ApplicationError('VALIDATION','Datos no permitidos.');
    throw new ApplicationError('UNAVAILABLE','No se pudo consultar la base de datos.');
  }
  return result.data;
}
export class SupabaseIdentity extends IdentityPort {
  constructor(client) { super(); this.client=client; }
  async authenticate(token) {
    if(!token)return null;
    const result=await this.client.auth.getUser(token);
    if(result.error) {
      if(result.error.status>=500 || !result.error.status) throw new ApplicationError('UNAVAILABLE','Servicio de identidad no disponible.');
      return null;
    }
    if(!result.data.user)return null;
    const admin=check(await this.client.from('administradores').select('id').eq('id',result.data.user.id).maybeSingle());
    return {id:result.data.user.id,isAdmin:!!admin};
  }
}
export class SupabaseRepository extends RepositoryPort {
  constructor(client) { super(); this.client=client; }
  async readings() { return check(await this.client.from('smoke_readings').select('*').eq('dataset_id','smoke-detection-iot-300-v1').order('source_row').limit(300)); }
  async operations() {
    const [nodes,links,cases,maintenance]=(await Promise.all([
      this.client.from('demo_nodes').select('*').order('id'),
      this.client.from('demo_node_readings').select('node_id,source_row,smoke_readings(*)').order('source_row').limit(300),
      this.client.from('demo_cases').select('*').order('node_id'),
      this.client.from('demo_maintenance').select('*').order('node_id')
    ])).map(check);
    return {nodes,links,cases,maintenance};
  }
  async activity() {
    const [reports,incidents,settings]=(await Promise.all([
      this.client.from('reportes').select('*').order('created_at',{ascending:false}).limit(200),
      this.client.from('incidentes').select('*').order('created_at',{ascending:false}).limit(200),
      this.client.from('app_settings').select('*').eq('id',true).single()
    ])).map(check);
    return {reports,incidents,settings};
  }
  async compareAndSet({kind,id,expectedState,nextState}) {
    const [table,key]=tables[kind];
    const rows=check(await this.client.from(table).update({state:nextState}).eq(key,id).eq('state',expectedState).select('*'));
    return rows[0] || null;
  }
  async exists(kind,id) { const [table,key]=tables[kind];return !!check(await this.client.from(table).select(key).eq(key,id).maybeSingle()); }
  async saveSettings(settings) { return check(await this.client.from('app_settings').update(settings).eq('id',true).select().single()); }
}
