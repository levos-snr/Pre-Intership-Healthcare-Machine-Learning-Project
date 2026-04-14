from pydantic import BaseModel, Field

class PredictRequest(BaseModel):
    age: int = Field(..., ge=1, le=120, alias="Age")
    gender: str = Field(..., alias="Gender")
    blood_type: str = Field(..., alias="Blood Type")
    medical_condition: str = Field(..., alias="Medical Condition")
    billing_amount: float = Field(..., alias="Billing Amount")
    admission_type: str = Field(..., alias="Admission Type")
    insurance_provider: str = Field(..., alias="Insurance Provider")
    medication: str = Field(..., alias="Medication")

    model_config = {"populate_by_name": True}

class PredictResponse(BaseModel):
    predicted_test_result: str
    confidence: float