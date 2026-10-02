import csv
import hashlib
import io
from urllib.request import urlopen


class HttpCsvSource:
    def __init__(self, url, timeout=60):
        self.url = url
        self.timeout = timeout

    def read(self):
        with urlopen(self.url, timeout=self.timeout) as response:
            raw = response.read()
        return list(csv.DictReader(io.StringIO(raw.decode('utf-8-sig')))), {
            'source_url': self.url,
            'source_sha256': hashlib.sha256(raw).hexdigest(),
        }
