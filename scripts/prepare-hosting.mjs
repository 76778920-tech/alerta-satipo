import { readFile, mkdir, readdir, copyFile, rm } from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
const out = path.resolve(root, 'dist');
if (out !== path.join(root, 'dist')) throw new Error('Destino de publicación inválido');
const config = JSON.parse(await readFile('config/public.json', 'utf8'));
if (!config.apiUrl?.startsWith('https://') || /localhost|127\.0\.0\.1/.test(config.apiUrl)) throw new Error('Hosting requiere una API HTTPS desplegada; no publiques la URL local.');
let role;
try { role = JSON.parse(Buffer.from(config.supabasePublishableKey.split('.')[1], 'base64url').toString()).role; } catch {}
if (config.mode !== 'supabase' || (!config.supabasePublishableKey?.startsWith('sb_publishable_') && role !== 'anon')) throw new Error('Hosting requiere Supabase y una clave pública válida.');
await rm(out, { recursive: true, force: true });
const allowed = new Set(['.html','.css','.js','.json']);
let count = 0;
async function copy(file, source = file) {
  const target = path.join(out,file);
  await mkdir(path.dirname(target), {recursive:true});
  await copyFile(path.join(root,source),target);count++;
}
async function walk(dir) {
  for (const entry of await readdir(path.join('frontend',dir),{withFileTypes:true})) {
    if(entry.name.startsWith('.') || entry.name.includes('.local.')) continue;
    const file=path.join(dir,entry.name);
    if(entry.isDirectory()) await walk(file);
    else if(entry.isFile() && allowed.has(path.extname(file))) await copy(file,path.join('frontend',file));
  }
}
for (const dir of ['web','shared']) await walk(dir);
for (const file of ['index.html','wireframes.css','wireframes.js','vista-general.png','Alerta-Satipo-Wireframes.pdf']) await copy(path.join('docs','wireframes',file));
for (const file of ['index.html','login.html','admin.html','admin-panel.html','architecture.html']) await copy(file,path.join('frontend',file));
await copy('config/public.json');
console.log(`Hosting preparado: ${count} archivos públicos en dist/.`);
