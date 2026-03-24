import { useEffect, useMemo, useState } from 'react'

export default function HumanTaskPanel({ project, onResume, loading }) {
  const waitingTasks = useMemo(
    () => (Array.isArray(project?.insan_islemi_gerektirenler) ? project.insan_islemi_gerektirenler : []),
    [project],
  )

  const [notes, setNotes] = useState({})

  useEffect(() => {
    setNotes({})
  }, [project?.klasor])

  if (!project || waitingTasks.length === 0) return null

  const submit = async () => {
    if (loading || typeof onResume !== 'function') return

    const payload = waitingTasks.map((task) => ({
      gorev_id: task.id,
      notlar: notes[task.id] ?? '',
      tamamlandi: true,
    }))

    await onResume(payload)
  }

  return (
    <section className="panel warning-panel">
      <div className="panel-header">
        <h3>İnsan onayı gereken işler</h3>
        <span>{waitingTasks.length} görev</span>
      </div>

      {waitingTasks.map((task, index) => (
        <div key={task?.id ?? `human-task-${index}`} className="task-card">
          <strong>
            #{task?.id ?? '?'} · {task?.dosya || 'Dosya belirtilmemiş'}
          </strong>
          <p>{task?.islem || 'Görev açıklaması yok.'}</p>

          <textarea
            placeholder="Bu görevi tamamladıysan not bırak..."
            value={notes[task.id] ?? ''}
            onChange={(event) =>
              setNotes((prev) => ({
                ...prev,
                [task.id]: event.target.value,
              }))
            }
          />
        </div>
      ))}

      <button
        type="button"
        className="primary"
        onClick={submit}
        disabled={loading}
      >
        {loading ? 'Devam ediyor...' : 'İnsan görevlerini tamamlandı işaretle'}
      </button>
    </section>
  )
}