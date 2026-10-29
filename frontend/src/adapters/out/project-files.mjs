export class ProjectFiles {
  async read(file) {
    if(!file || file.size>10_000_000)throw Error('Selecciona un JSON de hasta 10 MB.');
    return JSON.parse(await file.text());
  }
  download(name,data) {
    const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download=name;link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
}
