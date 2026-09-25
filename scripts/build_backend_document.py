"""Genera figuras técnicas y versiones Word/PDF desde el documento fuente."""
from pathlib import Path
import re
import textwrap
from html import escape
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak, Preformatted
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs'
ASSETS=OUT/'backend_figuras'
ASSETS.mkdir(exist_ok=True)
GREEN='#205C45'; INK='#18362E'; MUTED='#506A61'

def canvas(title,subtitle):
    fig,ax=plt.subplots(figsize=(12,7))
    fig.patch.set_facecolor('#F5F8F6');ax.set_facecolor('#F5F8F6')
    ax.set(xlim=(0,12),ylim=(0,7));ax.axis('off')
    ax.text(.3,6.65,title,size=21,weight='bold',color=INK)
    ax.text(.3,6.22,subtitle,size=11,color=MUTED)
    return fig,ax

def box(ax,x,y,w,h,title,body):
    ax.add_patch(FancyBboxPatch((x,y),w,h,boxstyle='round,pad=0.06,rounding_size=0.12',facecolor='white',edgecolor='#BED3C6',linewidth=1.4))
    ax.text(x+.16,y+h-.3,title,size=12,weight='bold',color=GREEN,va='top')
    ax.text(x+.16,y+h-.75,body,size=10,color=INK,va='top',linespacing=1.6)

def arrow(ax,a,b,label=''):
    ax.annotate('',xy=b,xytext=a,arrowprops={'arrowstyle':'->','color':GREEN,'lw':1.7})
    if label:ax.text((a[0]+b[0])/2+.08,(a[1]+b[1])/2+.08,label,size=9,color=MUTED)

def save(fig,name):
    fig.savefig(ASSETS/f'{name}.png',dpi=190,bbox_inches='tight')
    fig.savefig(ASSETS/f'{name}.svg',bbox_inches='tight')
    plt.close(fig)

fig,ax=canvas('01 / Arquitectura del backend','Implementación actual: frontend estático y servicios administrados de Supabase')
box(ax,.3,3.4,3.1,2,'Panel administrativo','HTML · CSS · JavaScript\nSDK supabase-js\nArchivos en Firebase Hosting')
box(ax,4.5,3.4,3,2,'Supabase','Auth: identidad y sesión\nAPI de datos: consultas\nComunicación por HTTPS')
box(ax,8.6,3.4,3.1,2,'PostgreSQL','Permisos y políticas RLS\nTablas y claves foráneas\nFunciones y disparadores')
arrow(ax,(3.4,4.5),(4.5,4.5),'sesión');arrow(ax,(7.5,4.5),(8.6,4.5),'SQL')
box(ax,.3,.7,5.2,1.7,'Control de acceso','Cuenta existente → identidad → autorización administrativa.\nLa API y PostgreSQL aplican los permisos efectivos.')
box(ax,6,.7,5.7,1.7,'Límite de la implementación','No hay servidor Express ni arquitectura hexagonal completa.\nNode.js se usa para scripts; Firebase publica archivos.')
save(fig,'arquitectura')

fig,ax=canvas('02 / Trazabilidad de las 300 lecturas','La fuente CSV se importa; el panel consulta la copia persistida en Supabase')
for x,t,b in [(0.3,'CSV en GitHub','Archivo histórico\nSmoke Detection IoT'),(3.3,'Selección en Python','Muestreo estratificado\nSemilla: 20260923'),(6.3,'Importación','JSON / CSV / SQL\nSin duplicar registros'),(9.3,'Supabase','smoke_readings\n300 filas originales')]:
    box(ax,x,3.6,2.4,1.8,t,b)
for x in [2.7,5.7,8.7]:arrow(ax,(x,4.45),(x+.6,4.45))
ax.barh(2.6,214/300*10,left=.7,height=.48,color=GREEN)
ax.barh(2.6,86/300*10,left=.7+214/300*10,height=.48,color='#A8C8B7')
ax.text(.7,2.05,'214 con alarma (71,3 %)',size=12,color=INK,weight='bold')
ax.text(8,2.05,'86 sin alarma (28,7 %)',size=12,color=INK)
ax.text(.7,1.25,'6 nodos virtuales × 50 lecturas = 300 vínculos',size=16,color=GREEN,weight='bold')
ax.text(.7,.65,'Fire Alarm es una etiqueta histórica; no confirma incendios ni averías actuales.',size=11,color=MUTED)
save(fig,'trazabilidad')

fig,ax=canvas('03 / Relaciones del módulo demostrativo','Extracto del modelo real: claves y cardinalidades de las cuatro tablas demo')
box(ax,.3,3.3,3.3,2,'smoke_readings','PK: dataset_id + source_row\nfire_alarm · recorded_at\nMediciones originales')
box(ax,4.4,3.3,3.6,2,'demo_node_readings','PK / FK: dataset_id + source_row\nFK: node_id → demo_nodes.id\nUna asignación por lectura')
box(ax,8.8,3.3,2.9,2,'demo_nodes','PK: id\nSeis lotes virtuales\n50 lecturas por lote')
arrow(ax,(4.4,4.4),(3.6,4.4),'0..1 / 1')
arrow(ax,(8,4.4),(8.8,4.4),'N / 1')
box(ax,2.4,.4,3.5,1.9,'demo_cases','PK / FK: node_id\nstate\nCaso si hay etiquetas positivas')
box(ax,7,.4,4,1.9,'demo_maintenance','PK / FK: node_id\ntask · state\nUna tarea propuesta por lote')
arrow(ax,(9.2,3.3),(5.8,2.3),'1 / 0..1')
arrow(ax,(10.2,3.3),(9.2,2.3),'1 / 0..1')
save(fig,'relaciones')

source=(OUT/'BACKEND_ALERTA_SATIPO.md').read_text(encoding='utf-8')
figures={'2.4.':('arquitectura','Figura 1. Arquitectura desplegada y responsabilidad de cada servicio.'),'2.5.':('relaciones','Figura 2. Relaciones del módulo demostrativo. Extracto; no incluye todas las tablas.'),'2.6.':('trazabilidad','Figura 3. Origen, selección y persistencia de las 300 lecturas.')}
doc=Document();sec=doc.sections[0]
sec.top_margin=sec.bottom_margin=Inches(.7)
style=doc.styles['Normal'];style.font.name='Calibri';style.font.size=Pt(10.5)
style.paragraph_format.space_after=Pt(7)
for n in ['Heading 1','Heading 2']:doc.styles[n].font.color.rgb=RGBColor.from_string('205C45')
header=sec.header.paragraphs[0];header.text='ALERTA SATIPO  /  DOCUMENTACIÓN TÉCNICA';header.style='Caption'
footer=sec.footer.paragraphs[0];footer.alignment=2;footer.add_run('Backend | ')
field=OxmlElement('w:fldSimple');field.set(qn('w:instr'),'PAGE');footer._p.append(field)
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='Body',fontName='Helvetica',fontSize=10,leading=14,spaceAfter=8,textColor=colors.HexColor(INK)))
styles.add(ParagraphStyle(name='Caption2',parent=styles['Body'],fontSize=8,textColor=colors.HexColor(MUTED)))
for n in ['Title','Heading1','Heading2']:styles[n].textColor=colors.HexColor(GREEN)
story=[]

def paragraph(text,style_name='Body'):
    story.append(Paragraph(escape(text),styles[style_name]))

doc.add_paragraph('DOCUMENTO DE IMPLEMENTACIÓN',style='Subtitle')
doc.add_heading('Alerta Satipo',0);doc.add_heading('Backend y persistencia de datos',1)
doc.add_paragraph('Supabase · PostgreSQL · JavaScript',style='Subtitle')
doc.add_picture(str(ASSETS/'arquitectura.png'),width=Inches(6))
doc.add_paragraph('Versión revisada · 24 de septiembre de 2026')
doc.add_paragraph('Alcance: panel administrativo, 300 lecturas históricas y operación demostrativa vinculada. Documento elaborado a partir del código del proyecto.')
doc.add_page_break()
paragraph('ALERTA SATIPO','Title');paragraph('Backend y persistencia de datos','Heading1')
paragraph('Supabase · PostgreSQL · JavaScript')
story.append(Spacer(1,24));story.append(Image(str(ASSETS/'arquitectura.png'),width=480,height=280))
paragraph('Documento de implementación · Versión revisada · 24 de septiembre de 2026')
paragraph('Alcance: panel administrativo, 300 lecturas históricas y operación demostrativa vinculada. Elaborado a partir del código del proyecto.')
story.append(PageBreak())

code=False;buffer=[]
for line in source.splitlines():
    if line.startswith('# ') or line.startswith('Documento técnico'):continue
    if line.startswith('```'):
        if code:
            for row in buffer:
                p=doc.add_paragraph();p.paragraph_format.space_after=Pt(0)
                r=p.add_run(row);r.font.name='Consolas';r.font.size=Pt(8)
            wrapped='\n'.join('\n'.join(textwrap.wrap(r,width=94,replace_whitespace=False,drop_whitespace=False)) or ' ' for r in buffer)
            story.append(Preformatted(wrapped,ParagraphStyle('Code',fontName='Courier',fontSize=8,leading=10,backColor=colors.HexColor('#EFF4F1'),spaceAfter=10)))
            buffer=[]
        code=not code;continue
    if code:buffer.append(line);continue
    if not line:continue
    if line.startswith('## '):
        title=line[3:]
        
        if not title.startswith('2.1.'):doc.add_page_break()
        doc.add_heading(title,1)
        if story and not isinstance(story[-1],PageBreak):story.append(PageBreak())
        paragraph(title,'Heading1')
        key=title.split(' ')[0]
        if key in figures:
            name,caption=figures[key]
            doc.add_picture(str(ASSETS/f'{name}.png'),width=Inches(6));doc.add_paragraph(caption,style='Caption')
            story.append(Image(str(ASSETS/f'{name}.png'),width=480,height=280));paragraph(caption,'Caption2')
    elif line.startswith('### '):doc.add_heading(line[4:],2);paragraph(line[4:],'Heading2')
    elif line.startswith('- '):doc.add_paragraph(line[2:],style='List Bullet');paragraph('• '+line[2:])
    else:doc.add_paragraph(line);paragraph(line)
doc.save(OUT/'BACKEND_ALERTA_SATIPO_REVISADO.docx')

def furniture(c,d):
    c.setStrokeColor(colors.HexColor('#C6D9CD'));c.line(48,805,547,805)
    c.setFont('Helvetica',8);c.setFillColor(colors.HexColor(MUTED))
    c.drawString(48,815,'ALERTA SATIPO / DOCUMENTACIÓN TÉCNICA')
    c.drawString(48,28,'Backend · Implementación actual');c.drawRightString(547,28,str(d.page))

SimpleDocTemplate(str(OUT/'BACKEND_ALERTA_SATIPO_REVISADO.pdf'),pagesize=(595,842),leftMargin=48,rightMargin=48,topMargin=52,bottomMargin=48).build(story,onFirstPage=furniture,onLaterPages=furniture)
print('Word, PDF y tres figuras PNG/SVG generados.')
