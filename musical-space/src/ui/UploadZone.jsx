import { useRef, useState, useEffect } from 'react'
import styles from './UploadZone.module.css'

export default function UploadZone({ onFile }) {
  const inputRef  = useRef()
  const [hover, setHover]   = useState(false)
  const [ready, setReady]   = useState(false)
  const [entered, setEntered] = useState(false)

  // Fade in on mount
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80)
    return () => clearTimeout(t)
  }, [])

  function handleFile(file) {
    if (!file || !file.type.startsWith('audio/')) return
    // Brief flash before transition
    setEntered(true)
    setTimeout(() => onFile(file), 600)
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
      className={`${styles.root} ${ready ? styles.visible : ''} ${entered ? styles.exiting : ''}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={() => setHover(false)}
      onClick={() => inputRef.current.click()}
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

        <div className={`${styles.dropZone} ${hover ? styles.hovering : ''}`}>
          <p className={styles.dropLabel}>
            {hover ? 'Suelta aquí' : 'Arrastra un archivo de audio'}
          </p>
          <p className={styles.dropSub}>o haz clic en cualquier parte</p>
        </div>

        <p className={styles.formats}>MP3 · WAV · FLAC · OGG · AAC</p>
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
