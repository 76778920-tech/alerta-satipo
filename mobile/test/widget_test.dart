import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:alerta_satipo/application/mobile_service.dart';
import 'package:alerta_satipo/domain/measurement.dart';
import 'package:alerta_satipo/ui/app.dart';
import 'support.dart';

void main() {
  testWidgets('Acceso y registro visibles en pantalla estrecha sin overflow', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(390, 844);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    final memory = Memory();
    final app = MobileService(
      records: memory,
      users: memory,
      session: memory,
      passwords: memory,
      model: LocalModel(
        jsonDecode(File('assets/pmv1-model.json').readAsStringSync()),
      ),
      now: DateTime.now,
      uuid: () => '00000000-0000-4000-8000-000000000001',
    );
    await tester.pumpWidget(SatipoApp(service: app));
    expect(find.text('ALERTA SATIPO'), findsOneWidget);
    expect(find.text('Estado actual'), findsNothing);
    await tester.ensureVisible(find.text('Comenzar'));
    await tester.tap(find.text('Comenzar'));
    await tester.pumpAndSettle();
    expect(find.text('Iniciar sesión'), findsOneWidget);
    expect(find.byType(NavigationBar), findsNothing);
    await tester.tap(find.text('Crear una cuenta'));
    await tester.pumpAndSettle();
    expect(find.text('Nombre completo'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
