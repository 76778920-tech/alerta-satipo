import test from 'node:test';
import assert from 'node:assert/strict';
import { SupabaseRepository } from '../backend/adapters/out/supabase.mjs';
import { SupabaseCommunity } from '../frontend/src/adapters/out/supabase.mjs';

const source=Array.from({length:1011},(_,source_row)=>({source_row}));
function client(cap,alter=()=>{}) {
  return {from(table) {
    const filters={};
    return {select(_,{count}={}){assert.equal(count,'exact');return this;},
      eq(k,v){filters[k]=v;return this;},order(k){assert.equal(k,'source_row');return this;},
      async range(start,end) {
        assert.equal(table,'smoke_readings');
        assert.equal(filters.dataset_id,'smoke-detection-iot-1011-v1');
        const result={data:source.slice(start,Math.min(end+1,start+cap)),count:1011,error:null};
        alter(result,start);return result;
      }};
  }};
}
for(const Adapter of [SupabaseRepository,SupabaseCommunity]) {
  test(`${Adapter.name}: recupera 1011 IDs con límite del servidor de 1000 o 200`,async()=>{
    for(const cap of [1000,200]) assert.deepEqual(await new Adapter(client(cap)).readings(),source);
  });
  test(`${Adapter.name}: rechaza página ausente, duplicada, total cambiante y error de red`,async()=>{
    for(const alter of [r=>{r.data=[];},r=>{r.data=[source[0]];},r=>{r.count=1010;},r=>{r.error={code:'XX000'};}]) {
      await assert.rejects(new Adapter(client(500,(r,start)=>{if(start)alter(r);})).readings());
    }
  });
}
