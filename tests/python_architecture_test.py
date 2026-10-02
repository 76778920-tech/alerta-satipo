"""Límites de importación e I/O en todos los núcleos Python del proyecto."""
import ast
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]


class ArchitectureTests(unittest.TestCase):
    def test_core_imports_and_io_boundaries(self):
        allowed_external={'typing','math','random','collections','datetime','pandas','numpy','shapely'}
        for package in ['dataset','territorial']:
            for layer in ['domain','application']:
                prefixes=[f'{package}.domain']+([f'{package}.application'] if layer=='application' else [])
                for path in (ROOT/package/layer).rglob('*.py'):
                    tree=ast.parse(path.read_text(encoding='utf-8'))
                    for node in ast.walk(tree):
                        with self.subTest(file=str(path.relative_to(ROOT)),line=getattr(node,'lineno',0)):
                            if isinstance(node,(ast.Import,ast.ImportFrom)):
                                if isinstance(node,ast.ImportFrom):
                                    self.assertEqual(node.level,0,'Usar imports absolutos verificables en el núcleo')
                                    names=[node.module]
                                else: names=[alias.name for alias in node.names]
                                for name in names:
                                    self.assertTrue(name.split('.')[0] in allowed_external or any(name==p or name.startswith(p+'.') for p in prefixes),name)
                            if isinstance(node,ast.Call):
                                if isinstance(node.func,ast.Name): self.assertNotIn(node.func.id,['open','print','eval','exec','__import__'])
                                if isinstance(node.func,ast.Attribute): self.assertNotIn(node.func.attr,['read_csv','to_csv','read_text','write_text','read_bytes','write_bytes','mkdir','iterdir'])


if __name__=='__main__': unittest.main()
