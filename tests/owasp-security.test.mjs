import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('OWASP: hosting restringe scripts inline y Edge no habilita localhost por defecto',()=>{
  const firebase=JSON.parse(readFileSync('firebase.json','utf8'));
  const headerValues=Object.fromEntries(firebase.hosting.headers[0].headers.map(header=>[header.key,header.value]));
  assert.match(headerValues['Content-Security-Policy'],/script-src 'self'/);
  assert.doesNotMatch(headerValues['Content-Security-Policy'],/script-src[^;]*unsafe-inline/);
  assert.equal(headerValues['Strict-Transport-Security'],'max-age=31536000');
  const edge=readFileSync('backend/edge.mjs','utf8');
  assert.match(edge,/API_ALLOWED_ORIGINS/);
  assert.doesNotMatch(edge,/localhost|127\.0\.0\.1/);
});
