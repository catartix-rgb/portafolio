import { useState } from 'react'
import styles from './OscColorPicker.module.css'

const PRESETS = [
  { name: 'Phosphor',  hex: '#00ff41', glow: 'rgba(0,255,65,0.6)'   },
  { name: 'Cyan',      hex: '#00f5ff', glow: 'rgba(0,245,255,0.6)'  },
  { name: 'Amber',     hex: '#FF9500', glow: 'rgba(255,149,0,0.6)'  },
  { name: 'White',     hex: '#e8e8e8', glow: 'rgba(232,232,232,0.5)'},
  { name: 'Violet',    hex: '#b347ff', glow: 'rgba(179,71,255,0.6)' },
  { name: 'Crimson',   hex: '#ff3344', glow: 'rgba(255,51,68,0.6)'  },
  { name: 'Solar',     hex: '#ffe033', glow: 'rgba(255,224,51,0.6)' },
]

export default function OscColorPicker({ color, onChange }) {
  const [open, setOpen] = useState(false)

  const current = PRESETS.find(p => p.hex === color) ?? PRESETS[0]

  return (
    <div className={styles.root}>
      {/* Expanded palette */}
      {open && (
        <div className={styles.palette}>
          {PRESETS.map(p => (
            <button
              key={p.hex}
              className={`${styles.swatch} ${color === p.hex ? styles.swatchActive : ''}`}
              style={{ '--c': p.hex, '--g': p.glow }}
              onClick={() => { onChange(p.hex); setOpen(false) }}
              title={p.name}
              aria-label={p.name}
            />
          ))}
        </div>
      )}

      {/* Toggle button */}
      <button
        className={styles.toggle}
        style={{ '--c': current.hex, '--g': current.glow }}
        onClick={() => setOpen(o => !o)}
        title="Color del osciloscopio"
        aria-label="Cambiar color del osciloscopio"
      >
        <span className={styles.dot} />
        <span className={styles.label}>OSC</span>
      </button>
    </div>
  )
}
