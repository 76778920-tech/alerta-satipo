import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateAcquisitionExport} from '../frontend/src/domain/acquisition.mjs';
import {ProjectService} from '../frontend/src/application/use-cases/project-service.mjs';
const catalog=JSON.parse(await readFile('frontend/src/adapters/out/report-catalog.json','utf8'));
const sample=()=>({schema_version:1,operational:false,rows:[{reading:{source:'fixture',external_id:'1',node_id:'api-1',observed_at:'2026-10-23T15:00:00Z',kind:'weather',provenance:'api',values:{temperature_c:26},units:{temperature_c:'degC'}},prediction:null}]});
test('Informe: conserva IDs originales, PMV y procedencia de las dos evaluaciones',()=>{
  for(const [type,count] of [['RF',15],['RNF',16],['HU',18],['RP',3]]) assert.equal(catalog.requirements.filter(r=>r.id.startsWith(type+'-')).length,count);
  assert.equal(new Set(catalog.requirements.map(r=>r.id)).size,52);
  assert.equal(catalog.requirements.find(r=>r.id==='HU-001').pmv,'PMV3');
  assert.equal(catalog.experiments.report.rows,62630);assert.equal(catalog.experiments.repository.rows,300);
  assert.equal(catalog.management.physical_acceptance,false);
  assert.ok(catalog.requirements.every(r=>r.status!=='Completado'));
});
test('Importación: rechaza inferencia meteorológica, unidades incompatibles y duplicados',()=>{
  assert.doesNotThrow(()=>validateAcquisitionExport(sample()));
  for(const mutate of [v=>v.rows.push(v.rows[0]),v=>v.rows[0].reading.units.temperature_c='F',v=>v.rows[0].reading.values.temperature_c=null,v=>v.rows[0].prediction={alarm:true,score:0.9},v=>v.rows[0].reading.observed_at='2026-10-23']) {
    const value=sample();mutate(value);assert.throws(()=>validateAcquisitionExport(value));
  }
});
test('Caso de uso: filtros y descarte de historial anterior ante importación inválida',async()=>{
  let input=sample();const app=new ProjectService({catalog,files:{read:async()=>input}});
  assert.equal(app.requirements({type:'HU'}).length,18);
  assert.equal(app.requirements({query:'HU-016'})[0].title,'Consultar offline');
  await app.importReadings({});assert.equal(app.rows.length,1);
  input={};await assert.rejects(app.importReadings({}));assert.equal(app.rows.length,0);
});
