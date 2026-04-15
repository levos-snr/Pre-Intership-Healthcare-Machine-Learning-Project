"""
Training pipeline — runs on startup (first time) and every Saturday at 12:00.
Can also be run directly:  python -m app.ml.train
"""
import logging
import os

import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier
import joblib

from app.core.config import settings
from app.db.database import SessionLocal
from app.db.models import Patient
from app.ml.evaluate import evaluate_model
from app.ml.preprocess import encode_features, preprocess_dataframe

logger = logging.getLogger(__name__)


def load_data_from_db() -> pd.DataFrame:
    db = SessionLocal()
    try:
        patients = db.query(Patient).all()
        records = [
            {
                "Age": p.age,
                "Gender": p.gender,
                "Blood Type": p.blood_type,
                "Medical Condition": p.medical_condition,
                "Billing Amount": p.billing_amount,
                "Admission Type": p.admission_type,
                "Insurance Provider": p.insurance_provider,
                "Medication": p.medication,
                "Test Results": p.test_result,
            }
            for p in patients
        ]
        return pd.DataFrame(records)
    finally:
        db.close()


def retrain_model() -> dict | None:
    """Full retrain — called by scheduler and /api/v1/train. Returns best metrics dict or None."""
    logger.info("=== Starting model retraining ===")

    try:
        df = load_data_from_db()

        if df.empty or len(df) < 50:
            logger.warning(
                "Not enough data to retrain (%d rows). Need at least 50.", len(df)
            )
            return None

        df = preprocess_dataframe(df)

        # Encode target
        target_le = LabelEncoder()
        y = target_le.fit_transform(df["Test Results"].astype(str))

        # Encode features
        X, encoders, scaler = encode_features(df, fit=True)

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        candidates = {
            "xgboost": XGBClassifier(
                n_estimators=300,
                max_depth=6,
                learning_rate=0.05,
                subsample=0.8,
                colsample_bytree=0.8,
                eval_metric="mlogloss",
                random_state=42,
            ),
            "random_forest": RandomForestClassifier(
                n_estimators=300,
                max_depth=10,
                min_samples_leaf=5,
                random_state=42,
                n_jobs=-1,
            ),
            "gradient_boosting": GradientBoostingClassifier(
                n_estimators=200,
                max_depth=5,
                learning_rate=0.05,
                subsample=0.8,
                random_state=42,
            ),
            # n_jobs removed — deprecated in sklearn 1.8+
            "logistic_regression": LogisticRegression(
                max_iter=1000,
                C=1.0,
                random_state=42,
            ),
        }

        results: dict[str, dict] = {}
        for name, model in candidates.items():
            logger.info("Training %s …", name)
            model.fit(X_train, y_train)
            metrics = evaluate_model(model, X_test, y_test, name)
            results[name] = {"model": model, "metrics": metrics}

        best_name = max(results, key=lambda k: results[k]["metrics"]["accuracy"])
        best = results[best_name]
        logger.info(
            "Best model: %s  accuracy=%.4f",
            best_name,
            best["metrics"]["accuracy"],
        )

        os.makedirs(os.path.dirname(settings.MODEL_PATH), exist_ok=True)
        joblib.dump(
            {
                "model": best["model"],
                "encoders": encoders,
                "scaler": scaler,
                "target_le": target_le,
                "model_name": best_name,
                "metrics": best["metrics"],
                "all_results": {
                    k: v["metrics"] for k, v in results.items()
                },
            },
            settings.MODEL_PATH,
        )
        logger.info("Model saved → %s", settings.MODEL_PATH)
        return best["metrics"]

    except Exception:
        logger.exception("Retraining failed")
        raise


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    retrain_model()
