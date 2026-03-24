import { useEffect, useMemo, useState } from 'react'

export default function ProjectFilesPanel({ project, files = [] }) {
  const [selectedFile, setSelectedFile] = useState(null)

  const normalizedFiles = useMemo(() => {
    if (!Array.isArray(files)) return []
    return files.filter((file) => file && typeof file.yol === 'string')
  }, [files])

  useEffect(() => {
    setSelectedFile(null)
  }, [project?.klasor])

  useEffect(() => {
    if (!normalizedFiles.length) {
      setSelectedFile(null)
      return
    }

    const stillExists = normalizedFiles.some((file) => file.yol === selectedFile)
    if (!selectedFile || !stillExists) {
      setSelectedFile(normalizedFiles[0].yol)
    }
  }, [normalizedFiles, selectedFile])

  if (!project) {
    return (
      <section className="panel">
        <div className="panel-header">
          <h3>Dosyalar</h3>
        </div>
        <p className="empty-state">Bir proje seçildiğinde dosya içerikleri burada görünür.</p>
      </section>
    )
  }

  const activeFile = selectedFile ?? normalizedFiles[0]?.yol ?? null
  const activeContent =
    normalizedFiles.find((file) => file.yol === activeFile)?.icerik ?? ''

  return (
    <section className="panel files-panel">
      <div className="panel-header">
        <h3>Dosya önizleme</h3>
        <span>{normalizedFiles.length} dosya</span>
      </div>

      <div className="files-layout">
        <div className="file-list">
          {normalizedFiles.length === 0 && (
            <p className="empty-state">Bu projede henüz dosya yok.</p>
          )}

          {normalizedFiles.map((file, index) => (
            <button
              key={file.yol || `file-${index}`}
              type="button"
              className={activeFile === file.yol ? 'file-item active' : 'file-item'}
              onClick={() => setSelectedFile(file.yol)}
            >
              {file.yol}
            </button>
          ))}
        </div>

        <pre className="file-preview">
          {activeContent || 'Önizlenecek dosya yok.'}
        </pre>
      </div>
    </section>
  )
}