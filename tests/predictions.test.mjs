import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { AdminService } from '../backend/application/use-cases/admin-service.mjs';
import { MemoryIdentity, MemoryRepository } from '../backend/adapters/out/memory.mjs';
import { PublishedPredictionResults } from '../backend/adapters/out/predictions.mjs';
import { createHandler } from '../backend/adapters/in/http.mjs';
test('Predicciones: autenticación y autorización antes de consultar resultados',async()=>{
  let calls=0;
  const service=new AdminService({identity:new MemoryIdentity(),repository:new MemoryRepository(),predictions:{results(){calls++;return {};}}});
  for(const [token,code] of [['bad','UNAUTHENTICATED'],['user','FORBIDDEN']]) await assert.rejects(service.listPredictions(token),{code});
  assert.equal(calls,0);await service.listPredictions('admin');assert.equal(calls,1);
});
test('Predicciones publicadas: coinciden con datos, CSV y métricas de evaluación',async()=>{
  const result=await new PublishedPredictionResults().results();
  const source=JSON.parse(await readFile('data/smoke_detection_300.json','utf8'));
  const lines=(await readFile('colab/resultados_locales/predicciones_prueba_60.csv','utf8')).trim().split(/\r?\n/).slice(1);
  assert.equal(result.rows.length,60);assert.equal(new Set(result.rows.map(r=>r.source_row)).size,60);
  const matrix=[[0,0],[0,0]];
  result.rows.forEach((row,i)=>{
    const csv=lines[i].split(',');
    assert.equal(row.source_row,Number(csv[1]));assert.equal(row.predicted,csv[4]==='True');assert.equal(row.score,Number(csv[5]));
    assert.equal(row.actual,source.find(r=>r.source_row===row.source_row).fire_alarm);
    matrix[Number(row.actual)][Number(row.predicted)]++;
  });
  assert.deepEqual(matrix,result.evaluation.confusion_matrix);
  const handler=createHandler({allowedOrigins:[],serviceFactory:()=>new AdminService({identity:new MemoryIdentity(),predictions:new PublishedPredictionResults()})});
  assert.equal((await handler(new Request('https://test/api/predictions'))).status,401);
  assert.equal((await handler(new Request('https://test/api/predictions',{headers:{Authorization:'Bearer user'}}))).status,403);
  const response=await handler(new Request('https://test/api/predictions',{headers:{Authorization:'Bearer admin'}}));
  assert.equal(response.status,200);assert.equal((await response.json()).rows.length,60);
});
