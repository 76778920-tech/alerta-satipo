import 'dart:convert';

// UTF-8 NDJSON, fragmented across BLE notifications; bounded accumulation.
class BleFrames {
  final List<int> _buffer = [];
  List<Map<String, dynamic>> add(List<int> chunk) {
    final result = <Map<String, dynamic>>[];
    for (final byte in chunk) {
      if (byte == 10) {
        final bytes = List<int>.from(_buffer);
        _buffer.clear();
        if (bytes.isEmpty) continue;
        final value = jsonDecode(utf8.decode(bytes));
        if (value is! Map<String, dynamic>) {
          throw const FormatException('Trama BLE inválida.');
        }
        result.add(value);
      } else {
        _buffer.add(byte);
        if (_buffer.length > 8192) {
          _buffer.clear();
          throw const FormatException('Trama BLE demasiado larga.');
        }
      }
    }
    return result;
  }

  void reset() => _buffer.clear();
}
