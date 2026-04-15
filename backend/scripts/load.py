"""
scripts/load.py
Reads data/cleaned/healthcare_dataset.csv and bulk-inserts all rows
into the PostgreSQL `patients` table.  Skips the insert if the table
already has the same number of rows (idempotent).

Usage (from backend/):
    python scripts/load.py
"""
import os
import sys
import logging

import pandas as pd

# Make sure `app` package is importable when run from backend/
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger(__name__)

CLEANED_PATH = os.path.join(
    os.path.dirname(__file__), "..", "data", "cleaned", "healthcare_dataset.csv"
)


def load():
    if not os.path.exists(CLEANED_PATH):
        raise FileNotFoundError(
            f"Cleaned data not found at {CLEANED_PATH}. "
            "Run scripts/ingest.py then scripts/clean.py first."
        )

    from app.db.database import SessionLocal, create_tables
    from app.db.models import Patient
    from sqlalchemy import func

    # Ensure tables exist
    create_tables()

    df = pd.read_csv(CLEANED_PATH)
    logger.info("Loaded cleaned CSV: %d rows", len(df))

    db = SessionLocal()
    try:
        existing = db.query(func.count(Patient.id)).scalar()
        if existing and existing >= len(df):
            logger.info(
                "DB already has %d rows (CSV has %d). Skipping load.",
                existing,
                len(df),
            )
            return existing

        if existing > 0:
            logger.info("Clearing %d existing rows before reload …", existing)
            db.query(Patient).delete()
            db.commit()

        records = []
        for _, row in df.iterrows():
            records.append(
                Patient(
                    name=row.get("name"),
                    age=int(row["age"]),
                    gender=str(row["gender"]),
                    blood_type=str(row["blood_type"]),
                    medical_condition=str(row["medical_condition"]),
                    date_of_admission=str(row.get("date_of_admission", "")) or None,
                    doctor=str(row.get("doctor", "")) or None,
                    hospital=str(row.get("hospital", "")) or None,
                    insurance_provider=str(row["insurance_provider"]),
                    billing_amount=float(row["billing_amount"]),
                    room_number=int(row.get("room_number", 0)) or None,
                    admission_type=str(row["admission_type"]),
                    discharge_date=str(row.get("discharge_date", "")) or None,
                    medication=str(row["medication"]),
                    test_result=str(row["test_result"]),
                )
            )

        BATCH = 500
        for i in range(0, len(records), BATCH):
            db.bulk_save_objects(records[i : i + BATCH])
            db.commit()
            logger.info("Inserted rows %d–%d", i + 1, min(i + BATCH, len(records)))

        total = db.query(func.count(Patient.id)).scalar()
        logger.info("Load complete. Total rows in DB: %d", total)
        return total

    finally:
        db.close()


if __name__ == "__main__":
    load()