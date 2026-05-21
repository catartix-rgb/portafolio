import { useRef, useState, useEffect } from 'react'
import ImmersiveCanvas from '../three/ImmersiveCanvas'
import NavBar         from '../ui/NavBar'
import AudioInfo      from '../ui/AudioInfo'
import AudioControls  from '../ui/AudioControls'
import styles         from './SpaceScreen.module.css'

export default function SpaceScreen({ analyzer }) {
  // Shared ref: updated by rAF loop, read by R3F useFrame in every 3D component
  const audioRef = useRef({
    bass: 0, mids: 0, highs: 0,
    subBass: 0, lowMids: 0, presence: 0,
    amplitude: 0, bpm: 0,
  })

  const [bpm, setBpm]       = useState(0)
  const [fileName, setFileName] = useState('')
  const [ready, setReady]   = useState(false)

  // Fade in
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80)
    return () => clearTimeout(t)
  }, [])

  // Resolve file name once
  useEffect(() => {
    if (!analyzer) return
    const raw = analyzer.fileName
    setFileName(raw.replace(/\.[^.]+$/, '').slice(0, 48))
  }, [analyzer])

  // Animation loop: update analyzer + fill audioRef every frame
  useEffect(() => {
    if (!analyzer) return
    let raf
    const tick = () => {
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

      // Update BPM display only on meaningful change
      if (analyzer.bpm > 30) {
        setBpm(p => Math.abs(analyzer.bpm - p) > 3 ? analyzer.bpm : p)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [analyzer])

  return (
    <div className={`${styles.root} ${ready ? styles.visible : ''}`}>
      <NavBar />
      <ImmersiveCanvas audioRef={audioRef} />
      <AudioInfo fileName={fileName} bpm={bpm} visible={ready} />
      <AudioControls analyzer={analyzer} visible={ready} />
    </div>
  )
}
