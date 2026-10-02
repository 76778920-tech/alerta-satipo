import { PredictionResultsPort } from '../../application/ports/out/prediction-results.mjs';
import snapshot from './prediction-results.json' with { type: 'json' };
/** Evaluación publicada; no ejecuta inferencia ni representa telemetría actual. */
export class PublishedPredictionResults extends PredictionResultsPort {
  async results() { return structuredClone(snapshot); }
}
