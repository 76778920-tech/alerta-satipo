import 'dart:convert';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart' as path;
import '../application/ports.dart';

class LocalDatabase implements RecordsPort, UsersPort {
  final Database db;
  LocalDatabase(this.db);
  static Future<LocalDatabase> open({
    DatabaseFactory? factory,
    String? location,
  }) async {
    final f = factory ?? databaseFactory;
    final db = await f.openDatabase(
      location ?? path.join(await getDatabasesPath(), 'satipo-mobile.db'),
      options: OpenDatabaseOptions(
        version: 1,
        onConfigure: (db) async {
          await db.execute('PRAGMA foreign_keys=ON');
        },
        onCreate: (db, version) async {
          await db.execute(
            "CREATE TABLE Usuario(usuario_id TEXT PRIMARY KEY,nombre TEXT NOT NULL,correo TEXT NOT NULL UNIQUE,contrasena_hash TEXT NOT NULL,rol TEXT NOT NULL CHECK(rol IN ('POBLADOR','OPERADOR','ADMINISTRADOR')),fecha_creacion TEXT NOT NULL)",
          );
          await db.execute(
            "CREATE TABLE NodoSensor(nodo_id TEXT PRIMARY KEY,origen TEXT NOT NULL CHECK(origen IN ('simulation','sensor')),ubicacion_lat REAL CHECK(ubicacion_lat BETWEEN -90 AND 90),ubicacion_lon REAL CHECK(ubicacion_lon BETWEEN -180 AND 180))",
          );
          await db.execute(
            'CREATE TABLE LecturaAmbiental(lectura_id TEXT PRIMARY KEY,nodo_id TEXT NOT NULL REFERENCES NodoSensor(nodo_id),owner TEXT NOT NULL REFERENCES Usuario(usuario_id),timestamp_utc TEXT NOT NULL,temperatura_c REAL NOT NULL CHECK(temperatura_c BETWEEN -20 AND 80),humedad_relativa REAL NOT NULL CHECK(humedad_relativa BETWEEN 0 AND 100),humo_indice REAL NOT NULL CHECK(humo_indice BETWEEN 0 AND 100),gas_indice REAL NOT NULL CHECK(gas_indice BETWEEN 0 AND 100),pm2_5_ugm3 REAL NOT NULL CHECK(pm2_5_ugm3 BETWEEN 0 AND 1000),gas_mq2_ppm REAL,pm10_ugm3 REAL,raw TEXT NOT NULL)',
          );
          await db.execute(
            "CREATE TABLE HistoricoPrediccion(prediccion_id TEXT PRIMARY KEY,lectura_id TEXT NOT NULL UNIQUE REFERENCES LecturaAmbiental(lectura_id),nivel TEXT NOT NULL CHECK(nivel IN ('Normal','Advertencia','Emergencia')),rp02 INTEGER CHECK(rp02 IN(0,1)),rp03 INTEGER CHECK(rp03 IN(0,1)),latency_ms REAL NOT NULL CHECK(latency_ms>=0),raw TEXT NOT NULL)",
          );
          await db.execute(
            "CREATE TABLE EventoAlerta(alerta_id TEXT PRIMARY KEY,prediccion_id TEXT NOT NULL UNIQUE REFERENCES HistoricoPrediccion(prediccion_id),estado_atencion TEXT NOT NULL DEFAULT 'PENDIENTE' CHECK(estado_atencion IN ('PENDIENTE','ATENDIDO','DESCARTADO')),canal TEXT NOT NULL DEFAULT 'APP_LOCAL',sincronizado INTEGER NOT NULL DEFAULT 0 CHECK(sincronizado IN(0,1)))",
          );
          await db.execute(
            'CREATE TABLE Reporte(id TEXT PRIMARY KEY,owner TEXT NOT NULL REFERENCES Usuario(usuario_id),raw TEXT NOT NULL)',
          );
          await db.execute(
            'CREATE INDEX lectura_fecha ON LecturaAmbiental(timestamp_utc DESC)',
          );
        },
      ),
    );
    return LocalDatabase(db);
  }

  @override
  Future<void> storeBatch(
    String owner,
    List<Map<String, dynamic>> records,
  ) async {
    await db.transaction((tx) async {
      for (final record in records) {
        final r = record['reading'] as Map<String, dynamic>,
            p = record['prediction'] as Map<String, dynamic>,
            v = r['values'] as Map<String, dynamic>;
        final existing = await tx.query(
          'LecturaAmbiental',
          where: 'lectura_id=?',
          whereArgs: [r['id']],
        );
        if (existing.isNotEmpty) {
          if (existing.single['raw'] != jsonEncode(r)) {
            throw StateError('El UUID existe con otro contenido.');
          }
          continue;
        }
        await tx.insert('NodoSensor', {
          'nodo_id': r['node_id'],
          'origen': r['source'],
        }, conflictAlgorithm: ConflictAlgorithm.ignore);
        final node = await tx.query(
          'NodoSensor',
          where: 'nodo_id=?',
          whereArgs: [r['node_id']],
        );
        if (node.single['origen'] != r['source']) {
          throw StateError('Origen incompatible con el nodo.');
        }
        await tx.insert('LecturaAmbiental', {
          'lectura_id': r['id'],
          'nodo_id': r['node_id'],
          'owner': owner,
          'timestamp_utc': r['observed_at'],
          'temperatura_c': v['temperature_c'],
          'humedad_relativa': v['humidity_pct'],
          'humo_indice': v['smoke_index'],
          'gas_indice': v['gas_index'],
          'pm2_5_ugm3': v['dust_ugm3'],
          'raw': jsonEncode(r),
        });
        await tx.insert('HistoricoPrediccion', {
          'prediccion_id': r['id'],
          'lectura_id': r['id'],
          'nivel': p['level'],
          'latency_ms': p['latency_ms'],
          'raw': jsonEncode(p),
        });
        if (p['level'] != 'Normal') {
          await tx.insert('EventoAlerta', {
            'alerta_id': r['id'],
            'prediccion_id': r['id'],
          });
        }
      }
    });
  }

  @override
  Future<List<Map<String, dynamic>>> history(String owner) async {
    // Environmental telemetry is shared by authorized accounts on this installation.
    final rows = await db.rawQuery(
      'SELECT l.raw reading,p.raw prediction,a.estado_atencion attention FROM LecturaAmbiental l JOIN HistoricoPrediccion p ON l.lectura_id=p.lectura_id LEFT JOIN EventoAlerta a ON p.prediccion_id=a.prediccion_id ORDER BY l.timestamp_utc DESC',
    );
    return rows
        .map(
          (row) => {
            'reading': jsonDecode(row['reading'] as String),
            'prediction': jsonDecode(row['prediction'] as String),
            'attention': row['attention'],
            'synced': false,
          },
        )
        .toList();
  }

  @override
  Future<void> attention(String owner, String id, String status) async {
    if (await db.update(
          'EventoAlerta',
          {'estado_atencion': status},
          where: 'alerta_id=?',
          whereArgs: [id],
        ) !=
        1) {
      throw StateError('Alerta no encontrada.');
    }
  }

  @override
  Future<int> userCount() async =>
      Sqflite.firstIntValue(await db.rawQuery('SELECT COUNT(*) FROM Usuario'))!;
  @override
  Future<void> createUser(Map<String, dynamic> user) async {
    await db.transaction((tx) async {
      // Mobile registration never grants administrative privileges.
      await tx.insert('Usuario', {...user, 'rol': 'POBLADOR'});
    });
  }

  @override
  Future<Map<String, dynamic>?> userByEmail(String email) async {
    final rows = await db.query(
      'Usuario',
      where: 'correo=?',
      whereArgs: [email],
    );
    return rows.isEmpty ? null : rows.single;
  }

  @override
  Future<Map<String, dynamic>?> userById(String id) async {
    final rows = await db.query(
      'Usuario',
      where: 'usuario_id=?',
      whereArgs: [id],
    );
    return rows.isEmpty ? null : rows.single;
  }

  @override
  Future<List<Map<String, dynamic>>> users() =>
      db.query('Usuario', columns: ['usuario_id', 'nombre', 'correo', 'rol']);
  @override
  Future<void> changeRole(String id, String role) async {
    if (await db.update(
          'Usuario',
          {'rol': role},
          where: 'usuario_id=?',
          whereArgs: [id],
        ) !=
        1) {
      throw StateError('Usuario no encontrado.');
    }
  }

  @override
  Future<void> addReport(String owner, Map<String, dynamic> report) async {
    await db.insert('Reporte', {
      'id': report['id'],
      'owner': owner,
      'raw': jsonEncode(report),
    });
  }

  @override
  Future<List<Map<String, dynamic>>> reports(String owner) async =>
      (await db.query('Reporte', where: 'owner=?', whereArgs: [owner]))
          .map((r) => jsonDecode(r['raw'] as String) as Map<String, dynamic>)
          .toList();
}
