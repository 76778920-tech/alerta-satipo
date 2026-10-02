import { createRiskService } from '../application/use-cases/risk-service.mjs';
import { BrowserStorage, BrowserEntropy } from '../adapters/out/browser.mjs';
import { HttpAssets } from '../adapters/out/http.mjs';
import * as fixtures from '../adapters/out/demo-data.mjs';

const base = new URL('../../', document.currentScript.src);
window.SatipoData = createRiskService({Backend:window.SatipoBackend,
  store:new BrowserStorage(window.localStorage), assets:new HttpAssets(base,window.fetch.bind(window)),
  entropy:new BrowserEntropy(), fixtures
});
