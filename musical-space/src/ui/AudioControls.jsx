import { useState } from 'react'
import styles from './AudioControls.module.css'

export default function AudioControls({ analyzer, visible }) {
  const [playing, setPlaying] = useState(true)
  const [volume, setVolumeState]  = useState(0.8)

  async function togglePlay() {
    await analyzer?.togglePlay()
    setPlaying(analyzer?.isPlaying ?? false)
  }

  function onVolumeChange(e) {
    const v = parseFloat(e.target.value)
    setVolumeState(v)
    analyzer?.setVolume(v)
  }

  if (!visible) return null

  return (
    <div className={styles.root}>
      {/* Play / Pause */}
      <button
        className={styles.playBtn}
        onClick={togglePlay}
        aria-label={playing ? 'Pausar' : 'Reproducir'}
      >
        {playing ? (
          /* Pause icon */
          <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
            <rect x="0" y="0" width="4" height="16" rx="1" fill="currentColor"/>
            <rect x="9" y="0" width="4" height="16" rx="1" fill="currentColor"/>
          </svg>
        ) : (
          /* Play icon */
          <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
            <path d="M2 0L14 8L2 16V0Z" fill="currentColor"/>
          </svg>
        )}
      </button>

      {/* Volume */}
      <div className={styles.volWrapper}>
        {/* Volume icon */}
        <svg className={styles.volIcon} width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M0 4.5v5h3l4 4V0.5L3 4.5H0z" fill="currentColor" fillOpacity=".6"/>
          {volume > 0.05 && (
            <path d="M10 3a5 5 0 010 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity=".6"/>
          )}
          {volume > 0.5 && (
            <path d="M12 1a8 8 0 010 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity=".35"/>
          )}
        </svg>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={onVolumeChange}
          className={styles.slider}
          aria-label="Volumen"
        />
      </div>
    </div>
  )
}
