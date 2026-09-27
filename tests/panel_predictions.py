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
    page.wait_for_selector('#prediction-status',state='attached')
    page.click('[data-view="predictions"]')
    page.wait_for_selector('#prediction-results:visible')
    assert '90.0 %' in page.inner_text('#prediction-summary')
    seen=[]
    while True:
        seen.extend(page.locator('#prediction-rows tr td:first-child').all_text_contents())
        if page.is_disabled('#prediction-next'):break
        page.click('#prediction-next')
    assert len(seen)==len(set(seen))==60
    page.select_option('#prediction-filter','errors')
    assert page.locator('#prediction-rows tr').count()==6
    assert page.inner_text('#prediction-rows').count('Falso negativo')==5
    assert page.inner_text('#prediction-rows').count('Falso positivo')==1
    page.set_viewport_size({'width':390,'height':844})
    assert page.locator('#prediction-refresh').is_visible()
    assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth')
    Path('test-results').mkdir(exist_ok=True)
    page.screenshot(path='test-results/predictions-mobile.png')
    page.set_viewport_size({'width':1440,'height':900})
    page.screenshot(path='test-results/predictions-desktop.png')
    page.route('**/admin-api/predictions',lambda route:route.abort())
    page.click('#prediction-refresh')
    page.wait_for_function("document.querySelector('#prediction-status').textContent.includes('No se pudieron')")
    assert page.is_hidden('#prediction-results')
    page.unroute('**/admin-api/predictions')
    page.route('**/admin-api/predictions',lambda route:route.fulfill(status=200,json={'rows':[]}))
    page.click('#prediction-refresh')
    page.wait_for_function("document.querySelector('#prediction-status').textContent.includes('No se pudieron')")
    assert page.is_hidden('#prediction-results')
    page.unroute('**/admin-api/predictions')
    page.click('#prediction-refresh');page.wait_for_selector('#prediction-results:visible')
    assert not errors,errors
    browser.close()
print('PASS: 60 resultados, filtros, métricas, móvil, fallo de red, respuesta inválida y recuperación; sin errores JavaScript.')
