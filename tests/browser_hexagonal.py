"""Recorrido local con adaptadores de prueba: sin cuentas, correos ni red externa."""
import json
import sys
from pathlib import Path
from threading import Thread
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright
from static_server_test import server, QuietHandler

ROOT=Path(__file__).resolve().parents[1]
readings=json.loads((ROOT/'data/smoke_detection_300.json').read_text(encoding='utf-8'))
predictions=json.loads((ROOT/'backend/adapters/out/prediction-results.json').read_text(encoding='utf-8'))
nodes=[{'id':f'V-0{i}','name':f'Lote {i}'} for i in range(1,7)]
operations={'nodes':nodes,'links':[{'node_id':f'V-0{i//50+1}','source_row':row['source_row'],'smoke_readings':row} for i,row in enumerate(readings)],
            'cases':[{'node_id':node['id'],'state':'Pendiente'} for node in nodes],
            'maintenance':[{'node_id':node['id'],'state':'Pendiente','task':'Revisión de prueba'} for node in nodes]}
activity={'reports':[],'incidents':[],'settings':{'temp_critical':39,'smoke_critical':65,'humidity_dry':38,'wind_risk':18}}
territory=json.loads((ROOT/'backend/adapters/out/territory.json').read_text(encoding='utf-8'))
environment={'version':1,'retrieved_at':'2026-10-23T16:00:00Z','cached':False,
    'territory':{**territory,'scope':'Rectángulo de consulta; puede incluir territorios vecinos.'},
    'weather':{'status':'ok','rows':[{'location':location,'observed_at':'2026-10-23T15:45:00Z','kind':'weather_model','interval_seconds':900,
         'values':{'temperature_c':25,'humidity_pct':79,'rain_mm':0,'wind_kmh':1.1}} for location in territory['locations']]},
    'fires':{'status':'not_configured','rows':[]}}
environment_failure=False
pmv1_saved={}
http=server.ThreadingHTTPServer(('127.0.0.1',0),QuietHandler)
thread=Thread(target=http.serve_forever,daemon=True)
thread.start()
base=f'http://127.0.0.1:{http.server_port}'
errors=[]
unexpected=[]


def route_request(route):
    url=route.request.url
    path=urlsplit(url).path
    if path=='/shared/vendor/supabase.js':
        route.fulfill(content_type='application/javascript',body=(ROOT/'tests/fixtures/supabase-browser.js').read_text(encoding='utf-8'))
    elif path=='/config/public.json':
        route.fulfill(json={'mode':'supabase','supabaseUrl':'https://fixture.invalid','supabasePublishableKey':'sb_publishable_fixture','apiUrl':'https://fixture.invalid/api'})
    elif url.startswith('https://fixture.invalid/api/'):
        name=path.split('/')[2]
        if name=='pmv1':
            if route.request.method=='PATCH':
                row=route.request.post_data_json
                pmv1_saved[row['id']]=row
                route.fulfill(json={'id':row['id'],'duplicate':False})
            else:route.fulfill(json=[])
            return
        if name=='environment':
            route.fulfill(status=503 if environment_failure else 200,json={'error':'Prueba de indisponibilidad'} if environment_failure else environment)
            return
        if route.request.method=='PATCH':
            payload=route.request.post_data_json
            if name in ['cases','maintenance']:
                row=next(row for row in operations[name] if row['node_id']==path.split('/')[3])
                row['state']=payload['state']
            route.fulfill(json={})
        else:
            route.fulfill(json={'readings':readings,'predictions':predictions,'operations':operations,'activity':activity}[name])
    elif urlsplit(url).hostname=='fonts.googleapis.com':
        route.fulfill(content_type='text/css',body='/* Fuentes del sistema durante pruebas sin red. */')
    elif url.startswith(base+'/'):
        route.continue_()
    else:
        unexpected.append(url)
        route.abort()


try:
    with sync_playwright() as p:
        browser=p.chromium.launch(**({'channel':'msedge'} if sys.platform=='win32' else {}),headless=True)
        context=browser.new_context(viewport={'width':1440,'height':1000})
        context.route('**/*',route_request)
        page=context.new_page()
        page.on('pageerror',lambda error:errors.append(str(error)))
        page.goto(base+'/shared/login.html')
        page.wait_for_function('!document.querySelector("#submit-btn").disabled')
        page.fill('#email','person@example.invalid');page.fill('#password','test-password')
        page.click('#submit-btn')
        page.wait_for_function("document.querySelector('#auth-status').textContent.includes('Acceso denegado')")
        assert page.evaluate('window.fixtureSignedOut') is True
        page.fill('#email','admin@example.invalid');page.fill('#password','test-password')
        page.click('#submit-btn');page.wait_for_url('**/web/index.html')
        page.wait_for_function("document.querySelector('#dataset-summary')?.textContent.includes('300 registros')")
        page.wait_for_function('window.SatipoOperations.getSnapshot() !== null')
        assert page.evaluate('window.SatipoBackend.client === undefined && window.SatipoBackend.api === undefined')
        page.click('[data-view="predictions"]')
        page.wait_for_selector('#prediction-results',state='visible')
        assert page.locator('#prediction-rows tr').count()==15
        page.click('[data-view="pmv1"]')
        page.click('#pmv1-ten')
        page.wait_for_function("document.querySelector('#pmv1-count').textContent.includes('10 registros')")
        assert page.locator('#pmv1-rows tr').count()==10
        context.set_offline(True)
        page.select_option('#pmv1-scenario','Emergencia');page.click('#pmv1-once')
        page.wait_for_function("document.querySelector('#pmv1-count').textContent.includes('11 registros')")
        assert 'Emergencia' in page.locator('#pmv1-current').inner_text()
        page.select_option('#pmv1-scenario','Advertencia');page.click('#pmv1-once')
        page.wait_for_function("document.querySelector('#pmv1-count').textContent.includes('12 registros')")
        assert 'Advertencia' in page.locator('#pmv1-current').inner_text()
        context.set_offline(False)
        page.reload();page.wait_for_function('window.SatipoOperations.getSnapshot() !== null')
        page.click('[data-view="pmv1"]')
        assert '12 registros' in page.locator('#pmv1-count').inner_text()
        page.click('#pmv1-sync')
        page.wait_for_function("document.querySelector('#pmv1-count').textContent.includes('0 pendientes')")
        assert len(pmv1_saved)==12
        page.set_input_files('#pmv1-file',{'name':'invalid.json','mimeType':'application/json','buffer':b'[{"values":{}}]'})
        page.wait_for_function("document.querySelector('#pmv1-status').textContent.includes('inválido')")
        assert '12 registros' in page.locator('#pmv1-count').inner_text()
        Path('test-results').mkdir(exist_ok=True)
        page.screenshot(path='test-results/pmv1-desktop.png',full_page=True)
        page.set_viewport_size({'width':390,'height':844})
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        page.screenshot(path='test-results/pmv1-mobile.png',full_page=True)
        page.set_viewport_size({'width':1440,'height':1000})
        page.click('[data-view="environment"]')
        page.click('#environment-refresh')
        page.wait_for_selector('#environment-results',state='visible')
        assert page.locator('#environment-weather tr').count()==9
        assert 'pendiente' in page.locator('#fires-status').inner_text()
        environment['fires']={'status':'partial','message':'Un producto no disponible.','rows':[{
            'source':'VIIRS_NOAA20_NRT','latitude':-11.2,'longitude':-74.5,'observed_at':'2026-10-23T09:45:00Z',
            'confidence':'n','frp_mw':3.2,'confirmed_fire':False}]}
        page.click('#environment-refresh')
        page.wait_for_function("document.querySelector('#fires-status').textContent.includes('parcial')")
        assert 'Nominal' in page.locator('#environment-fires').inner_text()
        Path('test-results').mkdir(exist_ok=True)
        page.screenshot(path='test-results/environment-desktop.png',full_page=True)
        page.set_viewport_size({'width':390,'height':844})
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        page.screenshot(path='test-results/environment-mobile.png',full_page=True)
        page.set_viewport_size({'width':1440,'height':1000})
        environment_failure=True
        page.click('#environment-refresh')
        page.wait_for_function("document.querySelector('#environment-status').textContent.includes('No se pudo')")
        assert page.locator('#environment-results').is_hidden()
        page.click('[data-view="project"]')
        assert page.locator('#project-rows tr').count()==52
        page.select_option('#project-type','HU')
        assert page.locator('#project-rows tr').count()==18
        page.fill('#project-query','HU-016')
        assert page.locator('#project-rows tr').count()==1
        assert 'Consultar offline' in page.locator('#project-rows').inner_text()
        page.fill('#project-query','')
        export={'schema_version':1,'operational':False,'rows':[{'reading':{
            'source':'fixture-api','external_id':'1','node_id':'station-1','kind':'weather','provenance':'api',
            'observed_at':'2026-10-23T15:00:00+00:00','values':{'temperature_c':26,'humidity_pct':70},
            'units':{'temperature_c':'degC','humidity_pct':'%'}},'prediction':None}]}
        page.set_input_files('#acquisition-file',{'name':'fixture.json','mimeType':'application/json','buffer':json.dumps(export).encode()})
        page.wait_for_function("document.querySelector('#acquisition-status').textContent.includes('1 lecturas')")
        assert 'Sin inferencia' in page.locator('#acquisition-rows').inner_text()
        Path('test-results').mkdir(exist_ok=True)
        page.screenshot(path='test-results/report-api-desktop.png',full_page=True)
        page.set_viewport_size({'width':390,'height':844})
        page.screenshot(path='test-results/report-api-mobile.png',full_page=True)
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        page.locator('#acquisition-file').scroll_into_view_if_needed()
        page.screenshot(path='test-results/report-api-history-mobile.png',full_page=True)
        page.set_viewport_size({'width':1440,'height':1000})
        page.locator('#acquisition-file').scroll_into_view_if_needed()
        page.screenshot(path='test-results/report-api-history-desktop.png',full_page=True)
        page.set_input_files('#acquisition-file',{'name':'invalid.json','mimeType':'application/json','buffer':b'{}'})
        page.wait_for_function("document.querySelector('#acquisition-status').textContent.includes('Archivo inválido')")
        assert page.locator('#acquisition-rows tr').count()==0
        page.click('[data-view="district-demo"]')
        assert page.locator('#demo-cards article').count()==9
        initial=page.input_value('#demo-history')
        page.click('#demo-generate')
        assert initial!=page.input_value('#demo-history')
        selected=page.input_value('#demo-history')
        page.reload();page.wait_for_function('window.SatipoOperations.getSnapshot() !== null')
        page.click('[data-view="district-demo"]')
        assert page.input_value('#demo-history')==selected
        page.click('[data-view="maintenance"]')
        control=page.locator('[data-operation="demo_maintenance"]').first
        control.select_option('En progreso')
        page.wait_for_function("document.querySelector('[data-operation=demo_maintenance]').dataset.previous==='En progreso'")
        page.goto(base+'/shared/account.html')
        page.fill('#new-password','new-test-password');page.fill('#confirm-password','new-test-password')
        page.click('#password-form button')
        page.wait_for_function("document.querySelector('#account-status').textContent.includes('actualizada')")
        assert page.evaluate('window.fixturePassword.password')=='new-test-password'
        page.goto(base+'/shared/login.html')
        page.wait_for_function('!document.querySelector("#submit-btn").disabled')
        page.click('#recover-btn');page.fill('#email','admin@example.invalid');page.click('#submit-btn')
        page.wait_for_function('!!window.fixtureRecovery')
        assert page.evaluate('window.fixtureRecovery.redirectTo')==base+'/shared/account.html'
        # Sesión de poblador inyectada solo en el sustituto de pruebas.
        page.evaluate("sessionStorage.setItem('fixture-role','user')")
        page.goto(base+'/mobile/index.html')
        page.wait_for_function("document.querySelector('#dataset-summary')?.textContent.includes('300 registros')")
        page.click('.cta-stack [data-screen=report]')
        page.fill('#report-location','Escuela local');page.select_option('#report-type','smoke');page.select_option('#report-severity','high')
        page.fill('#report-description','Humo visible junto a la escuela en esta prueba local.')
        page.click('#report-form button[type=submit]')
        page.wait_for_selector('#screen-profile.active')
        assert 'Escuela local' in page.inner_text('#saved-reports')
        page.uncheck('#notif-push')
        page.wait_for_function("!document.querySelector('#notif-push').disabled")
        assert page.evaluate("window.fixtureWrites.some(r=>r.table==='clientes' && r.value.notif_push===false)")
        assert not errors,errors
        assert not unexpected,unexpected
        browser.close()
finally:
    http.shutdown();http.server_close();thread.join()
print('PASS: acceso, rechazo no-admin, lecturas, predicciones, simulación, mantenimiento, contraseña, recuperación, reporte y preferencias; sin red externa.')
