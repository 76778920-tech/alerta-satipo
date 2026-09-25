import { compose } from './bootstrap.mjs';
const handler=compose({url:Deno.env.get('SUPABASE_URL'),publicKey:Deno.env.get('SUPABASE_ANON_KEY'),allowedOrigins:['https://alerta-satipo-76778920.web.app','https://alerta-satipo-76778920.firebaseapp.com','http://127.0.0.1:8000','http://localhost:8000']});
Deno.serve(handler);
