export const preferenceFields = Object.freeze({
  'notif-push': 'notif_push', 'notif-sound': 'notif_sound', 'share-location': 'share_location'
});
export function preferenceField(key, value) {
  if (!Object.hasOwn(preferenceFields, key) || typeof value !== 'boolean') throw new Error('Preferencia inválida.');
  return preferenceFields[key];
}
export function requireAdmin(profile) {
  if (!profile || profile.role !== 'admin') {
    const error = new Error('Acceso denegado. Esta página es exclusiva para administradores autorizados.');
    error.code = 'FORBIDDEN';
    throw error;
  }
  return profile;
}
export function validateReport(report) {
  if (!report || typeof report.location !== 'string' || !report.location.trim()
      || typeof report.description !== 'string' || report.description.trim().length < 20
      || !['low', 'medium', 'high'].includes(report.severity)
      || typeof report.type !== 'string' || !report.type.trim()) throw new Error('Reporte incompleto o inválido.');
  return report;
}
export function validateHelp(input) {
  if (!input || typeof input.location !== 'string' || !input.location.trim()
      || typeof input.visible !== 'boolean' || typeof input.safe !== 'boolean'
      || typeof input.reference !== 'boolean' || input.location.trim().length < 3
      || [input.visible,input.safe,input.reference].filter(Boolean).length < 2) throw new Error('Confirma al menos dos condiciones y una referencia del lugar.');
  return input;
}
