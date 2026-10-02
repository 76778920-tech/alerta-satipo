"""
Alerta Satipo - Entrenamiento / calibración en Google Colab
==========================================================
Cómo usar:
1. Sube este archivo y sample_sensors.csv a Colab
   (o copia el contenido en una celda).
2. Ejecuta todas las celdas.
3. Descarga satipo_umbrales.json
4. Reemplaza frontend/shared/models/satipo_umbrales.json en el proyecto
5. Recarga mobile/ o web/ en el navegador

Este script NO es Edge AI en producción: calibra umbrales/pesos
para que el frontend demuestre un modelo exportado desde Colab.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

# En Colab: from google.colab import files  (opcional para descargar)

CSV_PATH = Path("sample_sensors.csv")
OUTPUT_PATH = Path("satipo_umbrales.json")

LABEL_SCORE = {
    "normal": 30,
    "watch": 65,
    "critical": 88,
}


def load_dataset(path: Path) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(
            f"No se encontró {path}. Sube sample_sensors.csv al entorno de Colab."
        )
    df = pd.read_csv(path)
    required = {"temp", "smoke", "humidity", "wind", "last_comm_min", "label"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Faltan columnas en el CSV: {sorted(missing)}")
    return df


def calibrate(df: pd.DataFrame) -> dict:
    """Calibración simple y explicable para la demo académica."""
    critical = df[df["label"] == "critical"]
    normal = df[df["label"] == "normal"]

    if critical.empty or normal.empty:
        raise ValueError("El CSV debe incluir filas normal y critical.")

    # Umbrales entre la media normal y la media crítica
    thresholds = {
        "tempCritical": round(float((normal["temp"].mean() + critical["temp"].mean()) / 2), 1),
        "smokeCritical": round(float((normal["smoke"].mean() + critical["smoke"].mean()) / 2), 1),
        "humidityDry": round(float((normal["humidity"].mean() + critical["humidity"].mean()) / 2), 1),
        "windRisk": round(float((normal["wind"].mean() + critical["wind"].mean()) / 2), 1),
    }

    # Pesos fijos pero documentados (suman 100 con recencyMax)
    weights = {
        "temp": 30,
        "smoke": 34,
        "humidity": 18,
        "wind": 14,
        "recencyMax": 4,
        "recencyMin": 1,
        "recencyFreshMinutes": 5,
    }

    bands = {
        "critical": 76,
        "watch": 55,
    }

    return {
        "schemaVersion": "1.0.0",
        "modelId": "satipo-risk-v1",
        "source": "google-colab",
        "exportedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "notes": "Calibrado en Colab con sample_sensors.csv (dataset sintético).",
        "thresholds": thresholds,
        "weights": weights,
        "bands": bands,
        "datasetStats": {
            "rows": int(len(df)),
            "criticalRows": int(len(critical)),
            "normalRows": int(len(normal)),
            "watchRows": int(len(df[df["label"] == "watch"])),
        },
    }


def score_row(row: pd.Series, model: dict) -> float:
    t = model["thresholds"]
    w = model["weights"]
    temp = min(row["temp"] / t["tempCritical"], 1) * w["temp"]
    smoke = min(row["smoke"] / t["smokeCritical"], 1) * w["smoke"]
    dryness = max((t["humidityDry"] - row["humidity"]) / t["humidityDry"], 0) * w["humidity"]
    wind = min(row["wind"] / t["windRisk"], 1) * w["wind"]
    recency = w["recencyMax"] if row["last_comm_min"] <= w["recencyFreshMinutes"] else w["recencyMin"]
    return round(temp + smoke + dryness + wind + recency, 1)


def validate_model(df: pd.DataFrame, model: dict) -> None:
    """Comprueba que el schema y el scoring no rompan la demo."""
    for key in ("schemaVersion", "thresholds", "weights", "bands"):
        if key not in model:
            raise ValueError(f"Modelo incompleto: falta {key}")

    for key in ("tempCritical", "smokeCritical", "humidityDry", "windRisk"):
        value = model["thresholds"][key]
        if not isinstance(value, (int, float)) or value <= 0:
            raise ValueError(f"Umbral inválido: {key}={value}")

    scores = df.apply(lambda row: score_row(row, model), axis=1)
    if scores.isna().any():
        raise ValueError("El scoring produjo NaN.")

    print("Validación OK")
    print(f"  Riesgo medio: {scores.mean():.1f}")
    print(f"  Riesgo min/max: {scores.min():.1f} / {scores.max():.1f}")


def main() -> None:
    df = load_dataset(CSV_PATH)
    model = calibrate(df)
    validate_model(df, model)

    OUTPUT_PATH.write_text(json.dumps(model, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Exportado: {OUTPUT_PATH.resolve()}")
    print(json.dumps(model["thresholds"], indent=2, ensure_ascii=False))

    # En Colab puedes descomentar:
    # from google.colab import files
    # files.download(str(OUTPUT_PATH))


if __name__ == "__main__":
    main()
