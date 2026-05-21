import { useState } from 'react'
import styles from './AudioControls.module.css'

export default function AudioControls({ analyzer, visible, mode, onModeChange, onRandomize, paletteName }) {
  const [playing, setPlaying] = useState(true)
  const [volume, setVolumeState] = useState(0.8)

  async function togglePlay() {
    await analyzer?.togglePlay()
    setPlaying(analyzer?.isPlaying ?? false)
  }

  function onVolumeChange(e) {
    const v = parseFloat(e.target.value)
    setVolumeState(v)
    analyzer?.setVolume(v)
  }

  return (
    <div className={styles.root}>
      {/* Play / Pause */}
      <button className={styles.playBtn} onClick={togglePlay} aria-label={playing ? 'Pausar' : 'Reproducir'}>
        {playing ? (
          <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
            <rect x="0" y="0" width="3.5" height="14" rx="1" fill="currentColor"/>
            <rect x="7.5" y="0" width="3.5" height="14" rx="1" fill="currentColor"/>
          </svg>
        ) : (
          <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
            <path d="M1 0L12 7L1 14V0Z" fill="currentColor"/>
          </svg>
        )}
      </button>

      {/* Volume */}
      <div className={styles.volWrapper}>
        <svg className={styles.volIcon} width="13" height="13" viewBox="0 0 14 14" fill="none">
          <path d="M0 4.5v5h3l4 4V0.5L3 4.5H0z" fill="currentColor" fillOpacity=".55"/>
          {volume > 0.05 && <path d="M10 3a5 5 0 010 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity=".55"/>}
          {volume > 0.5  && <path d="M12 1a8 8 0 010 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity=".30"/>}
        </svg>
        <input type="range" min="0" max="1" step="0.01" value={volume}
          onChange={onVolumeChange} className={styles.slider} aria-label="Volumen" />
      </div>

      {/* Divider */}
      <span className={styles.divider} />

      {/* Mode toggle: 3D | Oscilloscope */}
      <div className={styles.modeGroup}>
        <button
          className={`${styles.modeBtn} ${mode === 'immersive' ? styles.modeActive : ''}`}
          onClick={() => onModeChange('immersive')}
          title="Modo 3D Inmersivo"
        >3D</button>
        <button
          className={`${styles.modeBtn} ${mode === 'oscilloscope' ? styles.modeActive : ''}`}
          onClick={() => onModeChange('oscilloscope')}
          title="Osciloscopio Retro"
        >◉</button>
      </div>

      {/* Divider */}
      <span className={styles.divider} />

      {/* Randomize — only in 3D mode */}
      {mode === 'immersive' && (
        <button className={styles.randomBtn} onClick={onRandomize} title={`Paleta: ${paletteName}`}>
          ⟳
        </button>
      )}
    </div>
  )
}
