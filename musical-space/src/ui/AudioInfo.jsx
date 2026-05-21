import { useState, useEffect } from 'react'
import styles from './AudioInfo.module.css'

export default function AudioInfo({ fileName, bpm, visible }) {
  const name = fileName ? fileName.slice(0, 40) : ''

  return (
    <div className={`${styles.root} ${visible ? styles.visible : ''}`}>
      <p className={styles.name}>{name || '—'}</p>
      {bpm > 30 && (
        <p className={styles.bpm}>
          <span className={styles.bpmVal}>{bpm}</span>
          <span className={styles.bpmUnit}> BPM</span>
        </p>
      )}
    </div>
  )
}
