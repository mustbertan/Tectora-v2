from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator


TaskType = Literal["ai", "human"]
TaskStatus = Literal[
    "pending",
    "in_progress",
    "completed",
    "failed",
    "waiting_human",
    "blocked",
]
ProjectStatus = Literal[
    "draft",
    "planning",
    "in_progress",
    "waiting_human",
    "completed",
    "failed",
]


class ProjeTalebi(BaseModel):
    dokuman_metni: str = Field(min_length=10)
    proje_adi: str | None = None


class RevizyonTalebi(BaseModel):
    proje_klasoru: str
    dosya_adi: str
    hata_mesaji: str = Field(min_length=3)


class KomutTalebi(BaseModel):
    proje_klasoru: str
    komut: str = Field(min_length=1)


class InsanGoreviGuncellemesi(BaseModel):
    gorev_id: int
    notlar: str | None = None
    tamamlandi: bool = True


class DevamTalebi(BaseModel):
    proje_klasoru: str
    tamamlanan_insan_gorevleri: list[InsanGoreviGuncellemesi] = Field(default_factory=list)


class TaskRecord(BaseModel):
    id: int
    dosya: str
    islem: str
    tip: TaskType = "ai"
    bagimliliklar: list[int] = Field(default_factory=list)
    durum: TaskStatus = "pending"
    notlar: str | None = None
    hata: str | None = None


class ProjectSnapshot(BaseModel):
    proje_adi: str
    klasor: str
    durum: ProjectStatus
    mimari_kararlar: list[str] = Field(default_factory=list)
    dosyalar: list[str] = Field(default_factory=list)
    tamamlanan_gorevler: list[str] = Field(default_factory=list)
    insan_islemi_gerektirenler: list[TaskRecord] = Field(default_factory=list)
    gorevler: list[TaskRecord] = Field(default_factory=list)
    maliyet_verisi: dict[str, Any] = Field(default_factory=dict)

    @field_validator("tamamlanan_gorevler", mode="before")
    @classmethod
    def normalize_completed_tasks(cls, value: Any) -> list[str]:
        if value is None:
            return []
        if not isinstance(value, list):
            return []
        return [str(item) for item in value if item is not None]

    @field_validator("mimari_kararlar", "dosyalar", mode="before")
    @classmethod
    def normalize_string_lists(cls, value: Any) -> list[str]:
        if value is None:
            return []
        if not isinstance(value, list):
            return []
        return [str(item) for item in value if item is not None]