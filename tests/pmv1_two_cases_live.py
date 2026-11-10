"""Evidence from real UI inference; no mock model and no database writes."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
base=os.environ.get('PANEL_TEST_URL','https://alerta-satipo-76778920.web.app')
credentials=json.loads((ROOT/'config/admin.local.json').read_text())
output=Path(os.environ.get('ML_EVIDENCE_DIR',str(ROOT/'test-results/ml_dos_casos')))
output.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(channel='msedge',headless=True)
    context=browser.new_context(viewport={'width':1440,'height':1100},locale='es-PE')
    page=context.new_page()
    errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.goto(base+'/shared/login.html')
    page.wait_for_function("!document.querySelector('#submit-btn').disabled")
    page.fill('#email',credentials['email'])
    page.fill('#password',credentials['password'])
    page.click('#submit-btn')
    page.wait_for_url('**/web/index.html')
    page.wait_for_function("document.querySelector('#pmv1-status')?.textContent.startsWith('Listo.')")
    page.click('[data-view="pmv1"]')
    records=[]
    for index,scenario in enumerate(['Normal','Emergencia'],1):
        page.select_option('#pmv1-scenario',scenario)
        page.click('#pmv1-once')
        page.wait_for_function("n=>document.querySelectorAll('#pmv1-rows tr').length===n",arg=index)
        assert scenario in page.inner_text('#pmv1-current')
        history=page.evaluate("async ()=>await createPmv1Service(SatipoBackend.profile.id).history()")
        latest=history[0]
        assert latest['prediction']['level']==scenario
        assert latest['reading']['source']=='simulation'
        assert latest['prediction']['model_version']=='pmv1-synthetic-tree-v2'
        assert len(latest['reading']['values'])==5 and not latest['synced']
        records.append(latest)
        page.locator('.admin-content').evaluate('(element)=>element.scrollTop=0')
        page.screenshot(path=str(output/f'caso_{index}_{scenario.lower()}.png'))
    # Reopening the screen must retain both actual inference outputs locally.
    page.reload()
    page.wait_for_function("document.querySelector('#pmv1-status')?.textContent.startsWith('Listo.')")
    page.click('[data-view="pmv1"]')
    page.wait_for_function("document.querySelectorAll('#pmv1-rows tr').length===2")
    history=page.evaluate("async ()=>await createPmv1Service(SatipoBackend.profile.id).history()")
    assert {r['reading']['id'] for r in history}=={r['reading']['id'] for r in records}
    assert not errors,errors
    (output/'resultados.json').write_text(json.dumps({'application_url':base+'/web/index.html',
        'method':'Real browser UI: select scenario, click Leer una vez; trained model executes locally.',
        'source':'simulation','remote_writes':False,'persistence_after_reload':True,
        'cases':records},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    context.close()
    browser.close()
print('PASS: dos inferencias desde la web publicada, cinco variables, modelo v2, niveles distintos y persistencia local; sin escrituras remotas.')
