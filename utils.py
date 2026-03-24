import os
import subprocess

def güvenli_klasör_olustur(yol):
    os.makedirs(yol, exist_ok=True)

def dosya_yaz(yol, icerik):
    os.makedirs(os.path.dirname(yol), exist_ok=True)
    with open(yol, "w", encoding="utf-8") as f:
        f.write(icerik)

def klasör_mü(dosya_adi):
    return dosya_adi.endswith("/") or dosya_adi.endswith("\\")

def komut_calistir(komut, calisma_dizini):
    """Verilen komutu belirtilen dizinde çalıştırır ve çıktısını döndürür."""
    try:
        sonuc = subprocess.run(
            komut,
            cwd=calisma_dizini,
            shell=True,
            capture_output=True,
            text=True,
            timeout=30
        )
        return {
            "stdout": sonuc.stdout,
            "stderr": sonuc.stderr,
            "exit_code": sonuc.returncode
        }
    except Exception as e:
        return {"stdout": "", "stderr": str(e), "exit_code": 1}