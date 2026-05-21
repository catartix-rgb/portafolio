import styles from './OscModeSelector.module.css'

export default function OscModeSelector({ subMode, onChange }) {
  return (
    <div className={styles.dock}>
      <button
        className={`${styles.btn} ${subMode === 'wave' ? styles.active : ''}`}
        onClick={() => onChange('wave')}
        aria-label="Modo waveform"
      >
        WAVE
      </button>
      <span className={styles.sep} />
      <button
        className={`${styles.btn} ${subMode === 'lissajous' ? styles.active : ''}`}
        onClick={() => onChange('lissajous')}
        aria-label="Modo XY Lissajous"
      >
        XY
      </button>
    </div>
  )
}
