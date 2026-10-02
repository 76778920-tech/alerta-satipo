from typing import Protocol


class DatasetSource(Protocol):
    """Entrega filas originales y trazabilidad sin exponer clientes HTTP."""
    def read(self) -> tuple[list[dict], dict]: ...


class DatasetWriter(Protocol):
    """Publica la muestra validada y sus metadatos."""
    def write(self, rows: list[dict], metadata: dict) -> None: ...
