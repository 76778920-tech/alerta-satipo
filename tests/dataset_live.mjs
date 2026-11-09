// Real dataset audit. --repeat-import explicitly tests import idempotence.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import { readPages } from '../backend/adapters/out/read-pages.mjs';
const db=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const checked=result=>{assert.ok(!result.error,`Consulta falló (${result.error?.code})`);return result.data;};
const dataset='smoke-detection-iot-1011-v1';
const expected=JSON.parse(await readFile('data/smoke_detection_1011.json','utf8'));
async function snapshot() {
  return Promise.all(['demo_cases','demo_maintenance'].map(async table=>checked(await db.from(table).select('*').order('node_id'))));
}
const before=await snapshot();
if(process.argv.includes('--repeat-import')) {
  await import('../scripts/import-dataset.mjs');
  assert.deepEqual(await snapshot(),before,'La importación modificó estados o tareas existentes');
}
const actual=await readPages(()=>db.from('smoke_readings').select('*',{count:'exact'}).eq('dataset_id',dataset).order('source_row'),checked);
assert.equal(actual.length,1011);
const byId=new Map(expected.map(r=>[r.source_row,r]));
for(const row of actual) {
  const reference=byId.get(row.source_row);assert.ok(reference);
  for(const key of Object.keys(reference)) {
    if(key==='recorded_at')assert.equal(Date.parse(row[key]),Date.parse(reference[key]));
    else assert.equal(row[key],reference[key],`Dato diferente: ${row.source_row}/${key}`);
  }
}
const links=await readPages(()=>db.from('demo_node_readings').select('*',{count:'exact'}).eq('dataset_id',dataset).order('source_row'),checked);
assert.deepEqual(links.map(r=>r.source_row),actual.map(r=>r.source_row));
const counts=Object.values(links.reduce((r,item)=>{r[item.node_id]=(r[item.node_id]||0)+1;return r;},{})).sort();
assert.deepEqual(counts,[168,168,168,169,169,169]);
assert.equal(actual.filter(r=>r.fire_alarm).length,722);
console.log('PASS remoto: 1011 filas coinciden campo por campo, 722 etiquetas positivas, 6 nodos completos'+(process.argv.includes('--repeat-import')?', reimportación conserva casos y mantenimiento.':'.'));
