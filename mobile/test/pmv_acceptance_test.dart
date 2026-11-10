import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:alerta_satipo/application/mobile_service.dart';
import 'package:alerta_satipo/domain/measurement.dart';
import 'package:alerta_satipo/domain/ble_frames.dart';
import 'package:alerta_satipo/ui/app.dart';
import 'support.dart';

// Only persistence is substituted; inference and UI are production classes.
class OrderedMemory extends Memory {
  @override
  Future<List<Map<String, dynamic>>> history(String owner) async =>
      [...rows]..sort(
        (a, b) => (b['reading']['observed_at'] as String).compareTo(
          a['reading']['observed_at'] as String,
        ),
      );
}

void main() {
  final model = LocalModel(
    jsonDecode(File('assets/pmv1-model.json').readAsStringSync()),
  );
  final examples = [
    [25, 70, 10, 12, 15],
    [34, 48, 45, 42, 90],
    [52, 25, 85, 82, 260],
  ];
  Map<String, dynamic> reading(int i) => {
    'id': '00000000-0000-4000-8000-${(i + 10).toString().padLeft(12, '0')}',
    'node_id': '00000000-0000-4000-8000-000000000001',
    'source': 'simulation',
    'observed_at': '2026-11-10T12:00:0${i}Z',
    'values': Map.fromIterables(features, examples[i]),
  };
  Future<MobileService> service(OrderedMemory memory) async {
    final app = MobileService(
      records: memory,
      users: memory,
      session: memory,
      passwords: memory,
      model: model,
      now: () => DateTime.utc(2026, 11, 10, 12),
      uuid: () => '00000000-0000-4000-8000-000000000001',
    );
    await app.register(
      'Prueba',
      'poblador@example.invalid',
      'test-password-long',
    );
    await app.login('poblador@example.invalid', 'test-password-long');
    return app;
  }

  Future<void> open(WidgetTester tester, MobileService app) async {
    tester.view.physicalSize = const Size(390, 844);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(SatipoApp(service: app));
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.text('Comenzar'));
    await tester.tap(find.text('Comenzar'));
    await tester.pumpAndSettle();
  }

  test('HU07 ML-DART: reproduce la matriz completa de 3000 lecturas', () {
    final report = jsonDecode(
      File('../colab/pmv1/evaluation.json').readAsStringSync(),
    );
    final lines = File('../colab/pmv1/test.csv').readAsLinesSync().skip(1);
    final matrix = List.generate(3, (_) => List.filled(3, 0));
    expect(lines.length, 3000);
    for (final line in lines) {
      final numbers = line.split(',').map(double.parse).toList();
      final input = reading(0);
      input['values'] = Map.fromIterables(features, numbers.take(5));
      final prediction = model.predict(Measurement.parse(input));
      matrix[numbers.last.toInt()][levels.indexOf(prediction['level'])]++;
      expect(prediction['model_version'], report['version']);
    }
    expect(matrix, report['confusion_matrix']);
  });
  for (var i = 0; i < 3; i++) {
    testWidgets(
      'HU08/HU13: ${levels[i]} calculado por ML se visualiza con su color',
      (tester) async {
        final app = await service(OrderedMemory());
        await app.ingest([reading(i)]);
        await open(tester, app);
        expect(find.text('Estado actual'), findsOneWidget);
        expect(find.text(levels[i]), findsOneWidget);
        expect(find.textContaining('SIMULACIÓN'), findsWidgets);
        final card = find.ancestor(
          of: find.text(levels[i]),
          matching: find.byType(Card),
        );
        expect(card, findsOneWidget);
        expect(
          tester.widget<Card>(card).color,
          [
            const Color(0xff126458),
            const Color(0xff8a5700),
            const Color(0xffae2630),
          ][i],
        );
        expect(tester.takeException(), isNull);
        await tester.pumpWidget(const SizedBox.shrink());
      },
    );
  }
  testWidgets(
    'HU11/HU13: alertas ML excluyen Normal, filtran y reflejan una nueva lectura',
    (tester) async {
      final memory = OrderedMemory();
      // Separate fixture for this test; no platform Bluetooth or cloud connection.
      final connected = await service(memory);
      await connected.ingest([reading(0), reading(1)]);
      await open(tester, connected);
      expect(find.text('Advertencia'), findsOneWidget);
      await connected.ingest([reading(2)]);
      tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.paused);
      tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.resumed);
      await tester.pumpAndSettle();
      expect(find.text('Emergencia'), findsOneWidget);
      await tester.tap(find.text('Alertas').last);
      await tester.pumpAndSettle();
      expect(find.byType(ExpansionTile), findsNWidgets(2));
      await tester.tap(find.byType(DropdownButtonFormField<String>));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Emergencia').last);
      await tester.pumpAndSettle();
      expect(find.byType(ExpansionTile), findsOneWidget);
      await tester.tap(find.byType(DropdownButtonFormField<String>));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Normal').last);
      await tester.pumpAndSettle();
      expect(find.byType(ExpansionTile), findsNothing);
      expect(find.textContaining('No hay alertas locales'), findsOneWidget);
      expect(tester.takeException(), isNull);
      await tester.pumpWidget(const SizedBox.shrink());
    },
  );
  test('HU05: lote inválido o duplicado no deja registros parciales', () async {
    final memory = OrderedMemory();
    final tested = await service(memory);
    final invalid = reading(1);
    invalid['values'].remove('gas_index');
    await expectLater(
      tested.ingest([reading(0), invalid]),
      throwsFormatException,
    );
    expect(memory.rows, isEmpty);
    await expectLater(
      tested.ingest([reading(0), reading(0)]),
      throwsFormatException,
    );
    expect(memory.rows, isEmpty);
  });
  test(
    'HU11: tramas BLE fragmentadas llegan al modelo; rechaza versión ajena',
    () async {
      final memory = OrderedMemory();
      final app = await service(memory);
      final frames = BleFrames();
      final bytes = utf8.encode(
        '${List.generate(3, (i) => jsonEncode(reading(i))).join('\n')}\n',
      );
      for (var i = 0; i < bytes.length; i += 7) {
        final stop = i + 7 < bytes.length ? i + 7 : bytes.length;
        final batch = frames.add(bytes.sublist(i, stop));
        if (batch.isNotEmpty) await app.ingest(batch);
      }
      expect(memory.rows.map((r) => r['prediction']['level']).toList(), levels);
      final incompatible = reading(0);
      incompatible['device_prediction'] = {'model_version': 'other-version'};
      await expectLater(app.ingest([incompatible]), throwsFormatException);
      expect(memory.rows, hasLength(3));
    },
  );
}
