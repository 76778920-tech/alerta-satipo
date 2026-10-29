// Verificación remota explícita. Conserva tres registros sintéticos identificables.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createClient} from '@supabase/supabase-js';
import {compose} from '../backend/bootstrap.mjs';
if(!process.argv.includes('--live'))throw Error('Usar --live para la prueba contra Supabase.');
const credentials=JSON.parse(await readFile('config/admin.local.json','utf8'));
const client=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const signed=await client.auth.signInWithPassword({email:credentials.email,password:credentials.password});
if(signed.error)throw Error('No se pudo iniciar sesión administrativa');
const token=signed.data.session.access_token;
const handler=compose({url:process.env.SUPABASE_URL,publicKey:process.env.SUPABASE_PUBLISHABLE_KEY,allowedOrigins:[]});
const endpoint=process.argv.includes('--deployed')?`${process.env.SUPABASE_URL}/functions/v1/admin-api/pmv1`:'https://local/api/pmv1';
const dispatch=process.argv.includes('--deployed')?fetch:handler;
const cases=[[25,70,10,12,15],[34,48,45,42,90],[52,25,85,82,260]],levels=['Normal','Advertencia','Emergencia'];
const ids=[];
for(let i=0;i<3;i++){
 const reading={id:`a6102600-0000-4000-8000-00000000000${i+1}`,node_id:'a6102600-0000-4000-8000-000000000000',source:'simulation',observed_at:`2026-10-26T15:00:0${i}Z`,values:Object.fromEntries(['temperature_c','humidity_pct','smoke_index','gas_index','dust_ugm3'].map((key,n)=>[key,cases[i][n]]))};
 const response=await dispatch(new Request(endpoint,{method:'PATCH',headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},body:JSON.stringify(reading)}));
 assert.equal(response.status,200,'Guardado remoto PMV1');assert.equal((await response.json()).id,reading.id);ids.push(reading.id);
}
await client.auth.signOut();
const again=await client.auth.signInWithPassword({email:credentials.email,password:credentials.password});if(again.error)throw Error('No se pudo reabrir sesión');
const result=await client.from('LecturaAmbiental').select('*,HistoricoPrediccion(*,EventoAlerta(*))').in('lectura_id',ids).order('observed_at');
assert.equal(result.error,null);assert.equal(result.data.length,3);
for(let i=0;i<3;i++){
 const relation=result.data[i].HistoricoPrediccion,prediction=Array.isArray(relation)?relation[0]:relation;
 assert.equal(prediction.level,levels[i]);const alerts=prediction.EventoAlerta;
 assert.equal(Array.isArray(alerts)?alerts.length:alerts?1:0,i===0?0:1);
}
await client.auth.signOut();
console.log('PASS: tres lecturas sintéticas, tres predicciones, dos alertas; persistencia tras cerrar y reabrir sesión.');
