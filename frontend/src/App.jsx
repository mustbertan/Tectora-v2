import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

import ActivityLog from './components/ActivityLog'
import AnalysisPanel from './components/AnalysisPanel'
import HumanTaskPanel from './components/HumanTaskPanel'
import ProductionDashboard from './components/ProductionDashboard'
import ProjectFilesPanel from './components/ProjectFilesPanel'
import RevisionPanel from './components/RevisionPanel'
import TerminalPanel from './components/TerminalPanel'

function toWsUrl(apiBase) {
  return apiBase.replace(/^http/i, 'ws') + '/ws/logs'
}

function normaliseError(error) {
  if (!error) return 'Bilinmeyen hata'
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message
  if (error.detail) {
    if (typeof error.detail === 'string') return error.detail
    return JSON.stringify(error.detail)
  }
  try {
    return JSON.stringify(error)
  } catch {
    return 'Beklenmeyen hata'
  }
}

function serialiseLogMessage(payload) {
  if (typeof payload === 'string') return payload
  try {
    return JSON.stringify(payload)
  } catch {
    return String(payload)
  }
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options)
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(normaliseError(data))
  }

  return data
}

export default function App() {
  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
    []
  )

  const [beyinMesaji, setBeyinMesaji] = useState('Log hattı bağlanıyor...')
  const [projeMetni, setProjeMetni] = useState('')
  const [analizSonucu, setAnalizSonucu] = useState(null)
  const [currentProject, setCurrentProject] = useState(null)
  const [projects, setProjects] = useState([])
  const [projectFiles, setProjectFiles] = useState([])
  const [logs, setLogs] = useState([])
  const [error, setError] = useState('')
  const [analizleniyor, setAnalizleniyor] = useState(false)
  const [uretiyor, setUretiyor] = useState(false)
  const [yeniliyor, setYeniliyor] = useState(false)

  const wsRef = useRef(null)
  const reconnectTimerRef = useRef(null)
  const intentionalCloseRef = useRef(false)

  const refreshProjects = useCallback(async () => {
    const data = await requestJson(`${apiBase}/projeler`)
    setProjects(Array.isArray(data.projeler) ? data.projeler : [])
  }, [apiBase])

  const refreshProject = useCallback(
    async (slug) => {
      if (!slug) return

      setYeniliyor(true)
      setError('')

      try {
        const [projectResponse, filesResponse] = await Promise.all([
          requestJson(`${apiBase}/projeler/${slug}`),
          requestJson(`${apiBase}/projeler/${slug}/dosyalar`),
        ])

        setCurrentProject(projectResponse.proje ?? null)
        setProjectFiles(Array.isArray(filesResponse.dosyalar) ? filesResponse.dosyalar : [])
      } catch (err) {
        setError(normaliseError(err))
      } finally {
        setYeniliyor(false)
      }
    },
    [apiBase]
  )

  useEffect(() => {
    refreshProjects().catch((err) => setError(normaliseError(err)))
  }, [refreshProjects])

  useEffect(() => {
    intentionalCloseRef.current = false

    const connect = () => {
      try {
        const socket = new WebSocket(toWsUrl(apiBase))
        wsRef.current = socket
        setBeyinMesaji('Log hattı bağlanıyor...')

        socket.onopen = () => {
          setBeyinMesaji('Canlı log hattı bağlı')
        }

        socket.onmessage = (event) => {
          let nextValue = event.data

          try {
            const parsed = JSON.parse(event.data)
            nextValue = serialiseLogMessage(parsed)
          } catch {
            nextValue = serialiseLogMessage(event.data)
          }

          setLogs((prev) => [...prev.slice(-199), nextValue])
        }

        socket.onerror = () => {
          setBeyinMesaji('Log hattı hatalı durumda')
        }

        socket.onclose = () => {
          wsRef.current = null

          if (intentionalCloseRef.current) {
            setBeyinMesaji('Log hattı kapalı')
            return
          }

          setBeyinMesaji('Log hattı koptu, yeniden bağlanıyor...')

          reconnectTimerRef.current = window.setTimeout(() => {
            connect()
          }, 2000)
        }
      } catch {
        setBeyinMesaji('Log hattı başlatılamadı')
      }
    }

    connect()

    return () => {
      intentionalCloseRef.current = true

      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }

      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [apiBase])

  const analizEt = async () => {
    if (!projeMetni.trim()) return

    setError('')
    setAnalizleniyor(true)

    try {
      const data = await requestJson(`${apiBase}/analiz-et`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dokuman_metni: projeMetni }),
      })

      setAnalizSonucu(data)
    } catch (err) {
      setError(normaliseError(err))
    } finally {
      setAnalizleniyor(false)
    }
  }

  const uretimeBasla = async () => {
    if (!projeMetni.trim()) return

    setError('')
    setUretiyor(true)
    setLogs([])

    try {
      const data = await requestJson(`${apiBase}/uretime-basla`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dokuman_metni: projeMetni }),
      })

      const createdProject = data.proje ?? null
      setCurrentProject(createdProject)

      await refreshProjects()

      if (createdProject?.klasor) {
        await refreshProject(createdProject.klasor)
      }
    } catch (err) {
      setError(normaliseError(err))
    } finally {
      setUretiyor(false)
    }
  }

  const devamEt = async (payload) => {
    if (!currentProject?.klasor) return

    setError('')
    setUretiyor(true)

    try {
      const data = await requestJson(`${apiBase}/devam-et`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proje_klasoru: currentProject.klasor,
          tamamlanan_insan_gorevleri: payload,
        }),
      })

      const updatedProject = data.proje ?? null
      setCurrentProject(updatedProject)

      await refreshProjects()

      if (updatedProject?.klasor) {
        await refreshProject(updatedProject.klasor)
      }
    } catch (err) {
      setError(normaliseError(err))
    } finally {
      setUretiyor(false)
    }
  }

  const handleRevise = async (dosyaAdi, hataMesaji) => {
    if (!currentProject?.klasor) return

    setError('')

    try {
      await requestJson(`${apiBase}/revize-et`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proje_klasoru: currentProject.klasor,
          dosya_adi: dosyaAdi,
          hata_mesaji: hataMesaji,
        }),
      })

      await refreshProject(currentProject.klasor)
    } catch (err) {
      setError(normaliseError(err))
    }
  }

  const handleRunCommand = async (komut) => {
    if (!currentProject?.klasor) return null

    setError('')

    try {
      const data = await requestJson(`${apiBase}/komut-calistir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proje_klasoru: currentProject.klasor,
          komut,
        }),
      })

      return data.cikti ?? ''
    } catch (err) {
      const message = normaliseError(err)
      setError(message)
      throw new Error(message)
    }
  }

  return (
    <div className="page-shell">
      <header className="hero-card">
        <div>
          <p className="eyebrow">Tectora</p>
          <h1>Otonom yazılım üretim paneli</h1>
          <p className="hero-copy">
            Analiz, planlama, dosya üretimi, insan onayı ve revizyon akışını tek ekrandan yönet.
          </p>
        </div>

        <div className="status-box">
          <span className="status-label">Durum</span>
          <strong>{beyinMesaji}</strong>
        </div>
      </header>

      <section className="input-card">
        <textarea
          value={projeMetni}
          onChange={(event) => setProjeMetni(event.target.value)}
          placeholder="Proje dokümanını buraya gir..."
        />

        <div className="button-row">
          <button onClick={analizEt} disabled={analizleniyor || uretiyor}>
            {analizleniyor ? 'Analiz ediliyor...' : 'Analiz et'}
          </button>

          <button
            className="primary"
            onClick={uretimeBasla}
            disabled={uretiyor || !projeMetni.trim()}
          >
            {uretiyor ? 'Çalışıyor...' : 'Üretimi başlat'}
          </button>

          <button
            className="ghost"
            onClick={() => refreshProjects().catch((err) => setError(normaliseError(err)))}
            disabled={yeniliyor}
          >
            {yeniliyor ? 'Yenileniyor...' : 'Projeleri yenile'}
          </button>
        </div>

        {error && <div className="error-box">{error}</div>}
      </section>

      <div className="grid-layout">
        <div className="stack">
          <AnalysisPanel analizSonucu={analizSonucu} />

          <ProductionDashboard
            uretimVerisi={currentProject}
            projects={projects}
            onSelectProject={(slug) => refreshProject(slug)}
            loading={yeniliyor}
          />

          <HumanTaskPanel
            project={currentProject}
            onResume={devamEt}
            loading={uretiyor}
          />

          <RevisionPanel
            projeKlasoru={currentProject?.klasor}
            onRevize={handleRevise}
          />

          <TerminalPanel
            projeKlasoru={currentProject?.klasor}
            onCalistir={handleRunCommand}
          />
        </div>

        <div className="stack">
          <ProjectFilesPanel project={currentProject} files={projectFiles} />
          <ActivityLog logs={logs} />
        </div>
      </div>
    </div>
  )
}