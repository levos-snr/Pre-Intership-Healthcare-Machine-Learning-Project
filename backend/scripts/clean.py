"""
scripts/clean.py
Reads data/raw/healthcare_dataset.csv, cleans it, and writes
data/cleaned/healthcare_dataset.csv ready for loading into PostgreSQL.

Usage (from backend/):
    python scripts/clean.py
"""
import os
import logging
import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger(__name__)

BASE_DIR = os.path.join(os.path.dirname(__file__), "..")
RAW_PATH = os.path.join(BASE_DIR, "data", "raw", "healthcare_dataset.csv")
CLEANED_DIR = os.path.join(BASE_DIR, "data", "cleaned")
CLEANED_PATH = os.path.join(CLEANED_DIR, "healthcare_dataset.csv")

EXPECTED_COLUMNS = {
    "Name": "name",
    "Age": "age",
    "Gender": "gender",
    "Blood Type": "blood_type",
    "Medical Condition": "medical_condition",
    "Date of Admission": "date_of_admission",
    "Doctor": "doctor",
    "Hospital": "hospital",
    "Insurance Provider": "insurance_provider",
    "Billing Amount": "billing_amount",
    "Room Number": "room_number",
    "Admission Type": "admission_type",
    "Discharge Date": "discharge_date",
    "Medication": "medication",
    "Test Results": "test_result",
}


def clean():
    if not os.path.exists(RAW_PATH):
        raise FileNotFoundError(
            f"Raw data not found at {RAW_PATH}. Run scripts/ingest.py first."
        )

    logger.info("Reading %s …", RAW_PATH)
    df = pd.read_csv(RAW_PATH)
    logger.info("Raw shape: %s", df.shape)

    # Rename columns to snake_case DB names
    df = df.rename(columns=EXPECTED_COLUMNS)

    # Standardise string columns
    str_cols = [
        "name", "gender", "blood_type", "medical_condition",
        "doctor", "hospital", "insurance_provider",
        "admission_type", "medication", "test_result",
    ]
    for col in str_cols:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip().str.title()

    # Normalise test_result to exactly one of the three expected labels
    label_map = {
        "Normal": "Normal",
        "Abnormal": "Abnormal",
        "Inconclusive": "Inconclusive",
    }
    df["test_result"] = df["test_result"].map(label_map).fillna("Inconclusive")

    # Numeric coercion
    df["age"] = pd.to_numeric(df["age"], errors="coerce")
    df["billing_amount"] = pd.to_numeric(df["billing_amount"], errors="coerce")
    df["room_number"] = pd.to_numeric(df["room_number"], errors="coerce")

    # Drop rows missing critical fields
    before = len(df)
    required = ["age", "gender", "blood_type", "medical_condition",
                "billing_amount", "admission_type", "insurance_provider",
                "medication", "test_result"]
    df = df.dropna(subset=required)
    logger.info("Dropped %d rows with missing critical fields.", before - len(df))

    # Convert int columns
    df["age"] = df["age"].astype(int)
    df["room_number"] = df["room_number"].fillna(0).astype(int)

    os.makedirs(CLEANED_DIR, exist_ok=True)
    df.to_csv(CLEANED_PATH, index=False)
    logger.info("Cleaned shape: %s → saved to %s", df.shape, CLEANED_PATH)
    return CLEANED_PATH


if __name__ == "__main__":
    result = clean()
    logger.info("Clean complete → %s", result)