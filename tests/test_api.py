from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

from fastapi.testclient import TestClient


DOC_WITH_HUMAN_TASK = """
React dashboard ve backend API içeren bir proje istiyorum.
OpenWeather API anahtarı kullanılacak.
"""

DOC_SIMPLE = """
FastAPI backend API ve temel yönetim ekranı isteyen bir proje.
"""


def load_app(tmp_path, monkeypatch):
    project_root = Path(__file__).resolve().parents[1]
    monkeypatch.setenv("TECTORA_WORKSPACE_DIR", str(tmp_path / "workspace"))
    sys.path.insert(0, str(project_root))
    spec = importlib.util.spec_from_file_location("main", project_root / "main.py")
    module = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(module)
    return module, TestClient(module.app)


def test_start_project_waits_for_human_and_resume(tmp_path, monkeypatch):
    main_module, client = load_app(tmp_path, monkeypatch)

    response = client.post("/uretime-basla", json={"dokuman_metni": DOC_WITH_HUMAN_TASK})
    assert response.status_code == 200, response.text

    payload = response.json()
    project = payload["proje"]
    assert project["durum"] == "waiting_human"
    assert any(task["tip"] == "human" for task in project["gorevler"])

    project_dir = Path(main_module.WORKSPACE_DIR) / project["klasor"]
    assert (project_dir / "README.md").exists()
    assert (project_dir / "backend" / "main.py").exists()
    assert (project_dir / "frontend" / "src" / "App.jsx").exists()

    waiting_task = next(task for task in project["gorevler"] if task["tip"] == "human")
    resume_response = client.post(
        "/devam-et",
        json={
            "proje_klasoru": project["klasor"],
            "tamamlanan_insan_gorevleri": [
                {"gorev_id": waiting_task["id"], "notlar": "API anahtarı eklendi", "tamamlandi": True}
            ],
        },
    )
    assert resume_response.status_code == 200, resume_response.text
    resumed_project = resume_response.json()["proje"]
    assert resumed_project["durum"] == "completed"


def test_revision_and_command_security(tmp_path, monkeypatch):
    _, client = load_app(tmp_path, monkeypatch)

    response = client.post("/uretime-basla", json={"dokuman_metni": DOC_SIMPLE})
    assert response.status_code == 200, response.text
    project = response.json()["proje"]
    assert project["durum"] in {"completed", "waiting_human"}

    revision = client.post(
        "/revize-et",
        json={
            "proje_klasoru": project["klasor"],
            "dosya_adi": "README.md",
            "hata_mesaji": "Kurulum adımlarını daha net yaz.",
        },
    )
    assert revision.status_code == 200, revision.text

    files_response = client.get(f"/projeler/{project['klasor']}/dosyalar")
    assert files_response.status_code == 200
    files = {item["yol"]: item["icerik"] for item in files_response.json()["dosyalar"]}
    assert "README.md" in files
    assert "Revizyon" in files["README.md"]

    safe_command = client.post(
        "/komut-calistir",
        json={"proje_klasoru": project["klasor"], "komut": "pwd"},
    )
    assert safe_command.status_code == 200
    assert project["klasor"] in safe_command.json()["cikti"]["stdout"]

    unsafe_command = client.post(
        "/komut-calistir",
        json={"proje_klasoru": project["klasor"], "komut": "python -c 'print(1)'"},
    )
    assert unsafe_command.status_code == 400
    assert "güvenlik" in unsafe_command.json()["detail"].lower()
