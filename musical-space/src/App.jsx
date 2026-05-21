import { useState, useRef, useEffect, useCallback } from 'react'
import UploadZone       from './ui/UploadZone'
import SpaceScreen      from './screens/SpaceScreen'
import { AudioAnalyzer } from './audio/AudioAnalyzer'
import { generateVisualConfig } from './visual/visualConfig'
import './App.css'

export default function App() {
  const [screen,  setScreen]  = useState('upload')
  const [error,   setError]   = useState('')
  const [config,  setConfig]  = useState(null)
  const analyzerRef = useRef(null)

  useEffect(() => {
    return () => analyzerRef.current?.destroy()
  }, [])

  // Generate new random visual config
  const randomize = useCallback(() => {
    setConfig(generateVisualConfig())
  }, [])

  async function handleFile(file) {
    setError('')
    analyzerRef.current?.destroy()
    analyzerRef.current = null

    const az = new AudioAnalyzer()
    try {
      await az.load(file)
      analyzerRef.current = az
      // Generate fresh random visuals on each new song
      setConfig(generateVisualConfig())
      setScreen('space')
    } catch (err) {
      console.error('[AudioAnalyzer]', err)
      az.destroy()
      const msg = err?.name === 'NotAllowedError'
        ? 'El navegador bloqueó el audio. Haz clic en la página primero.'
        : 'No se pudo cargar. Prueba MP3, WAV u OGG.'
      setError(msg)
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
        />
      )}
    </>
  )
}
