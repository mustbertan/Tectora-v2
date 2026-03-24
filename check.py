import os
from dotenv import load_dotenv
import anthropic

# .env dosyasından şifreni al
load_dotenv()
api_key = os.environ.get("ANTHROPIC_API_KEY")
client = anthropic.Anthropic(api_key=api_key)

try:
    print("Anthropic sunucularına bağlanılıyor...\n")
    modeller = client.models.list()
    
    print("--- API ANAHTARININ ERİŞEBİLDİĞİ MODELLER ---")
    for model in modeller.data:
        print(f"- {model.id}")
    print("---------------------------------------------")
except Exception as e:
    print(f"Hata oluştu: {e}")