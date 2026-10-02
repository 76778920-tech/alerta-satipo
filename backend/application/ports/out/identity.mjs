export class IdentityPort {
  /** Retorna {id, isAdmin} a partir de una credencial verificada. */
  async authenticate(token) { throw new Error('IdentityPort.authenticate'); }
}
