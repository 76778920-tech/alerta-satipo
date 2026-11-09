from dataset.application.ports import DatasetSource, DatasetWriter
from dataset.domain.sampling import sample, describe, SAMPLE_ROWS, SAMPLE_SEED


class PrepareDataset:
    def __init__(self, source: DatasetSource, writer: DatasetWriter):
        self.source = source
        self.writer = writer

    def execute(self, size=SAMPLE_ROWS, seed=SAMPLE_SEED):
        original, provenance = self.source.read()
        selected = sample(original, size, seed)
        metadata = {**provenance, **describe(original, selected, seed)}
        self.writer.write(selected, metadata)
        return metadata
