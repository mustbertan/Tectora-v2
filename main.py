from __future__ import annotations

import asyncio
import os
from contextlib import suppress
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from agents import TectoraOrchestrator
from memory import ProjectMemory
from models import DevamTalebi, KomutTalebi, ProjeTalebi, RevizyonTalebi
from utils import (
    dependency_ready,
    dosya_oku,
    dosya_yaz,
    güvenli_klasör_olustur,
    güvenli_yol_bul,
    klasör_mü,
    komut_calistir,
    proje_dosyalarini_listele,
    slugify,
)
from validators import validate_generated_content

try:
    import anthropic  # type: ignore
except Exception:
    anthropic = None


BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

WORKSPACE_DIR = os.environ.get(
    "TECTORA_WORKSPACE_DIR",
    os.path.join(os.getcwd(), "workspace"),
)
ALLOW_ORIGINS = os.environ.get("TECTORA_ALLOW_ORIGINS", "*").split(",")


def create_client() -> Any | None:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key or anthropic is None:
        return None
    return anthropic.Anthropic(api_key=api_key)


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        with suppress(ValueError):
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str) -> None:
        stale: list[WebSocket] = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                stale.append(connection)
        for item in stale:
            self.disconnect(item)


manager = ConnectionManager()
app = FastAPI(title="Tectora API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = TectoraOrchestrator(create_client())


def _project_dir(slug: str) -> str:
    güvenli_klasör_olustur(WORKSPACE_DIR)
    return güvenli_yol_bul(WORKSPACE_DIR, slug)


def _load_memory(slug: str) -> ProjectMemory:
    project_dir = _project_dir(slug)
    memory = ProjectMemory(project_dir)
    if not memory.exists():
        raise HTTPException(status_code=404, detail="Proje bulunamadı.")
    memory.oku()
    return memory


async def _log(message: str) -> None:
    orchestrator.log_ekle(message)
    await manager.broadcast(message)


async def _execute_plan(memory: ProjectMemory) -> None:
    await _log("🚀 Üretim akışı başlatıldı")
    memory.data["durum"] = "in_progress"
    memory.data["aktif_asama"] = "uretim"
    memory.kaydet()

    while True:
        progress = False
        waiting_human = False
        completed_ids = memory.completed_task_ids()

        for task in memory.data.get("gorevler", []):
            if task["durum"] == "completed":
                continue

            if task["tip"] == "human":
                if task["durum"] != "waiting_human":
                    task["durum"] = "waiting_human"
                    memory.kaydet()
                    await _log(f"🧑 İnsan adımı bekleniyor: #{task['id']} {task['islem']}")
                waiting_human = True
                continue

            if not dependency_ready(task, completed_ids):
                if task["durum"] != "blocked":
                    task["durum"] = "blocked"
                    memory.kaydet()
                continue

            progress = True
            task["durum"] = "in_progress"
            task["hata"] = None
            memory.kaydet()
            await _log(f"🛠️ Görev başladı: #{task['id']} {task['dosya']}")

            try:
                relative_path = task["dosya"]

                if klasör_mü(relative_path):
                    güvenli_klasör_olustur(güvenli_yol_bul(memory.folder_path, relative_path))
                    memory.mark_file(relative_path.rstrip("/\\") + "/", "klasor")
                    memory.update_task(task["id"], durum="completed")
                    completed_ids = memory.completed_task_ids()
                    await _log(f"📁 Klasör hazır: {relative_path}")
                    continue

                target_path = güvenli_yol_bul(memory.folder_path, relative_path)
                mevcut_icerik = dosya_oku(target_path) if os.path.exists(target_path) else ""
                taslak = orchestrator.kod_yaz(task, memory.oku(), mevcut_icerik)
                final_content, issues = orchestrator.denetle_ve_duzelt(
                    relative_path,
                    taslak,
                    memory.oku(),
                )

                validation = validate_generated_content(relative_path, final_content)
                issues = list(dict.fromkeys(issues + validation.issues))

                if issues:
                    raise ValueError("; ".join(issues))

                dosya_yaz(target_path, final_content)
                memory.mark_file(relative_path, "tamamlandi")
                memory.update_task(task["id"], durum="completed", notlar="Dosya üretildi.")
                completed_ids = memory.completed_task_ids()
                await _log(f"✅ Dosya yazıldı: {relative_path}")

            except Exception as exc:
                task["durum"] = "failed"
                task["hata"] = str(exc)
                memory.kaydet()
                memory.data["durum"] = "failed"
                memory.kaydet()
                await _log(f"❌ Görev başarısız: #{task['id']} {task['dosya']} -> {exc}")
                raise HTTPException(status_code=500, detail=str(exc)) from exc

        if waiting_human:
            memory.data["durum"] = "waiting_human"
            memory.data["aktif_asama"] = "insan_girdisi"
            memory.kaydet()
            await _log("⏸️ Süreç insan girdisi beklediği için duraklatıldı")
            break

        if all(task["durum"] == "completed" for task in memory.data.get("gorevler", [])):
            memory.data["durum"] = "completed"
            memory.data["aktif_asama"] = "tamamlandi"
            memory.kaydet()
            await _log("🏁 Üretim tamamlandı")
            break

        if not progress:
            memory.data["durum"] = "failed"
            memory.data["aktif_asama"] = "kilitlendi"
            memory.kaydet()
            await _log("❌ Akış ilerleyemedi; bağımlılık veya plan sorunu var")
            raise HTTPException(
                status_code=500,
                detail="Görevler ilerleyemedi; plan bağımlılıklarını kontrol edin.",
            )


@app.get("/")
def read_root() -> dict[str, Any]:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    return {
        "mesaj": "Tectora Modüler API Sistemi Aktif!",
        "llm_aktif": orchestrator.llm_enabled,
        "workspace": WORKSPACE_DIR,
        "env_var_goruldu": bool(api_key),
        "api_key_prefix": api_key[:12] if api_key else None,
    }


@app.get("/projeler")
def list_projects() -> dict[str, Any]:
    güvenli_klasör_olustur(WORKSPACE_DIR)
    projects = []

    for entry in sorted(os.listdir(WORKSPACE_DIR)):
        project_dir = os.path.join(WORKSPACE_DIR, entry)
        if not os.path.isdir(project_dir):
            continue

        memory = ProjectMemory(project_dir)
        if not memory.exists():
            continue

        memory.oku()
        projects.append(memory.snapshot().model_dump())

    return {"durum": "basarili", "projeler": projects}


@app.get("/projeler/{slug}")
def get_project(slug: str) -> dict[str, Any]:
    memory = _load_memory(slug)
    memory.data["dosya_yapisi"] = {
        path: "tamamlandi" for path in proje_dosyalarini_listele(memory.folder_path)
    } | memory.data.get("dosya_yapisi", {})
    memory.kaydet()
    return {"durum": "basarili", "proje": memory.snapshot().model_dump()}


@app.get("/projeler/{slug}/dosyalar")
def get_project_files(slug: str) -> dict[str, Any]:
    memory = _load_memory(slug)
    files = []

    for relative_path in proje_dosyalarini_listele(memory.folder_path):
        file_path = güvenli_yol_bul(memory.folder_path, relative_path)
        files.append({"yol": relative_path, "icerik": dosya_oku(file_path)})

    return {"durum": "basarili", "dosyalar": files}


@app.websocket("/ws/logs")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await manager.connect(websocket)
    try:
        while True:
            await asyncio.sleep(10)
            await websocket.send_text("heartbeat")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)


@app.post("/analiz-et")
def analiz_et(talep: ProjeTalebi) -> dict[str, Any]:
    return orchestrator.proje_analiz_et(talep.dokuman_metni, talep.proje_adi)


@app.post("/uretime-basla")
async def uretime_basla(talep: ProjeTalebi) -> dict[str, Any]:
    analiz = orchestrator.proje_analiz_et(talep.dokuman_metni, talep.proje_adi)
    plan = orchestrator.plan_yap(talep.dokuman_metni, talep.proje_adi)
    slug = slugify(plan["proje_adi"])
    project_dir = _project_dir(slug)
    güvenli_klasör_olustur(project_dir)

    memory = ProjectMemory(project_dir)
    memory.bootstrap(
        proje_adi=plan["proje_adi"],
        slug=slug,
        proje_amaci=talep.dokuman_metni,
        mimari_kararlar=plan["mimari"],
        gorevler=plan["gorevler"],
        maliyet_verisi=analiz["maliyet_verisi"],
    )

    await _execute_plan(memory)

    return {
        "durum": "basarili",
        "proje": memory.snapshot().model_dump(),
        "analiz": analiz,
    }


@app.post("/devam-et")
async def devam_et(talep: DevamTalebi) -> dict[str, Any]:
    memory = _load_memory(talep.proje_klasoru)

    for update in talep.tamamlanan_insan_gorevleri:
        task = memory.get_task(update.gorev_id)
        if task["tip"] != "human":
            raise HTTPException(
                status_code=400,
                detail=f"Görev {update.gorev_id} insan görevi değil.",
            )

        new_status = "completed" if update.tamamlandi else "waiting_human"
        memory.update_task(update.gorev_id, durum=new_status, notlar=update.notlar)
        await _log(f"🧑 İnsan görevi güncellendi: #{update.gorev_id} -> {new_status}")

    await _execute_plan(memory)
    return {"durum": "basarili", "proje": memory.snapshot().model_dump()}


@app.post("/revize-et")
async def revize_et(talep: RevizyonTalebi) -> dict[str, Any]:
    memory = _load_memory(talep.proje_klasoru)
    target_path = güvenli_yol_bul(memory.folder_path, talep.dosya_adi)

    if not os.path.exists(target_path):
        raise HTTPException(status_code=404, detail="Revize edilecek dosya bulunamadı.")

    await _log(f"🛠️ Revizyon başladı: {talep.dosya_adi}")

    mevcut = dosya_oku(target_path)
    yeni = orchestrator.revize_et(
        talep.dosya_adi,
        mevcut,
        talep.hata_mesaji,
        memory.oku(),
    )

    final_content, issues = orchestrator.denetle_ve_duzelt(
        talep.dosya_adi,
        yeni,
        memory.oku(),
    )

    validation = validate_generated_content(talep.dosya_adi, final_content)
    issues = list(dict.fromkeys(issues + validation.issues))

    if issues:
        raise HTTPException(
            status_code=422,
            detail={
                "mesaj": "Revizyon doğrulamadan geçmedi.",
                "issues": issues,
            },
        )

    dosya_yaz(target_path, final_content)
    memory.mark_file(talep.dosya_adi, "revize_edildi")
    await _log(f"✅ Revizyon tamamlandı: {talep.dosya_adi}")
    return {"durum": "basarili", "dosya": talep.dosya_adi}


@app.post("/komut-calistir")
async def terminal_komutu_calistir(talep: KomutTalebi) -> dict[str, Any]:
    memory = _load_memory(talep.proje_klasoru)
    await _log(f"💻 Komut çalıştırılıyor: {talep.komut}")

    try:
        result = komut_calistir(talep.komut, memory.folder_path)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    await _log(f"✅ Komut tamamlandı (kod={result['exit_code']})")
    return {"durum": "basarili", "cikti": result}