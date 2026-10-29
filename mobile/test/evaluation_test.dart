import 'package:flutter_test/flutter_test.dart';
import 'package:alerta_satipo/domain/evaluation.dart';

void main() {
  test('Métricas agrupan niveles de riesgo sin inventar denominadores', () {
    final m = binaryMetrics([
      [8, 1, 1],
      [2, 3, 0],
      [0, 1, 4],
    ]);
    expect(m['precision'], .8);
    expect(m['recall'], .8);
    expect(m['specificity'], .8);
    expect(m['false_positive_rate'], .2);
    final empty = binaryMetrics([
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]);
    expect(empty.values.every((v) => v == null), true);
  });
  test('Métricas rechazan matriz mal formada', () {
    expect(
      () => binaryMetrics([
        [1],
      ]),
      throwsFormatException,
    );
  });
}
