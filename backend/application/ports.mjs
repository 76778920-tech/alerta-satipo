/** Puertos propiedad del núcleo. No exponen objetos del SDK, HTTP ni SQL. */
export class AdminUseCases {
  async listPredictions(token) { throw new Error("AdminUseCases.listPredictions"); }
  async listReadings(token) { throw new Error('AdminUseCases.listReadings'); }
  async listOperations(token) { throw new Error('AdminUseCases.listOperations'); }
  async getActivity(token) { throw new Error('AdminUseCases.getActivity'); }
  async updateState(token, kind, id, input) { throw new Error('AdminUseCases.updateState'); }
  async updateSettings(token, input) { throw new Error('AdminUseCases.updateSettings'); }
}
export class IdentityPort {
  /** Retorna {id, isAdmin} a partir de una credencial verificada. */
  async authenticate(token) { throw new Error('IdentityPort.authenticate'); }
}
export class RepositoryPort {
  async readings() { throw new Error('RepositoryPort.readings'); }
  /** {nodes, links, cases, maintenance}; DTO con datos planos. */
  async operations() { throw new Error('RepositoryPort.operations'); }
  async activity() { throw new Error('RepositoryPort.activity'); }
  /** Retorna DTO actualizado o null cuando no coincide el estado esperado. */
  async compareAndSet(command) { throw new Error('RepositoryPort.compareAndSet'); }
  async exists(kind, id) { throw new Error('RepositoryPort.exists'); }
  async saveSettings(settings) { throw new Error('RepositoryPort.saveSettings'); }
}

export class PredictionResultsPort {
  async results() { throw new Error("PredictionResultsPort.results"); }
}
