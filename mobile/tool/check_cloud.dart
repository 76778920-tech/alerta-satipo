// Read-only integration check. Run from mobile: dart run tool/check_cloud.dart --live
import 'dart:convert';
import 'dart:io';
import 'package:alerta_satipo/adapters/cloud_records.dart';

Future<void> main(List<String> args) async {
  if (!args.contains('--live')) throw StateError('Requires --live');
  final config = jsonDecode(File('assets/supabase-public.json').readAsStringSync());
  final credentials = jsonDecode(File('../config/resident.local.json').readAsStringSync());
  final cloud = CloudRecords(config['supabaseUrl'], config['supabasePublishableKey']);
  try {
    await cloud.login(credentials['email'], credentials['password']);
    final rows = await cloud.history(), alerts = await cloud.alerts();
    if (alerts.any((r) => r['remote_alert'] != true)) throw StateError('Missing alert relation');
    stdout.writeln('PASS: ${rows.length} remote readings, ${alerts.length} remote alerts mapped by Dart.');
    await cloud.disconnect();
    if (cloud.connected) throw StateError('Session was not cleared');
    try {
      await cloud.history();
      throw StateError('Anonymous request accepted');
    } on StateError catch (e) {
      if (e.message == 'Anonymous request accepted') rethrow;
    }
    stdout.writeln('PASS: disconnected access rejected. No remote data written.');
  } finally {
    await cloud.dispose();
  }
}
