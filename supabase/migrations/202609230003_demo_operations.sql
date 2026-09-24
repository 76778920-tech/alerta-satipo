begin;
create table public.demo_nodes (
 id text primary key,
 description text not null
);
create table public.demo_node_readings (
 dataset_id text not null,
 source_row integer not null,
 node_id text not null references public.demo_nodes(id),
 primary key(dataset_id,source_row),
 foreign key(dataset_id,source_row) references public.smoke_readings(dataset_id,source_row)
);
create table public.demo_cases (
 node_id text primary key references public.demo_nodes(id),
 state text not null default 'Pendiente' check(state in ('Pendiente','En revisión','Revisado'))
);
create table public.demo_maintenance (
 node_id text primary key references public.demo_nodes(id),
 task text not null,
 state text not null default 'Pendiente' check(state in ('Pendiente','En progreso','Completada'))
);
insert into public.demo_nodes
 select 'V-'||lpad(n::text,2,'0'),'Nodo virtual del lote '||n from generate_series(1,6) n;
insert into public.demo_node_readings
 select dataset_id,source_row,'V-'||lpad((((row_number() over(order by source_row))-1)/50+1)::text,2,'0')
 from public.smoke_readings where dataset_id='smoke-detection-iot-300-v1';
do $$ begin
 if (select count(*) from public.demo_node_readings) <> 300 then
 raise exception 'Se requieren exactamente las 300 lecturas originales'; end if;
end $$;
insert into public.demo_cases(node_id)
 select distinct m.node_id from public.demo_node_readings m
 join public.smoke_readings r using(dataset_id,source_row) where r.fire_alarm;
insert into public.demo_maintenance(node_id,task)
 select id,'Revisar integridad de las 50 lecturas y documentar una comprobación de calibración simulada. No acredita una reparación física.' from public.demo_nodes;
alter table public.demo_nodes enable row level security;
alter table public.demo_node_readings enable row level security;
alter table public.demo_cases enable row level security;
alter table public.demo_maintenance enable row level security;
revoke all on public.demo_nodes,public.demo_node_readings,public.demo_cases,public.demo_maintenance from anon,authenticated;
grant select on public.demo_nodes,public.demo_node_readings,public.demo_cases,public.demo_maintenance to authenticated;
grant update(state) on public.demo_cases,public.demo_maintenance to authenticated;
create policy admin_read on public.demo_nodes for select to authenticated using((select private.is_admin()));
create policy admin_read on public.demo_node_readings for select to authenticated using((select private.is_admin()));
create policy admin_read on public.demo_cases for select to authenticated using((select private.is_admin()));
create policy admin_read on public.demo_maintenance for select to authenticated using((select private.is_admin()));
create policy admin_update on public.demo_cases for update to authenticated using((select private.is_admin())) with check((select private.is_admin()));
create policy admin_update on public.demo_maintenance for update to authenticated using((select private.is_admin())) with check((select private.is_admin()));
commit;
