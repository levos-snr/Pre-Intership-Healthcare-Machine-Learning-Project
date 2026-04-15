from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.db.models import Patient, Prediction
from app.core.config import settings
from pydantic import BaseModel
from typing import Dict, List, Optional
import joblib
import os

router = APIRouter()


class ModelMetrics(BaseModel):
    model_name: str
    accuracy: float
    precision: float
    recall: float
    f1: float
    confusion_matrix: List[List[int]]


class StatsResponse(BaseModel):
    total_patients: int
    total_predictions: int
    result_distribution: Dict[str, int]
    condition_distribution: Dict[str, int]
    model_name: Optional[str] = None
    model_metrics: Optional[ModelMetrics] = None


@router.get("/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    total_patients = db.query(func.count(Patient.id)).scalar() or 0
    total_predictions = db.query(func.count(Prediction.id)).scalar() or 0

    result_rows = (
        db.query(Patient.test_result, func.count(Patient.id))
        .group_by(Patient.test_result)
        .all()
    )
    result_distribution = {row[0]: row[1] for row in result_rows}

    condition_rows = (
        db.query(Patient.medical_condition, func.count(Patient.id))
        .group_by(Patient.medical_condition)
        .all()
    )
    condition_distribution = {row[0]: row[1] for row in condition_rows}

    model_name = None
    model_metrics = None

    if os.path.exists(settings.MODEL_PATH):
        try:
            bundle = joblib.load(settings.MODEL_PATH)
            model_name = bundle.get("model_name")
            raw_metrics = bundle.get("metrics", {})
            if raw_metrics:
                model_metrics = ModelMetrics(
                    model_name=raw_metrics.get("model_name", model_name or ""),
                    accuracy=raw_metrics.get("accuracy", 0.0),
                    precision=raw_metrics.get("precision", 0.0),
                    recall=raw_metrics.get("recall", 0.0),
                    f1=raw_metrics.get("f1", 0.0),
                    confusion_matrix=raw_metrics.get("confusion_matrix", []),
                )
        except Exception:
            pass

    return StatsResponse(
        total_patients=total_patients,
        total_predictions=total_predictions,
        result_distribution=result_distribution,
        condition_distribution=condition_distribution,
        model_name=model_name,
        model_metrics=model_metrics,
    )