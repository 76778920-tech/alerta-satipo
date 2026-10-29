"""CLI local. Las claves de API se leen del entorno; nunca se guardan en SQLite."""
import argparse
import json
import os
from pathlib import Path
from acquisition.bootstrap import compose
from acquisition.adapters.http import HttpCommunication


def main():
    parser = argparse.ArgumentParser(description='Adquisición API y consulta offline de Alerta Satipo')
    parser.add_argument('action', choices=['ingest', 'history', 'export', 'sync', 'import-environment', 'fires'])
    parser.add_argument('--db', default='var/acquisition.sqlite3')
    parser.add_argument('--limit', type=int, default=100)
    parser.add_argument('--node')
    parser.add_argument('--output')
    parser.add_argument('--input')
    args = parser.parse_args()
    if not 1 <= args.limit <= 10000:
        parser.error('--limit debe estar entre 1 y 10000')
    if args.action == 'import-environment' and not args.input:
        parser.error('Indica --input con la captura obtenida por npm run capture:environment')
    url = os.environ.get('SATIPO_SOURCE_API_URL')
    if args.action == 'ingest' and not url:
        parser.error('Configura SATIPO_SOURCE_API_URL con el proveedor elegido')
    if args.action == 'sync' and not os.environ.get('SATIPO_SYNC_API_URL'):
        parser.error('Configura SATIPO_SYNC_API_URL; no se envían datos sin destino explícito')
    if args.action == 'export' and not args.output:
        parser.error('Indica --output para exportar JSON')
    Path(args.db).parent.mkdir(parents=True, exist_ok=True)
    service = compose(args.db, url if args.action == 'ingest' else None, os.environ.get('SATIPO_SOURCE_API_TOKEN'))
    try:
        if args.action == 'import-environment':
            from acquisition.adapters.environment_file import read_environment
            data, records = read_environment(args.input)
            result = service.repository.save_environment(data, records)
        elif args.action == 'fires':
            result = {'rows': service.repository.fire_history(args.limit), 'notice': 'Historial satelital guardado; no confirma incendios ni garantiza cobertura reciente.'}
        elif args.action == 'ingest':
            result = service.ingest()
        elif args.action == 'sync':
            result = service.synchronize(HttpCommunication(os.environ['SATIPO_SYNC_API_URL'], os.environ.get('SATIPO_SYNC_API_TOKEN')))
        else:
            result = {'schema_version': 1, 'operational': False, 'rows': service.history(args.limit, args.node)}
            if args.action == 'export':
                # Exclusivo: no sobrescribir exportaciones ni archivos del usuario.
                with open(args.output, 'x', encoding='utf-8') as target:
                    json.dump(result, target, ensure_ascii=False, indent=2, allow_nan=False)
                result = {'exported': len(result['rows']), 'output': args.output}
        print(json.dumps(result, ensure_ascii=False, indent=2, allow_nan=False))
    finally:
        service.repository.close()


if __name__ == '__main__':
    main()
