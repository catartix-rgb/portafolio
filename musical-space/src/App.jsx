import { useState, useRef, useEffect, useCallback } from 'react'
import UploadZone       from './ui/UploadZone'
import SpaceScreen      from './screens/SpaceScreen'
import { AudioAnalyzer } from './audio/AudioAnalyzer'
import { generateVisualConfig, generateNewPalette } from './visual/visualConfig'
import './App.css'

export default function App() {
  const [screen,  setScreen]  = useState('upload')
  const [error,   setError]   = useState('')
  const [config,  setConfig]  = useState(null)
  const analyzerRef = useRef(null)

  useEffect(() => {
    return () => analyzerRef.current?.destroy()
  }, [])

  // Randomize: ONLY swap palette — no geometry rebuild, no scene reset
  const randomize = useCallback(() => {
    setConfig(prev => prev ? { ...prev, palette: generateNewPalette() } : generateVisualConfig())
  }, [])

  // Load audio file — used for both initial load AND song replacement
  async function loadAudio(file) {
    setError('')
    analyzerRef.current?.destroy()
    analyzerRef.current = null

    const az = new AudioAnalyzer()
    try {
      await az.load(file)
      analyzerRef.current = az
      return true
    } catch (err) {
      console.error('[AudioAnalyzer]', err)
      az.destroy()
      const msg = err?.name === 'NotAllowedError'
        ? 'El navegador bloqueó el audio. Haz clic en la página primero.'
        : 'No se pudo cargar. Prueba MP3, WAV u OGG.'
      setError(msg)
      return false
    }
  }

  // Initial file load → enter space
  async function handleFile(file) {
    const ok = await loadAudio(file)
    if (ok) {
      setConfig(generateVisualConfig())
      setScreen('space')
    }
  }

  // Replace song while staying in space (no page reload)
  async function handleNewFile(file) {
    const ok = await loadAudio(file)
    if (ok) {
      // Fresh random visuals for the new track
      setConfig(generateVisualConfig())
    }
  }

  return (
    <>
      {screen === 'upload' && (
        <UploadZone onFile={handleFile} error={error} />
      )}
      {screen === 'space' && config && (
        <SpaceScreen
          analyzer={analyzerRef.current}
          config={config}
          onRandomize={randomize}
          onNewFile={handleNewFile}
        />
      )}
    </>
  )
}
