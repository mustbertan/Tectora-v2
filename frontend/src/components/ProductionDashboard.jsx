function StatusPill({ value }) {
  const safeValue = value || 'unknown'
  return <span className={`status-pill status-${safeValue}`}>{safeValue}</span>
}

function projectKey(project, index) {
  return project?.klasor || project?.proje_adi || `project-${index}`
}

export default function ProductionDashboard({
  uretimVerisi,
  projects = [],
  onSelectProject,
  loading,
}) {
  const activeProjectKey = uretimVerisi?.klasor || uretimVerisi?.proje_adi || null

  return (
    <section className="panel">
      <div className="panel-header">
        <h3>Projeler</h3>
        <span>{loading ? 'Yenileniyor...' : `${projects.length} proje`}</span>
      </div>

      <div className="project-list">
        {projects.length === 0 && <p className="empty-state">Henüz proje yok.</p>}

        {projects.map((project, index) => {
          const key = projectKey(project, index)
          const isActive = activeProjectKey === (project?.klasor || project?.proje_adi || null)
          const disabled = !project?.klasor

          return (
            <button
              key={key}
              type="button"
              className={`project-card ${isActive ? 'active' : ''}`}
              onClick={() => !disabled && onSelectProject?.(project.klasor)}
              disabled={disabled}
            >
              <div>
                <strong>{project?.proje_adi || 'İsimsiz proje'}</strong>
                <p>{project?.klasor || 'Klasör bilgisi yok'}</p>
              </div>
              <StatusPill value={project?.durum} />
            </button>
          )
        })}
      </div>

      {uretimVerisi && (
        <div className="detail-grid">
          <div>
            <h4>Aktif proje</h4>
            <p className="project-name">{uretimVerisi?.proje_adi || 'İsimsiz proje'}</p>
            <StatusPill value={uretimVerisi?.durum} />
          </div>

          <div>
            <h4>Mimari kararlar</h4>
            <ul>
              {(uretimVerisi?.mimari_kararlar || []).length === 0 && (
                <li>Henüz mimari karar yok.</li>
              )}

              {(uretimVerisi?.mimari_kararlar || []).map((item, index) => (
                <li key={`mimari-${index}-${item}`}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Tamamlanan görevler</h4>
            <ul>
              {(uretimVerisi?.tamamlanan_gorevler || []).length === 0 && (
                <li>Henüz tamamlanmadı.</li>
              )}

              {(uretimVerisi?.tamamlanan_gorevler || []).map((item, index) => (
                <li key={`tamamlanan-${index}-${item}`}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Tüm görevler</h4>
            <ul>
              {(uretimVerisi?.gorevler || []).length === 0 && <li>Henüz görev yok.</li>}

              {(uretimVerisi?.gorevler || []).map((task, index) => (
                <li key={task?.id ?? `task-${index}`}>
                  #{task?.id ?? '?'} {task?.dosya || 'Dosya yok'} · {task?.durum || 'unknown'}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}