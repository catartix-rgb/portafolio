import { useState, useRef, useEffect } from 'react'
import UploadZone  from './ui/UploadZone'
import SpaceScreen from './screens/SpaceScreen'
import { AudioAnalyzer } from './audio/AudioAnalyzer'
import './App.css'

export default function App() {
  const [screen, setScreen] = useState('upload') // 'upload' | 'space'
  const [error,  setError]  = useState('')
  const analyzerRef = useRef(null)

  useEffect(() => {
    return () => analyzerRef.current?.destroy()
  }, [])

  async function handleFile(file) {
    setError('')

    // Destroy previous session
    analyzerRef.current?.destroy()
    analyzerRef.current = null

    const az = new AudioAnalyzer()
    try {
      await az.load(file)
      analyzerRef.current = az
      setScreen('space')
    } catch (err) {
      console.error('[AudioAnalyzer] Load error:', err)
      az.destroy()

      // Give a human-readable error
      const msg = err?.name === 'NotAllowedError'
        ? 'El navegador bloqueó el audio. Haz clic en la página primero.'
        : 'No se pudo cargar el archivo. Prueba MP3, WAV u OGG.'
      setError(msg)
    }
  }

  return (
    <>
      {screen === 'upload' && (
        <UploadZone onFile={handleFile} error={error} />
      )}
      {screen === 'space' && (
        <SpaceScreen analyzer={analyzerRef.current} />
      )}
    </>
  )
}
