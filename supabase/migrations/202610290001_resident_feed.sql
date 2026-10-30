begin;
-- Read-only resident feed. Base tables and administrative writes keep their RLS.
create function public.resident_pmv1_feed(p_alerts boolean default false)
returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or private.is_admin() or not exists(
   select 1 from public.clientes where id=auth.uid()
 ) then raise exception 'Resident account required' using errcode='42501'; end if;
 return coalesce((select jsonb_agg(item order by observed_at desc, lectura_id) from (
   select l.observed_at,l.lectura_id,
     (to_jsonb(l)-'created_by'-'received_at') || jsonb_build_object(
       'HistoricoPrediccion', to_jsonb(p) || jsonb_build_object(
         'EventoAlerta', case when a.alerta_id is null then null else
           jsonb_build_object('alerta_id',a.alerta_id,'level',a.level,'created_at',a.created_at) end
       )
     ) as item
   from public."LecturaAmbiental" l
   join public."HistoricoPrediccion" p on p.lectura_id=l.lectura_id
   left join public."EventoAlerta" a on a.prediccion_id=p.prediccion_id
   where not p_alerts or a.alerta_id is not null
   order by l.observed_at desc,l.lectura_id
   limit case when p_alerts then 200 else 1000 end
 ) records),'[]'::jsonb);
end;
$$;
revoke all on function public.resident_pmv1_feed(boolean) from public,anon;
grant execute on function public.resident_pmv1_feed(boolean) to authenticated;
commit;
