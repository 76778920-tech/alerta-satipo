"""Prueba publicada: consulta con administrador existente, sin modificar tablas."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
credentials=json.loads(Path('config/admin.local.json').read_text())
base=os.environ.get('PANEL_TEST_URL','https://alerta-satipo-76778920.web.app')
with sync_playwright() as p:
    browser=p.chromium.launch(channel='msedge',headless=True)
    page=browser.new_page(viewport={'width':1440,'height':900})
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(base+'/shared/login.html')
    page.wait_for_function("!document.querySelector('#submit-btn').disabled")
    page.fill('#email',credentials['email']);page.fill('#password',credentials['password'])
    page.click('#submit-btn');page.wait_for_url('**/web/index.html')
    page.wait_for_selector('#forecast-horizon',state='attached')
    page.click('[data-view="forecast"]')
    assert page.locator('#forecast-cards article').count()==9
    for horizon in ['1','7','30']:
        page.select_option('#forecast-horizon',horizon)
        assert 'Sin pronósticos publicados' in page.inner_text('#forecast-status')
        assert 'Sin estimación disponible' in page.inner_text('#forecast-cards')
    page.select_option('#forecast-district','120609')
    assert page.locator('#forecast-cards article').count()==1
    assert 'VIZCATAN' in page.inner_text('#forecast-cards')
    page.click('#forecast-evaluation')
    assert page.inner_text('#view-title')=='Evaluación de humo'
    page.click('[data-view="forecast"]');page.click('#forecast-demo')
    assert page.inner_text('#view-title')=='Simulación distrital'
    page.click('[data-view="forecast"]')
    page.set_viewport_size({'width':390,'height':844})
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    assert not errors,errors
    browser.close()
print('PASS: distritos, horizontes sin resultados simulados, navegación y móvil.')
