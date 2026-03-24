import { useState, useEffect } from 'react'
import './App.css'

import AnalysisPanel from './components/AnalysisPanel'
import ProductionDashboard from './components/ProductionDashboard'
import RevisionPanel from './components/RevisionPanel'
import ActivityLog from './components/ActivityLog'
import TerminalPanel from './components/TerminalPanel' // <--- YENİ EKLENDİ

function App() {
  const [beyinMesaji, setBeyinMesaji] = useState("Tectora'nın beynine bağlanılıyor...")
  const [projeMetni, setProjeMetni] = useState("")
  const [analizSonucu, setAnalizSonucu] = useState(null)
  const [uretimVerisi, setUretimVerisi] = useState(null)
  const [logs, setLogs] = useState([])
  const [yukleniyor, setYukleniyor] = useState(false)
  const [uretiyor, setUretiyor] = useState(false)

  // WEBSOCKET BAĞLANTISI
  useEffect(() => {
    let socket;
    const connectWS = () => {
      socket = new WebSocket("ws://localhost:8000/ws/logs");
      socket.onmessage = (event) => setLogs((prev) => [...prev, event.data]);
      socket.onopen = () => setBeyinMesaji("Tectora Canlı Yayına Bağlandı!");
      socket.onclose = () => {
        setBeyinMesaji("Bağlantı Kesildi. Yeniden bağlanılıyor...");
        setTimeout(connectWS, 2000);
      };
    };
    connectWS();
    return () => socket && socket.close();
  }, []);

  const analizEt = async () => {
    if (!projeMetni) return;
    setYukleniyor(true);
    setAnalizSonucu(null);
    setUretimVerisi(null);
    setLogs([]); 
    try {
      const response = await fetch("http://localhost:8000/analiz-et", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dokuman_metni: projeMetni })
      });
      const data = await response.json();
      if (data.durum === "basarili") setAnalizSonucu(data);
    } catch (e) { console.error(e); }
    setYukleniyor(false);
  }

  const uretimeBasla = async () => {
    if (uretiyor) return; // <--- GÜVENLİK KİLİDİ: Eğer üretim zaten başladıysa fonksiyonu durdur.
    setUretiyor(true);
    setLogs([]);
    try {
      const response = await fetch("http://localhost:8000/uretime-basla", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dokuman_metni: projeMetni })
      });
      const data = await response.json();
      if (data.durum === "basarili") setUretimVerisi(data);
    } catch (e) { console.error(e); }
    setUretiyor(false);
  }

  const handleRevise = async (dosyaAdi, hataMesaji) => {
    try {
      await fetch("http://localhost:8000/revize-et", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proje_klasoru: uretimVerisi.klasor,
          dosya_adi: dosyaAdi,
          hata_mesaji: hataMesaji
        })
      });
    } catch (e) { console.error(e); }
  }

  // TERMINAL KOMUTU ÇALIŞTIRMA FONKSİYONU (YENİ)
  const handleRunCommand = async (komut) => {
    try {
      const response = await fetch("http://localhost:8000/komut-calistir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proje_klasoru: uretimVerisi.klasor,
          komut: komut
        })
      });
      const data = await response.json();
      return data.cikti;
    } catch (e) {
      return { stderr: "Sunucu hatası: Komut çalıştırılamadı." };
    }
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: 'Segoe UI', color: "white" }}>
      <h1 style={{ textAlign: "center", color: "#4CAF50" }}>Tectora .ai</h1>
      
      <div style={{ padding: "10px", backgroundColor: "#1e1e1e", borderRadius: "8px", marginBottom: "20px", textAlign: "center", fontSize: "13px" }}>
        🧠 <span style={{ color: "#4CAF50" }}>{beyinMesaji}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <textarea 
          value={projeMetni}
          onChange={(e) => setProjeMetni(e.target.value)}
          placeholder="Proje dokümanını buraya gir..."
          style={{ width: "100%", height: "100px", padding: "15px", borderRadius: "8px", backgroundColor: "#2d2d2d", color: "white", border: "1px solid #444" }}
        />
        <button onClick={analizEt} disabled={yukleniyor || uretiyor} style={{ padding: "12px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
          {yukleniyor ? "Analiz Ediliyor..." : "Projeyi Analiz Et"}
        </button>
      </div>

      <AnalysisPanel 
        analizSonucu={analizSonucu} 
        uretimeBasla={uretimeBasla} 
        uretiyor={uretiyor} 
        uretimVerisi={uretimVerisi} 
      />

      <ActivityLog logs={logs} />

      {/* TERMINAL PANELİ (YENİ) */}
      <TerminalPanel 
        projeKlasoru={uretimVerisi?.klasor} 
        onCalistir={handleRunCommand} 
      />

      <ProductionDashboard uretimVerisi={uretimVerisi} />

      <RevisionPanel 
        projeKlasoru={uretimVerisi?.klasor} 
        onRevize={handleRevise} 
      />
    </div>
  )
}

export default App