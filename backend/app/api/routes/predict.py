from fastapi import APIRouter, HTTPException
from app.schemas.prediction import PredictRequest, PredictResponse
from app.ml.predict import make_prediction

router = APIRouter()


@router.post("/predict", response_model=PredictResponse)
async def predict(payload: PredictRequest):
    try:
        # IMPORTANT: by_alias=True gives {"Age": 45, "Blood Type": "O+", ...}
        # which matches the column names the scaler/encoders were trained on.
        # Without it you get {"age": 45, "blood_type": "O+"} and only 0-2
        # features are found → "X has 6 features, but StandardScaler expects 8"
        result = make_prediction(payload.model_dump(by_alias=True))
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))