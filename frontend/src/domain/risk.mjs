// Reglas puras del modelo demostrativo; no son predicciones operativas.
export const defaultThresholds = {
    tempCritical: 39,
    smokeCritical: 65,
    humidityDry: 38,
    windRisk: 18
  };

  const defaultWeights = {
    temp: 30,
    smoke: 34,
    humidity: 18,
    wind: 14,
    recencyMax: 4,
    recencyMin: 1,
    recencyFreshMinutes: 5
  };

  const defaultBands = {
    critical: 76,
    watch: 55
  };

  const toPositiveNumber = (value, fallback) => {
    const num = Number(value);
    return Number.isFinite(num) && num > 0 ? num : fallback;
  };

  const validateModel = (payload) => {
    if (!payload || typeof payload !== "object") {
      throw new Error("JSON vacío o inválido");
    }

    const thresholds = payload.thresholds || {};
    const weights = payload.weights || {};
    const bands = payload.bands || {};

    const nextThresholds = {
      tempCritical: toPositiveNumber(thresholds.tempCritical, defaultThresholds.tempCritical),
      smokeCritical: toPositiveNumber(thresholds.smokeCritical, defaultThresholds.smokeCritical),
      humidityDry: toPositiveNumber(thresholds.humidityDry, defaultThresholds.humidityDry),
      windRisk: toPositiveNumber(thresholds.windRisk, defaultThresholds.windRisk)
    };

    const nextWeights = {
      temp: toPositiveNumber(weights.temp, defaultWeights.temp),
      smoke: toPositiveNumber(weights.smoke, defaultWeights.smoke),
      humidity: toPositiveNumber(weights.humidity, defaultWeights.humidity),
      wind: toPositiveNumber(weights.wind, defaultWeights.wind),
      recencyMax: toPositiveNumber(weights.recencyMax, defaultWeights.recencyMax),
      recencyMin: toPositiveNumber(weights.recencyMin, defaultWeights.recencyMin),
      recencyFreshMinutes: toPositiveNumber(weights.recencyFreshMinutes, defaultWeights.recencyFreshMinutes)
    };

    const nextBands = {
      critical: toPositiveNumber(bands.critical, defaultBands.critical),
      watch: toPositiveNumber(bands.watch, defaultBands.watch)
    };

    if (nextBands.watch >= nextBands.critical) {
      throw new Error("bands.watch debe ser menor que bands.critical");
    }

    // Prueba de scoring con un sensor sintético para detectar NaN
    const probe = calculateRiskWith(
      { temp: 30, smoke: 40, humidity: 50, wind: 10, lastComm: 3 },
      nextThresholds,
      nextWeights
    );
    if (!Number.isFinite(probe)) {
      throw new Error("El scoring del modelo produjo un valor no numérico");
    }

    return {
      thresholds: nextThresholds,
      weights: nextWeights,
      bands: nextBands,
      modelId: String(payload.modelId || "satipo-risk-v1"),
      version: String(payload.schemaVersion || "1.0.0"),
      source: String(payload.source || "google-colab"),
      exportedAt: payload.exportedAt || null,
      notes: String(payload.notes || "Modelo Colab cargado.")
    };
  };

  const calculateRiskWith = (sensor, thresholds, weights) => {
    const lastSeen = sensor.lastComm ?? sensor.lastSeen ?? 99;
    const temp = Math.min(sensor.temp / thresholds.tempCritical, 1) * weights.temp;
    const smoke = Math.min(sensor.smoke / thresholds.smokeCritical, 1) * weights.smoke;
    const dryness = Math.max((thresholds.humidityDry - sensor.humidity) / thresholds.humidityDry, 0) * weights.humidity;
    const wind = Math.min(sensor.wind / thresholds.windRisk, 1) * weights.wind;
    const recency = lastSeen <= weights.recencyFreshMinutes ? weights.recencyMax : weights.recencyMin;
    return Math.round(temp + smoke + dryness + wind + recency);
  };

  const classifyRisk = (score, activeBands) => {
    if (score >= activeBands.critical) {
      return {
        text: "Crítico",
        label: "Riesgo crítico",
        className: "alert",
        key: "danger",
        point: "danger",
        detail: "Activar verificación comunitaria y ruta de respuesta."
      };
    }
    if (score >= activeBands.watch) {
      return {
        text: "Vigilancia",
        label: "Vigilancia alta",
        className: "warn",
        key: "warning",
        point: "warning",
        detail: "Mantener observación, confirmar con reportes locales."
      };
    }
    return {
      text: "Normal",
      label: "Estable",
      className: "good",
      key: "safe",
      point: "safe",
      detail: "Sin señales críticas en la red cercana."
    };
  };


export { defaultWeights, defaultBands, toPositiveNumber, validateModel, calculateRiskWith, classifyRisk };
