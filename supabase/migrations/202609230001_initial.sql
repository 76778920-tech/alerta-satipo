begin;

create table public.clientes (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default 'Poblador' check (length(full_name) between 1 and 120),
  notif_push boolean not null default true,
  notif_sound boolean not null default true,
  share_location boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.administradores (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (length(display_name) between 1 and 120),
  created_at timestamptz not null default now()
);
create function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists(select 1 from public.administradores where id = (select auth.uid())); $$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create function public.create_client_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.clientes(id, full_name)
  values (new.id, coalesce(nullif(left(trim(new.raw_user_meta_data->>'full_name'),120),''),'Poblador'));
  return new;
end; $$;
revoke all on function public.create_client_profile() from public, anon, authenticated;
create trigger on_satipo_user_created after insert on auth.users
for each row execute function public.create_client_profile();
-- Usuarios anteriores a esta migracion tambien reciben su perfil.
insert into public.clientes(id, full_name)
select id, coalesce(nullif(left(trim(raw_user_meta_data->>'full_name'),120),''),'Poblador') from auth.users
on conflict (id) do nothing;

create table public.smoke_readings (
  dataset_id text not null,
  source_row integer not null check (source_row >= 0),
  utc_seconds bigint not null,
  recorded_at timestamptz not null,
  temperature_c double precision not null,
  humidity_pct double precision not null check (humidity_pct between 0 and 100),
  tvoc_ppb integer not null check (tvoc_ppb >= 0),
  eco2_ppm integer not null check (eco2_ppm >= 0),
  raw_h2 integer not null,
  raw_ethanol integer not null,
  pressure_hpa double precision not null,
  pm1_0 double precision not null,
  pm2_5 double precision not null,
  nc0_5 double precision not null,
  nc1_0 double precision not null,
  nc2_5 double precision not null,
  cnt integer not null,
  fire_alarm boolean not null,
  primary key (dataset_id, source_row)
);
create table public.reportes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.clientes(id) on delete cascade,
  location text not null check (length(trim(location)) between 3 and 250),
  observation text not null check (observation in ('smoke','flame','heat','burning')),
  severity text not null check (severity in ('low','medium','high')),
  description text not null check (length(trim(description)) between 20 and 2000),
  contact text not null default '' check (length(contact) <= 40),
  distance text not null default 'near' check (distance in ('near','medium','far')),
  created_at timestamptz not null default now()
);
create index reportes_user_created on public.reportes(user_id, created_at desc);
create table public.incidentes (
  id uuid primary key default gen_random_uuid(),
  report_id uuid unique references public.reportes(id) on delete cascade,
  user_id uuid not null references public.clientes(id) on delete cascade,
  location text not null check (length(trim(location)) between 3 and 250),
  kind text not null,
  risk integer not null check (risk between 0 and 100),
  state text not null default 'Nuevo' check (state in ('Nuevo','En revisión','Validado','Falso positivo')),
  owner text not null default 'Cola comunitaria' check (length(owner) between 1 and 120),
  source text not null check (source in ('mobile','mobile-help')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index incidentes_user_created on public.incidentes(user_id, created_at desc);
create function public.report_to_incident() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.incidentes(report_id,user_id,location,kind,risk,source)
  values(new.id,new.user_id,new.location,'Reporte comunitario: ' || new.observation,
    case new.severity when 'high' then 82 when 'medium' then 64 else 41 end,'mobile');
  return new;
end; $$;
revoke all on function public.report_to_incident() from public, anon, authenticated;
create trigger report_creates_incident after insert on public.reportes
for each row execute function public.report_to_incident();

create function public.request_help(location_text text, visible boolean, safe boolean, reference_known boolean)
returns uuid language plpgsql security definer set search_path = '' as $$
declare new_id uuid;
begin
  if auth.uid() is null then raise exception 'Se requiere autenticacion' using errcode='42501'; end if;
  if coalesce(visible,false)::int + coalesce(safe,false)::int + coalesce(reference_known,false)::int < 2 then
    raise exception 'Confirma al menos dos condiciones';
  end if;
  insert into public.incidentes(user_id,location,kind,risk,source)
  values(auth.uid(),location_text,'Solicitud de apoyo comunitario',85,'mobile-help') returning id into new_id;
  return new_id;
end; $$;
revoke all on function public.request_help(text,boolean,boolean,boolean) from public, anon;
grant execute on function public.request_help(text,boolean,boolean,boolean) to authenticated;

create table public.incident_audit (
  id bigint generated always as identity primary key,
  incident_id uuid not null references public.incidentes(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  old_state text not null,
  new_state text not null,
  changed_at timestamptz not null default now()
);
create function public.audit_incident() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  new.updated_at = now();
  if new.state is distinct from old.state then
    insert into public.incident_audit(incident_id,actor_id,old_state,new_state)
    values(old.id,auth.uid(),old.state,new.state);
  end if;
  return new;
end; $$;
revoke all on function public.audit_incident() from public, anon, authenticated;
create trigger log_incident_change before update on public.incidentes
for each row execute function public.audit_incident();

create table public.app_settings (
  id boolean primary key default true check (id),
  temp_critical numeric not null default 39 check (temp_critical between 20 and 55),
  smoke_critical numeric not null default 65 check (smoke_critical > 0 and smoke_critical <= 100),
  humidity_dry numeric not null default 38 check (humidity_dry between 10 and 90),
  wind_risk numeric not null default 18 check (wind_risk between 1 and 80)
);
insert into public.app_settings(id) values(true);

alter table public.clientes enable row level security;
alter table public.administradores enable row level security;
alter table public.smoke_readings enable row level security;
alter table public.reportes enable row level security;
alter table public.incidentes enable row level security;
alter table public.incident_audit enable row level security;
alter table public.app_settings enable row level security;

revoke all on public.clientes,public.administradores,public.smoke_readings,public.reportes,
  public.incidentes,public.incident_audit,public.app_settings from anon,authenticated;
grant select on public.clientes,public.administradores,public.smoke_readings,public.reportes,
  public.incidentes,public.incident_audit,public.app_settings to authenticated;
grant update(full_name,notif_push,notif_sound,share_location) on public.clientes to authenticated;
grant insert(user_id,location,observation,severity,description,contact,distance) on public.reportes to authenticated;
grant update(state,owner) on public.incidentes to authenticated;
grant update(temp_critical,smoke_critical,humidity_dry,wind_risk) on public.app_settings to authenticated;
grant all on public.clientes,public.administradores,public.smoke_readings,public.reportes,
  public.incidentes,public.incident_audit,public.app_settings to service_role;
grant usage,select on sequence public.incident_audit_id_seq to service_role;

create policy client_read on public.clientes for select to authenticated using (id=(select auth.uid()) or (select public.is_admin()));
create policy client_update on public.clientes for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
create policy admin_read on public.administradores for select to authenticated using(id=(select auth.uid()));
create policy dataset_read on public.smoke_readings for select to authenticated using(true);
create policy report_read on public.reportes for select to authenticated using(user_id=(select auth.uid()) or (select public.is_admin()));
create policy report_insert on public.reportes for insert to authenticated with check(user_id=(select auth.uid()));
create policy incident_read on public.incidentes for select to authenticated using(user_id=(select auth.uid()) or (select public.is_admin()));
create policy incident_update on public.incidentes for update to authenticated using((select public.is_admin())) with check((select public.is_admin()));
create policy audit_read on public.incident_audit for select to authenticated using((select public.is_admin()));
create policy settings_read on public.app_settings for select to authenticated using(true);
create policy settings_update on public.app_settings for update to authenticated using((select public.is_admin())) with check((select public.is_admin()));
commit;
