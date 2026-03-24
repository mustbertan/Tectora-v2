import json
import re
import asyncio

class TectoraOrchestrator:
    def __init__(self, client):
        self.client = client
        self.sonnet = "claude-sonnet-4-6" 
        self.haiku = "claude-haiku-4-5-20251001" 
        self.logs = []

    def log_ekle(self, mesaj):
        print(f"[LOG] {mesaj}")
        self.logs.append(mesaj)

    def _tembellik_kontrol(self, text):
        yasakli = ["buraya", "içerik", "...", "placeholder", "<!--"]
        if len(text) < 300:
            for kelime in yasakli:
                if kelime in text.lower(): return True
        return False

    def plan_yap(self, proje_tanimi):
        self.log_ekle("📋 Koordinatör planlama yapıyor...")
        prompt = f"""Sen Tectora Koordinatörüsün. Projeyi atomik görevlere böl. SADECE JSON döndür. 
        ÖNEMLİ: 'islem' içinde asla çift tırnak kullanma, tek tırnak (') kullan.
        Yapı: {{"proje_adi": "...", "mimari": "...", "gorevler": [{{"id": 1, "dosya": "index.html", "islem": "...", "tip": "ai"}}]}}
        Tanım: {proje_tanimi}"""
        response = self.client.messages.create(model=self.sonnet, max_tokens=1000, messages=[{"role": "user", "content": prompt}])
        return self._json_temizle(response.content[0].text)

    def kod_yaz(self, gorev, hafiza):
        uzanti = gorev['dosya'].split('.')[-1]
        for deneme in range(3):
            self.log_ekle(f"🚀 {gorev['dosya']} kodlanıyor (Deneme {deneme+1})...")
            prompt = f"""PROJE: {json.dumps(hafiza)}\nGÖREV: {gorev['dosya']} -> {gorev['islem']}
            DİKKAT: Bu bir .{uzanti} dosyasıdır. SADECE saf .{uzanti} kodu yaz. JS içine HTML koyma! 
            YER TUTUCU YASAKTIR. TAM KOD YAZ."""
            response = self.client.messages.create(model=self.sonnet, max_tokens=4000, messages=[{"role": "user", "content": prompt}])
            icerik = self._kod_temizle(response.content[0].text)
            if not self._tembellik_kontrol(icerik): return icerik
            self.log_ekle(f"⚠️ {gorev['dosya']} eksik/tembel içerik! Tekrar deneniyor...")
        return icerik

    def revize_et(self, dosya_adi, hata_mesaji, hafiza):
        uzanti = dosya_adi.split('.')[-1]
        self.log_ekle(f"🛠️ {dosya_adi} revize ediliyor...")
        prompt = f"HAFIZA: {json.dumps(hafiza)}\nDOSYA: {dosya_adi}\nHATA: {hata_mesaji}\nTAM .{uzanti} KODU DÖNDÜR."
        response = self.client.messages.create(model=self.sonnet, max_tokens=4000, messages=[{"role": "user", "content": prompt}])
        return self._kod_temizle(response.content[0].text)

    def denetle_ve_duzelt(self, dosya_adi, icerik, hafiza):
        uzanti = dosya_adi.split('.')[-1]
        prompt = f"Sen Denetçisin. DOSYA: {dosya_adi}\nİÇERİK: {icerik}\nKONTROL: Bu bir .{uzanti} dosyasıdır. HTML etiketleri JS/CSS içindeyse TEMİZLE. Saf kod döndür."
        response = self.client.messages.create(model=self.haiku, max_tokens=4000, messages=[{"role": "user", "content": prompt}])
        return self._kod_temizle(response.content[0].text.strip())

    def _json_temizle(self, text):
        match = re.search(r"(\{.*\})", text.strip(), re.DOTALL)
        json_str = match.group(1).strip() if match else text
        try: return json.loads(json_str)
        except:
            onarım = self.client.messages.create(model=self.haiku, messages=[{"role": "user", "content": f"JSON onar:\n{json_str}"}])
            return json.loads(re.search(r"(\{.*\})", onarım.content[0].text, re.DOTALL).group(1))

    def _kod_temizle(self, text):
        raw = re.sub(r"```(?:\w+)?\n?(.*?)```", r"\1", text, flags=re.DOTALL).strip()
        for k in ["```html", "```javascript", "```js", "```css", "```"]: raw = raw.replace(k, "")
        return raw.strip()