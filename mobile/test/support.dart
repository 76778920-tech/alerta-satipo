import 'package:alerta_satipo/application/ports.dart';

class Memory implements RecordsPort, UsersPort, SessionPort, PasswordPort {
  final List<Map<String, dynamic>> accounts = [], rows = [], observations = [];
  String? token;
  @override
  Future<String?> read() async => token;
  @override
  Future<void> write(String value) async {
    token = value;
  }

  @override
  Future<void> clear() async {
    token = null;
  }

  @override
  Future<String> hash(String value) async => 'test:$value';
  @override
  Future<bool> verify(String value, String hash) async => hash == 'test:$value';
  @override
  Future<int> userCount() async => accounts.length;
  @override
  Future<void> createUser(Map<String, dynamic> u) async {
    accounts.add(u);
  }

  @override
  Future<Map<String, dynamic>?> userByEmail(String email) async =>
      accounts.where((u) => u['correo'] == email).firstOrNull;
  @override
  Future<Map<String, dynamic>?> userById(String id) async =>
      accounts.where((u) => u['usuario_id'] == id).firstOrNull;
  @override
  Future<List<Map<String, dynamic>>> users() async => accounts;
  @override
  Future<void> changeRole(String id, String role) async {
    (await userById(id))!['rol'] = role;
  }

  @override
  Future<void> storeBatch(
    String owner,
    List<Map<String, dynamic>> batch,
  ) async {
    rows.addAll(batch);
  }

  @override
  Future<List<Map<String, dynamic>>> history(String owner) async => rows;
  @override
  Future<void> attention(String owner, String id, String status) async {
    rows.firstWhere((r) => r['reading']['id'] == id)['attention'] = status;
  }

  @override
  Future<void> addReport(String owner, Map<String, dynamic> report) async {
    observations.add({...report, 'owner': owner});
  }

  @override
  Future<List<Map<String, dynamic>>> reports(String owner) async =>
      observations.where((r) => r['owner'] == owner).toList();
}
