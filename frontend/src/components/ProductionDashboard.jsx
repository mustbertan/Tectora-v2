export default function ProductionDashboard({ uretimVerisi }) {
  if (!uretimVerisi) return null;

  return (
    <div style={{ marginTop: "20px", padding: "20px", backgroundColor: "#0e1a0e", border: "1px solid #4CAF50", borderRadius: "8px" }}>
      <h3 style={{ color: "#4CAF50", marginTop: 0 }}>📂 Proje: {uretimVerisi.klasor}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div>
          <h4 style={{ fontSize: "14px", borderBottom: "1px solid #2d4a2d" }}>✅ Tamamlanan (AI)</h4>
          {uretimVerisi.dosyalar.map((d, i) => (
            <div key={i} style={{ fontSize: "13px", color: "#aaa", padding: "4px 0" }}>📄 {d}</div>
          ))}
        </div>
        <div>
          <h4 style={{ fontSize: "14px", borderBottom: "1px solid #4a2d2d", color: "#ff9800" }}>⚠️ Bekleyen (İnsan)</h4>
          {uretimVerisi.insan_islemi_gerektirenler.map((h, i) => (
            <div key={i} style={{ fontSize: "13px", color: "#ff9800", padding: "4px 0" }}>🛠️ {h}</div>
          ))}
        </div>
      </div>
    </div>
  );
}