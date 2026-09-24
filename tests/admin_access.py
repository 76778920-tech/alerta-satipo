"""Comprueba el acceso publicado sin crear cuentas ni enviar correos."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

base = 'https://alerta-satipo-76778920.web.app'
credentials = json.loads(Path('config/admin.local.json').read_text())
with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    page = browser.new_page()
    page.goto(base)
    page.wait_for_function("document.querySelector('#submit-btn') && !document.querySelector('#submit-btn').disabled")
    assert page.locator('#signup-tab,#registration-fields,[data-demo-role]').count() == 0
    for path in ['/mobile/', '/mobile/index.html', '/app-mobile.html']:
        assert page.request.get(base + path).status == 404
    # Consulta de configuración de Auth, sin intentar registrar una cuenta.
    assert page.evaluate("async()=>{const c=await (await fetch('/config/public.json')).json();const r=await fetch(c.supabaseUrl+'/auth/v1/settings',{headers:{apikey:c.supabasePublishableKey}});return (await r.json()).disable_signup}") is True
    # Simula credenciales válidas de un no-administrador: no se crea ningún usuario.
    page.evaluate("""()=>{
      window.SatipoBackend.client.auth.signInWithPassword=async()=>({data:{},error:null});
      window.SatipoBackend.identify=async()=>({role:'user'});
      window.SatipoBackend.client.auth.signOut=async()=>{window.testSignedOut=true;return {error:null}};
    }""")
    page.fill('#email','existing-user@example.invalid');page.fill('#password','test-only')
    page.locator('#submit-btn').click()
    page.wait_for_function("document.querySelector('#auth-status').textContent.includes('Acceso denegado')")
    assert page.evaluate('window.testSignedOut') is True
    assert '/shared/login.html' in page.url
    page.reload()
    page.wait_for_function("!document.querySelector('#submit-btn').disabled")
    page.fill('#email',credentials['email']);page.fill('#password',credentials['password'])
    page.locator('#submit-btn').click();page.wait_for_url('**/web/index.html')
    page.wait_for_selector('#dataset-summary')
    assert '300 registros' in page.locator('#dataset-summary').inner_text()
    browser.close()
print('PASS: sin registro, sin rutas móviles, registro Supabase desactivado, rechazo de no-admin y acceso real de administrador. No se crearon cuentas.')
