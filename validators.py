from __future__ import annotations

import ast
import json
import os
import re
import shutil
import subprocess
import tempfile
from dataclasses import dataclass, field
from html.parser import HTMLParser

from utils import placeholder_var_mi


@dataclass
class ValidationResult:
    ok: bool
    issues: list[str] = field(default_factory=list)


class _StrictHTMLParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.errors: list[str] = []

    def error(self, message: str) -> None:  # pragma: no cover
        self.errors.append(message)


def kod_temizle(text: str) -> str:
    cleaned = re.sub(r"```(?:\w+)?\n?(.*?)```", r"\1", text, flags=re.DOTALL)
    return cleaned.strip()


def _normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip().lower()


def _placeholder_issue(filename: str, cleaned: str) -> str | None:
    """
    Agresif false-positive üretmemesi için placeholder kontrolünü bağlamsal yap.
    Sadece gerçekten şablon/tembel içerik varsa hata ver.
    """
    normalized = _normalize_text(cleaned)
    ext = os.path.splitext(filename)[1].lower()

    strong_patterns = [
        r"\btodo\b",
        r"\bfixme\b",
        r"\bplaceholder\b",
        r"\blorem ipsum\b",
        r"\bcoming soon\b",
        r"\badd your code here\b",
        r"\bimplement here\b",
        r"\bnot implemented\b",
        r"\bdummy content\b",
        r"\bsample text\b",
    ]

    matched_strong = any(re.search(pattern, normalized) for pattern in strong_patterns)

    # utils içindeki kontrolü de destekleyelim ama tek başına yeterli saymayalım
    util_flag = placeholder_var_mi(cleaned)

    # Çok kısa ve anlamsız içerikse daha şüpheli
    too_short = len(cleaned.strip()) < 40

    # Bazı dosya türlerinde kısa ama geçerli içerik olabilir
    # Bu yüzden koşulları birlikte arıyoruz.
    if matched_strong and too_short:
        return "Çıktıda placeholder / TODO benzeri tembel içerik var."

    if matched_strong and ext in {".html", ".js", ".jsx", ".ts", ".tsx", ".css", ".md"}:
        return "Çıktıda placeholder / TODO benzeri tembel içerik var."

    if util_flag and too_short:
        return "Çıktıda placeholder / TODO benzeri tembel içerik var."

    return None


def validate_generated_content(filename: str, content: str) -> ValidationResult:
    issues: list[str] = []
    ext = os.path.splitext(filename)[1].lower()
    cleaned = kod_temizle(content)

    if not cleaned.strip():
        issues.append("Çıktı boş.")
        return ValidationResult(ok=False, issues=issues)

    if "```" in content:
        issues.append("Markdown kod bloğu işaretleri çıktıdan temizlenmeli.")

    placeholder_issue = _placeholder_issue(filename, cleaned)
    if placeholder_issue:
        issues.append(placeholder_issue)

    if ext == ".py":
        try:
            ast.parse(cleaned)
        except SyntaxError as exc:
            issues.append(f"Python sözdizimi hatası: {exc.msg} (satır {exc.lineno})")

    elif ext == ".json":
        try:
            json.loads(cleaned)
        except json.JSONDecodeError as exc:
            issues.append(f"JSON hatası: {exc.msg} (satır {exc.lineno})")

    elif ext == ".html":
        parser = _StrictHTMLParser()
        parser.feed(cleaned)
        if parser.errors:
            issues.extend(parser.errors)

        lowered = cleaned.lower()
        if "<html" not in lowered:
            issues.append("HTML kök etiketi eksik.")
        if "<body" not in lowered:
            issues.append("HTML body etiketi eksik.")

        # Çok zayıf HTML'leri engelle
        if len(cleaned) < 120:
            issues.append("HTML içeriği çok kısa; gerçek sayfa yapısı bekleniyor.")

        if "<div" not in lowered and "<main" not in lowered and "<section" not in lowered:
            issues.append("HTML içeriği çok zayıf; temel sayfa yapısı eksik.")

    elif ext == ".css":
        suspicious = ["<html", "<body", "function ", "export default"]
        if any(token in cleaned.lower() for token in suspicious):
            issues.append("CSS dosyasında farklı dil parçaları bulundu.")

        if len(cleaned) < 20:
            issues.append("CSS içeriği çok kısa.")

    elif ext in {".js", ".mjs", ".cjs"}:
        if shutil.which("node"):
            with tempfile.NamedTemporaryFile("w", suffix=ext, delete=False, encoding="utf-8") as handle:
                handle.write(cleaned)
                temp_path = handle.name
            try:
                proc = subprocess.run(
                    ["node", "--check", temp_path],
                    capture_output=True,
                    text=True,
                    timeout=15,
                )
                if proc.returncode != 0:
                    issues.append(proc.stderr.strip() or "JavaScript sözdizimi hatası")
            finally:
                os.unlink(temp_path)

        if len(cleaned) < 30:
            issues.append("JavaScript içeriği çok kısa.")

    elif ext in {".jsx", ".tsx"}:
        lowered = cleaned.lower()
        if "export default" not in cleaned and "function" not in cleaned:
            issues.append("Bileşen çıktısı geçerli görünmüyor; export/function bulunamadı.")

        if len(cleaned) < 40:
            issues.append("Bileşen içeriği çok kısa.")

        if "<" not in cleaned and "return (" not in cleaned and "return " not in cleaned:
            issues.append("Bileşen çıktısında görünür arayüz yapısı bulunamadı.")

        if "todo" in lowered and len(cleaned) < 200:
            issues.append("JSX çıktısı placeholder içeriyor görünüyor.")

    elif ext == ".md":
        if len(cleaned) < 30:
            issues.append("Markdown içeriği çok kısa.")

    if cleaned.startswith("# ") and ext in {".html", ".js", ".css"}:
        issues.append("Yanlış dosya türü: Markdown başlığı ile başlıyor.")

    return ValidationResult(ok=not issues, issues=issues)