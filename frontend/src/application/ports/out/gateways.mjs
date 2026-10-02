/** Contratos propiedad de la aplicación: datos planos, sin SDK ni respuestas HTTP. */
export class IdentityPort {
  async currentUser() { throw new Error('IdentityPort.currentUser'); }
  async signIn(credentials) { throw new Error('IdentityPort.signIn'); }
  async signOut() { throw new Error('IdentityPort.signOut'); }
  async recover(email) { throw new Error('IdentityPort.recover'); }
  async changePassword(password) { throw new Error('IdentityPort.changePassword'); }
  async accessToken() { throw new Error('IdentityPort.accessToken'); }
}
export class ProfilePort {
  async find(user) { throw new Error('ProfilePort.find'); }
  async updatePreference(id, field, value) { throw new Error('ProfilePort.updatePreference'); }
}
export class CommunityPort {
  async readings() { throw new Error('CommunityPort.readings'); }
  async activity(id) { throw new Error('CommunityPort.activity'); }
  async createReport(id, report) { throw new Error('CommunityPort.createReport'); }
  async requestHelp(input) { throw new Error('CommunityPort.requestHelp'); }
}
export class AdminPort {
  async readings() { throw new Error('AdminPort.readings'); }
  async operations() { throw new Error('AdminPort.operations'); }
  async predictions() { throw new Error('AdminPort.predictions'); }
  async activity() { throw new Error('AdminPort.activity'); }
  async updateState(kind, id, input) { throw new Error('AdminPort.updateState'); }
  async saveSettings(settings) { throw new Error('AdminPort.saveSettings'); }
}
export class KeyValuePort {
  get(key) { throw new Error('KeyValuePort.get'); }
  set(key, value) { throw new Error('KeyValuePort.set'); }
  remove(key) { throw new Error('KeyValuePort.remove'); }
  clear() { throw new Error('KeyValuePort.clear'); }
}
export class AssetsPort {
  async model() { throw new Error('AssetsPort.model'); }
  async readings() { throw new Error('AssetsPort.readings'); }
}
export class EntropyPort {
  now() { throw new Error('EntropyPort.now'); }
  id() { throw new Error('EntropyPort.id'); }
  numbers(count) { throw new Error('EntropyPort.numbers'); }
}
