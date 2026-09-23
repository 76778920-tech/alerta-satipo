// Ejecutar localmente: node --env-file=.env scripts/bootstrap-admin.mjs
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
const email=process.env.ADMIN_EMAIL;
if(!email) throw new Error('Configura ADMIN_EMAIL en .env');
const client=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const {data:existing,error:listError}=await client.auth.admin.listUsers({page:1,perPage:1000});
if(listError) throw new Error('No se pudieron consultar los usuarios');
if(existing.users.some(u=>u.email===email)) throw new Error('La cuenta ya existe. No se modificaron sus credenciales; asigna su UUID en administradores desde SQL.');
const password=randomBytes(24).toString('base64url');
const {data,error}=await client.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{full_name:'Administrador Satipo'}});
if(error) throw new Error(error.message);
await writeFile('config/admin.local.json',JSON.stringify({email,password,userId:data.user.id,notice:'Credencial inicial local. Cambiar desde Cuenta al ingresar. No subir a GitHub.'},null,2)+'\n');
const {error:profileError}=await client.from('administradores').insert({id:data.user.id,display_name:'Administrador Satipo'});
if(profileError) throw new Error('Cuenta creada; asignacion de administrador pendiente. Consulta el UUID en config/admin.local.json.');
console.log('Administrador creado. Credenciales guardadas exclusivamente en config/admin.local.json.');
