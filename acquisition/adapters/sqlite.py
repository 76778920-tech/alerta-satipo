import json
import sqlite3
from uuid import uuid4


SCHEMA = '''
CREATE TABLE IF NOT EXISTS schema_version(version INTEGER PRIMARY KEY);
INSERT OR IGNORE INTO schema_version VALUES(1);
CREATE TABLE IF NOT EXISTS NodoSensor(
 nodo_id TEXT PRIMARY KEY, tipo TEXT NOT NULL DEFAULT 'API' CHECK(tipo='API'));
CREATE TABLE IF NOT EXISTS LecturaAmbiental(
 lectura_id INTEGER PRIMARY KEY, nodo_id TEXT NOT NULL REFERENCES NodoSensor(nodo_id),
 source TEXT NOT NULL, external_id TEXT NOT NULL, timestamp_utc TEXT NOT NULL,
 payload TEXT NOT NULL, UNIQUE(source, external_id));
CREATE INDEX IF NOT EXISTS lectura_nodo_fecha ON LecturaAmbiental(nodo_id,timestamp_utc);
CREATE TABLE IF NOT EXISTS HistoricoPrediccion(
 prediccion_id INTEGER PRIMARY KEY, lectura_id INTEGER NOT NULL UNIQUE REFERENCES LecturaAmbiental(lectura_id),
 payload TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS EventoAlerta(
 evento_id TEXT PRIMARY KEY, lectura_id INTEGER NOT NULL REFERENCES LecturaAmbiental(lectura_id),
 prediccion_id INTEGER REFERENCES HistoricoPrediccion(prediccion_id), tipo TEXT NOT NULL,
 payload TEXT NOT NULL, sincronizado INTEGER NOT NULL DEFAULT 0 CHECK(sincronizado IN (0,1)),
 intentos INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS CapturaProveedor(
 captura_id TEXT PRIMARY KEY, fecha_utc TEXT NOT NULL, payload TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS DeteccionSatelital(
 deteccion_id TEXT PRIMARY KEY, fecha_utc TEXT NOT NULL, payload TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS deteccion_fecha ON DeteccionSatelital(fecha_utc);
'''


class SQLiteRepository:
    def __init__(self, path):
        self.connection = sqlite3.connect(path)
        self.connection.row_factory = sqlite3.Row
        self.connection.execute('PRAGMA foreign_keys=ON')
        self.connection.execute('PRAGMA journal_mode=WAL')
        self.connection.executescript(SCHEMA)

    def close(self):
        self.connection.close()

    def save_environment(self, data, records):
        import hashlib
        payload = json.dumps(data, sort_keys=True, allow_nan=False)
        capture_id = hashlib.sha256(payload.encode()).hexdigest()
        # save_batch tiene su propia transacción. La captura completa se guarda
        # después; un reintento deduplica lecturas si se interrumpió entre pasos.
        result = self.save_batch(records)
        with self.connection as db:
            db.execute('INSERT OR IGNORE INTO CapturaProveedor VALUES(?,?,?)', (capture_id, data['retrieved_at'], payload))
            for row in data['fires']['rows']:
                db.execute('INSERT INTO DeteccionSatelital VALUES(?,?,?) ON CONFLICT(deteccion_id) DO UPDATE SET payload=excluded.payload',
                           (row['id'], row['observed_at'], json.dumps(row, allow_nan=False)))
        return {**result, 'satellite_rows_received': len(data['fires']['rows']), 'weather_status': data['weather']['status'], 'fires_status': data['fires']['status']}

    def fire_history(self, limit=100):
        return [json.loads(row['payload']) for row in self.connection.execute('SELECT payload FROM DeteccionSatelital ORDER BY fecha_utc DESC LIMIT ?', (limit,))]

    def save_batch(self, records):
        added = 0
        with self.connection as db:
            for record in records:
                reading, prediction = record['reading'], record['prediction']
                payload = json.dumps(reading, sort_keys=True, allow_nan=False)
                previous = db.execute('SELECT payload FROM LecturaAmbiental WHERE source=? AND external_id=?',
                                      (reading['source'], reading['external_id'])).fetchone()
                if previous:
                    if previous['payload'] != payload:
                        raise ValueError('La API reutilizó un identificador con datos distintos')
                    continue
                db.execute('INSERT OR IGNORE INTO NodoSensor(nodo_id) VALUES(?)', (reading['node_id'],))
                row = db.execute('INSERT INTO LecturaAmbiental(nodo_id,source,external_id,timestamp_utc,payload) VALUES(?,?,?,?,?)',
                                 (reading['node_id'], reading['source'], reading['external_id'], reading['observed_at'], payload))
                reading_id = row.lastrowid
                prediction_id = None
                if prediction is not None:
                    prediction_id = db.execute('INSERT INTO HistoricoPrediccion(lectura_id,payload) VALUES(?,?)',
                                               (reading_id, json.dumps(prediction, allow_nan=False))).lastrowid
                event_id = str(uuid4())
                event = {'event_id': event_id, 'type': 'experimental_alarm' if prediction and prediction['alarm'] else 'measurement',
                         'reading': reading, 'prediction': prediction, 'operational': False}
                db.execute('INSERT INTO EventoAlerta(evento_id,lectura_id,prediccion_id,tipo,payload) VALUES(?,?,?,?,?)',
                           (event_id, reading_id, prediction_id, event['type'], json.dumps(event, allow_nan=False)))
                added += 1
        return {'inserted': added, 'duplicates': len(records) - added}

    def history(self, limit=100, node_id=None):
        rows = self.connection.execute('''SELECT l.payload reading,p.payload prediction FROM LecturaAmbiental l
            LEFT JOIN HistoricoPrediccion p USING(lectura_id) WHERE (? IS NULL OR l.nodo_id=?)
            ORDER BY l.timestamp_utc DESC,l.lectura_id DESC LIMIT ?''', (node_id, node_id, limit))
        return [{'reading': json.loads(row['reading']), 'prediction': json.loads(row['prediction']) if row['prediction'] else None} for row in rows]

    def pending(self):
        return [json.loads(row['payload']) for row in self.connection.execute('SELECT payload FROM EventoAlerta WHERE sincronizado=0 ORDER BY rowid')]

    def acknowledge(self, event_id):
        with self.connection as db:
            db.execute('UPDATE EventoAlerta SET sincronizado=1,intentos=intentos+1 WHERE evento_id=?', (event_id,))

    def failed(self, event_id):
        with self.connection as db:
            db.execute('UPDATE EventoAlerta SET intentos=intentos+1 WHERE evento_id=?', (event_id,))
