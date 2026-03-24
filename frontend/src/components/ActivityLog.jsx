import { useEffect, useRef } from 'react';

export default function ActivityLog({ logs }) {
  const logEndRef = useRef(null);

  // Yeni log geldiğinde otomatik olarak en aşağı kaydır
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);


  return (
    <div style={{ 
      marginTop: "20px", 
      padding: "15px", 
      backgroundColor: "#000", 
      border: "1px solid #333", 
      borderRadius: "8px",
      fontFamily: "Courier New, monospace",
      fontSize: "12px",
      boxShadow: "0 0 10px rgba(0,255,0,0.1)"
    }}>
      <h4 style={{ color: "#007bff", marginTop: 0, marginBottom: "10px", borderBottom: "1px solid #222", paddingBottom: "5px" }}>
        📡 Tectora Canlı İşlem Akışı
      </h4>
      <div style={{ maxHeight: "200px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "5px" }}>
        {logs.map((log, i) => (
          <div key={i} style={{ color: log.startsWith("✅") ? "#00ff00" : log.startsWith("🛠️") ? "#007bff" : log.startsWith("⚠️") ? "#ff9800" : "#00ff00" }}>
            <span style={{ color: "#444" }}>[{new Date().toLocaleTimeString()}]</span> {log}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}