import { useEffect, useMemo, useRef } from 'react'

function formatLogEntry(entry, index) {
  if (typeof entry === 'string') {
    return {
      key: `log-${index}-${entry}`,
      time: '',
      message: entry,
    }
  }

  if (entry && typeof entry === 'object') {
    const timeValue = entry.time || entry.zaman || entry.timestamp || ''
    const messageValue =
      entry.message ||
      entry.mesaj ||
      entry.log ||
      (() => {
        try {
          return JSON.stringify(entry)
        } catch {
          return String(entry)
        }
      })()

    const keyBase =
      entry.id ||
      `${timeValue}-${messageValue}` ||
      `log-${index}`

    return {
      key: `log-${index}-${keyBase}`,
      time: timeValue,
      message: messageValue,
    }
  }

  return {
    key: `log-${index}-${String(entry)}`,
    time: '',
    message: String(entry),
  }
}

function displayTime(value) {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return String(value)
  return parsed.toLocaleTimeString()
}

export default function ActivityLog({ logs = [] }) {
  const logEndRef = useRef(null)

  const normalizedLogs = useMemo(
    () => logs.map((log, index) => formatLogEntry(log, index)),
    [logs]
  )

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [normalizedLogs])

  return (
    <section className="panel">
      <div className="panel-header">
        <h3>Canlı işlem akışı</h3>
        <span>{normalizedLogs.length} kayıt</span>
      </div>

      <div className="log-list">
        {normalizedLogs.length === 0 && (
          <p className="empty-state">Henüz log yok.</p>
        )}

        {normalizedLogs.map((log) => (
          <div key={log.key} className="log-item">
            {log.time ? (
              <span className="log-time">[{displayTime(log.time)}]</span>
            ) : null}
            <span>{log.message}</span>
          </div>
        ))}

        <div ref={logEndRef} />
      </div>
    </section>
  )
}