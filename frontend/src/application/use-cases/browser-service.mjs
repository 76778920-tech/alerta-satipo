import { BrowserUseCases } from '../ports/in/browser-use-cases.mjs';
import { preferenceField, preferenceFields, requireAdmin, validateReport, validateHelp } from '../../domain/account.mjs';
import { validateReadings, validateOperations, validatePredictions } from '../../domain/historical.mjs';

export class BrowserService extends BrowserUseCases {
  constructor({identity, profiles, community, admin, assets, session, preferences, cloud}) {
    super();
    Object.assign(this, {identity, profiles, community, admin, assets, session, preferences, cloud});
    this.profile = null;
  }
  async identify() {
    if (!this.cloud) return null;
    const user = await this.identity.currentUser();
    if (!user) { this.signedOut(); return null; }
    this.profile = await this.profiles.find(user);
    if (!this.profile) { this.signedOut(); return null; }
    this.session.set('userRole', this.profile.role);
    this.session.set('userEmail', this.profile.email);
    this.session.set('userName', this.profile.name);
    return this.profile;
  }
  signedOut() { this.profile = null; this.session.clear(); }
  async login(credentials) {
    if (!this.cloud) throw new Error('Este acceso requiere la conexión administrativa configurada.');
    await this.identity.signIn(credentials);
    const profile = await this.identify();
    try { return requireAdmin(profile); }
    catch (error) { await this.logout(); throw error; }
  }
  async allowed(role) {
    const profile = this.cloud ? await this.identify() : {role: this.session.get('userRole')};
    if (!profile?.role) return {allowed:false, denied:false};
    if (role === 'admin' && profile.role !== 'admin') {
      await this.logout();
      return {allowed:false, denied:true};
    }
    return {allowed:true, denied:false};
  }
  async logout() { try { if (this.cloud) await this.identity.signOut(); } finally { this.signedOut(); } }
  async recover(email) {
    if (!this.cloud) throw new Error('La recuperación requiere conexión.');
    return this.identity.recover(email);
  }
  async changePassword(password) {
    requireAdmin(await this.identify());
    if (typeof password !== 'string' || password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');
    return this.identity.changePassword(password);
  }
  userName() { return this.profile?.name || this.session.get('userName'); }
  userEmail() { return this.profile?.email || this.session.get('userEmail'); }
  preference(key, fallback) {
    if (!Object.hasOwn(preferenceFields, key)) throw new Error('Preferencia inválida.');
    const value = this.cloud ? this.profile?.[preferenceFields[key]] : this.preferences.get(`satipo-${key}`);
    return value == null ? fallback : value === true || value === 'true';
  }
  async savePreference(key, value) {
    const field = preferenceField(key, value);
    if (this.cloud) {
      if (!this.profile) throw new Error('Inicia sesión nuevamente.');
      await this.profiles.updatePreference(this.profile.id, field, value);
      this.profile[field] = value;
    } else this.preferences.set(`satipo-${key}`, String(value));
  }
  async listReadings() {
    const rows = !this.cloud ? await this.assets.readings()
      : this.profile?.role === 'user' ? await this.community.readings() : await this.admin.readings();
    return validateReadings(rows);
  }
  async listOperations() { return validateOperations(await this.admin.operations()); }
  async listPredictions() { return validatePredictions(await this.admin.predictions()); }
  async getActivity() {
    return this.profile?.role === 'user' ? this.community.activity(this.profile.id) : this.admin.activity();
  }
  async updateState(kind, id, input) { return this.admin.updateState(kind, id, input); }
  async saveSettings(settings) { return this.admin.saveSettings(settings); }
  async createReport(report) {
    validateReport(report);
    if (!this.profile) throw new Error('Inicia sesión nuevamente.');
    return this.community.createReport(this.profile.id, report);
  }
  async requestHelp(input) { return this.community.requestHelp(validateHelp(input)); }
}
