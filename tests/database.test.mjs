import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('PostgreSQL: muestra de 300, aislamiento entre clientes, privilegios y auditoría', async () => {
  const db=new PGlite();
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key,raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant usage on schema public,auth to anon,authenticated,service_role;
    grant execute on function auth.uid() to anon,authenticated,service_role;`);
  await db.exec(await readFile('supabase/migrations/202609230001_initial.sql','utf8'));
  await db.exec(await readFile('supabase/migrations/202609230002_private_admin_helper.sql','utf8'));
  const seed=await readFile('supabase/seed.sql','utf8');
  await db.exec(seed);await db.exec(seed);
  await db.exec(await readFile('supabase/migrations/202609230003_demo_operations.sql','utf8'));
  assert.equal((await db.query('select count(*)::int as n from smoke_readings')).rows[0].n,300);
  assert.equal((await db.query('select count(*)::int as n from smoke_readings where fire_alarm')).rows[0].n,214);
  const a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222',admin='33333333-3333-4333-8333-333333333333';
  await db.query(`insert into auth.users(id,raw_user_meta_data) values($1,'{"full_name":"Ana","role":"admin"}'),($2,'{}'),($3,'{}')`,[a,b,admin]);
  await db.query('insert into administradores(id,display_name) values($1,$2)',[admin,'Operador']);
  async function as(role,id,sql,params=[]) {
    await db.exec('begin');
    try {
      await db.exec(`set local role ${role}`);
      await db.query("select set_config('request.jwt.claim.sub',$1,true)",[id||'']);
      const result=await db.query(sql,params);
      await db.exec('commit');return result;
    } catch(error) {await db.exec('rollback');throw error;}
  }
  assert.equal((await as('authenticated',a,'select private.is_admin() as admin')).rows[0].admin,false);
  assert.equal((await as('authenticated',a,'select * from clientes')).rows.length,1);
  for(const table of ['clientes','administradores','reportes','incidentes','incident_audit','app_settings','smoke_readings']) {
    await assert.rejects(as('anon',null,`select * from ${table}`));
    await assert.rejects(as('anon',null,`delete from ${table}`));
  }
  for(const table of ['demo_nodes','demo_node_readings','demo_cases','demo_maintenance']) {
    await assert.rejects(as('anon',null,`select * from ${table}`));
    assert.equal((await as('authenticated',a,`select * from ${table}`)).rows.length,0);
    assert.ok((await as('authenticated',admin,`select * from ${table}`)).rows.length>0);
  }
  assert.equal((await as('authenticated',admin,'select * from demo_node_readings')).rows.length,300);
  assert.equal((await as('authenticated',a,"update demo_maintenance set state='Completada' returning node_id")).rows.length,0);
  await assert.rejects(as('authenticated',admin,"update demo_maintenance set task='Cambiar fuente'"));
  await as('authenticated',admin,"update demo_maintenance set state='En progreso' where node_id='V-01'");
  await assert.rejects(as('authenticated',admin,"update demo_cases set state='Incendio confirmado'"));
  const params=['Escuela de San Francisco','smoke','high','Humo visible detrás de la escuela, lejos de las viviendas.'];
  const report=(await as('authenticated',a,'insert into reportes(location,observation,severity,description) values($1,$2,$3,$4) returning id',params)).rows[0];
  assert.equal((await as('authenticated',a,'select * from reportes')).rows.length,1);
  assert.equal((await as('authenticated',b,'select * from reportes')).rows.length,0);
  assert.equal((await as('authenticated',b,'select * from incidentes')).rows.length,0);
  assert.equal((await as('authenticated',admin,'select * from reportes')).rows.length,1);
  const incident=(await as('authenticated',a,'select * from incidentes')).rows[0];
  assert.equal(incident.report_id,report.id);assert.equal(incident.risk,82);
  await assert.rejects(as('authenticated',a,'insert into reportes(user_id,location,observation,severity,description) values($1,$2,$3,$4,$5)',[b,...params]));
  await assert.rejects(as('authenticated',a,"insert into administradores(id,display_name) values($1,'Ataque')",[a]));
  await assert.rejects(as('authenticated',a,"update clientes set id=$1",[b]));
  await assert.rejects(as('authenticated',a,"insert into reportes(location,observation,severity,description) values('Lugar','smoke','low','corta')"));
  assert.equal((await as('authenticated',a,"update incidentes set state='Validado' returning id")).rows.length,0);
  assert.equal((await as('authenticated',a,"update app_settings set temp_critical=40 returning id")).rows.length,0);
  await assert.rejects(as('authenticated',admin,'delete from smoke_readings'));
  await assert.rejects(as('authenticated',admin,'update incidentes set risk=0'));
  await as('authenticated',admin,"update incidentes set state='En revisión' where id=$1",[incident.id]);
  assert.equal((await as('authenticated',admin,'select * from incident_audit')).rows.length,1);
  assert.equal((await as('authenticated',a,'select * from incident_audit')).rows.length,0);
  await assert.rejects(as('authenticated',a,"select request_help('Puente',true,false,false)"));
  await assert.rejects(as('anon',null,"select request_help('Puente',true,true,true)"));
  await as('authenticated',a,"select request_help('Puente de la escuela',true,true,false)");
  assert.equal((await as('authenticated',a,'select * from incidentes')).rows.length,2);
  await as('authenticated',a,'update clientes set notif_push=false where id=$1',[a]);
  assert.equal((await as('authenticated',b,'select * from clientes')).rows.length,1);
  await db.close();
});

test('La muestra conserva filas únicas, fechas y unidades originales', async()=>{
  const rows=JSON.parse(await readFile('data/smoke_detection_300.json','utf8'));
  assert.equal(rows.length,300);assert.equal(new Set(rows.map(r=>r.source_row)).size,300);
  for(const row of rows) {
    assert.equal(Date.parse(row.recorded_at),row.utc_seconds*1000);
    assert.equal(typeof row.fire_alarm,'boolean');
    assert.ok(row.humidity_pct>=0 && row.humidity_pct<=100);
    assert.ok(!('wind' in row) && !('smoke' in row) && !('latitude' in row));
  }
});
