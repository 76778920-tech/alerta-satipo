import 'package:supabase/supabase.dart';
import '../domain/measurement.dart';

Map<String, dynamic>? singleRelation(dynamic value) {
  if (value is List) {
    return value.isEmpty ? null : Map<String, dynamic>.from(value.single);
  }
  return value is Map ? Map<String, dynamic>.from(value) : null;
}

Map<String, dynamic> cloudRecord(Map<String, dynamic> raw) {
  final prediction = singleRelation(raw['HistoricoPrediccion']);
  if (prediction == null || !levels.contains(prediction['level'])) {
    throw const FormatException('Predicción remota incompleta.');
  }
  final reading = Measurement.parse({
    'id': raw['lectura_id'],
    'node_id': raw['nodo_id'],
    'source': raw['source'],
    'observed_at': raw['observed_at'],
    'values': {for (final key in features) key: raw[key]},
  });
  return {
    'reading': reading.toJson(),
    'prediction': {...prediction, 'latency_ms': null},
    'remote_alert': singleRelation(prediction['EventoAlerta']) != null,
    'attention': 'Sin seguimiento remoto',
    'synced': true,
  };
}

class CloudRecords {
  final SupabaseClient client;
  CloudRecords(String url, String publicKey)
    : client = SupabaseClient(url, publicKey);
  String? get email => client.auth.currentUser?.email;
  bool get connected => client.auth.currentSession != null;

  Future<void> login(String email, String password) async {
    await disconnect();
    try {
      await client.auth.signInWithPassword(
        email: email.trim(),
        password: password,
      );
      await authorize();
    } catch (_) {
      await disconnect();
      rethrow;
    }
  }

  Future<void> authorize() async {
    final user = client.auth.currentUser;
    if (user == null) throw StateError('Conecta tu cuenta de la web.');
    final admin = await client
        .from('administradores')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
    if (admin == null) {
      throw StateError('Esta cuenta no tiene permiso para consultar PMV1.');
    }
  }

  Future<List<Map<String, dynamic>>> history() async {
    await authorize();
    final result = await client
        .from('LecturaAmbiental')
        .select('*,HistoricoPrediccion(*,EventoAlerta(*))')
        .order('observed_at', ascending: false)
        .order('lectura_id')
        .limit(1000);
    return result
        .where((r) => singleRelation(r['HistoricoPrediccion']) != null)
        .map(cloudRecord)
        .toList();
  }

  // Query actual alerts separately: a large normal-history must not hide old alerts.
  Future<List<Map<String, dynamic>>> alerts() async {
    await authorize();
    final result = await client
        .from('EventoAlerta')
        .select('*,HistoricoPrediccion!inner(*,LecturaAmbiental!inner(*))')
        .order('created_at', ascending: false)
        .order('alerta_id')
        .limit(200);
    return result.map((alert) {
      final prediction = singleRelation(alert['HistoricoPrediccion'])!;
      final reading = singleRelation(prediction['LecturaAmbiental'])!;
      return cloudRecord({
        ...reading,
        'HistoricoPrediccion': {
          ...prediction,
          'EventoAlerta': {'alerta_id': alert['alerta_id']},
        },
      });
    }).toList();
  }

  Future<void> disconnect() => client.auth.signOut(scope: SignOutScope.local);
  Future<void> dispose() => client.dispose();
}
