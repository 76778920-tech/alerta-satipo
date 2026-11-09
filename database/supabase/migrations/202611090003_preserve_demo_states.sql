begin;
-- Repair installations created with the unaccented state without losing work.
alter table public.demo_cases drop constraint if exists demo_cases_state_check;
update public.demo_cases set state='En revisión' where state='En revision';
alter table public.demo_cases add constraint demo_cases_state_check
  check(state in ('Pendiente','En revisión','Revisado'));

create or replace function public.refresh_demo_dataset()
returns void language plpgsql security definer set search_path = '' as $$
declare
  active_dataset constant text := 'smoke-detection-iot-1011-v1';
begin
  -- Serialize repeated imports. Existing workflow states and other datasets
  -- are deliberately retained; this function only ensures demo mappings exist.
  perform pg_advisory_xact_lock(10112026);
  if (select count(*) from public.smoke_readings where dataset_id=active_dataset) <> 1011 then
    raise exception 'Se requieren exactamente 1011 lecturas del conjunto activo';
  end if;
  insert into public.demo_nodes(id,description)
    select 'V-'||lpad(n::text,2,'0'),'Nodo virtual de la muestra demostrativa '||n
    from generate_series(1,6) n
    on conflict(id) do nothing;
  insert into public.demo_node_readings(dataset_id,source_row,node_id)
    select dataset_id,source_row,'V-'||lpad(bucket::text,2,'0')
    from (select dataset_id,source_row,ntile(6) over(order by source_row) bucket
      from public.smoke_readings where dataset_id=active_dataset) readings
    on conflict(dataset_id,source_row) do update set node_id=excluded.node_id;
  insert into public.demo_cases(node_id)
    select distinct mapping.node_id from public.demo_node_readings mapping
    join public.smoke_readings reading using(dataset_id,source_row)
    where reading.dataset_id=active_dataset and reading.fire_alarm
    on conflict(node_id) do nothing;
  insert into public.demo_maintenance(node_id,task)
    select 'V-'||lpad(n::text,2,'0'),
      'Revisar integridad de las lecturas asignadas y documentar una comprobacion de calibracion simulada. No acredita una reparacion fisica.'
    from generate_series(1,6) n
    on conflict(node_id) do nothing;
end;
$$;
-- Imports are an operator task, never a public browser operation.
revoke all on function public.refresh_demo_dataset() from public,anon,authenticated;
grant execute on function public.refresh_demo_dataset() to service_role;
commit;
