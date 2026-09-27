import copy
import hashlib
import json
import sys
import unittest
from pathlib import Path
from unittest.mock import patch
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'colab'))
import supabase_dataset as loader

class DatasetTest(unittest.TestCase):
    def setUp(self):
        self.rows=json.loads((ROOT/'data/smoke_detection_300.json').read_text())
        self.sha=hashlib.sha256(loader.canonical_payload(self.rows).encode()).hexdigest()
    def test_normalization(self):
        changed=copy.deepcopy(self.rows)
        for row in changed:
            row['recorded_at']=row['recorded_at'].replace('+00:00','Z')
            row['tvoc_ppb']=float(row['tvoc_ppb'])
        self.assertEqual(loader.canonical_payload(self.rows),loader.canonical_payload(changed[::-1]))
    def test_reject_partial_duplicate_invalid(self):
        for rows in [self.rows[:-1], self.rows[:-1]+[self.rows[0]]]:
            with self.assertRaises(ValueError):loader.canonical_payload(rows)
        for field,value in [('temperature_c',None),('fire_alarm','false'),('recorded_at','2026-01-01T00:00:00Z')]:
            rows=copy.deepcopy(self.rows);rows[0][field]=value
            with self.assertRaises(ValueError):loader.canonical_payload(rows)
    def test_private_key_rejected_before_network(self):
        with patch.object(loader,'_request') as request:
            with self.assertRaises(ValueError):loader.load_supabase_dataset('https://example.supabase.co','sb_secret_test','email','password',self.sha)
            request.assert_not_called()
    def test_modified_content_and_remote_count_fail(self):
        changed=copy.deepcopy(self.rows);changed[0]['temperature_c']+=1
        for rows,count in [(changed,'0-299/300'),(self.rows,'0-299/301')]:
            with patch.object(loader,'_request',side_effect=[({'access_token':'fake'},''),(rows,count)]):
                with self.assertRaises(ValueError):loader.load_supabase_dataset('https://example.supabase.co','sb_publishable_test','email','password',self.sha)
    def test_only_auth_and_dataset_requests(self):
        with patch.object(loader,'_request',side_effect=[({'access_token':'fake'},''),(self.rows,'0-299/300')]) as request:
            rows,_=loader.load_supabase_dataset('https://example.supabase.co','sb_publishable_test','email','password',self.sha)
            self.assertEqual(len(rows),300)
            self.assertIn('/auth/v1/token?',request.call_args_list[0].args[0])
            self.assertIn('/rest/v1/smoke_readings?',request.call_args_list[1].args[0])
            self.assertEqual(len(request.call_args_list[1].args),2) # GET, sin cuerpo de escritura.

if __name__=='__main__':unittest.main()
