import copy
import hashlib
import json
import sys
import unittest
from pathlib import Path
from unittest.mock import patch, MagicMock
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'colab'))
import supabase_dataset as loader

class DatasetTest(unittest.TestCase):
    def setUp(self):
        self.rows=json.loads((ROOT/'data/smoke_detection_1011.json').read_text())
        self.sha=hashlib.sha256(loader.canonical_payload(self.rows).encode()).hexdigest()
    def responses(self, rows=None):
        rows=self.rows if rows is None else rows
        return [({'access_token':'fake'},'')]+[(rows[i:i+500],f'{i}-{min(i+499,len(rows)-1)}/1011') for i in range(0,len(rows),500)]
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
        bad_count=self.responses();bad_count[1]=(self.rows[:500],'0-499/1012')
        empty=self.responses();empty[2]=([],'*/1011')
        duplicate=copy.deepcopy(self.rows);duplicate[500]=duplicate[0]
        for responses in [self.responses(changed),bad_count,empty,self.responses(duplicate)]:
            with patch.object(loader,'_request',side_effect=responses):
                with self.assertRaises(ValueError):loader.load_supabase_dataset('https://example.supabase.co','sb_publishable_test','email','password',self.sha)
    def test_only_auth_and_dataset_requests(self):
        with patch.object(loader,'_request',side_effect=self.responses()) as request:
            rows,_=loader.load_supabase_dataset('https://example.supabase.co','sb_publishable_test','email','password',self.sha)
            self.assertEqual(len(rows),1011)
            self.assertIn('/auth/v1/token?',request.call_args_list[0].args[0])
            self.assertIn('/rest/v1/smoke_readings?',request.call_args_list[1].args[0])
            self.assertEqual(len(request.call_args_list[1].args),2) # GET, sin cuerpo de escritura.
            self.assertEqual(request.call_count,4)
            self.assertIn('offset=1000',request.call_args_list[-1].args[0])
    def test_invalid_secrets(self):
        for value in [None,42,'   ']:
            with self.assertRaises(ValueError):loader.load_supabase_dataset(value,'sb_publishable_test','email','password',self.sha)
    def test_invalid_date_and_session(self):
        rows=copy.deepcopy(self.rows);rows[0]['recorded_at']=None
        with self.assertRaisesRegex(ValueError,'Fecha'):loader.canonical_payload(rows)
        with patch.object(loader,'_request',return_value=([],'')):
            with self.assertRaisesRegex(RuntimeError,'sesión'):loader.load_supabase_dataset('https://example.supabase.co','sb_publishable_test','email','password',self.sha)
    def test_url_whitespace_is_normalized(self):
        with patch.object(loader,'_request',side_effect=self.responses()) as request:
            loader.load_supabase_dataset(' https://example.supabase.co/ ','sb_publishable_test','email','password',self.sha)
            self.assertTrue(request.call_args_list[0].args[0].startswith('https://example.supabase.co/auth/'))
    def test_non_json_is_clear_and_redirection_is_blocked(self):
        response=MagicMock();response.__enter__.return_value=response;response.read.return_value=b'<html>error</html>'
        with patch.object(loader.urllib.request,'build_opener') as opener:
            opener.return_value.open.return_value=response
            with self.assertRaisesRegex(RuntimeError,'JSON'):loader._request('https://example.supabase.co',{})
        with self.assertRaisesRegex(RuntimeError,'Redirección'):
            loader._NoRedirect().redirect_request(None,None,302,'',{},'https://other.example')

if __name__=='__main__':unittest.main()
