import { useRef, useState, useEffect } from 'react'
import ImmersiveCanvas      from '../three/ImmersiveCanvas'
import OscilloscopeScreen   from '../visual/OscilloscopeScreen'
import NavBar               from '../ui/NavBar'
import AudioInfo            from '../ui/AudioInfo'
import AudioControls        from '../ui/AudioControls'
import MiniPlayer           from '../ui/MiniPlayer'
import styles               from './SpaceScreen.module.css'

export default function SpaceScreen({ analyzer, config, onRandomize, onNewFile }) {
  const audioRef = useRef({
    bass: 0, mids: 0, highs: 0,
    subBass: 0, lowMids: 0, presence: 0,
    amplitude: 0, bpm: 0,
  })

  const [bpm, setBpm]         = useState(0)
  const [fileName, setFileName] = useState('')
  const [mode, setMode]       = useState('immersive')

  // File name from analyzer
  useEffect(() => {
    if (!analyzer) return
    setFileName(analyzer.fileName.replace(/\.[^.]+$/, '').slice(0, 48))
  }, [analyzer])

  // Main audio poll loop
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

      if (analyzer.bpm > 30) {
        setBpm(p => Math.abs(analyzer.bpm - p) > 3 ? analyzer.bpm : p)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [analyzer])

  return (
    <div className={styles.root}>
      <NavBar />

      {mode === 'immersive' && (
        <ImmersiveCanvas audioRef={audioRef} config={config} />
      )}
      {mode === 'oscilloscope' && (
        <OscilloscopeScreen analyzer={analyzer} />
      )}

      {/* Mini Player — always visible, bottom right */}
      <MiniPlayer
        analyzer={analyzer}
        fileName={fileName}
        bpm={bpm}
        onNewFile={onNewFile}
      />

      {/* Bottom center controls */}
      <AudioControls
        analyzer={analyzer}
        visible={true}
        mode={mode}
        onModeChange={setMode}
        onRandomize={onRandomize}
        paletteName={config?.palette?.name ?? ''}
      />
    </div>
  )
}
