/** Operaciones invocadas por los controladores de las pantallas. */
export class BrowserUseCases {
  async identify() { throw new Error('BrowserUseCases.identify'); }
  async login(credentials) { throw new Error('BrowserUseCases.login'); }
  async logout() { throw new Error('BrowserUseCases.logout'); }
  async recover(email) { throw new Error('BrowserUseCases.recover'); }
  async changePassword(password) { throw new Error('BrowserUseCases.changePassword'); }
  async savePreference(key, value) { throw new Error('BrowserUseCases.savePreference'); }
  async listReadings() { throw new Error('BrowserUseCases.listReadings'); }
  async listOperations() { throw new Error('BrowserUseCases.listOperations'); }
  async listPredictions() { throw new Error('BrowserUseCases.listPredictions'); }
  async getActivity() { throw new Error('BrowserUseCases.getActivity'); }
  async updateState(kind, id, input) { throw new Error('BrowserUseCases.updateState'); }
  async saveSettings(settings) { throw new Error('BrowserUseCases.saveSettings'); }
  async createReport(report) { throw new Error('BrowserUseCases.createReport'); }
  async requestHelp(input) { throw new Error('BrowserUseCases.requestHelp'); }
}
