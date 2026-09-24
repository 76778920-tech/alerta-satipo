"""Verifica datos y UI con la cuenta existente; no crea usuarios ni escribe en Supabase."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

base = os.environ.get('PANEL_TEST_URL', 'http://127.0.0.1:8000')
credentials = json.loads(Path('config/admin.local.json').read_text())
source = json.loads(Path('data/smoke_detection_300.json').read_text())
with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True, ignore_default_args=['--hide-scrollbars'])
    page = browser.new_page(viewport={'width':1440,'height':900})
    errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.goto(base+'/shared/login.html')
    page.wait_for_function("!document.querySelector('#submit-btn').disabled")
    page.fill('#email',credentials['email']);page.fill('#password',credentials['password'])
    page.locator('#submit-btn').click();page.wait_for_url('**/web/index.html')
    page.wait_for_function("window.SatipoDataset && window.SatipoDataset.getSnapshot().length===300")
    actual=page.evaluate('window.SatipoDataset.getSnapshot()')
    expected={row['source_row']:row for row in source}
    assert len(actual)==300
    for row in actual:
        for key,value in expected[row['source_row']].items():
            if key=='recorded_at':continue  # PostgreSQL normaliza la representación de la zona UTC.
            assert row[key]==value,(row['source_row'],key)
    assert page.locator('.admin-content').evaluate('(e)=>e.scrollHeight>e.clientHeight')
    page.locator('.admin-content').evaluate('(e)=>e.scrollTop=500')
    assert page.locator('.admin-content').evaluate('(e)=>e.scrollTop')>0
    # Todas las filas son alcanzables mediante paginación, sin omisiones ni duplicados.
    seen=[]
    while True:
        seen.extend(page.locator('[data-reading]').evaluate_all('(els)=>els.map(e=>Number(e.dataset.reading))'))
        if page.locator('#dataset-next').is_disabled():break
        page.locator('#dataset-next').click()
    assert len(seen)==len(set(seen))==300
    assert set(seen)==set(expected)
    page.select_option('#dataset-filter','1');assert '214' in page.locator('#dataset-position').inner_text()
    page.select_option('#dataset-filter','0');assert '86' in page.locator('#dataset-position').inner_text()
    page.select_option('#dataset-filter','all');page.fill('#dataset-search','999999')
    assert '0 resultados' in page.locator('#dataset-position').inner_text()
    assert page.locator('#dataset-next').is_disabled()
    page.fill('#dataset-search','')
    # Pérdida de conexión: se retiene la última lectura y se avisa.
    page.route('**/rest/v1/smoke_readings*',lambda route:route.abort())
    page.locator('#dataset-retry').click()
    page.wait_for_function("document.querySelector('#dataset-connection').textContent.includes('No se pudo actualizar')")
    assert len(page.evaluate('window.SatipoDataset.getSnapshot()'))==300
    page.unroute('**/rest/v1/smoke_readings*')
    # Campos ausentes no se convierten en cero, porcentajes ni fechas inválidas.
    malformed=[dict(source[0],temperature_c=None,recorded_at='invalid',fire_alarm=None)]
    page.route('**/rest/v1/smoke_readings*',lambda route:route.fulfill(status=200,json=malformed))
    page.locator('#dataset-retry').click()
    page.wait_for_function("window.SatipoDataset.getSnapshot().length===1")
    assert 'No disponible' in page.locator('#dataset-rows').inner_text()
    assert 'Fecha no disponible' in page.locator('#dataset-rows').inner_text()
    assert 'Etiqueta no disponible' in page.locator('#dataset-rows').inner_text()
    assert 'inválidos' in page.locator('#dataset-quality').inner_text()
    page.unroute('**/rest/v1/smoke_readings*')
    page.locator('#dataset-retry').click()
    page.wait_for_function('window.SatipoDataset.getSnapshot().length===300')
    # Fallo inicial: el resto del panel permanece accesible y el botón permite recuperarse.
    page.route('**/rest/v1/smoke_readings*',lambda route:route.abort())
    page.reload();page.wait_for_function("document.querySelector('#dataset-connection')?.textContent.includes('No se pudieron cargar')")
    assert page.locator('[data-view=incidents]').is_visible()
    page.unroute('**/rest/v1/smoke_readings*')
    page.locator('#dataset-retry').click();page.wait_for_function('window.SatipoDataset.getSnapshot().length===300')
    for width,height in [(1440,900),(1024,768),(390,844),(320,700)]:
        page.set_viewport_size({'width':width,'height':height})
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
        assert page.locator('.admin-content').evaluate('(e)=>e.scrollHeight>e.clientHeight'),width
    page.locator('[data-view=incidents]').click()
    assert page.locator('#incidents-table').inner_text().strip()
    page.locator('[data-view=nodes]').click()
    assert page.locator('#nodes-table').inner_text().strip()
    assert not errors,errors
    browser.close()
print('PASS: 300 registros comparados con la fuente; paginación completa, filtros, scroll en 4 tamaños, fallos/reintento, campos inválidos y vistas vacías. Sin escrituras ni cuentas nuevas.')
