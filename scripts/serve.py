"""Servidor de desarrollo: publica la UI, nunca .env, credenciales o SQL."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit
import argparse

ROOT = Path(__file__).resolve().parents[1]
FRONTEND_DIRS = {'mobile', 'web', 'shared'}
PUBLIC_DIRS = FRONTEND_DIRS | {'docs', 'data'}
PUBLIC_FILES = {'index.html', 'login.html', 'admin.html', 'admin-panel.html', 'app-mobile.html', 'architecture.html', 'config/public.json'}
FRONTEND = ROOT / 'frontend'

def public_target(relative):
    parts = Path(relative).parts
    is_frontend = (parts and parts[0] in FRONTEND_DIRS) or relative in PUBLIC_FILES - {'config/public.json'}
    base = FRONTEND if is_frontend else ROOT
    return (base / relative).resolve()

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def translate_path(self, path):
        relative = unquote(urlsplit(path).path).replace('\\', '/').lstrip('/') or 'index.html'
        return str(public_target(relative))

    def send_head(self):
        raw = unquote(urlsplit(self.path).path).replace('\\', '/').lstrip('/')
        relative = raw or 'index.html'
        parts = Path(relative).parts
        if not parts:
            self.send_error(404)
            return None
        target = public_target(relative)
        public_root = ROOT
        if parts[0] in FRONTEND_DIRS:
            public_root = FRONTEND / parts[0]
        elif parts[0] in PUBLIC_DIRS:
            public_root = ROOT / parts[0]
        if (not target.is_relative_to(public_root) or any(p.startswith('.') or '.local.' in p for p in parts)
                or (relative not in PUBLIC_FILES and parts[0] not in PUBLIC_DIRS)):
            self.send_error(404)
            return None
        if target.is_dir() and not (target / 'index.html').is_file():
            self.send_error(404)
            return None
        return super().send_head()

    def end_headers(self):
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8000)
    args = parser.parse_args()
    print(f'Alerta Satipo: http://127.0.0.1:{args.port}', flush=True)
    ThreadingHTTPServer(('127.0.0.1', args.port), Handler).serve_forever()
