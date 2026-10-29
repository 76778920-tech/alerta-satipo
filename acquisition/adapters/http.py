import json
from urllib.parse import urlsplit
from urllib.request import Request, build_opener, HTTPRedirectHandler


def validate_url(url):
    parsed = urlsplit(url)
    if parsed.username or parsed.password or parsed.fragment:
        raise ValueError('No incluir credenciales ni fragmentos en URL')
    if parsed.scheme != 'https' and not (parsed.scheme == 'http' and parsed.hostname in ('127.0.0.1', 'localhost', '::1')):
        raise ValueError('Se requiere HTTPS (HTTP solo en localhost)')
    if not parsed.hostname:
        raise ValueError('URL inválida')


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        raise ValueError('Redirección rechazada para proteger la credencial')


def request_json(url, token=None, payload=None):
    validate_url(url)
    headers = {'Accept': 'application/json'}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    body = None if payload is None else json.dumps(payload, allow_nan=False).encode()
    if body:
        headers['Content-Type'] = 'application/json'
    try:
        with build_opener(NoRedirect()).open(Request(url, data=body, headers=headers), timeout=15) as response:
            raw = response.read(2_000_001)
            if len(raw) > 2_000_000:
                raise ValueError('Respuesta demasiado grande')
            return json.loads(raw)
    except Exception:
        raise ValueError('No se pudo obtener una respuesta JSON válida de la API') from None


class HttpSource:
    def __init__(self, url, token=None):
        validate_url(url)
        self.url, self.token = url, token

    def fetch(self):
        return request_json(self.url, self.token)


class HttpCommunication:
    def __init__(self, url, token=None):
        validate_url(url)
        self.url, self.token = url, token

    def send(self, event):
        result = request_json(self.url, self.token, event)
        return result.get('event_id') if isinstance(result, dict) else None
