from acquisition.adapters.http import HttpSource
from acquisition.adapters.sqlite import SQLiteRepository
from acquisition.application.service import AcquisitionService


def compose(path, url=None, token=None, model=None):
    repository = SQLiteRepository(path)
    return AcquisitionService(HttpSource(url, token) if url else None, repository, model)
