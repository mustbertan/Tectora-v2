export default function AnalysisPanel({ analizSonucu }) {
  if (!analizSonucu) return null

  return (
    <section className="panel">
      <div className="panel-header">
        <h3>Analiz raporu</h3>
        <span>
          ${analizSonucu.maliyet_verisi?.tahmini_dolar ?? 0}
        </span>
      </div>
      <div className="analysis-meta">
        <span>Input: {analizSonucu.maliyet_verisi?.input ?? 0}</span>
        <span>Output: {analizSonucu.maliyet_verisi?.output ?? 0}</span>
        {analizSonucu.maliyet_verisi?.not && <span>{analizSonucu.maliyet_verisi.not}</span>}
      </div>
      <pre className="pre-wrap">{analizSonucu.analiz_sonucu}</pre>
    </section>
  )
}
