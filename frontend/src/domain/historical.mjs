export function validatePredictions(value) {
  if(!value || !Array.isArray(value.rows) || value.rows.length!==203 || value.evaluation?.train_rows!==808 || value.evaluation?.test_rows!==203 || typeof value.version!=='string') throw new Error('Resultados incompletos.');
  const ids=new Set();
  for(const row of value.rows) {
    if(!Number.isInteger(row.source_row) || ids.has(row.source_row) || typeof row.actual!=='boolean' || typeof row.predicted!=='boolean' || !Number.isFinite(row.score) || row.score<0 || row.score>1 || !Number.isFinite(Date.parse(row.recorded_at))) throw new Error('Resultados invalidos.');
    ids.add(row.source_row);
  }
  return value;
}

export function validateReadings(rows) {
  if(!Array.isArray(rows)||rows.some(r=>!r||typeof r!=='object')||new Set(rows.map(r=>r.source_row)).size!==rows.length) throw new Error('Formato de lecturas invalido');
  return rows;
}

export function validateOperations(value) {
  const {nodes,links,cases,maintenance}=value;
  const expectedRows=1011, minimumPerNode=Math.floor(expectedRows/6), maximumPerNode=Math.ceil(expectedRows/6);
  if(!Array.isArray(nodes)||!Array.isArray(links)||!Array.isArray(cases)||!Array.isArray(maintenance)
    ||nodes.length!==6||links.length!==expectedRows||new Set(links.map(r=>r.source_row)).size!==expectedRows
    ||links.some(r=>!r.smoke_readings)||nodes.some(n=>{const total=links.filter(l=>l.node_id===n.id).length;return total<minimumPerNode||total>maximumPerNode;})) throw new Error('La relacion de nodos y lecturas esta incompleta.');
  return value;
}
