import { useEffect, useState } from 'react'

export default function RevisionPanel({ projeKlasoru, onRevize }) {
  const [dosyaAdi, setDosyaAdi] = useState('')
  const [hataMesaji, setHataMesaji] = useState('')
  const [yukleniyor, setYukleniyor] = useState(false)

  useEffect(() => {
    setDosyaAdi('')
    setHataMesaji('')
    setYukleniyor(false)
  }, [projeKlasoru])

  if (!projeKlasoru) return null

  const gonder = async () => {
    if (yukleniyor) return
    if (typeof onRevize !== 'function') return
    if (!dosyaAdi.trim() || !hataMesaji.trim()) return

    setYukleniyor(true)

    try {
      await onRevize(dosyaAdi.trim(), hataMesaji.trim())
      setDosyaAdi('')
      setHataMesaji('')
    } finally {
      setYukleniyor(false)
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h3>Revizyon</h3>
        <span>{projeKlasoru}</span>
      </div>

      <input
        value={dosyaAdi}
        onChange={(event) => setDosyaAdi(event.target.value)}
        placeholder="Dosya yolu"
      />

      <textarea
        value={hataMesaji}
        onChange={(event) => setHataMesaji(event.target.value)}
        placeholder="Ne düzeltilmeli?"
      />

      <button
        type="button"
        className="primary"
        onClick={gonder}
        disabled={yukleniyor || !dosyaAdi.trim() || !hataMesaji.trim()}
      >
        {yukleniyor ? 'Revize ediliyor...' : 'Revizyon uygula'}
      </button>
    </section>
  )
}