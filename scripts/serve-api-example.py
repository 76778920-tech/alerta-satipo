"""API local de demostración del contrato. No contiene observaciones reales."""
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

READINGS = [{'source': 'DEMO_API_NO_REAL', 'external_id': 'demo-20261023-1', 'node_id': 'demo-station',
             'observed_at': '2026-10-23T15:00:00Z', 'kind': 'weather',
             'values': {'temperature_c': 26, 'humidity_pct': 70},
             'units': {'temperature_c': 'degC', 'humidity_pct': '%'}}]


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path != '/readings':
            self.send_error(404); return
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(READINGS).encode())


if __name__ == '__main__':
    print('API DEMOSTRATIVA: http://127.0.0.1:8890/readings (Ctrl+C para cerrar)', flush=True)
    ThreadingHTTPServer(('127.0.0.1', 8890), Handler).serve_forever()
