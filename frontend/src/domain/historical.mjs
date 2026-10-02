export function validatePredictions(value) {
    if(!value || !Array.isArray(value.rows) || value.rows.length!==60 || value.evaluation?.train_rows!==240 || value.evaluation?.test_rows!==60 || typeof value.version!=='string') throw new Error('Resultados incompletos.');
    const ids=new Set();
    for(const row of value.rows) {
      if(!Number.isInteger(row.source_row) || ids.has(row.source_row) || typeof row.actual!=='boolean' || typeof row.predicted!=='boolean' || !Number.isFinite(row.score) || row.score<0 || row.score>1 || !Number.isFinite(Date.parse(row.recorded_at))) throw new Error('Resultados inválidos.');
      ids.add(row.source_row);
    }
    return value;
  }

export function validateReadings(rows) {
  if(!Array.isArray(rows)||rows.some(r=>!r||typeof r!=='object')||new Set(rows.map(r=>r.source_row)).size!==rows.length) throw new Error('Formato de lecturas inválido');
  return rows;
}
export function validateOperations(value) {
  const {nodes,links,cases,maintenance}=value;
  if(!Array.isArray(nodes)||!Array.isArray(links)||!Array.isArray(cases)||!Array.isArray(maintenance)
    ||nodes.length!==6||links.length!==300||new Set(links.map(r=>r.source_row)).size!==300
    ||links.some(r=>!r.smoke_readings)||nodes.some(n=>links.filter(l=>l.node_id===n.id).length!==50)) throw new Error('La relación de nodos y lecturas está incompleta.');
  return value;
}
