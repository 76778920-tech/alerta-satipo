import { ApplicationError } from '../domain/errors.mjs';
import { changeCommand, validateThresholds, requireObject } from '../domain/operation.mjs';
import { AdminUseCases } from './ports.mjs';
/** Puerto de entrada: API de aplicación consumida por HTTP y pruebas. */
export class AdminService extends AdminUseCases {
  constructor({ identity, repository }) { super(); this.identity=identity; this.repository=repository; }
  async authorize(token) {
    const actor=await this.identity.authenticate(token);
    if (!actor) throw new ApplicationError('UNAUTHENTICATED','Inicia sesión nuevamente.');
    if (actor.isAdmin !== true) throw new ApplicationError('FORBIDDEN','Se requiere autorización administrativa.');
    return actor;
  }
  async listReadings(token) { await this.authorize(token); return this.repository.readings(); }
  async listOperations(token) { await this.authorize(token); return this.repository.operations(); }
  async getActivity(token) { await this.authorize(token); return this.repository.activity(); }
  async updateState(token, kind, id, input) {
    await this.authorize(token);
    requireObject(input);
    const command=changeCommand(kind,id,input.expectedState,input.state);
    const updated=await this.repository.compareAndSet(command);
    if (updated) return updated;
    if (!await this.repository.exists(kind,id)) throw new ApplicationError('NOT_FOUND','Registro no encontrado.');
    throw new ApplicationError('CONFLICT','El estado cambió. Actualiza antes de volver a intentarlo.');
  }
  async updateSettings(token, input) { await this.authorize(token); return this.repository.saveSettings(validateThresholds(input)); }
}
