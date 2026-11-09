// Follow the server's actual page size, validating totals and unique IDs.
export async function readPages(query, check) {
  const rows=[], ids=new Set();
  let total;
  do {
    const result=await query().range(rows.length,rows.length+499);
    const page=check(result);
    if(!Number.isInteger(result.count) || result.count<0 || result.count>100000
      || (total!==undefined && total!==result.count) || !Array.isArray(page)) throw new Error('Conteo de lecturas inconsistente.');
    total=result.count;
    for(const row of page) {
      if(!Number.isInteger(row.source_row) || ids.has(row.source_row)) throw new Error('Lecturas duplicadas o inválidas.');
      ids.add(row.source_row);
    }
    rows.push(...page);
    if(rows.length>total || (!page.length && rows.length<total)) throw new Error('Consulta de lecturas incompleta.');
  } while(rows.length<total);
  return rows;
}
