import 'package:flutter_test/flutter_test.dart';
import 'package:alerta_satipo/adapters/cloud_records.dart';
import 'dart:convert';
import 'support.dart';

Map<String, dynamic> fixture({bool array = false}) {
  final prediction = {
    'level': 'Emergencia',
    'model_version': 'server-model',
    'scores': [0, 0, 1],
    'EventoAlerta': [
      {'alerta_id': 'alert'},
    ],
  };
  return {
    'lectura_id': 'a6102600-0000-4000-8000-000000000003',
    'nodo_id': 'a6102600-0000-4000-8000-000000000000',
    'observed_at': '2026-10-26T15:00:02+00:00',
    'source': 'simulation',
    'temperature_c': 52,
    'humidity_pct': 25,
    'smoke_index': 85,
    'gas_index': 82,
    'dust_ugm3': 260,
    'HistoricoPrediccion': array ? [prediction] : prediction,
  };
}

void main() {
  test('Restaura sesión sin red, aísla la cuenta local', () async {
    final stores = <String, Memory>{'one': Memory(), 'two': Memory()};
    final expiry = DateTime.now().millisecondsSinceEpoch ~/ 1000 + 3600;
    stores['one']!.token = jsonEncode({
      'access_token': 'test-token',
      'refresh_token': 'test-refresh',
      'token_type': 'bearer',
      'expires_in': 3600,
      'expires_at': expiry,
      'user': {
        'id': 'cloud-user',
        'app_metadata': {},
        'user_metadata': {},
        'aud': 'authenticated',
        'created_at': '2026-01-01T00:00:00Z',
      },
    });
    final cloud = CloudRecords(
      'https://test.invalid',
      'public-test-key',
      storageForOwner: (owner) => stores[owner]!,
    );
    await cloud.restoreFor('one');
    expect(cloud.connected, isTrue);
    await cloud.dispose();
    final reopened = CloudRecords(
      'https://test.invalid',
      'public-test-key',
      storageForOwner: (owner) => stores[owner]!,
    );
    await reopened.restoreFor('two');
    expect(reopened.connected, isFalse);
    await reopened.restoreFor('one');
    expect(reopened.connected, isTrue);
    await reopened.dispose();
  });
  test(
    'Respeta predicción remota y relaciones objeto o lista sin inventar latencia',
    () {
      for (final array in [true, false]) {
        final row = cloudRecord(fixture(array: array));
        expect(row['prediction']['model_version'], 'server-model');
        expect(row['prediction']['level'], 'Emergencia');
        expect(row['prediction']['latency_ms'], isNull);
        expect(row['remote_alert'], isTrue);
        expect(row['synced'], isTrue);
        expect(row['reading']['values'].length, 5);
      }
    },
  );
  test('Rechaza predicción ausente y medición remota incompleta', () {
    expect(
      () => cloudRecord({...fixture(), 'HistoricoPrediccion': []}),
      throwsFormatException,
    );
    expect(
      () => cloudRecord({...fixture(), 'temperature_c': null}),
      throwsFormatException,
    );
  });
}
