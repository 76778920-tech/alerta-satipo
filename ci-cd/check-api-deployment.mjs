import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const expected=JSON.parse(await readFile('database/supabase/.temp/admin-api-build.json','utf8')).build;
const base=process.env.SATIPO_API_URL || `${process.env.SUPABASE_URL}/functions/v1/admin-api`;
assert.match(base,/^https:\/\/[a-z0-9-]+\.supabase\.co\/functions\/v1\/admin-api$/);
const headers={apikey:process.env.SUPABASE_PUBLISHABLE_KEY};
for(let attempt=0;attempt<6;attempt++) {
  try {
    const response=await fetch(base+'/health',{headers,signal:AbortSignal.timeout(15000)});
    assert.equal(response.status,200);
    assert.equal((await response.json()).build,expected,'El backend remoto no coincide con el código comprobado');
    assert.equal((await fetch(base+'/readings',{headers,signal:AbortSignal.timeout(15000)})).status,401);
    console.log('Backend publicado verificado: huella de código exacta y acceso protegido.');break;
  } catch(error) {
    if(attempt===5)throw error;
    await new Promise(resolve=>setTimeout(resolve,5000));
  }
}
