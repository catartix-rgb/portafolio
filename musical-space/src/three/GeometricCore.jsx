import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import vertGLSL from '../shaders/core.vert.glsl?raw'
import fragGLSL from '../shaders/core.frag.glsl?raw'

export default function GeometricCore({ audioRef }) {
  const meshRef = useRef()

  const uniforms = useMemo(() => ({
    uTime     : { value: 0 },
    uBass     : { value: 0 },
    uSubBass  : { value: 0 },
    uAmplitude: { value: 0 },
  }), [])

  useFrame(({ clock }) => {
    const u  = uniforms
    const ad = audioRef.current
    u.uTime.value      = clock.getElapsedTime()
    u.uBass.value      = ad.bass
    u.uSubBass.value   = ad.subBass
    u.uAmplitude.value = ad.amplitude

    // Slow rotation on all axes
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.0008 + ad.lowMids * 0.003
      meshRef.current.rotation.y += 0.0012 + ad.bass    * 0.004
      meshRef.current.rotation.z += 0.0004
    }
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[6, 5]} />
      <shaderMaterial
        vertexShader={vertGLSL}
        fragmentShader={fragGLSL}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}
