from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from app.ml.train import retrain_model
from app.ml.predict import invalidate_cache
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()


class TrainResponse(BaseModel):
    status: str
    model_name: Optional[str] = None
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1: Optional[float] = None
    confusion_matrix: Optional[List[List[int]]] = None
    message: Optional[str] = None


@router.post("/train", response_model=TrainResponse)
async def trigger_training():
    """
    Trigger a full model retrain. Runs synchronously in a thread pool.
    Returns metrics of the best model found.
    """
    try:
        metrics = await run_in_threadpool(retrain_model)
        invalidate_cache()  # force next prediction to reload the new model

        if metrics is None:
            return TrainResponse(
                status="skipped",
                message="Not enough data to retrain (need at least 50 rows).",
            )

        return TrainResponse(
            status="success",
            model_name=metrics.get("model_name"),
            accuracy=metrics.get("accuracy"),
            precision=metrics.get("precision"),
            recall=metrics.get("recall"),
            f1=metrics.get("f1"),
            confusion_matrix=metrics.get("confusion_matrix"),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
