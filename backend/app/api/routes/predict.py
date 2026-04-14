from fastapi import APIRouter, HTTPException
from app.schemas.prediction import PredictRequest, PredictResponse
from app.ml.predict import make_prediction

router = APIRouter()

@router.post("/predict", response_model=PredictResponse)
async def predict(payload: PredictRequest):
    try:
        result = make_prediction(payload.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))