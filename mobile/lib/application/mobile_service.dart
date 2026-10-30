import 'dart:convert';
import '../domain/measurement.dart';
import 'ports.dart';

class MobileService {
  final RecordsPort records;
  final UsersPort users;
  final SessionPort session;
  final PasswordPort passwords;
  final LocalModel model;
  final DateTime Function() now;
  final String Function() uuid;
  Map<String, dynamic>? profile;
  DateTime? expires;
  MobileService({
    required this.records,
    required this.users,
    required this.session,
    required this.passwords,
    required this.model,
    required this.now,
    required this.uuid,
  });
  String get role => profile?['rol'] ?? '';
  bool get canOperate => role == 'POBLADOR';
  bool get isAdmin => false;
  Future<void> restore() async {
    try {
      final raw = await session.read();
      if (raw == null) return;
      final value = jsonDecode(raw);
      expires = DateTime.parse(value['expires']);
      if (!now().isBefore(expires!)) {
        await logout();
        return;
      }
      profile = await users.userById(value['id']);
      if (profile == null || role != 'POBLADOR') await logout();
    } catch (_) {
      await logout();
    }
  }

  Future<void> register(String name, String email, String password) async {
    name = name.trim();
    email = email.trim().toLowerCase();
    if (name.length < 2 ||
        name.length > 120 ||
        !RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(email) ||
        password.length < 12 ||
        password.length > 128) {
      throw const FormatException(
        'Revisa nombre, correo y contraseña (12 a 128 caracteres).',
      );
    }
    await users.createUser({
      'usuario_id': uuid(),
      'nombre': name,
      'correo': email,
      'contrasena_hash': await passwords.hash(password),
      'rol': 'POBLADOR',
      'fecha_creacion': now().toUtc().toIso8601String(),
    });
  }

  Future<void> login(String email, String password) async {
    final user = await users.userByEmail(email.trim().toLowerCase());
    if (user == null ||
        !await passwords.verify(password, user['contrasena_hash'])) {
      throw StateError('Credenciales incorrectas.');
    }
    if (user['rol'] != 'POBLADOR') {
      throw StateError(
        'Esta aplicación es para pobladores. La administración se realiza en la web.',
      );
    }
    final end = now().add(const Duration(hours: 24));
    await session.write(
      jsonEncode({'id': user['usuario_id'], 'expires': end.toIso8601String()}),
    );
    profile = user;
    expires = end;
  }

  Future<void> logout() async {
    profile = null;
    expires = null;
    await session.clear();
  }

  Future<String> authorize({bool operation = false, bool admin = false}) async {
    if (profile == null || expires == null || !now().isBefore(expires!)) {
      await logout();
      throw StateError('Sesión finalizada. Inicia sesión.');
    }
    profile = await users.userById(profile!['usuario_id']);
    if (profile == null || role != 'POBLADOR') {
      await logout();
      throw StateError('Cuenta no disponible.');
    }
    if ((operation && !canOperate) || (admin && !isAdmin)) {
      throw StateError('Tu perfil no tiene permiso.');
    }
    return profile!['usuario_id'];
  }

  Future<void> ingest(List<dynamic> batch) async {
    final owner = await authorize(operation: true);
    if (batch.isEmpty || batch.length > 1000) {
      throw const FormatException('Importa de 1 a 1000 lecturas por lote.');
    }
    final ids = <String>{}, prepared = <Map<String, dynamic>>[];
    for (final raw in batch) {
      if (raw is! Map<String, dynamic>) {
        throw const FormatException('Registro inválido.');
      }
      if (raw['device_prediction'] != null &&
          raw['device_prediction']['model_version'] != model.version) {
        throw const FormatException('Modelo del dispositivo incompatible.');
      }
      final reading = Measurement.parse(raw);
      if (!ids.add(reading.id)) {
        throw const FormatException('ID duplicado en el lote.');
      }
      final watch = Stopwatch()..start();
      final prediction = model.predict(reading);
      watch.stop();
      prepared.add({
        'reading': reading.toJson(),
        'prediction': {
          ...prediction,
          'latency_ms': watch.elapsedMicroseconds / 1000,
        },
        'attention': 'PENDIENTE',
        'synced': false,
      });
    }
    await records.storeBatch(owner, prepared);
  }

  Future<void> simulate(String level) async {
    await authorize(admin: true);
    final i = levels.indexOf(level);
    if (i < 0) throw const FormatException('Nivel inválido.');
    const fixtures = [
      [25, 70, 10, 12, 15],
      [34, 48, 45, 42, 90],
      [52, 25, 85, 82, 260],
    ];
    await ingest([
      {
        'id': uuid(),
        'node_id': '00000000-0000-4000-8000-000000000001',
        'source': 'simulation',
        'observed_at': now().toUtc().toIso8601String(),
        'values': Map.fromIterables(features, fixtures[i]),
      },
    ]);
  }

  Future<List<Map<String, dynamic>>> history() async =>
      records.history(await authorize());
  Future<void> attend(String id, String status) async {
    if (!['PENDIENTE', 'ATENDIDO', 'DESCARTADO'].contains(status)) {
      throw const FormatException('Estado inválido.');
    }
    await records.attention(await authorize(admin: true), id, status);
  }

  Future<String> export() async => jsonEncode({
    'schema': 'satipo-mobile-v1',
    'exported_at': now().toUtc().toIso8601String(),
    'records': await records.history(await authorize(operation: true)),
  });
  Future<void> setRole(String id, String role) async {
    final self = await authorize(admin: true);
    if (!roles.contains(role) || id == self) {
      throw StateError('No puedes modificar tu propio rol.');
    }
    await users.changeRole(id, role);
  }

  Future<List<Map<String, dynamic>>> listUsers() async {
    await authorize(admin: true);
    return users.users();
  }

  Future<void> report(Map<String, dynamic> input) async {
    final owner = await authorize();
    for (final key in ['location', 'type', 'severity', 'description']) {
      if (input[key] is! String ||
          (input[key] as String).trim().isEmpty ||
          (input[key] as String).length > 2000) {
        throw const FormatException('Completa los campos obligatorios.');
      }
    }
    await records.addReport(owner, {
      ...input,
      'id': uuid(),
      'created_at': now().toUtc().toIso8601String(),
      'status': 'LOCAL_NO_ENVIADO',
    });
  }
}
