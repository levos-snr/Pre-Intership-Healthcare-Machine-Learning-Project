from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.db.database import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=True)
    age = Column(Integer, nullable=False)
    gender = Column(String(10), nullable=False)
    blood_type = Column(String(5), nullable=False)
    medical_condition = Column(String(100), nullable=False)
    date_of_admission = Column(String(20), nullable=True)
    doctor = Column(String(100), nullable=True)
    hospital = Column(String(200), nullable=True)
    insurance_provider = Column(String(100), nullable=False)
    billing_amount = Column(Float, nullable=False)
    room_number = Column(Integer, nullable=True)
    admission_type = Column(String(50), nullable=False)
    discharge_date = Column(String(20), nullable=True)
    medication = Column(String(100), nullable=False)
    test_result = Column(String(20), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    age = Column(Integer)
    gender = Column(String(10))
    blood_type = Column(String(5))
    medical_condition = Column(String(100))
    billing_amount = Column(Float)
    admission_type = Column(String(50))
    insurance_provider = Column(String(100))
    medication = Column(String(100))
    predicted_result = Column(String(20))
    confidence = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())