import { useRef, useState, useEffect } from 'react'
import styles from './UploadZone.module.css'

export default function UploadZone({ onFile, error }) {
  const inputRef  = useRef()
  const [hover, setHover]     = useState(false)
  const [ready, setReady]     = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80)
    return () => clearTimeout(t)
  }, [])

  async function handleFile(file) {
    if (!file) return

    // Accept by MIME type OR file extension (some browsers report wrong MIME)
    const validMime = file.type.startsWith('audio/')
    const validExt  = /\.(mp3|wav|flac|ogg|aac|m4a|opus|weba|webm)$/i.test(file.name)
    if (!validMime && !validExt) return

    setLoading(true)
    // Call parent immediately — the user gesture context is still active
    await onFile(file)
    setLoading(false)
  }

  function onDrop(e) {
    e.preventDefault()
    setHover(false)
    handleFile(e.dataTransfer.files[0])
  }

  function onDragOver(e) {
    e.preventDefault()
    setHover(true)
  }

  return (
    <div
      className={`${styles.root} ${ready ? styles.visible : ''}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={() => setHover(false)}
      onClick={() => !loading && inputRef.current.click()}
    >
      {/* Corner marks */}
      <span className={`${styles.corner} ${styles.tl}`} />
      <span className={`${styles.corner} ${styles.tr}`} />
      <span className={`${styles.corner} ${styles.bl}`} />
      <span className={`${styles.corner} ${styles.br}`} />

      <div className={styles.inner}>
        <p className={styles.eyebrow}>JPCC · Espacio Musical Inmersivo</p>

        <h1 className={styles.headline}>
          Sube tu música.<br />
          <span className={styles.accent}>Entra dentro.</span>
        </h1>

        <div className={`${styles.dropZone} ${hover ? styles.hovering : ''} ${loading ? styles.loading : ''}`}>
          {loading ? (
            <p className={styles.dropLabel}>Cargando…</p>
          ) : (
            <>
              <p className={styles.dropLabel}>
                {hover ? 'Suelta aquí' : 'Arrastra un archivo de audio'}
              </p>
              <p className={styles.dropSub}>o haz clic en cualquier parte</p>
            </>
          )}
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <p className={styles.formats}>MP3 · WAV · FLAC · OGG · AAC · M4A</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])}
      />
    </div>
  )
}
