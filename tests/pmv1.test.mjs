import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {evaluatePmv1,validatePmv1} from '../backend/domain/pmv1.mjs';
import {evaluatePmv1 as browserEvaluate} from '../frontend/src/domain/pmv1.mjs';
import {Pmv1Service} from '../frontend/src/application/use-cases/pmv1-service.mjs';
const example=()=>({id:'11111111-1111-4111-8111-111111111111',node_id:'22222222-2222-4222-8222-222222222222',source:'simulation',observed_at:'2026-10-26T15:00:00Z',values:{temperature_c:52,humidity_pct:25,smoke_index:85,gas_index:82,dust_ugm3:260}});
test('PMV1: cinco variables y rangos obligatorios, tres clases y paridad sklearn/navegador',async()=>{
  const fixtures=JSON.parse(await readFile('colab/pmv1/parity.json','utf8'));
  const labels=['Normal','Advertencia','Emergencia'],features=Object.keys(example().values);
  for(const fixture of fixtures){const input=example();input.values=Object.fromEntries(features.map((k,i)=>[k,fixture.x[i]]));const result=evaluatePmv1(input);assert.equal(result.prediction.level,labels[fixture.expected]);assert.deepEqual(result,browserEvaluate(input));}
  for(const key of features){const input=example();delete input.values[key];assert.throws(()=>validatePmv1(input));}
  for(const value of [-21,81,NaN,Infinity,null,'25']){const input=example();input.values.temperature_c=value;assert.throws(()=>validatePmv1(input));}
  assert.equal(evaluatePmv1(example()).prediction.level,'Emergencia');
  for(const [level,values] of [['Normal',[25,70,10,12,15]],['Advertencia',[34,48,45,42,90]]]){const input=example();input.values=Object.fromEntries(features.map((k,i)=>[k,values[i]]));assert.equal(evaluatePmv1(input).prediction.level,level);}
});
test('PMV1: diez capturas sin red y reintento conserva cola hasta confirmación correcta',async()=>{
  const rows=[];let id=0;
  const app=new Pmv1Service({store:{put:async r=>rows.push(r),all:async()=>rows,ack:async id=>{rows.find(r=>r.reading.id===id).synced=true;}},entropy:{now:()=>new Date('2026-10-26T15:00Z'),id:()=>`00000000-0000-4000-8000-${String(++id).padStart(12,'0')}`,numbers:()=>[.5,.5,.5,.5,.5]},remote:{savePmv1:async()=>{throw Error('offline');}}});
  for(let i=0;i<10;i++)await app.capture();assert.equal(rows.length,10);assert.ok(rows.every(r=>Object.keys(r.reading.values).length===5));
  await assert.rejects(app.synchronize(),/offline/);assert.ok(rows.every(r=>!r.synced));
  app.remote.savePmv1=async r=>({id:r.id});assert.equal(await app.synchronize(),10);assert.equal(await app.synchronize(),0);
});
test('PMV1 PostgreSQL: RLS, transacción, unicidad y persistencia de lectura/predicción/alerta',async()=>{
 const db=new PGlite();await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create schema private;
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create function private.is_admin() returns boolean language sql stable as $$select auth.uid()='33333333-3333-4333-8333-333333333333'::uuid$$;
 grant usage on schema public,auth,private to authenticated,anon;
 insert into auth.users values('33333333-3333-4333-8333-333333333333'),('44444444-4444-4444-8444-444444444444');`);
 await db.exec(await readFile('supabase/migrations/202610260001_pmv1.sql','utf8'));
 async function call(role,user,sql,params=[]){await db.exec('begin');try{await db.exec(`set local role ${role}`);await db.query("select set_config('request.jwt.claim.sub',$1,true)",[user]);const result=await db.query(sql,params);await db.exec('commit');return result;}catch(e){await db.exec('rollback');throw e;}}
 const admin='33333333-3333-4333-8333-333333333333',user='44444444-4444-4444-8444-444444444444',record=evaluatePmv1(example());
 const write=(r,id=admin)=>call('authenticated',id,'select public.pmv1_store($1::jsonb) as result',[JSON.stringify(r)]);
 await assert.rejects(write(record,user));await assert.rejects(call('anon','','select public.pmv1_store($1::jsonb)',[JSON.stringify(record)]));
 assert.equal((await write(record)).rows[0].result.duplicate,false);assert.equal((await write(record)).rows[0].result.duplicate,true);
 for(const table of ['NodoSensor','LecturaAmbiental','HistoricoPrediccion','EventoAlerta']){assert.equal((await db.query(`select * from public."${table}"`)).rows.length,1);assert.equal((await call('authenticated',user,`select * from public."${table}"`)).rows.length,0);}
 const changed=structuredClone(record);changed.reading.values.temperature_c=53;await assert.rejects(write(changed));
 const bad=structuredClone(record);bad.reading.id='55555555-5555-4555-8555-555555555555';bad.prediction.level='INVALID';await assert.rejects(write(bad));
 assert.equal((await db.query('select * from public."LecturaAmbiental"')).rows.length,1);
 const normal=example();normal.id='66666666-6666-4666-8666-666666666666';normal.values={temperature_c:25,humidity_pct:70,smoke_index:10,gas_index:12,dust_ugm3:15};await write(evaluatePmv1(normal));
 assert.equal((await db.query('select * from public."LecturaAmbiental"')).rows.length,2);assert.equal((await db.query('select * from public."EventoAlerta"')).rows.length,1);
 await db.close();
});
