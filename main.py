import os
import json
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import anthropic

# Kendi modüllerimiz - Buraya 'KomutTalebi' ve 'komut_calistir' eklendi
from models import ProjeTalebi, RevizyonTalebi, KomutTalebi 
from memory import ProjectMemory
from agents import TectoraOrchestrator
from utils import güvenli_klasör_olustur, dosya_yaz, klasör_mü, komut_calistir

load_dotenv()

# --- BAĞLANTI YÖNETİCİSİ ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

manager = ConnectionManager()

# --- API KURULUMU ---
app = FastAPI(title="Tectora API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
orchestrator = TectoraOrchestrator(client)
WORKSPACE_DIR = os.path.join(os.getcwd(), "workspace")

# --- ENDPOINT'LER ---

@app.get("/")
def read_root():
    return {"mesaj": "Tectora Modüler API Sistemi Aktif!"}

@app.websocket("/ws/logs")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.post("/analiz-et")
def analiz_et(talep: ProjeTalebi):
    """Manifesto Madde 3 & 4: Derin analiz ve maliyet tahmini."""
    # PROMPT GÜNCELLENDİ: Kod yazımı kesinlikle yasaklandı.
    prompt = f"""Sen Tectora'nın merkezi beynisin. Görevin, projeyi analiz etmek.
    
    🛑 KRİTİK YASAK: Analiz raporunda ASLA VE ASLA ```html, ```css veya ```javascript gibi kod blokları kullanma. Tek bir satır bile kod yazma! 
    Eğer kod yazarsan sistem hata verecektir.
    
    Sadece şu başlıklarla rapor sun:
    1. **Stratejik Özet**
    2. **Teknik Mimari Planı** (Sadece hangi teknolojilerin kullanılacağı)
    3. **Eksik Gereksinimler**
    4. **Yaratıcı Üretim Önerileri**
    5. **Risk Analizi**
    
    Kullanıcının Proje Dokümanı: {talep.dokuman_metni}"""
    try:
        mesaj = client.messages.create(
            model="claude-sonnet-4-6", 
            max_tokens=1000, 
            messages=[{"role": "user", "content": prompt}]
        )
        
        ham_analiz = mesaj.content[0].text
        
        # GÜVENLİK FİLTRESİ: Eğer Claude kod yazdıysa, kod bloklarını temizle
        import re
        temiz_analiz = re.sub(r"```.*?```", "\n[KOD BLOĞU GÜVENLİK NEDENİYLE ANALİZDEN KALDIRILDI - ÜRETİM AŞAMASINDA OLUŞTURULACAK]\n", ham_analiz, flags=re.DOTALL)
        
        maliyet = (mesaj.usage.input_tokens * 0.000003) + (mesaj.usage.output_tokens * 0.000015)
        return {
            "durum": "basarili", 
            "analiz_sonucu": temiz_analiz, # Temizlenmiş analiz gidiyor
            "maliyet_verisi": {"input": mesaj.usage.input_tokens, "output": mesaj.usage.output_tokens, "tahmini_dolar": round(maliyet, 5)}
        }
    except Exception as e:
        return {"durum": "hata", "mesaj": str(e)}

@app.post("/uretime-basla")
async def uretime_basla(talep: ProjeTalebi):
    try:
        orchestrator.logs = [] 
        await manager.broadcast("🚀 Üretim süreci başlatıldı...")
        
        plan = orchestrator.plan_yap(talep.dokuman_metni)
        
        klasor_adi = plan.get("proje_adi", "tect_proje").lower().replace(" ", "_")
        hedef_dizin = os.path.join(WORKSPACE_DIR, klasor_adi)
        güvenli_klasör_olustur(hedef_dizin)

        hafiza = ProjectMemory(hedef_dizin)
        hafiza.data["proje_amaci"] = talep.dokuman_metni
        hafiza.data["mimari_kararlar"] = [plan.get("mimari", "Modern ES Modules")]
        hafiza.kaydet()

        olusturulan_dosyalar = []
        for gorev in plan["gorevler"]:
            dosya_ismi = gorev.get("dosya", "islem")
            await manager.broadcast(f"🛠️ {dosya_ismi} üzerinde çalışılıyor...")
            
            if gorev.get("tip") == "human":
                hafiza.data["dosya_yapisi"][f"HUMAN: {gorev['islem']}"] = "BEKLIYOR"
                hafiza.kaydet()
                continue
            
            tam_yol = os.path.join(hedef_dizin, dosya_ismi)
            if klasör_mü(dosya_ismi):
                güvenli_klasör_olustur(tam_yol)
                continue

            ilk_taslak = orchestrator.kod_yaz(gorev, hafiza.oku())
            final_kod = orchestrator.denetle_ve_duzelt(dosya_ismi, ilk_taslak, hafiza.oku())
            dosya_yaz(tam_yol, final_kod)
            
            hafiza.data["dosya_yapisi"][dosya_ismi] = "Tamamlandi"
            hafiza.kaydet()
            olusturulan_dosyalar.append(dosya_ismi)
            await manager.broadcast(f"✅ {dosya_ismi} yazıldı.")

        await manager.broadcast("🏁 Üretim tamamlandı!")
        return {"durum": "basarili", "klasor": klasor_adi, "dosyalar": olusturulan_dosyalar, "insan_islemi_gerektirenler": [g["islem"] for g in plan["gorevler"] if g.get("tip") == "human"]}
    except Exception as e:
        await manager.broadcast(f"❌ Hata: {str(e)}")
        return {"durum": "hata", "mesaj": str(e)}

@app.post("/revize-et")
async def revize_et(talep: RevizyonTalebi):
    try:
        await manager.broadcast(f"🛠️ {talep.dosya_adi} revize ediliyor...")
        hedef_dizin = os.path.join(WORKSPACE_DIR, talep.proje_klasoru)
        hafiza = ProjectMemory(hedef_dizin).oku()
        
        yeni_kod = orchestrator.revize_et(talep.dosya_adi, talep.hata_mesaji, hafiza)
        final_kod = orchestrator.denetle_ve_duzelt(talep.dosya_adi, yeni_kod, hafiza)
        
        dosya_yaz(os.path.join(hedef_dizin, talep.dosya_adi), final_kod)
        await manager.broadcast(f"✅ {talep.dosya_adi} güncellendi.")
        return {"durum": "basarili", "mesaj": "Güncellendi"}
    except Exception as e:
        return {"durum": "hata", "mesaj": str(e)}

@app.post("/komut-calistir")
async def terminal_komutu_calistir(talep: KomutTalebi):
    try:
        hedef_dizin = os.path.join(WORKSPACE_DIR, talep.proje_klasoru)
        await manager.broadcast(f"💻 Komut çalıştırılıyor: {talep.komut}")
        sonuc = komut_calistir(talep.komut, hedef_dizin)
        await manager.broadcast(f"✅ Komut bitti (Kod: {sonuc['exit_code']})")
        return {"durum": "basarili", "cikti": sonuc}
    except Exception as e:
        return {"durum": "hata", "mesaj": str(e)}