from pydantic import BaseModel

class ProjeTalebi(BaseModel):
    dokuman_metni: str

class RevizyonTalebi(BaseModel):
    proje_klasoru: str
    dosya_adi: str
    hata_mesaji: str

class KomutTalebi(BaseModel):
    proje_klasoru: str
    komut: str