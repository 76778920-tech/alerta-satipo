import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
const result=await build({entryPoints:['backend/edge.mjs'],bundle:true,format:'esm',platform:'neutral',external:['@supabase/supabase-js'],write:false});
await mkdir('supabase/functions/admin-api',{recursive:true});
await writeFile('supabase/functions/admin-api/index.ts','// Generado por npm run build:api. Editar backend/, no este archivo.\n'+result.outputFiles[0].text.replaceAll('"@supabase/supabase-js"','"npm:@supabase/supabase-js@2.117.1"'));
console.log('Adaptador Edge generado con el mismo núcleo que Node.js.');
