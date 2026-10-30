import 'dart:convert';
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';
import 'package:alerta_satipo/domain/measurement.dart';
import 'package:alerta_satipo/domain/ble_frames.dart';
import 'package:alerta_satipo/application/mobile_service.dart';
import 'package:alerta_satipo/adapters/local_database.dart';
import 'package:alerta_satipo/adapters/security.dart';
import 'support.dart';

void main() {
  final model = LocalModel(
    jsonDecode(File('assets/pmv1-model.json').readAsStringSync()),
  );
  Map<String, dynamic> reading([
    String id = '00000000-0000-4000-8000-000000000002',
  ]) => {
    'id': id,
    'node_id': '00000000-0000-4000-8000-000000000001',
    'source': 'simulation',
    'observed_at': '2026-10-28T00:00:00Z',
    'values': Map.fromIterables(features, [52, 25, 85, 82, 260]),
  };
  test('Inferencia Dart conserva las 40 predicciones sklearn', () {
    final fixtures =
        jsonDecode(File('../colab/pmv1/parity.json').readAsStringSync())
            as List;
    for (final f in fixtures) {
      final r = reading();
      r['values'] = Map.fromIterables(features, f['x']);
      expect(
        model.predict(Measurement.parse(r))['level'],
        levels[f['expected']],
      );
    }
    final bad = reading();
    bad['values'].remove('gas_index');
    expect(() => Measurement.parse(bad), throwsFormatException);
  });
  test(
    'BLE reconstruye UTF8 fragmentado, separa lecturas y limita memoria',
    () {
      final frames = BleFrames(),
          bytes = utf8.encode('${jsonEncode({'text': 'señal'})}\n{}\n');
      final results = <Map<String, dynamic>>[];
      for (final b in bytes) {
        results.addAll(frames.add([b]));
      }
      expect(results, [
        {'text': 'señal'},
        {},
      ]);
      expect(() => frames.add(List.filled(8193, 65)), throwsFormatException);
      expect(frames.add(utf8.encode('{}\n')), [{}]);
    },
  );
  test('Sesiones, registro sin autoascenso, permisos y expiración', () async {
    final memory = Memory();
    var id = 0;
    var now = DateTime.utc(2026, 10, 28);
    final app = MobileService(
      records: memory,
      users: memory,
      session: memory,
      passwords: memory,
      model: model,
      now: () => now,
      uuid: () =>
          '00000000-0000-4000-8000-${(++id).toString().padLeft(12, '0')}',
    );
    await app.register('Admin', 'admin@test.local', 'long-password');
    await app.register('Persona', 'person@test.local', 'long-password');
    await expectLater(
      app.login('person@test.local', 'incorrect'),
      throwsStateError,
    );
    await app.login('person@test.local', 'long-password');
    expect(app.role, 'POBLADOR');
    await expectLater(app.simulate('Normal'), throwsStateError);
    await expectLater(
      app.setRole(memory.accounts[1]['usuario_id'], 'ADMINISTRADOR'),
      throwsStateError,
    );
    expect(memory.accounts.first['rol'], 'POBLADOR');
    memory.accounts.first['rol'] = 'ADMINISTRADOR';
    await expectLater(
      app.login('admin@test.local', 'long-password'),
      throwsStateError,
    );
    for (var i = 0; i < 10; i++) {
      await app.ingest([
        reading(
          '00000000-0000-4000-8000-${(i + 10).toString().padLeft(12, '0')}',
        ),
      ]);
    }
    expect((await app.history()).length, 10);
    expect(jsonDecode(await app.export())['records'].length, 10);
    await expectLater(app.attend('any', 'ATENDIDO'), throwsStateError);
    now = now.add(const Duration(hours: 25));
    await expectLater(app.history(), throwsStateError);
    expect(app.profile, isNull);
    expect(memory.token, isNull);
  });
  test('SQLite transaccional, reintento, rollback y reapertura', () async {
    sqfliteFfiInit();
    final directory = Directory.systemTemp.createTempSync('satipo-test-');
    final location = '${directory.path}/test.db';
    var db = await LocalDatabase.open(
      factory: databaseFactoryFfi,
      location: location,
    );
    await db.createUser({
      'usuario_id': 'owner',
      'nombre': 'Prueba',
      'correo': 'a@b.c',
      'contrasena_hash': 'test',
      'rol': 'POBLADOR',
      'fecha_creacion': '2026-10-28',
    });
    Map<String, dynamic> record(Map<String, dynamic> r) => {
      'reading': r,
      'prediction': {...model.predict(Measurement.parse(r)), 'latency_ms': 0.2},
    };
    await db.storeBatch('owner', [record(reading())]);
    await db.storeBatch('owner', [record(reading())]);
    expect((await db.history('owner')).length, 1);
    final bad = record(reading('00000000-0000-4000-8000-000000000004'));
    bad['prediction']['level'] = 'INVALID';
    await expectLater(
      db.storeBatch('owner', [
        record(reading('00000000-0000-4000-8000-000000000003')),
        bad,
      ]),
      throwsA(anything),
    );
    expect((await db.history('owner')).length, 1);
    await db.attention('owner', reading()['id'], 'ATENDIDO');
    await db.db.close();
    db = await LocalDatabase.open(
      factory: databaseFactoryFfi,
      location: location,
    );
    expect((await db.history('owner')).single['attention'], 'ATENDIDO');
    expect(await db.db.query('EventoAlerta'), hasLength(1));
    await db.db.close();
    directory.deleteSync(recursive: true);
  });
  test(
    'Contraseña PBKDF2 con sal distinta y verificación',
    () async {
      final hasher = PasswordHasher();
      final a = await hasher.hash('test-password-long'),
          b = await hasher.hash('test-password-long');
      expect(a, isNot(b));
      expect(a.contains('test-password-long'), false);
      expect(await hasher.verify('test-password-long', a), true);
      expect(await hasher.verify('incorrect', a), false);
    },
    timeout: const Timeout(Duration(minutes: 2)),
  );
}
