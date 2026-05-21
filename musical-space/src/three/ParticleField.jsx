import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import vertGLSL from '../shaders/particles.vert.glsl?raw'
import fragGLSL from '../shaders/particles.frag.glsl?raw'

const COUNT = 7000
const SPHERE_RADIUS = 55

export default function ParticleField({ audioRef }) {
  const meshRef = useRef()

  // Build geometry once
  const { positions, normals, phases } = useMemo(() => {
    const pos    = new Float32Array(COUNT * 3)
    const norms  = new Float32Array(COUNT * 3)
    const phs    = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      // Fibonacci sphere distribution — even coverage
      const golden = Math.PI * (3 - Math.sqrt(5))
      const y  = 1 - (i / (COUNT - 1)) * 2
      const r  = Math.sqrt(1 - y * y)
      const theta = golden * i
      const x  = Math.cos(theta) * r
      const z  = Math.sin(theta) * r

      const scale = SPHERE_RADIUS * (0.6 + Math.random() * 0.8)
      pos[i*3]   = x * scale
      pos[i*3+1] = y * scale
      pos[i*3+2] = z * scale

      norms[i*3]   = x
      norms[i*3+1] = y
      norms[i*3+2] = z

      phs[i] = Math.random()
    }
    return { positions: pos, normals: norms, phases: phs }
  }, [])

  const uniforms = useMemo(() => ({
    uTime     : { value: 0 },
    uBass     : { value: 0 },
    uHighs    : { value: 0 },
    uAmplitude: { value: 0 },
  }), [])

  useFrame(({ clock }) => {
    const u = uniforms
    u.uTime.value      = clock.getElapsedTime()
    u.uBass.value      = audioRef.current.bass
    u.uHighs.value     = audioRef.current.highs
    u.uAmplitude.value = audioRef.current.amplitude
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aNormal"
          args={[normals, 3]}
        />
        <bufferAttribute
          attach="attributes-aPhase"
          args={[phases, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertGLSL}
        fragmentShader={fragGLSL}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
