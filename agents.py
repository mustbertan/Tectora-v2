from __future__ import annotations

import json
import re
from typing import Any

from validators import kod_temizle, validate_generated_content


class TectoraOrchestrator:
    def __init__(self, client: Any | None = None):
        self.client = client
        self.sonnet = "claude-sonnet-4-6"
        self.haiku = "claude-haiku-4-5-20251001"
        self.logs: list[str] = []

    def log_ekle(self, mesaj: str) -> None:
        self.logs.append(mesaj)

    @property
    def llm_enabled(self) -> bool:
        return self.client is not None

    def proje_analiz_et(self, proje_tanimi: str, proje_adi: str | None = None) -> dict[str, Any]:
        if self.llm_enabled:
            prompt = f"""
Sen Tectora'nın analiz ajanısın.
Kullanıcının proje dokümanını kod yazmadan değerlendir.
ÇIKTI ŞEKLİ:
1. Stratejik Özet
2. Teknik Mimari Planı
3. Eksik Gereksinimler
4. Yaratıcı Üretim Önerileri
5. Risk Analizi
6. Önerilen İlk Sprint

DOKÜMAN:
{proje_tanimi}
""".strip()
            mesaj = self.client.messages.create(
                model=self.sonnet,
                max_tokens=1200,
                messages=[{"role": "user", "content": prompt}],
            )
            rapor = kod_temizle(mesaj.content[0].text)
            maliyet = self._maliyet_hesapla(mesaj)
            return {
                "durum": "basarili",
                "analiz_sonucu": rapor,
                "maliyet_verisi": maliyet,
            }

        slug_source = proje_adi or self._project_title_from_doc(proje_tanimi)
        rapor = """1. Stratejik Özet
Bu proje için önce güvenli görev planı, dosya doğrulaması ve pause/resume akışı kurulmalı.

2. Teknik Mimari Planı
Backend: FastAPI
Durum Kaydı: JSON tabanlı proje hafızası
Üretim: LLM + deterministic fallback
Doğrulama: uzantı bazlı syntax/structure kontrolü
Frontend: React + Vite yönetim paneli

3. Eksik Gereksinimler
- İnsan müdahalesi gereken görevlerin geri dönüş formatı net olmalı.
- Komut çalıştırma yetki sınırları tanımlanmalı.
- Revizyon akışı mevcut dosya içeriğini kullanmalı.

4. Yaratıcı Üretim Önerileri
- Proje ilerleme zaman çizelgesi eklenebilir.
- Dosya önizleme ve görev bağımlılık grafiği gösterilebilir.
- Başarısız üretimler için otomatik validation feedback döngüsü kullanılmalı.

5. Risk Analizi
- LLM çıktıları doğrulanmadan diske yazılırsa kırık dosyalar oluşur.
- Güvensiz shell komutları ürün güvenliğini bozar.
- İnsan adımlarında resume yoksa süreç kilitlenir.

6. Önerilen İlk Sprint
- Güvenli workspace
- Kalıcı task state
- Validation
- Resume endpoint
- Dosya bazlı revizyon
"""
        return {
            "durum": "basarili",
            "analiz_sonucu": rapor,
            "maliyet_verisi": {
                "input": len(proje_tanimi.split()),
                "output": len(rapor.split()),
                "tahmini_dolar": 0.0,
                "not": f"LLM yapılandırılmadığı için offline analiz modu kullanıldı ({slug_source}).",
            },
        }

    def plan_yap(self, proje_tanimi: str, proje_adi: str | None = None) -> dict[str, Any]:
        self.log_ekle("📋 Plan oluşturuluyor")

        if self.llm_enabled:
            prompt = f"""
Sen Tectora Koordinatörüsün.
Aşağıdaki dokümandan üretim planı çıkar.

Sadece geçerli JSON döndür.
Açıklama ekleme.
Markdown kullanma.
JSON şeması dışına çıkma.
Tüm property adları çift tırnaklı olsun.
Virgül hatası yapma.

Şema:
{{
  "proje_adi": "...",
  "mimari": ["..."],
  "gorevler": [
    {{
      "id": 1,
      "dosya": "backend/main.py",
      "islem": "...",
      "tip": "ai",
      "bagimliliklar": []
    }}
  ]
}}

Kurallar:
- Görevler atomik olsun.
- İnsan görevi gerekiyorsa tip=human kullan.
- bagimliliklar alanını mutlaka ver.
- dosya alanı klasör ise slash ile bitsin.
- JSON dışında hiçbir şey yazma.

Doküman:
{proje_tanimi}
""".strip()

            response = self.client.messages.create(
                model=self.sonnet,
                max_tokens=1800,
                temperature=0,
                messages=[{"role": "user", "content": prompt}],
            )

            first_text = response.content[0].text

            try:
                plan = self._json_temizle(first_text)
            except Exception:
                try:
                    repair_prompt = f"""
Aşağıdaki model çıktısını geçerli JSON'a dönüştür.

Kurallar:
- Sadece JSON döndür.
- Açıklama yazma.
- Markdown code fence kullanma.
- Şema dışına çıkma.
- String'lerde çift tırnak kullan.

ÇIKTI:
{first_text}
""".strip()

                    repair = self.client.messages.create(
                        model=self.haiku,
                        max_tokens=2200,
                        temperature=0,
                        messages=[{"role": "user", "content": repair_prompt}],
                    )
                    plan = self._json_temizle(repair.content[0].text)
                except Exception:
                    plan = self._fallback_plan(proje_tanimi, proje_adi)

            return self._normalize_plan(plan, proje_tanimi, proje_adi)

        plan = self._fallback_plan(proje_tanimi, proje_adi)
        return self._normalize_plan(plan, proje_tanimi, proje_adi)

    def kod_yaz(self, gorev: dict[str, Any], hafiza: dict[str, Any], mevcut_icerik: str = "") -> str:
        if self.llm_enabled:
            proje_ozeti = json.dumps(
                {
                    "proje_adi": hafiza.get("proje_adi"),
                    "mimari_kararlar": hafiza.get("mimari_kararlar", []),
                    "dosyalar": list(hafiza.get("dosya_yapisi", {}).keys()),
                },
                ensure_ascii=False,
            )
            prompt = f"""
Sen Tectora'nın uygulayıcı ajanısın.
Aşağıdaki dosya için SADECE dosya içeriğini üret.
Mevcut kodu tamamen bozma; tutarlı devam et.

Dosya: {gorev['dosya']}
Görev: {gorev['islem']}
Proje Özeti: {proje_ozeti}
Mevcut İçerik:
{mevcut_icerik or '[boş]'}
""".strip()

            response = self.client.messages.create(
                model=self.sonnet,
                max_tokens=4000,
                messages=[{"role": "user", "content": prompt}],
            )
            return kod_temizle(response.content[0].text)

        return self._fallback_file_content(gorev, hafiza, mevcut_icerik)

    def revize_et(
        self,
        dosya_adi: str,
        mevcut_icerik: str,
        hata_mesaji: str,
        hafiza: dict[str, Any],
    ) -> str:
        if self.llm_enabled:
            prompt = f"""
Bir dosyayı hedefli revize et.
SADECE dosyanın yeni halini döndür.

Dosya: {dosya_adi}
Hata / İstek: {hata_mesaji}
Mimari: {json.dumps(hafiza.get('mimari_kararlar', []), ensure_ascii=False)}
Mevcut İçerik:
{mevcut_icerik}
""".strip()

            response = self.client.messages.create(
                model=self.sonnet,
                max_tokens=4000,
                messages=[{"role": "user", "content": prompt}],
            )
            return kod_temizle(response.content[0].text)

        fallback_task = {"dosya": dosya_adi, "islem": hata_mesaji}
        return self._fallback_file_content(fallback_task, hafiza, mevcut_icerik)

    def denetle_ve_duzelt(self, dosya_adi: str, icerik: str, hafiza: dict[str, Any]) -> tuple[str, list[str]]:
        cleaned = kod_temizle(icerik)
        result = validate_generated_content(dosya_adi, cleaned)

        if result.ok or not self.llm_enabled:
            return cleaned, result.issues

        prompt = f"""
Dosyayı düzelt.
SADECE düzeltilmiş dosya içeriğini döndür.

Dosya: {dosya_adi}
Sorunlar: {json.dumps(result.issues, ensure_ascii=False)}
Mevcut İçerik:
{cleaned}
""".strip()

        response = self.client.messages.create(
            model=self.haiku,
            max_tokens=3000,
            messages=[{"role": "user", "content": prompt}],
        )
        revised = kod_temizle(response.content[0].text)
        second_pass = validate_generated_content(dosya_adi, revised)
        return revised, second_pass.issues

    def _maliyet_hesapla(self, mesaj: Any) -> dict[str, Any]:
        input_tokens = getattr(mesaj.usage, "input_tokens", 0)
        output_tokens = getattr(mesaj.usage, "output_tokens", 0)
        cost = (input_tokens * 0.000003) + (output_tokens * 0.000015)
        return {
            "input": input_tokens,
            "output": output_tokens,
            "tahmini_dolar": round(cost, 5),
        }

    def _extract_first_json_object(self, text: str) -> str:
        start = text.find("{")
        if start == -1:
            raise ValueError("Model çıktısında JSON nesnesi bulunamadı.")

        depth = 0
        in_string = False
        escape = False

        for i in range(start, len(text)):
            ch = text[i]

            if in_string:
                if escape:
                    escape = False
                elif ch == "\\":
                    escape = True
                elif ch == '"':
                    in_string = False
                continue

            if ch == '"':
                in_string = True
            elif ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    return text[start:i + 1]

        raise ValueError("Tam JSON nesnesi çıkarılamadı.")

    def _json_temizle(self, text: str) -> dict[str, Any]:
        cleaned = text.strip()

        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)

        json_str = self._extract_first_json_object(cleaned)
        json_str = re.sub(r",(\s*[}\]])", r"\1", json_str)
        json_str = json_str.replace("\u201c", '"').replace("\u201d", '"')
        json_str = json_str.replace("\u2018", "'").replace("\u2019", "'")

        try:
            return json.loads(json_str)
        except json.JSONDecodeError as exc:
            raise ValueError(
                f"Model geçerli JSON döndürmedi. Hata: {exc}. Ayrıştırılan içerik:\n{json_str}"
            ) from exc

    def _normalize_plan(
        self,
        plan: dict[str, Any],
        proje_tanimi: str,
        proje_adi: str | None,
    ) -> dict[str, Any]:
        tasks = []
        for idx, task in enumerate(plan.get("gorevler", []), start=1):
            tasks.append(
                {
                    "id": int(task.get("id", idx)),
                    "dosya": task["dosya"],
                    "islem": task.get("islem", f"{task['dosya']} dosyasını üret"),
                    "tip": task.get("tip", "ai"),
                    "bagimliliklar": task.get("bagimliliklar", []),
                    "durum": task.get("durum", "pending"),
                    "notlar": task.get("notlar"),
                    "hata": task.get("hata"),
                }
            )

        mimari = plan.get("mimari", [])
        if isinstance(mimari, str):
            mimari = [mimari]

        return {
            "proje_adi": plan.get("proje_adi") or proje_adi or self._project_title_from_doc(proje_tanimi),
            "mimari": mimari or ["FastAPI", "React", "JSON project memory"],
            "gorevler": tasks,
        }

    def _project_title_from_doc(self, text: str) -> str:
        first_line = next((line.strip() for line in text.splitlines() if line.strip()), "Tectora Proje")
        title = re.sub(r"[^\w\s-]", "", first_line)[:50].strip()
        return title or "Tectora Proje"

    def _fallback_plan(self, proje_tanimi: str, proje_adi: str | None) -> dict[str, Any]:
        lowered = proje_tanimi.lower()
        wants_frontend = any(token in lowered for token in ["react", "vite", "frontend", "arayüz", "dashboard", "ui"])
        wants_backend = any(token in lowered for token in ["api", "backend", "fastapi", "sunucu", "websocket"])
        wants_weather_key = any(token in lowered for token in ["api anahtarı", "openweather", "secret", "env"])

        tasks: list[dict[str, Any]] = [
            {
                "id": 1,
                "dosya": "README.md",
                "islem": "Projeyi, akışı ve kullanım adımlarını açıklayan README dosyasını oluştur.",
                "tip": "ai",
                "bagimliliklar": [],
            }
        ]

        next_id = 2
        if wants_backend or True:
            tasks.extend(
                [
                    {
                        "id": next_id,
                        "dosya": "backend/",
                        "islem": "Backend klasörünü oluştur.",
                        "tip": "ai",
                        "bagimliliklar": [],
                    },
                    {
                        "id": next_id + 1,
                        "dosya": "backend/main.py",
                        "islem": "FastAPI uygulamasını, log websocket'ini ve proje uçlarını yaz.",
                        "tip": "ai",
                        "bagimliliklar": [next_id],
                    },
                    {
                        "id": next_id + 2,
                        "dosya": "backend/services.py",
                        "islem": "Planlama, üretim ve doğrulama servis katmanını yaz.",
                        "tip": "ai",
                        "bagimliliklar": [next_id],
                    },
                ]
            )
            next_id += 3

        if wants_frontend:
            tasks.extend(
                [
                    {
                        "id": next_id,
                        "dosya": "frontend/",
                        "islem": "Frontend klasörünü oluştur.",
                        "tip": "ai",
                        "bagimliliklar": [],
                    },
                    {
                        "id": next_id + 1,
                        "dosya": "frontend/index.html",
                        "islem": "Frontend giriş HTML dosyasını oluştur.",
                        "tip": "ai",
                        "bagimliliklar": [next_id],
                    },
                    {
                        "id": next_id + 2,
                        "dosya": "frontend/src/App.jsx",
                        "islem": "Yönetim panelini oluşturan ana React bileşenini yaz.",
                        "tip": "ai",
                        "bagimliliklar": [next_id],
                    },
                ]
            )
            next_id += 3

        if wants_weather_key:
            tasks.append(
                {
                    "id": next_id,
                    "dosya": "ENV_SETUP",
                    "islem": "Gerekli API anahtarını alıp .env dosyasına ekle.",
                    "tip": "human",
                    "bagimliliklar": [],
                }
            )

        return {
            "proje_adi": proje_adi or self._project_title_from_doc(proje_tanimi),
            "mimari": [
                "FastAPI orchestration API",
                "React/Vite control panel",
                "Workspace based project memory",
                "Validation driven revision loop",
            ],
            "gorevler": tasks,
        }

    def _fallback_file_content(self, gorev: dict[str, Any], hafiza: dict[str, Any], mevcut_icerik: str = "") -> str:
        path = gorev["dosya"]
        name = path.lower()
        project_name = hafiza.get("proje_adi") or "Tectora Project"

        if mevcut_icerik:
            note = gorev.get("islem", "Revizyon uygulandı")
            if name.endswith(".md"):
                return mevcut_icerik + f"\n\n## Revizyon\n- {note}\n"
            if name.endswith(".py"):
                return mevcut_icerik + f"\n# Revizyon: {note}\n"
            if name.endswith(".js") or name.endswith(".jsx"):
                return mevcut_icerik + f"\n// Revizyon: {note}\n"
            if name.endswith(".css"):
                return mevcut_icerik + f"\n/* Revizyon: {note} */\n"
            return mevcut_icerik

        if name.endswith("readme.md"):
            return f"# {project_name}\n\nBu proje Tectora tarafından planlanan görevleri, insan onay noktalarını ve üretim durumunu yönetmek için oluşturuldu.\n"

        if name.endswith("main.py"):
            return (
                "from fastapi import FastAPI\n\n"
                "app = FastAPI(title='Generated Service')\n\n"
                "@app.get('/')\n"
                "def read_root():\n"
                "    return {'message': 'service ready'}\n"
            )

        if name.endswith("services.py"):
            return "def health():\n    return {'status': 'ok'}\n"

        if name.endswith("index.html"):
            return (
                "<!doctype html>\n<html lang='tr'>\n<head>\n"
                "  <meta charset='UTF-8' />\n  <meta name='viewport' content='width=device-width, initial-scale=1.0' />\n"
                f"  <title>{project_name}</title>\n</head>\n<body>\n  <div id='root'></div>\n</body>\n</html>\n"
            )

        if name.endswith("app.jsx"):
            return (
                "export default function App() {\n"
                "  return (\n"
                f"    <main><h1>{project_name}</h1><p>Üretim paneli hazır.</p></main>\n"
                "  );\n"
                "}\n"
            )

        return f"# {path}\n"