import { useState } from 'react';

export default function RevisionPanel({ projeKlasoru, onRevize }) {
  const [dosyaAdi, setDosyaAdi] = useState("");
  const [hataMesaji, setHataMesaji] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  const gonder = async () => {
    if (!dosyaAdi || !hataMesaji) return alert("Dosya adı ve hata mesajı gerekli.");
    setYukleniyor(true);
    await onRevize(dosyaAdi, hataMesaji);
    setYukleniyor(false);
    setHataMesaji("");
  };

  if (!projeKlasoru) return null;

  return (
    <div style={{ marginTop: "20px", padding: "20px", backgroundColor: "#1a130e", border: "1px solid #ff5722", borderRadius: "8px" }}>
      <h3 style={{ color: "#ff5722", marginTop: 0 }}>🛠️ Hata Bildir / Revize Et</h3>
      <input 
        placeholder="Dosya Adı (Örn: style.css)" 
        value={dosyaAdi} onChange={e => setDosyaAdi(e.target.value)}
        style={{ width: "95%", padding: "10px", marginBottom: "10px", backgroundColor: "#2d2d2d", color: "white", border: "1px solid #444" }}
      />
      <textarea 
        placeholder="Hata nedir veya ne değişmeli?" 
        value={hataMesaji} onChange={e => setHataMesaji(e.target.value)}
        style={{ width: "95%", height: "60px", padding: "10px", backgroundColor: "#2d2d2d", color: "white", border: "1px solid #444" }}
      />
      <button 
        onClick={gonder} disabled={yukleniyor}
        style={{ width: "100%", padding: "10px", backgroundColor: "#ff5722", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
      >
        {yukleniyor ? "Güncelleniyor..." : "Düzeltmeyi Uygula"}
      </button>
    </div>
  );
}