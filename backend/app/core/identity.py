from __future__ import annotations

import json
import os
from pathlib import Path

import numpy as np

_STORE_PATH = Path(os.getenv("IDENTITY_STORE_PATH", "data/identities.json"))
_THRESHOLD = float(os.getenv("RECOGNITION_THRESHOLD", "0.4"))


class IdentityStore:
    """Persists face embeddings + names in a local JSON file."""

    def __init__(
        self,
        path: Path = _STORE_PATH,
        threshold: float = _THRESHOLD,
    ) -> None:
        self._path = path
        self.threshold = threshold
        self._entries: list[dict[str, object]] = []
        self._load()

    def _load(self) -> None:
        if self._path.exists():
            try:
                with self._path.open() as f:
                    data = json.load(f)
                if isinstance(data, list):
                    self._entries = data
            except Exception:
                self._entries = []

    def _save(self) -> None:
        self._path.parent.mkdir(parents=True, exist_ok=True)
        with self._path.open("w") as f:
            json.dump(self._entries, f)

    def add(self, name: str, embedding: np.ndarray) -> None:
        """Add or replace an identity by name."""
        self._entries = [e for e in self._entries if e["name"] != name]
        self._entries.append({"name": name, "embedding": embedding.tolist()})
        self._save()

    def remove(self, name: str) -> bool:
        """Remove an identity by name. Returns True if found."""
        before = len(self._entries)
        self._entries = [e for e in self._entries if e["name"] != name]
        if len(self._entries) < before:
            self._save()
            return True
        return False

    def find_match(self, embedding: np.ndarray) -> str | None:
        """Return the name of the best matching identity, or None."""
        best_name: str | None = None
        best_score = -1.0
        for entry in self._entries:
            stored = np.array(entry["embedding"], dtype=np.float32)
            score = float(np.dot(embedding, stored))  # both L2-normalised
            if score > best_score:
                best_score = score
                best_name = entry["name"]
        return best_name if best_score >= self.threshold else None

    @property
    def names(self) -> list[str]:
        return [str(e["name"]) for e in self._entries]
