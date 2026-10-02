import { IdentityPort, ProfilePort, CommunityPort } from '../../application/ports/out/gateways.mjs';
const checked = result => { if (result.error) throw result.error; return result.data; };

export class SupabaseIdentity extends IdentityPort {
  constructor(client, recoveryUrl) { super(); this.client = client; this.recoveryUrl = recoveryUrl; }
  async currentUser() {
    const result = await this.client.auth.getUser();
    if (result.error?.status >= 500) throw result.error;
    const user = result.error ? null : result.data.user;
    return user ? {id:user.id,email:user.email} : null;
  }
  async signIn(credentials) { checked(await this.client.auth.signInWithPassword(credentials)); }
  async signOut() { checked(await this.client.auth.signOut({scope:'local'})); }
  async recover(email) { checked(await this.client.auth.resetPasswordForEmail(email, {redirectTo:this.recoveryUrl})); }
  async changePassword(password) { checked(await this.client.auth.updateUser({password})); }
  async accessToken() { return checked(await this.client.auth.getSession()).session?.access_token; }
  subscribe(callback) { return this.client.auth.onAuthStateChange(event => { if(event === 'SIGNED_OUT') callback(); }); }
}
export class SupabaseProfiles extends ProfilePort {
  constructor(client) { super(); this.client = client; }
  async find(user) {
    const admin = checked(await this.client.from('administradores').select('id,display_name').eq('id', user.id).maybeSingle());
    const person = checked(await this.client.from('clientes').select('*').eq('id', user.id).single());
    return {...person, email:user.email, role:admin ? 'admin' : 'user', name:admin?.display_name || person.full_name};
  }
  async updatePreference(id, field, value) {
    checked(await this.client.from('clientes').update({[field]:value}).eq('id',id).select('id').single());
  }
}
export class SupabaseCommunity extends CommunityPort {
  constructor(client) { super(); this.client = client; }
  async readings() {
    return checked(await this.client.from('smoke_readings').select('*').eq('dataset_id','smoke-detection-iot-300-v1').order('source_row').limit(300));
  }
  async activity(id) {
    const [reports,incidents,settings] = (await Promise.all([
      this.client.from('reportes').select('*').eq('user_id',id).order('created_at',{ascending:false}).limit(200),
      this.client.from('incidentes').select('*').eq('user_id',id).order('created_at',{ascending:false}).limit(200),
      this.client.from('app_settings').select('*').eq('id',true).single()
    ])).map(checked);
    return {reports,incidents,settings};
  }
  async createReport(id, report) {
    checked(await this.client.from('reportes').insert({user_id:id,location:report.location,observation:report.type,severity:report.severity,description:report.description,contact:report.contact,distance:report.distance}));
  }
  async requestHelp({location,visible,safe,reference}) {
    return checked(await this.client.rpc('request_help',{location_text:location,visible,safe,reference_known:reference}));
  }
}
