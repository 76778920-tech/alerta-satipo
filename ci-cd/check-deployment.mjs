import assert from 'node:assert/strict';
const base='https://alerta-satipo-76778920.web.app';
const expected=process.env.EXPECTED_COMMIT;
assert.match(expected||'',/^[a-f0-9]{40}$/);
let failure;
for(let attempt=0;attempt<6;attempt++){
  try {
    const get=async path=>{
      const response=await fetch(`${base}${path}?version=${expected}`,{signal:AbortSignal.timeout(15000),cache:'no-store'});
      assert.equal(response.status,200,`HTTP incorrecto: ${path}`);return response;
    };
    assert.equal((await (await get('/deployment.json')).json()).commit,expected);
    assert.match(await (await get('/shared/login.html')).text(),/Alerta Satipo/);
    const config=await (await get('/config/public.json')).json();
    assert.equal(config.mode,'supabase');assert.match(config.apiUrl,/^https:\/\//);
    console.log('Firebase verificado: commit esperado, login y configuracion publica disponibles.');
    failure=null;break;
  }catch(error){failure=error;if(attempt<5)await new Promise(resolve=>setTimeout(resolve,5000));}
}
if(failure)throw failure;
