import {validateAcquisitionExport} from '../../domain/acquisition.mjs';
export class ProjectService {
  constructor({catalog,files}) {this.catalog=catalog;this.files=files;this.rows=[];}
  requirements({type='',status='',query=''}={}) {
    const term=query.trim().toLocaleLowerCase('es');
    return this.catalog.requirements.filter(r=>(!type||r.id.startsWith(type+'-'))&&(!status||r.status===status)&&(!term||`${r.id} ${r.title} ${r.gap}`.toLocaleLowerCase('es').includes(term)));
  }
  async importReadings(file) {
    this.rows=[];
    this.rows=validateAcquisitionExport(await this.files.read(file)).rows;
    return this.rows;
  }
  exportCatalog() {this.files.download('satipo-trazabilidad-informe.json',this.catalog);}
}
