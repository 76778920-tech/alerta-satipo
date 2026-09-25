import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AdminService } from '../backend/application/admin-service.mjs';
import { MemoryIdentity, MemoryRepository } from '../backend/infrastructure/memory.mjs';
import { createHandler } from '../backend/infrastructure/http.mjs';
import { compose } from '../backend/bootstrap.mjs';
import { build } from 'esbuild';

test('Auditoría: los puertos de entrada rechazan nulos y arreglos sin depender de HTTP',async()=>{
  const app=new AdminService({identity:new MemoryIdentity(),repository:new MemoryRepository()});
  for(const input of [null,undefined,[],42]) {
    await assert.rejects(app.updateState('admin','maintenance','V-01',input),{code:'VALIDATION'});
    await assert.rejects(app.updateSettings('admin',input),{code:'VALIDATION'});
  }
});
test('Auditoría: repositorio en memoria conserva configuración y separa casos de tareas',async()=>{
  const repository=new MemoryRepository();
  const settings={temp_critical:39,smoke_critical:65,humidity_dry:38,wind_risk:18};
  await repository.saveSettings(settings);
  assert.deepEqual((await repository.activity()).settings,settings);
  const snapshot=await repository.operations();
  assert.equal(snapshot.maintenance.length,1);assert.equal(snapshot.cases.length,1);
  snapshot.maintenance[0].state='CORRUPT';
  assert.equal((await repository.operations()).maintenance[0].state,'Pendiente');
});
test('Auditoría: HTTP limita bytes antes de decodificar y acepta JSON sin distinguir mayúsculas',async()=>{
  const handler=createHandler({allowedOrigins:[],serviceFactory:()=>new AdminService({identity:new MemoryIdentity(),repository:new MemoryRepository()})});
  const request=(body,type='application/json')=>new Request('http://test/api/maintenance/V-01',{method:'PATCH',headers:{authorization:'Bearer admin','content-type':type},body});
  assert.equal((await handler(request(JSON.stringify({extra:'á'.repeat(2100)})))).status,413);
  assert.equal((await handler(request(JSON.stringify({expectedState:'Pendiente',state:'En progreso'}),'Application/JSON; charset=utf-8'))).status,200);
});
test('Auditoría: composición rechaza claves administrativas antes de crear clientes',()=>{
  const options={url:'https://example.supabase.co',allowedOrigins:[]};
  assert.throws(()=>compose({...options,publicKey:'sb_secret_fake'}));
  const privileged='eyJhbGciOiJIUzI1NiJ9.'+Buffer.from(JSON.stringify({role:'service_role'})).toString('base64url')+'.signature';
  assert.throws(()=>compose({...options,publicKey:privileged}));
});
test('Auditoría: grafo transitivo del núcleo no alcanza infraestructura ni paquetes externos',async()=>{
  for(const entry of ['backend/domain/operation.mjs','backend/application/admin-service.mjs']) {
    const {metafile}=await build({entryPoints:[entry],bundle:true,write:false,metafile:true,platform:'neutral',packages:'external',format:'esm'});
    const allowed=entry.includes('/domain/')?['backend/domain/']:['backend/domain/','backend/application/'];
    for(const name of Object.keys(metafile.inputs))assert.ok(allowed.some(prefix=>name.replaceAll('\\','/').startsWith(prefix)),`Dependencia prohibida: ${name}`);
    for(const output of Object.values(metafile.outputs))assert.equal(output.imports.length,0,'El núcleo depende de un paquete externo');
  }
});
