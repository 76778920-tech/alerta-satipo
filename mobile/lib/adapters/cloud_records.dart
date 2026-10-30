import 'package:supabase/supabase.dart';
import 'dart:async';
import 'dart:convert';
import '../application/ports.dart';
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
  final SessionPort Function(String owner)? storageForOwner;
  SessionPort? _storage;
  StreamSubscription<AuthState>? _auth;
  Future<void> _writes = Future.value();
  CloudRecords(String url, String publicKey, {this.storageForOwner})
    : client = SupabaseClient(url, publicKey) {
    _auth = client.auth.onAuthStateChange.listen((event) {
      final storage = _storage;
      if (storage == null) return;
      final session = event.session;
      _writes = _writes.catchError((Object _) {}).then((_) async {
        if (session == null) {
          await storage.clear();
        } else {
          await storage.write(jsonEncode(session.toJson()));
        }
      });
      unawaited(_writes.catchError((Object _) {}));
    }, onError: (Object _) {});
  }

  Future<void> restoreFor(String owner) async {
    // Never reuse one local user's remote identity for another local user.
    _storage = null;
    await client.auth.signOut(scope: SignOutScope.local);
    await _writes.catchError((Object _) {});
    _storage = storageForOwner?.call(owner);
    final raw = await _storage?.read();
    if (raw == null) return;
    try {
      await client.auth.setInitialSession(raw);
    } catch (_) {
      await _storage?.clear();
    }
  }

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
      await _writes;
    } catch (_) {
      await disconnect();
      rethrow;
    }
  }

  Future<void> authorize() async {
    if (client.auth.currentSession?.isExpired == true) {
      await client.auth.refreshSession();
    }
    final user = client.auth.currentUser;
    if (user == null) throw StateError('Conecta tu cuenta de la web.');
    final admin = await client
        .from('administradores')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
    if (admin != null) {
      throw StateError(
        'Las cuentas administradoras utilizan el panel web, no la aplicación móvil.',
      );
    }
    final resident = await client
        .from('clientes')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
    if (resident == null) {
      throw StateError('Se requiere una cuenta de poblador.');
    }
  }

  Future<List<Map<String, dynamic>>> history() async {
    await authorize();
    final result = await client.rpc(
      'resident_pmv1_feed',
      params: {'p_alerts': false},
    );
    return (result as List)
        .map((r) => cloudRecord(Map<String, dynamic>.from(r)))
        .toList();
  }

  Future<List<Map<String, dynamic>>> alerts() async {
    await authorize();
    final result = await client.rpc(
      'resident_pmv1_feed',
      params: {'p_alerts': true},
    );
    return (result as List)
        .map((r) => cloudRecord(Map<String, dynamic>.from(r)))
        .toList();
  }

  Future<void> disconnect() async {
    await client.auth.signOut(scope: SignOutScope.local);
    await _writes.catchError((Object _) {});
    await _storage?.clear();
  }

  Future<void> dispose() async {
    await _auth?.cancel();
    await _writes.catchError((Object _) {});
    await client.dispose();
  }
}
