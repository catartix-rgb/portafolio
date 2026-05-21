import { useRef, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'

/**
 * Hook that reads from an AudioAnalyzer instance every frame.
 * Returns a ref to the live audio data object — use .current inside useFrame.
 */
export function useAudioData(analyzer) {
  const dataRef = useRef({
    bass    : 0,
    mids    : 0,
    highs   : 0,
    subBass : 0,
    lowMids : 0,
    presence: 0,
    amplitude: 0,
    bpm     : 0,
  })

  useFrame(() => {
    if (!analyzer) return
    analyzer.update()
    const b = analyzer.bands
    dataRef.current.bass     = b.bass
    dataRef.current.mids     = b.mids
    dataRef.current.highs    = b.highs
    dataRef.current.subBass  = b.subBass
    dataRef.current.lowMids  = b.lowMids
    dataRef.current.presence = b.presence
    dataRef.current.amplitude = analyzer.amplitude
    dataRef.current.bpm      = analyzer.bpm
  })

  return dataRef
}
