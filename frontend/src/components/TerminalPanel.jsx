import { useState } from 'react';

export default function TerminalPanel({ projeKlasoru, onCalistir }) {
  const [komut, setKomut] = useState("");
  const [cikti, setCikti] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  const calistir = async () => {
    if (!komut) return;
    setYukleniyor(true);
    const result = await onCalistir(komut);
    setCikti(result);
    setYukleniyor(false);
  };

  if (!projeKlasoru) return null;

  return (
    <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#1e1e1e", border: "1px solid #007bff", borderRadius: "8px" }}>
      <h3 style={{ color: "#007bff", marginTop: 0, fontSize: "14px" }}>💻 Terminal (Sandbox: {projeKlasoru})</h3>
      <div style={{ display: "flex", gap: "10px" }}>
        <input 
          value={komut} onChange={e => setKomut(e.target.value)}
          placeholder="Komut girin (Örn: npm start, ls, python -m http.server)"
          style={{ flex: 1, padding: "10px", backgroundColor: "#000", color: "#00ff00", border: "1px solid #333", fontFamily: "monospace" }}
        />
        <button onClick={calistir} disabled={yukleniyor} style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", cursor: "pointer" }}>
          {yukleniyor ? "..." : "Çalıştır"}
        </button>
      </div>
      {cikti && (
        <pre style={{ marginTop: "10px", padding: "10px", backgroundColor: "#000", color: "#ccc", fontSize: "11px", overflowX: "auto", borderLeft: "3px solid #007bff" }}>
          {cikti.stdout || cikti.stderr}
        </pre>
      )}
    </div>
  );
}