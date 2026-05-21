import { useRef, useState, useEffect } from 'react'
import ImmersiveCanvas    from '../three/ImmersiveCanvas'
import Immersive3DScope   from '../visual/Immersive3DScope'
import NavBar             from '../ui/NavBar'
import AudioControls      from '../ui/AudioControls'
import MiniPlayer         from '../ui/MiniPlayer'
import OscModeSelector    from '../ui/OscModeSelector'
import styles             from './SpaceScreen.module.css'

export default function SpaceScreen({ analyzer, config, onRandomize, onNewFile }) {
  const audioRef = useRef({
    bass: 0, mids: 0, highs: 0,
    subBass: 0, lowMids: 0, presence: 0,
    amplitude: 0, bpm: 0,
  })

  const [bpm, setBpm]           = useState(0)
  const [fileName, setFileName] = useState('')
  const [mode, setMode]         = useState('immersive')    // 'immersive' | 'oscilloscope'
  const [oscMode, setOscMode]   = useState('wave')         // 'wave' | 'lissajous'

  // File name from analyzer
  useEffect(() => {
    if (!analyzer) return
    setFileName(analyzer.fileName.replace(/\.[^.]+$/, '').slice(0, 48))
  }, [analyzer])

  // Main audio poll loop — runs always, feeds audioRef for R3F components
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
      {/* Nav — z:600 */}
      <NavBar />

      {/* ── Canvases — z:0 ───────────────────────────── */}
      {mode === 'immersive' && (
        <ImmersiveCanvas audioRef={audioRef} config={config} />
      )}
      {mode === 'oscilloscope' && (
        <Immersive3DScope analyzer={analyzer} subMode={oscMode} />
      )}

      {/* ── UI overlay — all above canvases ──────────── */}

      {/* Mini Player — bottom right, z:250 */}
      <MiniPlayer
        analyzer={analyzer}
        fileName={fileName}
        bpm={bpm}
        onNewFile={onNewFile}
      />

      {/* Osc sub-mode selector — bottom LEFT, z:500, only in scope mode */}
      {mode === 'oscilloscope' && (
        <OscModeSelector subMode={oscMode} onChange={setOscMode} />
      )}

      {/* Main controls — bottom center, z:200 */}
      <AudioControls
        analyzer={analyzer}
        mode={mode}
        onModeChange={setMode}
        onRandomize={onRandomize}
        paletteName={config?.palette?.name ?? ''}
      />
    </div>
  )
}
