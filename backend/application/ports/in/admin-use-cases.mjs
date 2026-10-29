export class AdminUseCases {
  async savePmv1(token, input) { throw new Error('AdminUseCases.savePmv1'); }
  async listPmv1(token) { throw new Error('AdminUseCases.listPmv1'); }
  async getEnvironment(token) { throw new Error('AdminUseCases.getEnvironment'); }
  async listPredictions(token) { throw new Error("AdminUseCases.listPredictions"); }
  async listReadings(token) { throw new Error('AdminUseCases.listReadings'); }
  async listOperations(token) { throw new Error('AdminUseCases.listOperations'); }
  async getActivity(token) { throw new Error('AdminUseCases.getActivity'); }
  async updateState(token, kind, id, input) { throw new Error('AdminUseCases.updateState'); }
  async updateSettings(token, input) { throw new Error('AdminUseCases.updateSettings'); }
}
