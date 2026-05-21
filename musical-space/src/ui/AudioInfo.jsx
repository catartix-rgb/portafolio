import { useState, useEffect } from 'react'
import styles from './AudioInfo.module.css'

export default function AudioInfo({ fileName, bpm, visible }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setShow(true), 1200)
      return () => clearTimeout(t)
    }
    setShow(false)
  }, [visible])

  // Clean up the file name for display
  const name = fileName
    ? fileName.replace(/\.[^.]+$/, '').slice(0, 40)
    : ''

  return (
    <div className={`${styles.root} ${show ? styles.visible : ''}`}>
      <p className={styles.name}>{name}</p>
      {bpm > 0 && (
        <p className={styles.bpm}>
          <span className={styles.bpmVal}>{bpm}</span>
          <span className={styles.bpmUnit}> BPM</span>
        </p>
      )}
    </div>
  )
}
