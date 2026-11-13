import { compose } from './bootstrap.mjs';
const productionOrigins=['https://alerta-satipo-76778920.web.app','https://alerta-satipo-76778920.firebaseapp.com'];
const configuredOrigins=(Deno.env.get('API_ALLOWED_ORIGINS')||'').split(',').map(origin=>origin.trim()).filter(Boolean);
const allowedOrigins=[...new Set([...productionOrigins,...configuredOrigins])];
const handler=compose({url:Deno.env.get('SUPABASE_URL'),publicKey:Deno.env.get('SUPABASE_ANON_KEY'),firmsKey:Deno.env.get('FIRMS_MAP_KEY'),allowedOrigins});
Deno.serve(handler);
