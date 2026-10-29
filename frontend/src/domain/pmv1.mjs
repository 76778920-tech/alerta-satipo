// Generado desde backend/domain/pmv1.mjs.
import model from './pmv1-model.mjs';
class ApplicationError extends Error { constructor(code,message) { super(message); this.code=code; } }
const bounds=[[-20,80],[0,100],[0,100],[0,100],[0,1000]];
export function validatePmv1(input) {
  const fail=()=>{throw new ApplicationError('VALIDATION','Registro PMV1 inválido: se requieren cinco variables completas y dentro de rango.');};
  if(!input||Array.isArray(input)||!input.values||Array.isArray(input.values))fail();
  if(input.device_prediction && input.device_prediction.model_version!==model.version)
    throw new ApplicationError('VALIDATION','La exportación del dispositivo usa otro modelo. Se requiere integrar y validar esa versión antes de importar sus lecturas.');
  const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if(!uuid.test(input.id)||!uuid.test(input.node_id)||!['simulation','sensor'].includes(input.source))fail();
  if(typeof input.observed_at!=='string'||!/(Z|[+-]\d{2}:\d{2})$/.test(input.observed_at)||!Number.isFinite(Date.parse(input.observed_at)))fail();
  if(Object.keys(input.values).length!==5)fail();
  const values={};model.features.forEach((key,i)=>{const value=input.values[key];if(typeof value!=='number'||!Number.isFinite(value)||value<bounds[i][0]||value>bounds[i][1])fail();values[key]=value;});
  return {id:input.id,node_id:input.node_id,source:input.source,observed_at:new Date(input.observed_at).toISOString(),values};
}
export function evaluatePmv1(input) {
  const reading=validatePmv1(input),x=model.features.map(key=>Math.fround(reading.values[key]));let n=0;
  while(model.left[n]>=0)n=x[model.feature[n]]<=model.threshold[n]?model.left[n]:model.right[n];
  const scores=model.scores[n],index=scores.indexOf(Math.max(...scores));
  return {reading,prediction:{level:model.labels[index],scores,model_version:model.version,experimental:true},
    alert:index===0?null:{level:model.labels[index],channel:'software',experimental:true}};
}
