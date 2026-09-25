// Integración de solo lectura con cuenta existente. No crea usuarios ni escribe filas.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
const credentials=JSON.parse(await readFile('config/admin.local.json','utf8'));
const db=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const {data,error}=await db.auth.signInWithPassword(credentials);
assert.ok(!error,'Login falló');
const token=data.session.access_token;
try {
  for(const base of ['http://127.0.0.1:8787/api',`${process.env.SUPABASE_URL}/functions/v1/admin-api`]) {
    const headers={authorization:`Bearer ${token}`,apikey:process.env.SUPABASE_PUBLISHABLE_KEY,'content-type':'application/json'};
    const get=async path=>{const response=await fetch(base+path,{headers});assert.equal(response.status,200,`${path}: ${response.status}`);return response.json();};
    const readings=await get('/readings');assert.equal(readings.length,300);assert.equal(readings.filter(r=>r.fire_alarm).length,214);
    const ops=await get('/operations');assert.equal(ops.nodes.length,6);assert.equal(ops.links.length,300);
    assert.ok((await get('/activity')).settings);
    assert.equal((await fetch(base+'/readings',{headers:{apikey:process.env.SUPABASE_PUBLISHABLE_KEY}})).status,401);
    assert.equal((await fetch(base+'/maintenance/V-01',{method:'PATCH',headers,body:JSON.stringify({expectedState:'Pendiente',state:'INVALID'})})).status,422);
    console.log(`PASS ${base.includes('127.0.0.1')?'Node local':'Supabase Edge'}: 300 lecturas, 6 nodos, actividad, 401 y 422; sin escrituras.`);
  }
} finally { await db.auth.signOut({scope:'local'}); }
