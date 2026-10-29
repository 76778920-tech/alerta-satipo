import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluate} from '../scripts/evaluate-pmv1.mjs';
const sample=(n,label)=>({id:`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`,node_id:'00000000-0000-4000-8000-000000000001',source:'simulation',observed_at:'2026-10-26T00:00:00Z',expected_label:label,values:{temperature_c:25,humidity_pct:70,smoke_index:10,gas_index:12,dust_ugm3:15}});
test('Evaluación PMV1: referencia independiente cuenta emergencias omitidas y denominadores',()=>{
 const report=evaluate([sample(1,'Normal'),sample(2,'Emergencia')]);
 assert.equal(report.accuracy,.5);assert.equal(report.missed_emergencies,1);
 assert.equal(report.emergency_recall,0);assert.equal(report.false_alarm_rate,0);
 assert.deepEqual(report.confusion_matrix,[[1,0,0],[0,0,0],[1,0,0]]);
 assert.equal(evaluate([sample(1,'Advertencia')]).false_alarm_rate,null);
 assert.equal(evaluate([sample(1,'Normal')]).emergency_recall,null);
});
test('Evaluación PMV1: rechaza referencia ausente, duplicados y datos incompletos',()=>{
 assert.throws(()=>evaluate([sample(1,undefined)]));assert.throws(()=>evaluate([]));
 assert.throws(()=>evaluate([sample(1,'Normal'),sample(1,'Normal')]));
 const incomplete=sample(1,'Normal');delete incomplete.values.gas_index;
 assert.throws(()=>evaluate([incomplete]));
});
