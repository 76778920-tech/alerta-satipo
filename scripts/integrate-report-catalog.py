"""Genera catálogo trazable del informe de 22/10/2026; no calcula aceptación física."""
import json
from pathlib import Path

rf = ['Recopilar variables ambientales','Procesar localmente','Analizar múltiples variables','Detectar condiciones de riesgo','Clasificar Normal/Advertencia/Emergencia','Generar alertas locales','Transmitir alertas inalámbricas','Registrar mediciones y eventos','Visualizar estado y alertas en móvil','Registrar usuarios','Autenticar usuarios','Gestionar permisos por tipo','Cerrar sesión','Consultar historial','Proveer datos para evaluar desempeño']
rnf = ['Tiempo de respuesta','Consumo eficiente de recursos','Comunicación oportuna','Funcionamiento sin Internet','Continuidad de operación','Conservación de registros','Interfaz comprensible','Diferenciación clara del riesgo','Protección de credenciales','Control de acceso','Gestión de sesiones','Protección de información','Compatibilidad Android','Modularidad','Control de versiones','Exportación de datos']
hu = ['Registro de usuario','Inicio de sesión','Acceso según rol','Captura ambiental','Integración de variables','Procesamiento local','Detección de riesgo','Clasificación de riesgo','Alerta visual','Alerta sonora','Envío por BLE','Comunicación a largo alcance','Visualizar estado actual','Consultar historial','Registrar evento','Consultar offline','Exportar información','Evaluar desempeño']
pmv = [3,3,3,1,1,1,1,1,2,2,2,3,2,3,1,3,3,3]
links = [[10],[11],[12],[1],[3],[2],[4],[5],[6],[6],[7],[7],[9],[14],[8],[8,14],[15],[15]]
items = []
for prefix, names, page in [('RF',rf,8),('RNF',rnf,8),('HU',hu,9)]:
    for i,title in enumerate(names,1):
        item = {'id':f'{prefix}-{i:03}' if prefix=='HU' else f'{prefix}-{i:02}', 'title':title,'page':page,
                'status':'Pendiente','evidence':[], 'gap':'Requiere aceptación y evidencia específica; no se presume cumplido.'}
        if prefix=='HU':
            item['pmv']=f'PMV{pmv[i-1]}'
            item['requirements']=[f'RF-{n:02}' for n in links[i-1]]
            item['mapping']='Correspondencia propuesta en esta integración; los ID y PMV proceden del informe.'
        items.append(item)

def update(ids,status,evidence,gap):
    for item in items:
        if item['id'] in ids.split(): item.update(status=status,evidence=evidence.split(),gap=gap)

update('RF-01 HU-004','Parcial','acquisition/adapters/http.py tests/acquisition_test.py','Adaptador HTTP probado con servidor local. Falta seleccionar proveedor y verificar cobertura, unidades y autenticación. Sensores sustituidos por API a petición del usuario.')
update('RF-02 RF-03 HU-005 HU-006','Parcial','acquisition/domain/measurement.py acquisition/application/service.py','Validación y procesamiento local implementados. Una nueva adquisición requiere conectividad con la API. Modelo compatible pendiente de conectar.')
update('RF-04 RF-15 HU-007 HU-018','Parcial','colab/Alerta_Satipo_300_predicciones.ipynb backend/adapters/out/prediction-results.json','Existe evaluación de 300 lecturas. La PoC de 62 630 está reportada en el PDF; faltan notebook y artefactos originales para reproducirla.')
update('RF-05 HU-008 RP-01','Pendiente','','La etiqueta Fire Alarm es binaria. No hay modelo de tres clases ni umbrales operativos validados.')
update('RF-06 HU-009 HU-010','Pendiente','','Panel con indicadores demostrativos; no hay alertamiento automático operativo, LED ni buzzer. Definir el canal sustituto en la variante por API.')
update('RF-07 HU-011 HU-012','Adaptado','acquisition/adapters/http.py acquisition/application/service.py','Transporte HTTP y cola con confirmación reemplazan el plan BLE/LoRaWAN para esta variante. Falta receptor real. No implica cumplimiento del enlace físico original.')
update('RF-08 RF-14 HU-014 HU-015 HU-016 RNF-04 RNF-06','Parcial','acquisition/adapters/sqlite.py acquisition/__main__.py tests/acquisition_test.py','SQLite conserva lecturas, predicciones opcionales y eventos; consulta sin Internet en equipo local. No es SQLite en Android ni PWA offline. Falta API real y evaluación de retención.')
update('RF-09 HU-013 RNF-13','Parcial','frontend/web/index.html frontend/mobile/index.html','Interfaz web y código móvil local existentes; no hay aplicación Flutter/Android validada. El panel permite inspeccionar exportaciones API sin mezclarlas con sensores reales.')
update('RF-10 HU-001','Pendiente','frontend/src/application/use-cases/browser-service.mjs','El acceso vigente permite solo administradores previamente autorizados. El informe propone registro pero no define aprobación ni alta pública; se conserva la restricción existente.')
update('RF-11 RF-12 RF-13 HU-002 HU-003 RNF-09 RNF-10 RNF-11','Parcial','frontend/src/application/use-cases/browser-service.mjs backend/application/use-cases/admin-service.mjs supabase/migrations/202609230001_initial.sql','Autenticación, autorización y cierre implementados para el panel. Falta validar recorrido de usuarios finales Android y aceptación del backlog original.')
update('RNF-14 RNF-15','Parcial','docs/ARQUITECTURA_HEXAGONAL.md tests/python_architecture_test.py tests/frontend-hexagonal.test.mjs','Núcleos separados y repositorio Git. La ampliación API requiere mantener pruebas de integración y revisiones.')
update('RNF-16 HU-017','Parcial','acquisition/__main__.py frontend/web/js/admin.js','Exportación JSON implementada; faltan criterios de aceptación originales y prueba con usuario.')
items.extend([
 {'id':'RP-01','title':'Normal / Advertencia / Emergencia','page':8,'status':'Pendiente','evidence':[],'gap':'No deducir tres clases de una etiqueta binaria.'},
 {'id':'RP-02','title':'Condición compatible con incendio: 0 / 1','page':8,'status':'Parcial','evidence':['colab/Alerta_Satipo_300_predicciones.ipynb'],'gap':'Clasificación experimental externa; no validación territorial ni inferencia API operativa.'},
 {'id':'RP-03','title':'Condición anómala: 0 / 1','page':8,'status':'Pendiente','evidence':[],'gap':'La perturbación de datos no constituye un detector independiente de anomalías.'}])
update('RF-01 HU-004 HU-005 RF-03','Parcial','colab/PMV1_cinco_variables.ipynb frontend/web/js/pmv1.js firmware/pmv1/src/main.cpp','Cinco variables completas, adquisición periódica y prueba de diez lecturas implementadas. Firmware compilado; no hay placa ni sensores para validación física.')
update('RF-02 HU-006 RNF-04','Parcial','backend/domain/pmv1.mjs firmware/pmv1/include/generated_model.h tests/browser_hexagonal.py','Inferencia local de árbol propio probada sin red en navegador. Firmware compilado. Falta exportación real Edge Impulse y ejecución sin Internet en ESP32-S3.')
update('RF-04 RF-05 HU-007 HU-008 RP-01','Parcial','scripts/train_pmv1.py colab/pmv1/evaluation.json','Tres clases entrenadas con cinco variables sintéticas; test independiente de 900 registros. Sin validación con incendios reales ni sensores calibrados.')
update('RF-08 HU-015 RNF-06','Parcial','supabase/migrations/202610260001_pmv1.sql tests/pmv1.test.mjs tests/pmv1_live.mjs','Cuatro tablas, límites, transacción e idempotencia; persistencia remota comprobada tras reabrir sesión. Falta aceptación con dispositivo físico.')
catalog = {'version':'report-20261022-pmv1-20261026','source':{'title':'Informe final del proyecto · Grupo 04','date':'2026-10-22','pages':19},
 'adaptation':'PMV1 ampliado con simulación de cinco variables, inferencia local y firmware ESP32-S3 preparado. El usuario aún no tiene componentes; pruebas físicas y exportación Edge Impulse pendientes. La integración de API ambientales se mantiene separada.',
 'requirements':items,
 'experiments':{'report':{'provenance':'Valores transcritos del PDF, páginas 15–16. No ejecutados ni reproducidos en esta integración.', 'rows':62630,'features':9,'train':50104,'test':12526,
    'models':[{'name':'Random Forest','accuracy':0.9976,'f1_macro':0.9971,'recall_alarm':0.9990},{'name':'Árbol','accuracy':0.9896,'f1_macro':0.9873,'recall_alarm':0.9895},{'name':'Regresión logística','accuracy':0.7775,'f1_macro':0.6383,'recall_alarm':0.9781},{'name':'Baseline','accuracy':0.7146,'f1_macro':0.4168,'recall_alarm':1.0}],
    'temporal':{'f1_macro':0.6869,'recall_alarm':0.8465},'noise_2_percent':{'f1_macro':0.8351,'recall_alarm':0.8638},'confusion_matrix':[[3554,21],[9,8942]],'colab_latency_ms':45.965},
    'repository':{'rows':300,'train':240,'test':60,'correct':54,'false_negatives':5,'false_positives':1,'artifact':'backend/adapters/out/prediction-results.json'}},
 'management':{'weeks':16,'sprints':8,'tasks_reported':43,'administrative_progress_reported':37.5349,'physical_acceptance':False,'note':'Cifras del informe; no avance calculado a partir del código.',
    'milestones':[{'id':'PMV1','weeks':'1–6','scope':'Adquisición, tratamiento y primeras pruebas'},{'id':'PMV2','weeks':'7–12','scope':'Modelo, alertas y visualización'},{'id':'PMV3','weeks':'13–16','scope':'Comunicación, usuarios, historial, offline y evaluación integral'}]},
 'risks':['Datos externos no representativos de Satipo','Variables o unidades incompatibles con el modelo','Falsos negativos y falsas alarmas','Interrupción de API, cuotas o cambios de contrato','Pérdida de conectividad: no hay nuevas lecturas offline','Exposición de credenciales o información personal'],
 'missing_evidence':['Notebook y exportaciones originales de la PoC de 62 630 filas','Backlog original con Given/When/Then','Libro Gantt con las 43 actividades','API seleccionada y su contrato','Modelo apto para las variables del proveedor','Pruebas con usuarios, experto y actas de aceptación','Proyecto Flutter o decisión de mantener solo web']}
Path('frontend/src/adapters/out/report-catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
