import logging
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
)

logger = logging.getLogger(__name__)


def evaluate_model(model, X_test, y_test, model_name: str = "model") -> dict:
    """Return a dict of metrics and log a summary."""
    y_pred = model.predict(X_test)

    metrics = {
        "model_name": model_name,
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(
            precision_score(y_test, y_pred, average="weighted", zero_division=0)
        ),
        "recall": float(
            recall_score(y_test, y_pred, average="weighted", zero_division=0)
        ),
        "f1": float(f1_score(y_test, y_pred, average="weighted", zero_division=0)),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
    }

    logger.info(
        "\n%s\nModel : %s\nAccuracy  : %.4f\nPrecision : %.4f\n"
        "Recall    : %.4f\nF1-Score  : %.4f\n%s",
        "=" * 40,
        model_name,
        metrics["accuracy"],
        metrics["precision"],
        metrics["recall"],
        metrics["f1"],
        "=" * 40,
    )

    return metrics