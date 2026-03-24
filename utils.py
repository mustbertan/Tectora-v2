from __future__ import annotations

import os
import re
import shlex
import shutil
import subprocess
from pathlib import Path
from typing import Iterable


SHELL_METACHAR_PATTERN = re.compile(r"[;&|><`$]")
ALLOWED_COMMANDS = {
    "ls",
    "pwd",
    "find",
    "cat",
    "head",
    "tail",
    "echo",
    "python",
    "python3",
    "pytest",
    "node",
    "npm",
}
DISALLOWED_NPM_SUBCOMMANDS = {"install", "publish", "login", "config", "exec"}
DISALLOWED_SCRIPT_FLAGS = {"-c", "-mhttp.server", "-e"}


def slugify(text: str) -> str:
    normalized = re.sub(r"[^a-zA-Z0-9\s_-]", "", text).strip().lower()
    normalized = re.sub(r"[\s_-]+", "_", normalized)
    return normalized or "tectora_proje"


def güvenli_klasör_olustur(yol: str) -> None:
    os.makedirs(yol, exist_ok=True)


def güvenli_yol_bul(kok_dizin: str, goreli_yol: str) -> str:
    clean_root = os.path.abspath(kok_dizin)
    candidate = os.path.abspath(os.path.join(clean_root, goreli_yol))
    if os.path.commonpath([clean_root, candidate]) != clean_root:
        raise ValueError("Geçersiz dosya yolu. Çalışma alanı dışına çıkılamaz.")
    return candidate


def dosya_yaz(yol: str, icerik: str) -> None:
    os.makedirs(os.path.dirname(yol), exist_ok=True)
    with open(yol, "w", encoding="utf-8") as handle:
        handle.write(icerik)


def dosya_oku(yol: str) -> str:
    with open(yol, "r", encoding="utf-8") as handle:
        return handle.read()


def klasör_mü(dosya_adi: str) -> bool:
    return dosya_adi.endswith("/") or dosya_adi.endswith("\\")


def proje_dosyalarini_listele(kok_dizin: str) -> list[str]:
    root = Path(kok_dizin)
    if not root.exists():
        return []
    entries: list[str] = []
    for path in sorted(root.rglob("*")):
        if path.is_file() and path.name != "tect_memory.json":
            entries.append(path.relative_to(root).as_posix())
    return entries


def komut_calistir(komut: str, calisma_dizini: str, timeout: int = 30) -> dict:
    if not komut.strip():
        raise ValueError("Boş komut çalıştırılamaz.")
    if SHELL_METACHAR_PATTERN.search(komut):
        raise ValueError("Komutta izin verilmeyen shell karakterleri bulundu.")

    args = shlex.split(komut)
    if not args:
        raise ValueError("Komut ayrıştırılamadı.")

    executable = args[0]
    if executable not in ALLOWED_COMMANDS:
        raise ValueError(f"'{executable}' komutuna izin verilmiyor.")
    if shutil.which(executable) is None:
        raise ValueError(f"Sistemde '{executable}' komutu bulunamadı.")

    if executable == "npm" and len(args) > 1 and args[1] in DISALLOWED_NPM_SUBCOMMANDS:
        raise ValueError(f"npm {args[1]} komutu güvenlik nedeniyle kapalı.")
    if executable in {"python", "python3"} and any(flag == "-c" for flag in args[1:]):
        raise ValueError("python -c komutu güvenlik nedeniyle kapalı.")
    if executable == "node" and any(flag == "-e" for flag in args[1:]):
        raise ValueError("node -e komutu güvenlik nedeniyle kapalı.")

    sonuc = subprocess.run(
        args,
        cwd=calisma_dizini,
        capture_output=True,
        text=True,
        timeout=timeout,
        shell=False,
    )
    return {
        "stdout": sonuc.stdout,
        "stderr": sonuc.stderr,
        "exit_code": sonuc.returncode,
        "command": args,
    }


def placeholder_var_mi(text: str) -> bool:
    cleaned = re.sub(r"\s+", " ", text).strip().lower()

    if not cleaned:
        return True

    strong_patterns = [
        r"\btodo\b",
        r"\bfixme\b",
        r"\bplaceholder\b",
        r"\blorem ipsum\b",
        r"\bcoming soon\b",
        r"\bnot implemented\b",
        r"\bimplement here\b",
        r"\badd your code here\b",
        r"\bsample text\b",
        r"\bdummy content\b",
        r"\bburaya .* ekle\b",
    ]

    if any(re.search(pattern, cleaned) for pattern in strong_patterns):
        return True

    # Çok kısa ve anlamsız içerikler
    very_short_suspicious = {
        "test",
        "deneme",
        "placeholder",
        "todo",
        "coming soon",
        "hello world",
    }
    if cleaned in very_short_suspicious:
        return True

    # Yalnızca noktalama / tekrar karakterleri içeren zayıf içerik
    if len(cleaned) < 12 and re.fullmatch(r"[\W_]+", cleaned):
        return True

    # Sadece birkaç kelimelik, içeriksiz şablon metinler
    if len(cleaned) < 30:
        weak_phrases = [
            "content here",
            "text here",
            "example here",
            "coming soon",
            "under construction",
        ]
        if any(phrase in cleaned for phrase in weak_phrases):
            return True

    return False


def dependency_ready(task: dict, completed_ids: Iterable[int]) -> bool:
    completed = set(completed_ids)
    return all(dep in completed for dep in task.get("bagimliliklar", []))