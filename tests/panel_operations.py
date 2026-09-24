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
    page.wait_for_function("window.SatipoOperations && window.SatipoOperations.getSnapshot() !== null")
    snapshot=page.evaluate('window.SatipoOperations.getSnapshot()')
    assert len(snapshot['nodes'])==6 and len(snapshot['links'])==300
    expected={r['source_row']:r for r in source}
    for link in snapshot['links']:
        row=link['smoke_readings']
        assert row['fire_alarm']==expected[link['source_row']]['fire_alarm']
        assert row['temperature_c']==expected[link['source_row']]['temperature_c']
    assert sum(r['smoke_readings']['fire_alarm'] for r in snapshot['links'])==214
    for view,table in [('incidents','demo_cases'),('maintenance','demo_maintenance')]:
        page.click(f'[data-view="{view}"]')
        control=page.locator(f'[data-operation="{table}"]').first
        previous=control.input_value()
        target='En revisión' if table=='demo_cases' else 'En progreso'
        if previous==target: target='Pendiente'
        node=control.get_attribute('data-node')
        try:
            control.select_option(target)
            page.wait_for_function("([t,n,s])=>document.querySelector(`[data-operation='${t}'][data-node='${n}']`).dataset.previous===s",arg=[table,node,target])
            page.reload()
            page.wait_for_function("window.SatipoOperations && window.SatipoOperations.getSnapshot() !== null")
            page.click(f'[data-view="{view}"]')
            assert page.locator(f'[data-operation="{table}"][data-node="{node}"]').input_value()==target
        finally:
            page.evaluate("async ([t,n,s])=>{const r=await SatipoBackend.client.from(t).update({state:s}).eq('node_id',n);if(r.error)throw r.error}",[table,node,previous])
    page.click('[data-view="nodes"]')
    assert page.locator('#demo-nodes .operation-card').count()==6
    page.route('**/rest/v1/demo_nodes*',lambda route:route.abort())
    page.locator('#demo-nodes .operations-retry').click()
    page.wait_for_function("document.querySelector('#demo-nodes .operations-status').textContent.includes('No se pudieron')")
    assert page.locator('#demo-nodes .operation-card').count()==6
    page.unroute('**/rest/v1/demo_nodes*')
    page.locator('#demo-nodes .operations-retry').click()
    page.wait_for_function("document.querySelector('#demo-nodes .operations-status').textContent.includes('Datos y estados')")
    for width in [1440,390,320]:
        page.set_viewport_size({'width':width,'height':800})
        for view in ['nodes','incidents','maintenance']:
            page.click(f'[data-view="{view}"]')
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,view)
    assert not errors,errors
    browser.close()
print('PASS: 6 nodos, 300 relaciones, 214 etiquetas; estados persistentes restaurados, recuperación de red y 3 anchos.')
