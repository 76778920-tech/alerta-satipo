-- Supabase's API safety layer requires explicit predicates for maintenance deletes.
create or replace function public.refresh_demo_dataset()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  expected_rows constant integer := 1011;
  active_dataset constant text := 'smoke-detection-iot-1011-v1';
begin
  if auth.uid() is not null and not private.is_admin() then
    raise exception 'Solo personal administrativo puede actualizar el conjunto demostrativo';
  end if;

  if (select count(*) from public.smoke_readings where dataset_id = active_dataset) <> expected_rows then
    raise exception 'Se requieren exactamente % registros para %', expected_rows, active_dataset;
  end if;

  delete from public.demo_node_readings where true;
  delete from public.demo_cases where true;
  delete from public.demo_maintenance where true;
  delete from public.smoke_readings where dataset_id = 'smoke-detection-iot-300-v1';

  insert into public.demo_nodes(id, description)
  select 'V-' || lpad(n::text, 2, '0'), 'Nodo virtual de la muestra demostrativa ' || n
  from generate_series(1, 6) n
  on conflict (id) do update set description = excluded.description;

  insert into public.demo_node_readings(dataset_id, source_row, node_id)
  select dataset_id, source_row, 'V-' || lpad(bucket::text, 2, '0')
  from (
    select dataset_id, source_row, ntile(6) over(order by source_row) as bucket
    from public.smoke_readings where dataset_id = active_dataset
  ) readings;

  if (select count(*) from public.demo_node_readings where dataset_id = active_dataset) <> expected_rows then
    raise exception 'No se pudo asignar los % registros a los nodos virtuales', expected_rows;
  end if;

  insert into public.demo_cases(node_id)
  select distinct mapping.node_id
  from public.demo_node_readings mapping
  join public.smoke_readings reading using(dataset_id, source_row)
  where reading.dataset_id = active_dataset and reading.fire_alarm;

  insert into public.demo_maintenance(node_id, task)
  select id, 'Revisar integridad de las lecturas asignadas y documentar una comprobacion de calibracion simulada. No acredita una reparacion fisica.'
  from public.demo_nodes;
end;
$$;

revoke all on function public.refresh_demo_dataset() from public;
grant execute on function public.refresh_demo_dataset() to authenticated, service_role;
