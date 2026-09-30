"""Verifica simulación en hosting; no modifica datos remotos."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
credentials=json.loads(Path('config/admin.local.json').read_text())
with sync_playwright() as p:
    browser=p.chromium.launch(channel='msedge',headless=True)
    page=browser.new_page(viewport={'width':1440,'height':900},accept_downloads=True)
    errors=[];writes=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('https://alerta-satipo-76778920.web.app/shared/login.html')
    page.wait_for_function("!document.querySelector('#submit-btn').disabled")
    page.fill('#email',credentials['email']);page.fill('#password',credentials['password']);page.click('#submit-btn')
    page.wait_for_url('**/web/index.html')
    page.wait_for_selector('#demo-generate',state='attached')
    page.on('request',lambda r:writes.append(r.url) if r.method in ['POST','PATCH','PUT','DELETE'] else None)
    page.click('[data-view="district-demo"]')
    assert page.locator('#demo-cards article').count()==9
    assert 'DATOS FICTICIOS' in page.inner_text('#district-demo')
    first=page.inner_text('#demo-period');page.click('#demo-generate');assert first!=page.inner_text('#demo-period')
    page.select_option('#demo-filter','Alto')
    for card in page.locator('#demo-cards article').all():assert 'Alto · ficticio' in card.inner_text()
    page.select_option('#demo-filter','Todos')
    with page.expect_download() as info:page.click('#demo-download')
    download=info.value;data=json.loads(Path(download.path()).read_text(encoding='utf-8'))
    assert data['type']=='SIMULATION_ONLY' and data['horizonHours']==24
    assert len({r['ubigeo'] for r in data['districts']})==9
    assert all(0<=r['score']<=100 for r in data['districts'])
    assert download.suggested_filename.startswith('SIMULACION-')
    page.screenshot(path='test-results/district-demo-desktop.png')
    page.set_viewport_size({'width':390,'height':844})
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    assert page.locator('.admin-content').evaluate('(e)=>e.scrollHeight>e.clientHeight')
    page.locator('.admin-content').evaluate('(e)=>e.scrollTop=e.scrollHeight')
    assert page.locator('#demo-cards article').last.is_visible()
    page.screenshot(path='test-results/district-demo-mobile.png')
    assert not errors,errors
    assert not writes,writes
    browser.close()
print('PASS: 9 distritos, regeneración, filtros, exportación marcada, móvil, sin escrituras remotas ni errores JS.')
