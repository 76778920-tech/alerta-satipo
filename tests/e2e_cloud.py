"""Prueba opt-in contra Supabase real. Crea cuentas temporales y las elimina al terminar.
Requiere: pip install playwright; Microsoft Edge; npm start.
Ejecutar: python tests/e2e_cloud.py --live
"""
import json
import secrets
import sys
import urllib.request
import urllib.error
from pathlib import Path
from playwright.sync_api import sync_playwright

if '--live' not in sys.argv:
    raise SystemExit('Usa --live para autorizar cuentas temporales de prueba en el proyecto configurado.')
root = Path(__file__).resolve().parents[1]
env = dict(line.split('=', 1) for line in (root / '.env').read_text().splitlines() if '=' in line and not line.startswith('#'))
url, secret, public = env['SUPABASE_URL'], env['SUPABASE_SECRET_KEY'], env['SUPABASE_PUBLISHABLE_KEY']

def api(path, data=None, method='GET', token=None, admin=False):
    headers = {'apikey': secret if admin else public, 'Authorization': 'Bearer ' + (secret if admin else token or public), 'Content-Type': 'application/json', 'Prefer': 'return=representation'}
    request = urllib.request.Request(url + path, data=json.dumps(data).encode() if data is not None else None, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            body = response.read()
            return response.status, json.loads(body) if body else None
    except urllib.error.HTTPError as error:
        return error.code, json.loads(error.read())

created = []
try:
    users = []
    for role in ['alice', 'bob', 'admin']:
        email = f'satipo-test-{role}-{secrets.token_hex(5)}@example.invalid'
        password = secrets.token_urlsafe(24)
        status, user = api('/auth/v1/admin/users', {'email': email, 'password': password, 'email_confirm': True, 'user_metadata': {'full_name': 'Prueba ' + role, 'role': 'admin'}}, 'POST', admin=True)
        assert status in [200, 201], (status, 'create user')
        created.append(user['id'])
        if role == 'admin':
            status, _ = api('/rest/v1/administradores', {'id': user['id'], 'display_name': 'Administrador de prueba'}, 'POST', admin=True)
            assert status == 201
        status, session = api('/auth/v1/token?grant_type=password', {'email': email, 'password': password}, 'POST')
        assert status == 200
        users.append({'email': email, 'password': password, 'id': user['id'], 'token': session['access_token'], 'refresh': session['refresh_token']})
    alice, bob, admin = users
    status, rows = api('/rest/v1/smoke_readings?select=source_row', token=alice['token'])
    assert status == 200 and len(rows) == 300
    assert api('/rest/v1/reportes')[0] in [401, 403]
    assert api('/rest/v1/administradores', {'id': alice['id'], 'display_name': 'Ataque'}, 'POST', token=alice['token'])[0] == 403
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=True)
        contexts=[]
        errors=[]
        def login(user, mobile=False):
            context = browser.new_context(viewport={'width': 390, 'height': 844} if mobile else {'width':1440,'height':1000})
            contexts.append(context)
            page=context.new_page()
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto('http://127.0.0.1:8000/shared/login.html')
            page.wait_for_function("!document.querySelector('#submit-btn').disabled")
            if mobile:
                # Solo para probar el código móvil local: no existe login público de pobladores.
                page.evaluate('(tokens)=>window.SatipoBackend.client.auth.setSession(tokens)', {'access_token':user['token'],'refresh_token':user['refresh']})
                page.goto('http://127.0.0.1:8000/mobile/index.html')
            else:
                page.fill('#email',user['email']);page.fill('#password',user['password'])
                page.locator('#login-form button[type=submit]').first.click()
                page.wait_for_url('**/web/index.html')
            page.wait_for_selector('#dataset-summary')
            return page
        a=login(alice,True)
        assert '300 registros' in a.locator('#dataset-summary').inner_text()
        assert 'Sin sensores' in a.locator('#risk-title').inner_text()
        assert a.evaluate('document.documentElement.scrollWidth <= innerWidth')
        assert a.locator('#bottom-nav').bounding_box()['y'] < 844
        a.locator('.cta-stack [data-screen=report]').click()
        location='<img src=x onerror=window.xss=1> Escuela QA'
        a.fill('#report-location',location);a.select_option('#report-type','smoke');a.select_option('#report-severity','high')
        a.fill('#report-description','Prueba automatizada temporal: humo visible junto a la escuela.')
        # Un fallo de red no debe borrar el formulario ni anunciar un envío exitoso.
        a.route('**/rest/v1/reportes*',lambda route:route.abort() if route.request.method=='POST' else route.continue_())
        a.locator('#report-form button[type=submit]').click()
        a.wait_for_function("!document.querySelector('#report-form button[type=submit]').disabled")
        assert a.locator('#report-location').input_value()==location
        a.unroute('**/rest/v1/reportes*')
        a.locator('#report-form button[type=submit]').click()
        a.wait_for_selector('#screen-profile.active')
        assert location in a.locator('#saved-reports').inner_text()
        assert a.evaluate('window.xss') is None
        b=login(bob,True)
        assert api('/rest/v1/reportes?select=id', token=bob['token'])[1] == []
        assert api('/rest/v1/incidentes?select=id', token=bob['token'])[1] == []
        b.goto('http://127.0.0.1:8000/web/index.html');b.wait_for_url('**/shared/login.html*')
        status, reports=api('/rest/v1/reportes?select=id,user_id',token=alice['token'])
        assert len(reports)==1
        status, _=api('/rest/v1/reportes',{'user_id':bob['id'],'location':'Escuela','observation':'smoke','severity':'low','description':'Intento de escribir para otro poblador.'},'POST',token=alice['token'])
        assert status == 403
        op=login(admin)
        assert location in op.locator('#community-reports').inner_text()
        assert op.evaluate('window.xss') is None
        op.locator('[data-view=incidents]').click()
        op.locator('.incident-action').first.click()
        op.wait_for_function("document.querySelector('#incidents-table').textContent.includes('En revisión')")
        status, audit=api('/rest/v1/incident_audit?select=id',token=admin['token'])
        assert status == 200 and len(audit)>=1
        # Preferencias se guardan por cuenta y permanecen tras recargar.
        a.locator('#notif-push').uncheck()
        a.wait_for_function("!document.querySelector('#notif-push').disabled")
        a.reload();a.wait_for_selector('#dataset-summary')
        a.locator('#bottom-nav [data-screen=profile]').click()
        assert not a.locator('#notif-push').is_checked()
        a.locator('#bottom-nav [data-screen=home]').click()
        a.locator('[data-screen=help]').click()
        a.fill('#help-location','Puente QA temporal');a.check('#confirm-visible');a.check('#confirm-safe')
        a.locator('#send-help-btn').click();a.wait_for_selector('#screen-home.active')
        op.locator('#refresh-ops-btn').click()
        op.wait_for_function("document.querySelector('#incidents-table').textContent.includes('Puente QA temporal')")
        # La configuracion publica es legible; los secretos nunca se sirven.
        for path in ['/.env','/config/admin.local.json','/supabase/seed.sql','/node_modules/package.json','/config/../.env']:
            assert op.request.get('http://127.0.0.1:8000'+path).status == 404,path
        assert not errors,errors
        for context in contexts:context.close()
        browser.close()
    print('PASS: Supabase real, 300 filas, login móvil/admin, reporte, XSS, aislamiento A/B, rechazo de escalada, auditoría, preferencias, apoyo y secretos HTTP.')
finally:
    for user_id in reversed(created):
        status,_=api('/auth/v1/admin/users/'+user_id,method='DELETE',admin=True)
        if status not in [200,204]:print('Revisar limpieza de cuenta temporal:',user_id)
