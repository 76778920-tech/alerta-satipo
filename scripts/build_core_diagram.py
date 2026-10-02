"""Lámina vectorial del core real; las flechas muestran dependencias, no tráfico."""
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Polygon
from matplotlib import patheffects

out=Path(__file__).resolve().parents[1]/'docs'/'core_hexagonal';out.mkdir(exist_ok=True)
plt.rcParams.update({'font.family':'DejaVu Sans','svg.fonttype':'none'})
fig,ax=plt.subplots(figsize=(24,15));fig.subplots_adjust(0,0,1,1)
fig.patch.set_facecolor('#F5F7FA');ax.set(xlim=(0,24),ylim=(0,15));ax.axis('off')
ink='#142B40';muted='#566B7D';blue='#276A9B';green='#147363';gold='#A57524'
ax.text(.7,14.35,'ALERTA SATIPO',fontsize=14,weight='bold',color=green)
ax.text(.7,13.64,'CORE · Arquitectura hexagonal',fontsize=33,weight='bold',color=ink)
ax.text(.7,13.12,'Panel administrativo  /  Puertos y adaptadores  /  Vista de dependencias del código implementado',fontsize=13,color=muted)
ax.text(23.2,14.35,'ARQ–01  |  25 SEP 2026',fontsize=11,color=muted,ha='right')
ax.plot([.7,23.3],[12.75,12.75],color='#D7E1E8',lw=1)
hexagon=Polygon([(5.8,7.55),(7.9,12.15),(16.1,12.15),(18.2,7.55),(16.1,2.95),(7.9,2.95)],facecolor='#E8F2EF',edgecolor=green,lw=2.5,joinstyle='round')
ax.add_patch(hexagon)
ax.text(12,11.7,'CORE / DOMINIO + APLICACIÓN + CONTRATOS',ha='center',fontsize=13,weight='bold',color=green)
ax.text(12,11.28,'Sin dependencias de Supabase, HTTP o navegador',ha='center',fontsize=11,color=muted)

def card(x,y,w,h,tag,title,lines,color=blue):
 p=FancyBboxPatch((x,y),w,h,boxstyle='round,pad=.02,rounding_size=.13',facecolor='white',edgecolor='#CFDBE3',lw=1)
 p.set_path_effects([patheffects.SimplePatchShadow(offset=(2,-2),alpha=.08),patheffects.Normal()]);ax.add_patch(p)
 ax.plot([x+.18,x+.18],[y+.2,y+h-.2],color=color,lw=3)
 ax.text(x+.38,y+h-.28,tag,fontsize=9,weight='bold',color=color,va='top')
 ax.text(x+.38,y+h-.67,title,fontsize=14,weight='bold',color=ink,va='top')
 ax.text(x+.38,y+h-1.14,lines,fontsize=10.5,color=muted,va='top',linespacing=1.65)

card(.7,8.25,4.35,2.6,'ADAPTADOR DE ENTRADA','HTTP / createHandler','GET: lecturas, operación, actividad\nPATCH: estados y configuración\nMapea solicitudes y errores\nbackend/adapters/in/http.mjs')
card(.7,4.5,4.35,2.6,'ENTRADA DE PRUEBAS','Pruebas de aplicación','Invocan AdminService sin HTTP\nInyectan puertos de memoria\nComprueban reglas y conflictos\ntests/hexagonal.test.mjs')
card(7.55,8.4,3.75,2.4,'PUERTO DE ENTRADA','AdminUseCases','listReadings · listOperations\ngetActivity · updateState\nupdateSettings',green)
card(12.65,8.4,3.8,2.4,'APLICACIÓN','AdminService','Autoriza al administrador\nCoordina reglas y repositorios\nDetecta ausencia y conflicto',green)
card(7.55,4.1,3.75,2.8,'DOMINIO','OperationalRecord','Identidad y estado inmutables\nchangeCommand\nvalidateThresholds\nrequireObject · ApplicationError',green)
card(12.65,4.1,3.8,2.8,'PUERTOS DE SALIDA','Contratos del núcleo','IdentityPort: authenticate\nRepositoryPort: consultas,\ncompareAndSet, exists,\nsaveSettings',green)
card(18.95,8.25,4.35,2.6,'ADAPTADORES DE SALIDA','Supabase','SupabaseIdentity\nSupabaseRepository\nCliente aislado por solicitud\nJWT del usuario + permisos RLS')
card(18.95,4.5,4.35,2.6,'ADAPTADORES DE PRUEBA','Memoria','MemoryIdentity\nMemoryRepository\nMismos contratos de salida\nSin red ni base de datos')

def arrow(start,end,label,dash=False,offset=(0,.15)):
 ax.annotate('',xy=end,xytext=start,arrowprops={'arrowstyle':'-|>','lw':1.8,'color':blue,'linestyle':'--' if dash else '-', 'shrinkA':3,'shrinkB':3})
 x=(start[0]+end[0])/2+offset[0];y=(start[1]+end[1])/2+offset[1]
 ax.text(x,y,label,fontsize=10,color=blue,ha='center',bbox={'facecolor':'#F5F7FA','edgecolor':'none','pad':2})
arrow((5.05,9.7),(7.55,9.7),'usa')
arrow((5.05,6.05),(12.65,8.55),'invoca caso de uso',offset=(0,.1))
arrow((12.65,9.65),(11.3,9.65),'implementa',True)
arrow((13.6,8.4),(10.65,6.9),'usa dominio')
arrow((15.4,8.4),(15.4,6.9),'usa puertos',offset=(.55,.1))
arrow((18.95,8.5),(16.45,6.55),'implementan',True,offset=(.1,.2))
arrow((18.95,5.55),(16.45,5.55),'implementan',True)

ax.text(12,3.43,'Los contratos pertenecen al núcleo; la infraestructura los implementa.',ha='center',fontsize=10,color=green)
ax.plot([.7,23.3],[2.45,2.45],color='#D7E1E8',lw=1)
ax.text(.7,2.05,'COMPOSICIÓN',fontsize=10,weight='bold',color=gold)
ax.text(.7,1.58,'bootstrap.mjs',fontsize=13,weight='bold',color=ink)
ax.text(.7,1.14,'Crea los adaptadores e inyecta las dependencias.\nHosts: server.mjs (Node.js) y edge.mjs (Supabase Edge).',fontsize=10.5,color=muted,linespacing=1.5)
ax.text(9.1,2.05,'CÓMO LEER LAS FLECHAS',fontsize=10,weight='bold',color=gold)
ax.text(9.1,1.58,'Continua: usa / invoca     Discontinua: implementa',fontsize=11,color=ink)
ax.text(9.1,1.14,'La punta señala el contrato o módulo del que se depende.\nEste diagrama no representa el recorrido de una petición.',fontsize=10.5,color=muted,linespacing=1.5)
ax.text(18.25,2.05,'EVIDENCIA',fontsize=10,weight='bold',color=gold)
ax.text(18.25,1.58,'16 pruebas aprobadas',fontsize=13,weight='bold',color=ink)
ax.text(18.25,1.14,'Núcleo probado con memoria.\nGrafo de dependencias verificado.',fontsize=10.5,color=muted,linespacing=1.5)
ax.text(.7,.28,'ALCANCE: backend del panel administrativo. Auth y perfil conservan integración directa con Supabase; Flutter y WeatherSatipo no están incluidos.',fontsize=10,color=muted)
for ext in ['png','svg','pdf']:fig.savefig(out/f'CORE_HEXAGONAL_ALERTA_SATIPO.{ext}',dpi=240,facecolor=fig.get_facecolor())
print('Lámina generada: PNG 5760 × 3600, SVG y PDF vectoriales.')
