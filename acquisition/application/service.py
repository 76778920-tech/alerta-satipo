from acquisition.domain.measurement import validate_measurement, model_input, validate_prediction
from acquisition.application.ports import SourcePort, RepositoryPort, ModelPort


class AcquisitionService:
    def __init__(self, source: SourcePort, repository: RepositoryPort, model: ModelPort | None = None):
        self.source, self.repository, self.model = source, repository, model

    def ingest(self):
        payload = self.source.fetch()
        if not isinstance(payload, list) or len(payload) > 1000:
            raise ValueError('La API debe devolver una lista de hasta 1000 lecturas')
        records = []
        for raw in payload:
            reading = validate_measurement(raw)
            prediction = None
            if self.model is not None and reading['kind'] == 'smoke':
                prediction = validate_prediction(self.model.predict(model_input(reading)))
            records.append({'reading': reading, 'prediction': prediction})
        # Validar el lote completo antes de persistir evita importaciones parciales.
        return self.repository.save_batch(records)

    def history(self, limit=100, node_id=None):
        if type(limit) is not int or not 1 <= limit <= 10000:
            raise ValueError('Límite entre 1 y 10000')
        return self.repository.history(limit, node_id)

    def synchronize(self, communication):
        sent = 0
        for event in self.repository.pending():
            try:
                acknowledgement = communication.send(event)
                if acknowledgement != event['event_id']:
                    raise ValueError('Confirmación no corresponde al evento')
                self.repository.acknowledge(event['event_id'])
                sent += 1
            except Exception:
                # No guardar URL, token ni cuerpo remoto en errores persistidos.
                self.repository.failed(event['event_id'])
        return {'sent': sent, 'pending': len(self.repository.pending())}
