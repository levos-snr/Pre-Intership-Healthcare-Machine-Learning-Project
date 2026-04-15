from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.db.models import Patient
from pydantic import BaseModel
from typing import List, Optional
import math

router = APIRouter()


class PatientOut(BaseModel):
    id: int
    age: int
    gender: str
    blood_type: str
    medical_condition: str
    billing_amount: float
    admission_type: str
    insurance_provider: str
    medication: str
    test_result: str
    date_of_admission: Optional[str] = None

    model_config = {"from_attributes": True}


class PatientsResponse(BaseModel):
    items: List[PatientOut]
    total: int
    page: int
    page_size: int
    total_pages: int


@router.get("/patients", response_model=PatientsResponse)
def list_patients(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    total = db.query(func.count(Patient.id)).scalar()
    offset = (page - 1) * page_size
    patients = db.query(Patient).offset(offset).limit(page_size).all()

    return PatientsResponse(
        items=patients,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=max(1, math.ceil(total / page_size)),
    )