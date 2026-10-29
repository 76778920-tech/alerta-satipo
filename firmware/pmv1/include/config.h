#pragma once
// Propuesta para ESP32-S3-DevKitC-1. Confirmar placa y montaje antes de conectar.
#ifndef PMV1_SIMULATION
#define PMV1_SIMULATION 1
#endif
#if PMV1_SIMULATION
#define PMV1_NODE_ID "00000000-0000-4000-8000-000000000002"
#else
// Asignar un UUID distinto a cada dispositivo antes de desplegarlo.
#define PMV1_NODE_ID "00000000-0000-4000-8000-000000000003"
#endif
#define PMV1_I2C_SDA 8
#define PMV1_I2C_SCL 9
#define PMV1_PM_RX 18
#define PMV1_PM_TX 17
#define PMV1_SMOKE_ADC 4
#define PMV1_GAS_ADC 5
#define PMV1_INTERVAL_MS 2000UL
// Estos valores NO son calibraciones. El modo físico no adquiere hasta
// completar calibración propia y definir rangos seguros en milivoltios.
#define PMV1_CALIBRATED 0
#define PMV1_SMOKE_MIN_MV 0.0f
#define PMV1_SMOKE_MAX_MV 0.0f
#define PMV1_GAS_MIN_MV 0.0f
#define PMV1_GAS_MAX_MV 0.0f
// Tiempo validado para los módulos concretos; 0 bloquea modo físico.
#define PMV1_WARMUP_MS 0UL
// Para una exportación Edge Impulse real, definir PMV1_EDGE_HEADER como
// nombre entre comillas del *_inferencing.h instalado en lib/.
