import 'dart:typed_data';

const features = [
  'temperature_c',
  'humidity_pct',
  'smoke_index',
  'gas_index',
  'dust_ugm3',
];
const levels = ['Normal', 'Advertencia', 'Emergencia'];
const roles = ['POBLADOR', 'OPERADOR', 'ADMINISTRADOR'];

class Measurement {
  final String id, nodeId, source;
  final DateTime observedAt;
  final List<double> values;
  Measurement(
    this.id,
    this.nodeId,
    this.source,
    this.observedAt,
    List<double> values,
  ) : values = List.unmodifiable(values);
  factory Measurement.parse(Map<String, dynamic> input) {
    final uuid = RegExp(
      r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
    );
    if (!uuid.hasMatch('${input['id']}') ||
        !uuid.hasMatch('${input['node_id']}') ||
        !['simulation', 'sensor'].contains(input['source'])) {
      throw const FormatException(
        'Identificación u origen de lectura inválido.',
      );
    }
    final raw = input['values'];
    if (raw is! Map || raw.length != 5) {
      throw const FormatException('Se requieren las cinco variables.');
    }
    const low = [-20, 0, 0, 0, 0], high = [80, 100, 100, 100, 1000];
    final values = <double>[];
    for (var i = 0; i < 5; i++) {
      final v = raw[features[i]];
      if (v is! num || !v.isFinite || v < low[i] || v > high[i]) {
        throw FormatException('Valor inválido: ${features[i]}');
      }
      values.add(v.toDouble());
    }
    final text = input['observed_at'];
    if (text is! String || !RegExp(r'(Z|[+-]\d\d:\d\d)$').hasMatch(text)) {
      throw const FormatException('La fecha requiere zona horaria.');
    }
    return Measurement(
      input['id'],
      input['node_id'],
      input['source'],
      DateTime.parse(text).toUtc(),
      values,
    );
  }
  Map<String, dynamic> toJson() => {
    'id': id,
    'node_id': nodeId,
    'source': source,
    'observed_at': observedAt.toIso8601String(),
    'values': Map.fromIterables(features, values),
  };
}

class LocalModel {
  final Map<String, dynamic> data;
  LocalModel(this.data);
  String get version => data['version'];
  Map<String, dynamic> predict(Measurement reading) {
    final x = Float32List.fromList(reading.values);
    var node = 0;
    while (data['left'][node] >= 0) {
      node = x[data['feature'][node]] <= data['threshold'][node]
          ? data['left'][node]
          : data['right'][node];
    }
    final scores = List<num>.from(data['scores'][node]);
    var best = 0;
    for (var i = 1; i < scores.length; i++) {
      if (scores[i] > scores[best]) best = i;
    }
    return {
      'level': levels[best],
      'scores': scores,
      'model_version': version,
      'experimental': true,
      'rp02': null,
      'rp03': null,
    };
  }
}
