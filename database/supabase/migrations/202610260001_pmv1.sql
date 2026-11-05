begin;
create table public."NodoSensor" (
 nodo_id uuid primary key, nombre text not null default 'Nodo PMV1',
 source text not null check(source in ('simulation','sensor')), created_at timestamptz not null default now()
);
create table public."LecturaAmbiental" (
 lectura_id uuid primary key, nodo_id uuid not null references public."NodoSensor",
 observed_at timestamptz not null, source text not null check(source in ('simulation','sensor')),
 temperature_c double precision not null check(temperature_c between -20 and 80),
 humidity_pct double precision not null check(humidity_pct between 0 and 100),
 smoke_index double precision not null check(smoke_index between 0 and 100),
 gas_index double precision not null check(gas_index between 0 and 100),
 dust_ugm3 double precision not null check(dust_ugm3 between 0 and 1000),
 received_at timestamptz not null default now(), created_by uuid not null references auth.users
);
create index pmv1_reading_node_time on public."LecturaAmbiental"(nodo_id,observed_at desc);
create table public."HistoricoPrediccion" (
 prediccion_id uuid primary key default gen_random_uuid(), lectura_id uuid not null unique references public."LecturaAmbiental",
 level text not null check(level in ('Normal','Advertencia','Emergencia')),
 model_version text not null check(length(model_version) between 1 and 100),
 scores jsonb not null check(jsonb_typeof(scores)='array' and jsonb_array_length(scores)=3),
 experimental boolean not null default true check(experimental), created_at timestamptz not null default now()
);
create table public."EventoAlerta" (
 alerta_id uuid primary key default gen_random_uuid(), prediccion_id uuid not null unique references public."HistoricoPrediccion",
 level text not null check(level in ('Advertencia','Emergencia')), canal text not null default 'software' check(canal='software'),
 experimental boolean not null default true check(experimental), created_at timestamptz not null default now()
);
alter table public."NodoSensor" enable row level security;
alter table public."LecturaAmbiental" enable row level security;
alter table public."HistoricoPrediccion" enable row level security;
alter table public."EventoAlerta" enable row level security;
create policy pmv1_node_read on public."NodoSensor" for select to authenticated using(private.is_admin());
create policy pmv1_reading_read on public."LecturaAmbiental" for select to authenticated using(private.is_admin());
create policy pmv1_prediction_read on public."HistoricoPrediccion" for select to authenticated using(private.is_admin());
create policy pmv1_alert_read on public."EventoAlerta" for select to authenticated using(private.is_admin());
revoke all on public."NodoSensor",public."LecturaAmbiental",public."HistoricoPrediccion",public."EventoAlerta" from public,anon,authenticated;
grant select on public."NodoSensor",public."LecturaAmbiental",public."HistoricoPrediccion",public."EventoAlerta" to authenticated;

create function public.pmv1_store(p_record jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
 r jsonb:=p_record->'reading'; p jsonb:=p_record->'prediction'; v jsonb:=r->'values';
 rid uuid; nid uuid; pid uuid; existing public."LecturaAmbiental"%rowtype;
 previous public."HistoricoPrediccion"%rowtype;
 s double precision; total double precision:=0;
begin
 if not private.is_admin() then raise exception 'Admin required' using errcode='42501'; end if;
 if jsonb_typeof(r) is distinct from 'object' or jsonb_typeof(v) is distinct from 'object' or jsonb_typeof(p) is distinct from 'object' then
   raise exception 'Invalid record' using errcode='22023'; end if;
 if not(v ?& array['temperature_c','humidity_pct','smoke_index','gas_index','dust_ugm3']) or (select count(*) from jsonb_object_keys(v))<>5 then
   raise exception 'Five values required' using errcode='22023'; end if;
 if exists(select 1 from jsonb_each(v) e where jsonb_typeof(e.value)<>'number') then raise exception 'Numeric values required' using errcode='22023'; end if;
 if jsonb_typeof(p->'scores') is distinct from 'array' or jsonb_array_length(p->'scores')<>3 or (p->>'experimental') is distinct from 'true' then
   raise exception 'Invalid prediction' using errcode='22023'; end if;
 for s in select value::text::double precision from jsonb_array_elements(p->'scores') loop
   if s is null or not(s between 0 and 1) then raise exception 'Invalid score' using errcode='22023'; end if; total:=total+s;
 end loop;
 if abs(total-1)>0.000001 then raise exception 'Invalid scores sum' using errcode='22023'; end if;
 rid:=(r->>'id')::uuid; nid:=(r->>'node_id')::uuid;
 perform pg_advisory_xact_lock(hashtextextended(rid::text,0));
 select * into existing from public."LecturaAmbiental" where lectura_id=rid;
 if found then
   select * into previous from public."HistoricoPrediccion" where lectura_id=rid;
   if existing.nodo_id is distinct from nid or existing.source is distinct from r->>'source'
     or existing.observed_at is distinct from (r->>'observed_at')::timestamptz
     or existing.temperature_c is distinct from (v->>'temperature_c')::double precision
     or existing.humidity_pct is distinct from (v->>'humidity_pct')::double precision
     or existing.smoke_index is distinct from (v->>'smoke_index')::double precision
     or existing.gas_index is distinct from (v->>'gas_index')::double precision
     or existing.dust_ugm3 is distinct from (v->>'dust_ugm3')::double precision
     or previous.level is distinct from p->>'level' or previous.model_version is distinct from p->>'model_version'
     or previous.scores is distinct from p->'scores' then raise exception 'ID conflict' using errcode='23505'; end if;
   return jsonb_build_object('id',rid,'duplicate',true);
 end if;
 insert into public."NodoSensor"(nodo_id,source) values(nid,r->>'source') on conflict do nothing;
 if not exists(select 1 from public."NodoSensor" where nodo_id=nid and source=r->>'source') then raise exception 'Node source conflict' using errcode='23505'; end if;
 insert into public."LecturaAmbiental"(lectura_id,nodo_id,observed_at,source,temperature_c,humidity_pct,smoke_index,gas_index,dust_ugm3,created_by)
 values(rid,nid,(r->>'observed_at')::timestamptz,r->>'source',(v->>'temperature_c')::double precision,(v->>'humidity_pct')::double precision,
 (v->>'smoke_index')::double precision,(v->>'gas_index')::double precision,(v->>'dust_ugm3')::double precision,auth.uid());
 insert into public."HistoricoPrediccion"(lectura_id,level,model_version,scores) values(rid,p->>'level',p->>'model_version',p->'scores') returning prediccion_id into pid;
 if p->>'level'<>'Normal' then insert into public."EventoAlerta"(prediccion_id,level) values(pid,p->>'level'); end if;
 return jsonb_build_object('id',rid,'duplicate',false);
end;
$$;
revoke all on function public.pmv1_store(jsonb) from public,anon;
grant execute on function public.pmv1_store(jsonb) to authenticated;
commit;
