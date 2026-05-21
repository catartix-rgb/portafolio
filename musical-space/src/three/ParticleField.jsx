/* ─────────────────────────────────────────────────────────────
   ParticleField — stable uniforms, color never goes black
   Colors update in-place via useEffect, no scene reset
───────────────────────────────────────────────────────────── */
import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import vertGLSL from '../shaders/particles.vert.glsl?raw'
import fragGLSL from '../shaders/particles.frag.glsl?raw'

// Safe value: ensure no NaN / undefined / 0-only black
function safeColor(arr, fallback) {
  if (!Array.isArray(arr)) return fallback
  const [r, g, b] = arr
  if ([r, g, b].some(v => v === undefined || v === null || isNaN(v))) return fallback
  // Never allow pure black — floor to 0.04 so there's always a visible tint
  return [Math.max(0.04, r), Math.max(0.04, g), Math.max(0.04, b)]
}

export default function ParticleField({ audioRef, config }) {
  // ── Geometry — rebuilds only when particle count / radius changes ──
  const COUNT  = config.particleCount  || 6000
  const RADIUS = config.sphereRadius   || 55

  const { positions, normals, phases } = useMemo(() => {
    const pos   = new Float32Array(COUNT * 3)
    const norms = new Float32Array(COUNT * 3)
    const phs   = new Float32Array(COUNT)

    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < COUNT; i++) {
      const y  = 1 - (i / (COUNT - 1)) * 2
      const r  = Math.sqrt(Math.max(0, 1 - y * y))
      const th = golden * i
      const x  = Math.cos(th) * r
      const z  = Math.sin(th) * r

      const scale = RADIUS * (0.6 + Math.random() * 0.8)
      pos[i*3]   = x * scale
      pos[i*3+1] = y * scale
      pos[i*3+2] = z * scale
      norms[i*3]   = x; norms[i*3+1] = y; norms[i*3+2] = z
      phs[i] = Math.random()
    }
    return { positions: pos, normals: norms, phases: phs }
  }, [COUNT, RADIUS])

  // ── STABLE uniforms ref — never recreated, values updated in-place ──
  const uniformsRef = useRef(null)
  if (uniformsRef.current === null) {
    const [sR, sG, sB] = safeColor(config.palette?.secondary, [0.9, 0.9, 0.9])
    const [pR, pG, pB] = safeColor(config.palette?.primary,   [0.78, 0.66, 0.30])
    uniformsRef.current = {
      uTime     : { value: 0 },
      uBass     : { value: 0 },
      uHighs    : { value: 0 },
      uAmplitude: { value: 0 },
      uSpeed    : { value: config.particleSpeed || 1 },
      uColorA   : { value: new THREE.Vector3(sR, sG, sB) },
      uColorB   : { value: new THREE.Vector3(pR, pG, pB) },
    }
  }

  // ── Update colors in-place when palette changes — NO scene reset ──
  useEffect(() => {
    if (!config?.palette || !uniformsRef.current) return

    const [sR, sG, sB] = safeColor(config.palette.secondary, [0.9, 0.9, 0.9])
    const [pR, pG, pB] = safeColor(config.palette.primary,   [0.78, 0.66, 0.30])

    uniformsRef.current.uColorA.value.set(sR, sG, sB)
    uniformsRef.current.uColorB.value.set(pR, pG, pB)
    uniformsRef.current.uSpeed.value = config.particleSpeed || 1
  }, [config.palette, config.particleSpeed])

  useFrame(({ clock }) => {
    const u  = uniformsRef.current
    const ad = audioRef.current
    u.uTime.value      = clock.getElapsedTime()
    u.uBass.value      = ad.bass      ?? 0
    u.uHighs.value     = ad.highs     ?? 0
    u.uAmplitude.value = ad.amplitude ?? 0
  })

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aNormal"   args={[normals, 3]} />
        <bufferAttribute attach="attributes-aPhase"    args={[phases, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertGLSL}
        fragmentShader={fragGLSL}
        uniforms={uniformsRef.current}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
