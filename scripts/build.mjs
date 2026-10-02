import { build } from 'esbuild';
await build({ stdin: { contents: 'import { createClient } from "@supabase/supabase-js"; window.createSupabaseClient = createClient;', resolveDir: process.cwd() }, bundle: true, minify: true, format: 'iife', outfile: 'frontend/shared/vendor/supabase.js', legalComments: 'eof' });
await build({entryPoints:{backend:'frontend/src/bootstrap/backend.mjs',data:'frontend/src/bootstrap/data.mjs'},bundle:true,format:'iife',platform:'browser',outdir:'frontend/shared/js',banner:{js:'/* Generado por npm run build. Editar frontend/src/, no este archivo. */'}});
console.log('SDK y casos de uso del navegador compilados localmente.');
