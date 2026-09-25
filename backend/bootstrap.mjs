import { createClient } from '@supabase/supabase-js';
import { AdminService } from './application/admin-service.mjs';
import { SupabaseIdentity, SupabaseRepository } from './infrastructure/supabase.mjs';
import { createHandler } from './infrastructure/http.mjs';
export function compose({url,publicKey,allowedOrigins}) {
  if(!url||!publicKey)throw new Error('Falta configuración pública de Supabase.');
  let role;
  try { const payload=publicKey.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');role=JSON.parse(atob(payload)).role; } catch {}
  if(!publicKey.startsWith('sb_publishable_') && role!=='anon')throw new Error('La API requiere una clave pública publishable o anon, nunca una clave administrativa.');
  return createHandler({allowedOrigins, serviceFactory:token=>{
    // Cliente aislado por solicitud. JWT de usuario: nunca service_role.
    const client=createClient(url,publicKey,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
    return new AdminService({identity:new SupabaseIdentity(client),repository:new SupabaseRepository(client)});
  }});
}
