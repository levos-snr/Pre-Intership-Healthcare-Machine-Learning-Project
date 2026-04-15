import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from typing import Optional

CATEGORICAL_FEATURES = [
    "Gender",
    "Blood Type",
    "Medical Condition",
    "Admission Type",
    "Insurance Provider",
    "Medication",
]
NUMERIC_FEATURES = ["Age", "Billing Amount"]
ALL_FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES
TARGET = "Test Results"


def preprocess_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Standardise column values before encoding."""
    df = df.copy()

    # Rename DB column to ML column if needed
    if "Test Results" not in df.columns and "test_result" in df.columns:
        df["Test Results"] = df["test_result"]

    for col in CATEGORICAL_FEATURES:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip().str.title()

    return df


def encode_features(
    df: pd.DataFrame,
    encoders: Optional[dict] = None,
    scaler: Optional[StandardScaler] = None,
    fit: bool = False,
):
    """
    Encode a DataFrame into a numpy feature matrix.

    Returns (X, encoders, scaler).
    Pass fit=True when training; pass saved encoders + scaler for inference.
    """
    df = df.copy()
    if encoders is None:
        encoders = {}

    for col in CATEGORICAL_FEATURES:
        if col not in df.columns:
            df[col] = "Unknown"

        if fit or col not in encoders:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))
            encoders[col] = le
        else:
            le: LabelEncoder = encoders[col]
            known = set(le.classes_)
            df[col] = df[col].astype(str).apply(
                lambda x: x if x in known else le.classes_[0]
            )
            df[col] = le.transform(df[col])

    available = [c for c in ALL_FEATURES if c in df.columns]
    X = df[available].astype(float).values

    if fit or scaler is None:
        scaler = StandardScaler()
        X = scaler.fit_transform(X)
    else:
        X = scaler.transform(X)

    return X, encoders, scaler


def encode_target(
    series: pd.Series,
    le: Optional[LabelEncoder] = None,
    fit: bool = False,
):
    if fit or le is None:
        le = LabelEncoder()
        y = le.fit_transform(series.astype(str))
    else:
        y = le.transform(series.astype(str))
    return y, le