// Evaluación local contra etiquetas de referencia independientes, sin red.
import {readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {evaluatePmv1} from '../backend/domain/pmv1.mjs';

export function evaluate(records) {
  if(!Array.isArray(records)||!records.length)throw Error('Se requiere un lote no vacío.');
  const labels=['Normal','Advertencia','Emergencia'],matrix=labels.map(()=>[0,0,0]);
  const ids=new Set(),sources={simulation:0,sensor:0};
  let version;
  for(const record of records){
    if(!labels.includes(record.expected_label))throw Error('Cada registro requiere expected_label independiente: Normal, Advertencia o Emergencia.');
    const result=evaluatePmv1(record);
    if(ids.has(result.reading.id))throw Error('Identificador duplicado en la evaluación.');
    ids.add(result.reading.id);sources[result.reading.source]++;
    matrix[labels.indexOf(record.expected_label)][labels.indexOf(result.prediction.level)]++;
    version=result.prediction.model_version;
  }
  const normal=matrix[0].reduce((a,b)=>a+b,0),emergencies=matrix[2].reduce((a,b)=>a+b,0);
  return {model_version:version,experimental:true,rows:records.length,sources,labels,
    confusion_matrix:matrix,matrix_axes:'rows=expected; columns=predicted',
    accuracy:matrix.reduce((sum,row,i)=>sum+row[i],0)/records.length,
    false_alarms:matrix[0][1]+matrix[0][2],normal_rows:normal,
    false_alarm_rate:normal?(matrix[0][1]+matrix[0][2])/normal:null,
    missed_emergencies:matrix[2][0]+matrix[2][1],emergency_rows:emergencies,
    emergency_recall:emergencies?matrix[2][2]/emergencies:null,
    limitation:'La referencia debe asignarse independientemente del modelo. source=sensor no certifica calibración ni validez de campo.'};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const [input,output]=process.argv.slice(2);
  if(!input||!output)throw Error('Uso: node scripts/evaluate-pmv1.mjs lecturas-etiquetadas.json resultado.json');
  const result=evaluate(JSON.parse(await readFile(input,'utf8')));
  await writeFile(output,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
  console.log(`Evaluados ${result.rows} registros. Falsas alarmas: ${result.false_alarms}/${result.normal_rows}; emergencias no detectadas: ${result.missed_emergencies}/${result.emergency_rows}.`);
}
