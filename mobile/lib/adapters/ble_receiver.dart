import 'dart:async';
import 'package:flutter_reactive_ble/flutter_reactive_ble.dart';
import 'package:permission_handler/permission_handler.dart';
import '../domain/ble_frames.dart';

const serviceUuid = '6d89e001-2b74-4ec2-9c51-f1a0388b1200';
const readingUuid = '6d89e002-2b74-4ec2-9c51-f1a0388b1200';

class BleReceiver {
  late final FlutterReactiveBle ble = FlutterReactiveBle();
  final frames = BleFrames();
  StreamSubscription<dynamic>? scanSubscription, connection, notifications;
  Future<void> scan(
    void Function(DiscoveredDevice) found,
    void Function(Object) failed,
  ) async {
    await stop();
    await [Permission.bluetoothScan, Permission.bluetoothConnect].request();
    // Legacy Android requires location for scanning; denial is surfaced by BLE.
    if (!await Permission.bluetoothScan.isGranted) {
      await Permission.locationWhenInUse.request();
    }
    scanSubscription = ble
        .scanForDevices(
          withServices: [Uuid.parse(serviceUuid)],
          scanMode: ScanMode.lowLatency,
        )
        .listen(found, onError: failed);
  }

  Future<void> connect(
    String id,
    void Function(Map<String, dynamic>) receive,
    void Function(String) status,
  ) async {
    await scanSubscription?.cancel();
    await notifications?.cancel();
    await connection?.cancel();
    frames.reset();
    connection = ble
        .connectToDevice(id: id, connectionTimeout: const Duration(seconds: 12))
        .listen(
          (update) {
            status(update.connectionState.name);
            if (update.connectionState == DeviceConnectionState.connected) {
              notifications = ble
                  .subscribeToCharacteristic(
                    QualifiedCharacteristic(
                      serviceId: Uuid.parse(serviceUuid),
                      characteristicId: Uuid.parse(readingUuid),
                      deviceId: id,
                    ),
                  )
                  .listen(
                    (bytes) {
                      try {
                        for (final row in frames.add(bytes)) {
                          receive(row);
                        }
                      } catch (_) {
                        status('Trama inválida; lectura descartada.');
                      }
                    },
                    onError: (_) => status(
                      'No se pudo recibir la característica de lecturas.',
                    ),
                  );
            }
            if (update.connectionState == DeviceConnectionState.disconnected) {
              notifications?.cancel();
              frames.reset();
            }
          },
          onError: (_) =>
              status('Conexión BLE interrumpida. Vuelve a conectar.'),
        );
  }

  Future<void> stop() async {
    await scanSubscription?.cancel();
    await notifications?.cancel();
    await connection?.cancel();
    frames.reset();
  }
}
