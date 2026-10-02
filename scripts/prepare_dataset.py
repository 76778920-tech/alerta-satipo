"""Entrada CLI: la composición conecta la descarga y archivos con el caso de uso."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from dataset.bootstrap import compose


def prepare():
    metadata = compose(ROOT).execute()
    print(json.dumps(metadata, indent=2))
    return metadata


if __name__ == '__main__':
    prepare()
