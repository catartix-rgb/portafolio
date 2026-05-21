import { useRef, useState, useEffect } from 'react'
import styles from './MiniPlayer.module.css'

export default function MiniPlayer({ analyzer, fileName, bpm, onNewFile }) {
  const inputRef      = useRef()
  const [playing, setPlaying]     = useState(true)
  const [volume,  setVolumeState] = useState(0.8)
  const [progress, setProgress]   = useState(0)
  const [duration, setDuration]   = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading]     = useState(false)

  // Sync duration when analyzer changes
  useEffect(() => {
    const audio = analyzer?.audio
    if (!audio) return
    const onMeta = () => setDuration(audio.duration || 0)
    audio.addEventListener('loadedmetadata', onMeta)
    if (audio.duration) setDuration(audio.duration)
    return () => audio.removeEventListener('loadedmetadata', onMeta)
  }, [analyzer])

  // Poll progress
  useEffect(() => {
    if (!analyzer?.audio) return
    let raf
    const tick = () => {
      const audio = analyzer.audio
      if (audio && !isDragging && audio.duration) {
        setProgress(audio.currentTime / audio.duration)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [analyzer, isDragging])

  // Format mm:ss
  function fmt(s) {
    if (!s || isNaN(s)) return '--:--'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  async function togglePlay() {
    await analyzer?.togglePlay()
    setPlaying(analyzer?.isPlaying ?? false)
  }

  function onVolumeChange(e) {
    const v = parseFloat(e.target.value)
    setVolumeState(v)
    analyzer?.setVolume(v)
  }

  function seekTo(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    if (analyzer?.audio?.duration) {
      analyzer.audio.currentTime = ratio * analyzer.audio.duration
    }
    setProgress(ratio)
    setIsDragging(false)
  }

  async function handleNewFile(file) {
    if (!file) return
    const validMime = file.type.startsWith('audio/')
    const validExt  = /\.(mp3|wav|flac|ogg|aac|m4a|opus|weba|webm)$/i.test(file.name)
    if (!validMime && !validExt) return
    setLoading(true)
    await onNewFile(file)
    setLoading(false)
    setPlaying(true)
    setProgress(0)
  }

  return (
    <div className={styles.root}>
      {/* Song name + BPM */}
      <div className={styles.meta}>
        <div className={styles.songName}>{fileName || '—'}</div>
        {bpm > 30 && <div className={styles.bpmBadge}>{bpm} BPM</div>}
      </div>

      {/* Progress bar */}
      <div
        className={styles.progressBar}
        onClick={seekTo}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={seekTo}
        title="Click para buscar"
      >
        <div className={styles.progressFill} style={{ width: `${progress * 100}%` }} />
        <div className={styles.progressThumb} style={{ left: `${progress * 100}%` }} />
      </div>

      {/* Time */}
      <div className={styles.times}>
        <span>{fmt(analyzer?.audio?.currentTime)}</span>
        <span>{fmt(duration)}</span>
      </div>

      {/* Controls row */}
      <div className={styles.controls}>
        {/* Play/Pause */}
        <button className={styles.playBtn} onClick={togglePlay} aria-label={playing ? 'Pausar' : 'Reproducir'}>
          {playing
            ? <svg width="10" height="12" viewBox="0 0 10 12" fill="none"><rect x="0" y="0" width="3" height="12" rx="0.8" fill="currentColor"/><rect x="6" y="0" width="3" height="12" rx="0.8" fill="currentColor"/></svg>
            : <svg width="10" height="12" viewBox="0 0 10 12" fill="none"><path d="M0 0L10 6L0 12V0Z" fill="currentColor"/></svg>
          }
        </button>

        {/* Volume */}
        <input
          type="range" min="0" max="1" step="0.01" value={volume}
          onChange={onVolumeChange} className={styles.volSlider} aria-label="Volumen"
        />

        {/* Upload new song */}
        <button
          className={`${styles.uploadBtn} ${loading ? styles.uploading : ''}`}
          onClick={() => inputRef.current.click()}
          title="Cambiar canción"
        >
          {loading ? '…' : '⇪ Nueva'}
        </button>
      </div>

      <input
        ref={inputRef} type="file" accept="audio/*" style={{ display: 'none' }}
        onChange={e => handleNewFile(e.target.files[0])}
      />
    </div>
  )
}
