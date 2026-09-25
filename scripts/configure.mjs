import { mkdir, writeFile } from 'node:fs/promises';
const mode = process.env.SATIPO_MODE || 'demo';
if (!['demo', 'supabase'].includes(mode)) throw new Error('SATIPO_MODE debe ser demo o supabase');
const url = process.env.SUPABASE_URL || '';
const key = process.env.SUPABASE_PUBLISHABLE_KEY || '';
if (mode === 'supabase') {
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)) throw new Error('SUPABASE_URL debe ser la URL HTTPS del proyecto.');
  let legacyRole;
  try { legacyRole = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role; } catch {}
  if (!key.startsWith('sb_publishable_') && legacyRole !== 'anon') throw new Error('Usa exclusivamente una clave publica publishable o anon.');
}
await mkdir('config', { recursive: true });
await writeFile('config/public.json', JSON.stringify({ mode, supabaseUrl: url, supabasePublishableKey: key, apiUrl: process.env.SATIPO_API_URL || (url ? url + '/functions/v1/admin-api' : '') }, null, 2) + '\n');
console.log(`Configuracion publica generada: modo ${mode}. No contiene la clave administrativa.`);
