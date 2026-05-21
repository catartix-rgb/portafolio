import { useState, useRef, useEffect } from 'react'
import UploadZone  from './ui/UploadZone'
import SpaceScreen from './screens/SpaceScreen'
import { AudioAnalyzer } from './audio/AudioAnalyzer'
import './App.css'

export default function App() {
  const [screen, setScreen] = useState('upload') // 'upload' | 'space'
  const analyzerRef = useRef(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => analyzerRef.current?.destroy()
  }, [])

  async function handleFile(file) {
    // Destroy previous session if any
    analyzerRef.current?.destroy()
    analyzerRef.current = new AudioAnalyzer()
    try {
      await analyzerRef.current.load(file)
      setScreen('space')
    } catch (err) {
      console.error('Audio load failed:', err)
    }
  }

  return (
    <>
      {screen === 'upload' && (
        <UploadZone onFile={handleFile} />
      )}
      {screen === 'space' && (
        <SpaceScreen analyzer={analyzerRef.current} />
      )}
    </>
  )
}
