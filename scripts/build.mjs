import { build } from 'esbuild';
await build({ stdin: { contents: 'import { createClient } from "@supabase/supabase-js"; window.createSupabaseClient = createClient;', resolveDir: process.cwd() }, bundle: true, minify: true, format: 'iife', outfile: 'shared/vendor/supabase.js', legalComments: 'eof' });
console.log('SDK de Supabase compilado localmente.');
