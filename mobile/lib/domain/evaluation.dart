Map<String, double?> binaryMetrics(List<List<int>> matrix) {
  if (matrix.length != 3 ||
      matrix.any((row) => row.length != 3 || row.any((n) => n < 0))) {
    throw const FormatException('Matriz de confusión inválida.');
  }
  final tn = matrix[0][0],
      fp = matrix[0][1] + matrix[0][2],
      fn = matrix[1][0] + matrix[2][0];
  final tp = matrix[1][1] + matrix[1][2] + matrix[2][1] + matrix[2][2];
  double? ratio(int n, int d) => d == 0 ? null : n / d;
  return {
    'precision': ratio(tp, tp + fp),
    'recall': ratio(tp, tp + fn),
    'specificity': ratio(tn, tn + fp),
    'false_positive_rate': ratio(fp, fp + tn),
  };
}
