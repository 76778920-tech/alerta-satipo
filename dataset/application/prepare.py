from dataset.application.ports import DatasetSource, DatasetWriter
from dataset.domain.sampling import sample, describe


class PrepareDataset:
    def __init__(self, source: DatasetSource, writer: DatasetWriter):
        self.source = source
        self.writer = writer

    def execute(self, size=300, seed=20260923):
        original, provenance = self.source.read()
        selected = sample(original, size, seed)
        metadata = {**provenance, **describe(original, selected, seed)}
        self.writer.write(selected, metadata)
        return metadata
