"""Load the saved model bundle and run single-row predictions."""
import logging
import os

import joblib
import numpy as np
import pandas as pd

from app.core.config import settings
from app.ml.preprocess import encode_features, preprocess_dataframe

logger = logging.getLogger(__name__)

_bundle: dict | None = None


def _load_bundle() -> dict:
    global _bundle
    if _bundle is None:
        if not os.path.exists(settings.MODEL_PATH):
            raise FileNotFoundError(
                f"No model found at '{settings.MODEL_PATH}'. "
                "Run the data pipeline first:\n"
                "  python scripts/ingest.py\n"
                "  python scripts/clean.py\n"
                "  python scripts/load.py\n"
                "  python -m app.ml.train"
            )
        _bundle = joblib.load(settings.MODEL_PATH)
        logger.info("Model '%s' loaded from %s", _bundle.get("model_name"), settings.MODEL_PATH)
    return _bundle


def make_prediction(data: dict) -> dict:
    """
    data keys: Age, Gender, Blood Type, Medical Condition,
               Billing Amount, Admission Type, Insurance Provider, Medication
    Returns: { predicted_test_result: str, confidence: float }
    """
    bundle = _load_bundle()

    df = pd.DataFrame([data])
    df = preprocess_dataframe(df)
    X, _, _ = encode_features(
        df,
        encoders=bundle["encoders"],
        scaler=bundle["scaler"],
        fit=False,
    )

    model = bundle["model"]
    pred_idx = int(model.predict(X)[0])

    if hasattr(model, "predict_proba"):
        confidence = float(np.max(model.predict_proba(X)[0]))
    else:
        confidence = 1.0

    label: str = bundle["target_le"].inverse_transform([pred_idx])[0]

    return {
        "predicted_test_result": label,
        "confidence": round(confidence, 4),
    }


def invalidate_cache() -> None:
    """Call this after retraining so the next request reloads the model."""
    global _bundle
    _bundle = None