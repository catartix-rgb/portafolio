import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import vertGLSL from '../shaders/particles.vert.glsl?raw'
import fragGLSL from '../shaders/particles.frag.glsl?raw'

export default function ParticleField({ audioRef, config }) {
  const meshRef = useRef()

  const COUNT  = config.particleCount
  const RADIUS = config.sphereRadius

  const { positions, normals, phases } = useMemo(() => {
    const pos   = new Float32Array(COUNT * 3)
    const norms = new Float32Array(COUNT * 3)
    const phs   = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      // Fibonacci sphere
      const golden = Math.PI * (3 - Math.sqrt(5))
      const y  = 1 - (i / (COUNT - 1)) * 2
      const r  = Math.sqrt(1 - y * y)
      const th = golden * i
      const x  = Math.cos(th) * r
      const z  = Math.sin(th) * r

      const scale = RADIUS * (0.6 + Math.random() * 0.8)
      pos[i*3]   = x * scale
      pos[i*3+1] = y * scale
      pos[i*3+2] = z * scale
      norms[i*3]   = x
      norms[i*3+1] = y
      norms[i*3+2] = z
      phs[i] = Math.random()
    }
    return { positions: pos, normals: norms, phases: phs }
  }, [COUNT, RADIUS])

  const uniforms = useMemo(() => {
    const [sR, sG, sB] = config.palette.secondary
    const [pR, pG, pB] = config.palette.primary
    return {
      uTime     : { value: 0 },
      uBass     : { value: 0 },
      uHighs    : { value: 0 },
      uAmplitude: { value: 0 },
      uSpeed    : { value: config.particleSpeed },
      uColorA   : { value: new THREE.Vector3(sR, sG, sB) },
      uColorB   : { value: new THREE.Vector3(pR, pG, pB) },
    }
  }, [config])

  useFrame(({ clock }) => {
    const u  = uniforms
    const ad = audioRef.current
    u.uTime.value      = clock.getElapsedTime()
    u.uBass.value      = ad.bass
    u.uHighs.value     = ad.highs
    u.uAmplitude.value = ad.amplitude
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aNormal"   args={[normals, 3]} />
        <bufferAttribute attach="attributes-aPhase"    args={[phases, 1]} />
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
