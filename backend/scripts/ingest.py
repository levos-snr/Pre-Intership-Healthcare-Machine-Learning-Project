"""
scripts/ingest.py
Downloads the healthcare dataset from Kaggle and saves it to data/raw/.

Usage (from backend/):
    python scripts/ingest.py

Requires: KAGGLE_USERNAME and KAGGLE_KEY env vars (or ~/.kaggle/kaggle.json)
"""
import os
import shutil
import logging

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger(__name__)

RAW_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
DATASET = "prasad22/healthcare-dataset"
FILENAME = "healthcare_dataset.csv"


def ingest():
    os.makedirs(RAW_DIR, exist_ok=True)
    dest = os.path.join(RAW_DIR, FILENAME)

    if os.path.exists(dest):
        logger.info("Raw file already exists at %s — skipping download.", dest)
        return dest

    logger.info("Downloading dataset '%s' from Kaggle …", DATASET)
    try:
        import kagglehub  # type: ignore

        path = kagglehub.dataset_download(DATASET)
        logger.info("Downloaded to cache: %s", path)

        # Find the CSV inside the downloaded folder
        for root, _, files in os.walk(path):
            for fname in files:
                if fname.endswith(".csv"):
                    src = os.path.join(root, fname)
                    shutil.copy(src, dest)
                    logger.info("Copied %s → %s", src, dest)
                    return dest

        raise FileNotFoundError(f"No CSV found in downloaded dataset at {path}")

    except ImportError:
        logger.error(
            "kagglehub not installed. Run: pip install kagglehub"
        )
        raise
    except Exception as exc:
        logger.error("Download failed: %s", exc)
        raise


if __name__ == "__main__":
    result = ingest()
    logger.info("Ingest complete → %s", result)