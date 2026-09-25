import { ApplicationError } from './errors.mjs';
const states = Object.freeze({
  maintenance: ['Pendiente', 'En progreso', 'Completada'],
  cases: ['Pendiente', 'En revisión', 'Revisado'],
  incidents: ['Nuevo', 'En revisión', 'Validado', 'Falso positivo']
});
/** Entidad inmutable: identidad + estado de una tarea, caso o incidente. */
export class OperationalRecord {
  constructor(kind, id, state) {
    const validId = typeof id === 'string' && (kind === 'incidents'
      ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
      : /^V-0[1-6]$/.test(id));
    if(!validId || !Object.hasOwn(states,kind) || !states[kind].includes(state)) throw new ApplicationError('VALIDATION','Identificador o estado no permitido.');
    this.kind=kind;this.id=id;this.state=state;Object.freeze(this);
  }
  changeState(state) { return new OperationalRecord(this.kind,this.id,state); }
}
export function changeCommand(kind, id, expectedState, nextState) {
  const current=new OperationalRecord(kind,id,expectedState);
  const next=current.changeState(nextState);
  // El esquema permite reabrir tareas: no se inventa una transición irreversible.
  return Object.freeze({ kind, id, expectedState:current.state, nextState:next.state });
}
export function validateThresholds(value) {
  requireObject(value);
  const bounds = { temp_critical:[20,55], smoke_critical:[Number.MIN_VALUE,100], humidity_dry:[10,90], wind_risk:[1,80] };
  const result = {};
  for (const [key,[min,max]] of Object.entries(bounds)) {
    if (typeof value[key] !== 'number' || !Number.isFinite(value[key]) || value[key] < min || value[key] > max) throw new ApplicationError('VALIDATION','Umbrales fuera del rango permitido.');
    result[key] = value[key];
  }
  return Object.freeze(result);
}
export function requireObject(value) {
  if(!value || typeof value !== 'object' || Array.isArray(value)) throw new ApplicationError('VALIDATION','Se requiere un objeto de datos.');
}
