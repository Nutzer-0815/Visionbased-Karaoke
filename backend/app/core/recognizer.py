from __future__ import annotations

import cv2
import numpy as np

_rec_model = None


def load_recognizer() -> None:
    """Load InsightFace buffalo_s recognition model (downloads ~150 MB on first run)."""
    global _rec_model
    from insightface.app import FaceAnalysis

    app = FaceAnalysis(name="buffalo_s", providers=["CPUExecutionProvider"])
    # det_size is required by prepare() but we only use the recognition sub-model.
    app.prepare(ctx_id=-1, det_size=(64, 64))
    _rec_model = app.models.get("recognition") or app.models.get("rec")


def get_embedding(face_crop_bgr: np.ndarray) -> np.ndarray | None:
    """Return an L2-normalised 512-dim embedding for the given BGR face crop."""
    if _rec_model is None:
        return None
    try:
        face = cv2.resize(face_crop_bgr, (112, 112))
        feats = _rec_model.get_feat([face])
        if feats is None or len(feats) == 0:
            return None
        embedding = feats[0].astype(np.float32)
        norm = np.linalg.norm(embedding)
        return embedding / norm if norm > 0 else None
    except Exception:
        return None


def is_loaded() -> bool:
    return _rec_model is not None
