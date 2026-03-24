import { useEffect, useState } from 'react'

export default function TerminalPanel({ projeKlasoru, onCalistir }) {
  const [komut, setKomut] = useState('dir')
  const [cikti, setCikti] = useState(null)
  const [yukleniyor, setYukleniyor] = useState(false)

  useEffect(() => {
    setCikti(null)
    setKomut('dir')
    setYukleniyor(false)
  }, [projeKlasoru])

  if (!projeKlasoru) return null

  const calistir = async () => {
    if (yukleniyor) return
    if (typeof onCalistir !== 'function') return
    if (!komut.trim()) return

    setYukleniyor(true)

    try {
      const result = await onCalistir(komut.trim())
      setCikti(result)
    } finally {
      setYukleniyor(false)
    }
  }

  const outputText = cikti
    ? [
        cikti.stdout ? `STDOUT:\n${cikti.stdout}` : '',
        cikti.stderr ? `STDERR:\n${cikti.stderr}` : '',
        typeof cikti.exit_code !== 'undefined' ? `EXIT CODE: ${cikti.exit_code}` : '',
      ]
        .filter(Boolean)
        .join('\n\n')
    : ''

  return (
    <section className="panel">
      <div className="panel-header">
        <h3>Sandbox terminal</h3>
        <span>{projeKlasoru}</span>
      </div>

      <div className="button-row compact">
        <input
          value={komut}
          onChange={(event) => setKomut(event.target.value)}
          placeholder="Çalıştırılacak komut"
        />
        <button type="button" onClick={calistir} disabled={yukleniyor || !komut.trim()}>
          {yukleniyor ? 'Çalışıyor...' : 'Komutu çalıştır'}
        </button>
      </div>

      {cikti && (
        <pre className="terminal-output">{outputText || 'Çıktı yok.'}</pre>
      )}
    </section>
  )
}