export default function AnalysisPanel({ analizSonucu, uretimeBasla, uretiyor, uretimVerisi }) {
  if (!analizSonucu) return null;

  return (
    <div style={{ marginTop: "20px", padding: "20px", backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "15px", borderBottom: "1px solid #333", paddingBottom: "10px" }}>
        <h3 style={{ color: "#007bff", margin: 0 }}>Tectora Analiz Raporu</h3>
        <div style={{ fontSize: "11px", color: "#888", textAlign: "right", lineHeight: "1.4" }}>
          <div>Giriş: {analizSonucu.maliyet_verisi?.input} | Çıkış: {analizSonucu.maliyet_verisi?.output}</div>
          <div style={{ fontSize: "13px", marginTop: "4px" }}>
            Maliyet: <span style={{ color: "#4CAF50", fontWeight: "bold" }}>${analizSonucu.maliyet_verisi?.tahmini_dolar}</span>
          </div>
        </div>
      </div>
      
      <div style={{ whiteSpace: "pre-wrap", marginBottom: "20px", fontSize: "14px", lineHeight: "1.6" }}>
        {analizSonucu.analiz_sonucu}
      </div>
      
      {!uretimVerisi && (
        <button 
          onClick={uretimeBasla} 
          disabled={uretiyor} 
          style={{ width: "100%", padding: "15px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px", fontWeight: "bold" }}
        >
          {uretiyor ? "⚙️ Üretiliyor..." : "🚀 Tectora, Bu Projeyi Üret!"}
        </button>
      )}
    </div>
  );
}