abstract class RecordsPort {
  Future<void> storeBatch(String owner, List<Map<String, dynamic>> records);
  Future<List<Map<String, dynamic>>> history(String owner);
  Future<void> attention(String owner, String id, String status);
  Future<void> addReport(String owner, Map<String, dynamic> report);
  Future<List<Map<String, dynamic>>> reports(String owner);
}

abstract class UsersPort {
  Future<int> userCount();
  Future<void> createUser(Map<String, dynamic> user);
  Future<Map<String, dynamic>?> userByEmail(String email);
  Future<Map<String, dynamic>?> userById(String id);
  Future<List<Map<String, dynamic>>> users();
  Future<void> changeRole(String id, String role);
}

abstract class SessionPort {
  Future<String?> read();
  Future<void> write(String value);
  Future<void> clear();
}

abstract class PasswordPort {
  Future<String> hash(String password);
  Future<bool> verify(String password, String hash);
}
