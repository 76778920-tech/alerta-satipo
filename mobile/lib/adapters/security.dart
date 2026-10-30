import 'dart:convert';
import 'dart:math';
import 'package:cryptography/cryptography.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../application/ports.dart';

class PasswordHasher implements PasswordPort {
  final algorithm = Pbkdf2(
    macAlgorithm: Hmac.sha256(),
    iterations: 600000,
    bits: 256,
  );
  @override
  Future<String> hash(String password) async {
    final random = Random.secure(),
        salt = List<int>.generate(16, (_) => random.nextInt(256));
    final key = await algorithm.deriveKey(
      secretKey: SecretKey(utf8.encode(password)),
      nonce: salt,
    );
    return 'pbkdf2-sha256:600000:${base64Encode(salt)}:${base64Encode(await key.extractBytes())}';
  }

  @override
  Future<bool> verify(String password, String hash) async {
    final parts = hash.split(':');
    if (parts.length != 4 ||
        parts[0] != 'pbkdf2-sha256' ||
        parts[1] != '600000') {
      return false;
    }
    final key = await algorithm.deriveKey(
      secretKey: SecretKey(utf8.encode(password)),
      nonce: base64Decode(parts[2]),
    );
    final actual = await key.extractBytes(), expected = base64Decode(parts[3]);
    if (actual.length != expected.length) return false;
    var mismatch = 0;
    for (var i = 0; i < actual.length; i++) {
      mismatch |= actual[i] ^ expected[i];
    }
    return mismatch == 0;
  }
}

class SecureSession implements SessionPort {
  final FlutterSecureStorage storage;
  final String key;
  SecureSession([
    this.storage = const FlutterSecureStorage(),
    this.key = 'satipo.session',
  ]);
  @override
  Future<String?> read() => storage.read(key: key);
  @override
  Future<void> write(String value) => storage.write(key: key, value: value);
  @override
  Future<void> clear() => storage.delete(key: key);
}
