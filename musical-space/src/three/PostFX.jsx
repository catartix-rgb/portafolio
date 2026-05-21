import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  Noise,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

// Stable refs for uniform-like animation
const _caOffset = new THREE.Vector2(0, 0)

export default function PostFX({ audioRef }) {
  const bloomRef = useRef()
  const caRef    = useRef()

  useFrame(() => {
    const ad = audioRef.current

    // Bloom intensity: base + bass drive
    if (bloomRef.current) {
      bloomRef.current.intensity = 0.55 + ad.bass * 1.6 + ad.amplitude * 0.4
    }

    // Chromatic aberration: highs + presence drive
    const caAmount = (ad.highs * 0.006 + ad.presence * 0.003)
    _caOffset.set(caAmount, caAmount * 0.5)
    if (caRef.current) {
      caRef.current.offset = _caOffset
    }
  })

  return (
    <EffectComposer>
      <Bloom
        ref={bloomRef}
        intensity={0.55}
        luminanceThreshold={0.20}
        luminanceSmoothing={0.9}
        mipmapBlur
        radius={0.85}
      />
      <Vignette
        offset={0.38}
        darkness={0.88}
        blendFunction={BlendFunction.NORMAL}
      />
      <ChromaticAberration
        ref={caRef}
        offset={_caOffset}
        blendFunction={BlendFunction.NORMAL}
        radialModulation={false}
      />
      <Noise
        opacity={0.032}
        blendFunction={BlendFunction.ADD}
        premultiply
      />
    </EffectComposer>
  )
}
