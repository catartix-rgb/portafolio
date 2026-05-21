import { useRef, useState, useEffect } from 'react'
import styles from './UploadZone.module.css'

const NAV_LINKS = [
  { label: 'Portafolio',    href: '../../index.html' },
  { label: 'Galería 3D',    href: '../../galeria.html' },
  { label: 'Audiovisual',   href: '../../audiovisual.html' },
]

export default function UploadZone({ onFile, error }) {
  const inputRef      = useRef()
  const [hover,    setHover]   = useState(false)
  const [ready,    setReady]   = useState(false)
  const [loading,  setLoading] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80)
    return () => clearTimeout(t)
  }, [])

  async function handleFile(file) {
    if (!file) return
    const validMime = file.type.startsWith('audio/')
    const validExt  = /\.(mp3|wav|flac|ogg|aac|m4a|opus|weba|webm)$/i.test(file.name)
    if (!validMime && !validExt) return
    setLoading(true)
    await onFile(file)
    setLoading(false)
  }

  function onDrop(e) {
    e.preventDefault()
    setHover(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div
      className={`${styles.root} ${ready ? styles.visible : ''}`}
      onDrop={onDrop}
      onDragOver={e => { e.preventDefault(); setHover(true) }}
      onDragLeave={() => setHover(false)}
    >
      {/* Corner marks */}
      <span className={`${styles.corner} ${styles.tl}`} />
      <span className={`${styles.corner} ${styles.tr}`} />
      <span className={`${styles.corner} ${styles.bl}`} />
      <span className={`${styles.corner} ${styles.br}`} />

      {/* Top navigation */}
      <nav className={styles.topNav}>
        {NAV_LINKS.map(l => (
          <a key={l.href} href={l.href} className={styles.navLink}>
            {l.label}
          </a>
        ))}
        <span className={styles.navActive}>Música 3D</span>
      </nav>

      {/* Main content — centered */}
      <div className={styles.inner}>
        <p className={styles.eyebrow}>
          <span className={styles.dot} />
          Espacio Musical Inmersivo
        </p>

        <h1 className={styles.headline}>
          Sube tu música.<br />
          <span className={styles.accent}>Entra dentro.</span>
        </h1>

        {/* Drop zone */}
        <div
          className={`${styles.dropZone} ${hover ? styles.hovering : ''} ${loading ? styles.loading : ''}`}
          onClick={() => !loading && inputRef.current.click()}
        >
          {loading ? (
            <div className={styles.loadingInner}>
              <div className={styles.loadingBar} />
              <p className={styles.dropLabel}>Cargando…</p>
            </div>
          ) : (
            <>
              <div className={styles.uploadIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <polyline points="16 16 12 12 8 16"/>
                  <line x1="12" y1="12" x2="12" y2="21"/>
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                </svg>
              </div>
              <p className={styles.dropLabel}>
                {hover ? 'Suelta aquí' : 'Arrastra un archivo de audio'}
              </p>
              <p className={styles.dropSub}>o haz clic para seleccionar</p>
            </>
          )}
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <p className={styles.formats}>MP3 · WAV · FLAC · OGG · AAC · M4A</p>
      </div>

      {/* Bottom system label */}
      <div className={styles.systemBar}>
        <span>SYS:READY</span>
        <span>◈</span>
        <span>DSP v1.0</span>
        <span>◈</span>
        <span>VISUAL ENGINE ONLINE</span>
      </div>

      <input
        ref={inputRef} type="file" accept="audio/*"
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])}
      />
    </div>
  )
}
