import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {evaluatePmv1} from '../backend/domain/pmv1.mjs';
import {evaluatePmv1 as browserEvaluate} from '../frontend/src/domain/pmv1.mjs';

test('HU07: los 3000 casos reservados reproducen matriz, errores y paridad web/backend',async()=>{
  const report=JSON.parse(await readFile('colab/pmv1/evaluation.json','utf8'));
  const seen=new Set();let testing;
  for(const split of ['train','validation','test']) {
    const [header,...lines]=(await readFile(`colab/pmv1/${split}.csv`,'utf8')).trim().split(/\r?\n/);
    assert.deepEqual(header.split(','),[...report.features,'label']);
    assert.equal(lines.length,report[split==='train'?'train_rows':`${split}_rows`]);
    for(const line of lines) {
      const key=line.split(',').slice(0,5).map(Number).join(',');
      assert.ok(!seen.has(key),`Contaminación o duplicado en ${split}`);seen.add(key);
    }
    if(split==='test')testing=lines;
  }
  const matrix=Array.from({length:3},()=>[0,0,0]);
  for(const [i,line] of testing.entries()) {
    const numbers=line.split(',').map(Number),actual=numbers.pop();
    const input={id:`00000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`,node_id:'00000000-0000-4000-8000-000000000001',source:'simulation',observed_at:'2026-11-10T00:00:00Z',values:Object.fromEntries(report.features.map((f,k)=>[f,numbers[k]]))};
    const result=evaluatePmv1(input);
    assert.deepEqual(browserEvaluate(input),result);
    assert.equal(result.prediction.model_version,report.version);
    matrix[actual][report.labels.indexOf(result.prediction.level)]++;
  }
  assert.deepEqual(matrix,report.confusion_matrix);
  assert.equal(matrix[0][1]+matrix[0][2],report.false_alarms);
  assert.equal(matrix[2][0]+matrix[2][1],report.missed_emergencies);
  assert.equal(matrix.reduce((n,row,i)=>n+row[i],0)/testing.length,report.accuracy);
});
