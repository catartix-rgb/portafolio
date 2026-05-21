import { useRef, useState, useEffect, useCallback } from 'react'
import ImmersiveCanvas    from '../three/ImmersiveCanvas'
import Immersive3DScope   from '../visual/Immersive3DScope'
import NavBar             from '../ui/NavBar'
import AudioControls      from '../ui/AudioControls'
import MiniPlayer         from '../ui/MiniPlayer'
import OscModeSelector    from '../ui/OscModeSelector'
import OscColorPicker     from '../ui/OscColorPicker'
import { generateNewPalette } from '../visual/visualConfig'
import styles             from './SpaceScreen.module.css'

export default function SpaceScreen({ analyzer, config, onNewFile }) {
  const audioRef = useRef({
    bass: 0, mids: 0, highs: 0,
    subBass: 0, lowMids: 0, presence: 0,
    amplitude: 0, bpm: 0,
  })

  const [bpm, setBpm]           = useState(0)
  const [fileName, setFileName] = useState('')
  const [mode, setMode]         = useState('immersive')
  const [oscMode, setOscMode]   = useState('wave')
  const [scopeColor, setScopeColor] = useState('#00ff41')

  // ── Palette ref — mutated directly, never causes re-render ──
  // This is the KEY fix: palette changes bypass React state entirely
  const paletteRef  = useRef(config?.palette ?? null)
  const [paletteName, setPaletteName] = useState(config?.palette?.name ?? '')

  // Sync paletteRef when a NEW SONG is loaded (config fully changes)
  useEffect(() => {
    if (config?.palette) {
      paletteRef.current = config.palette
      setPaletteName(config.palette.name)
    }
  }, [config])

  // Randomize: ONLY mutates the ref — NO setConfig, NO App re-render, NO canvas reset
  const handleRandomize = useCallback(() => {
    const p = generateNewPalette()
    paletteRef.current = p   // instant, no render
    setPaletteName(p.name)   // only updates the tooltip text in AudioControls
  }, [])

  useEffect(() => {
    if (!analyzer) return
    setFileName(analyzer.fileName.replace(/\.[^.]+$/, '').slice(0, 48))
  }, [analyzer])

  // Main audio loop
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
      {/* Canvas layer — pointer-events handled by canvas itself */}
      <div className={styles.canvasLayer}>
        {mode === 'immersive' && (
          <ImmersiveCanvas
            audioRef={audioRef}
            config={config}
            paletteRef={paletteRef}
          />
        )}
        {mode === 'oscilloscope' && (
          <Immersive3DScope
            analyzer={analyzer}
            subMode={oscMode}
            scopeColor={scopeColor}
          />
        )}
      </div>

      {/* UI layer — all interactive, above canvas */}
      <div className={styles.uiLayer}>
        <NavBar />

        <AudioControls
          analyzer={analyzer}
          mode={mode}
          onModeChange={setMode}
          onRandomize={handleRandomize}
          paletteName={paletteName}
        />

        <MiniPlayer
          analyzer={analyzer}
          fileName={fileName}
          bpm={bpm}
          onNewFile={onNewFile}
        />

        {mode === 'oscilloscope' && (
          <>
            <OscModeSelector subMode={oscMode} onChange={setOscMode} />
            <OscColorPicker  color={scopeColor} onChange={setScopeColor} />
          </>
        )}
      </div>
    </div>
  )
}
