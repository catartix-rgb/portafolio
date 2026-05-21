import { useRef, useState, useEffect } from 'react'
import ImmersiveCanvas from '../three/ImmersiveCanvas'
import NavBar    from '../ui/NavBar'
import AudioInfo from '../ui/AudioInfo'
import { useAudioData } from '../audio/useAudioData'
import { Canvas }       from '@react-three/fiber'
import styles from './SpaceScreen.module.css'

// We need the audioRef to be accessible outside R3F Canvas
// So we create a shared ref at this level

export default function SpaceScreen({ analyzer }) {
  const audioRef = useRef({
    bass: 0, mids: 0, highs: 0,
    subBass: 0, lowMids: 0, presence: 0,
    amplitude: 0, bpm: 0,
  })

  const [bpm, setBpm] = useState(0)
  const [fileName, setFileName] = useState('')
  const [ready, setReady] = useState(false)

  // Fade in
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 100)
    return () => clearTimeout(t)
  }, [])

  // Poll audio data outside R3F for UI display (low rate)
  useEffect(() => {
    if (!analyzer) return
    setFileName(analyzer.audio?.src
      ? decodeURIComponent(analyzer.audio.src.split('/').pop()).replace(/\.[^.]+$/, '')
      : '')

    let raf
    const poll = () => {
      analyzer.update()
      const b = analyzer.bands
      audioRef.current.bass      = b.bass
      audioRef.current.mids      = b.mids
      audioRef.current.highs     = b.highs
      audioRef.current.subBass   = b.subBass
      audioRef.current.lowMids   = b.lowMids
      audioRef.current.presence  = b.presence
      audioRef.current.amplitude = analyzer.amplitude
      audioRef.current.bpm       = analyzer.bpm

      // Update BPM display at low rate
      setBpm(prev => analyzer.bpm > 0 && Math.abs(analyzer.bpm - prev) > 2
        ? analyzer.bpm : prev)

      raf = requestAnimationFrame(poll)
    }
    raf = requestAnimationFrame(poll)
    return () => cancelAnimationFrame(raf)
  }, [analyzer])

  return (
    <div className={`${styles.root} ${ready ? styles.visible : ''}`}>
      <NavBar />
      <ImmersiveCanvas audioRef={audioRef} />
      <AudioInfo fileName={fileName} bpm={bpm} visible={ready} />
    </div>
  )
}
