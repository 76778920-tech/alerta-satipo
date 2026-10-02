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
