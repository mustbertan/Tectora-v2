from __future__ import annotations

import json
import os
from copy import deepcopy
from datetime import datetime, timezone
from typing import Any

from models import ProjectSnapshot, TaskRecord


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _normalize_completed_tasks(values: Any) -> list[str]:
    if not isinstance(values, list):
        return []
    return [str(v) for v in values if v is not None]


class ProjectMemory:
    def __init__(self, folder_path: str):
        self.folder_path = folder_path
        self.path = os.path.join(folder_path, "tect_memory.json")
        self.data = self._default()

    def _default(self) -> dict[str, Any]:
        return {
            "proje_adi": "",
            "slug": "",
            "proje_amaci": "",
            "mimari_kararlar": [],
            "durum": "draft",
            "aktif_asama": "hazirlaniyor",
            "olusturulma_zamani": _utc_now(),
            "guncellenme_zamani": _utc_now(),
            "maliyet_verisi": {},
            "dosya_yapisi": {},
            "tamamlanan_gorevler": [],
            "gorevler": [],
            "olaylar": [],
        }

    def exists(self) -> bool:
        return os.path.exists(self.path)

    def oku(self) -> dict[str, Any]:
        if self.exists():
            with open(self.path, "r", encoding="utf-8") as handle:
                self.data = json.load(handle)

            # Geriye dönük uyumluluk:
            # eski memory dosyalarında tamamlanan_gorevler integer içerebilir
            self.data["tamamlanan_gorevler"] = _normalize_completed_tasks(
                self.data.get("tamamlanan_gorevler", [])
            )
        return self.data

    def kaydet(self) -> None:
        os.makedirs(self.folder_path, exist_ok=True)
        self.data["guncellenme_zamani"] = _utc_now()
        self.data["tamamlanan_gorevler"] = _normalize_completed_tasks(
            self.data.get("tamamlanan_gorevler", [])
        )
        with open(self.path, "w", encoding="utf-8") as handle:
            json.dump(self.data, handle, indent=2, ensure_ascii=False)

    def bootstrap(
        self,
        proje_adi: str,
        slug: str,
        proje_amaci: str,
        mimari_kararlar: list[str],
        gorevler: list[dict[str, Any]],
        maliyet_verisi: dict[str, Any],
    ) -> None:
        self.data = self._default()
        self.data.update(
            {
                "proje_adi": proje_adi,
                "slug": slug,
                "proje_amaci": proje_amaci,
                "mimari_kararlar": mimari_kararlar,
                "durum": "planning",
                "aktif_asama": "planlama",
                "maliyet_verisi": maliyet_verisi,
                "gorevler": [TaskRecord(**gorev).model_dump() for gorev in gorevler],
                "tamamlanan_gorevler": [],
            }
        )
        self.kaydet()

    def log_event(self, message: str) -> None:
        self.data.setdefault("olaylar", []).append(
            {"zaman": _utc_now(), "mesaj": message}
        )
        self.kaydet()

    def get_task(self, task_id: int) -> dict[str, Any]:
        for task in self.data.get("gorevler", []):
            if task["id"] == task_id:
                return task
        raise KeyError(f"Görev bulunamadı: {task_id}")

    def update_task(self, task_id: int, **updates: Any) -> dict[str, Any]:
        task = self.get_task(task_id)
        task.update(updates)

        if updates.get("durum") == "completed":
            entry = f"#{task['id']} {task['dosya']}"
            completed = _normalize_completed_tasks(
                self.data.get("tamamlanan_gorevler", [])
            )
            if entry not in completed:
                completed.append(entry)
            self.data["tamamlanan_gorevler"] = completed

        self.kaydet()
        return task

    def mark_file(self, relative_path: str, status: str) -> None:
        self.data.setdefault("dosya_yapisi", {})[relative_path] = status
        self.kaydet()

    def completed_task_ids(self) -> set[int]:
        return {
            task["id"]
            for task in self.data.get("gorevler", [])
            if task.get("durum") == "completed"
        }

    def snapshot(self) -> ProjectSnapshot:
        waiting = [
            TaskRecord(**task)
            for task in self.data.get("gorevler", [])
            if task.get("durum") == "waiting_human"
        ]
        tasks = [TaskRecord(**task) for task in self.data.get("gorevler", [])]

        return ProjectSnapshot(
            proje_adi=self.data.get("proje_adi", ""),
            klasor=self.data.get("slug", ""),
            durum=self.data.get("durum", "draft"),
            mimari_kararlar=deepcopy(self.data.get("mimari_kararlar", [])),
            dosyalar=sorted(self.data.get("dosya_yapisi", {}).keys()),
            tamamlanan_gorevler=_normalize_completed_tasks(
                self.data.get("tamamlanan_gorevler", [])
            ),
            insan_islemi_gerektirenler=waiting,
            gorevler=tasks,
            maliyet_verisi=deepcopy(self.data.get("maliyet_verisi", {})),
        )