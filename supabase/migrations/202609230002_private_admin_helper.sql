begin;
-- La comprobacion interna de permisos no necesita un endpoint RPC publico.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;
alter function public.is_admin() set schema private;
-- PostgreSQL conserva las dependencias de las politicas por OID.
commit;
