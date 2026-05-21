/* ─────────────────────────────────────────────────────────────
   ParticleField — palette read from paletteRef every frame
   Zero React state changes, zero re-renders, no black flash
───────────────────────────────────────────────────────────── */
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import vertGLSL from '../shaders/particles.vert.glsl?raw'
import fragGLSL from '../shaders/particles.frag.glsl?raw'

// Validate color array — never returns undefined/NaN/pure-black
function safeColor(arr, fallback) {
  if (!Array.isArray(arr) || arr.length < 3) return fallback
  const [r, g, b] = arr
  if ([r, g, b].some(v => v === undefined || v === null || isNaN(v))) return fallback
  return [Math.max(0.04, r), Math.max(0.04, g), Math.max(0.04, b)]
}

export default function ParticleField({ audioRef, config, paletteRef }) {
  const COUNT  = config.particleCount || 6000
  const RADIUS = config.sphereRadius  || 55

  // Geometry — only rebuilt on new song (COUNT/RADIUS change)
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
      const s  = RADIUS * (0.6 + Math.random() * 0.8)
      pos[i*3] = x*s; pos[i*3+1] = y*s; pos[i*3+2] = z*s
      norms[i*3] = x; norms[i*3+1] = y; norms[i*3+2] = z
      phs[i] = Math.random()
    }
    return { positions: pos, normals: norms, phases: phs }
  }, [COUNT, RADIUS])

  // Stable uniforms — created once per component lifetime
  const uniformsRef = useRef(null)
  if (uniformsRef.current === null) {
    const p   = paletteRef?.current ?? config.palette
    const [sR, sG, sB] = safeColor(p?.secondary, [0.9, 0.9, 0.9])
    const [pR, pG, pB] = safeColor(p?.primary,   [0.78, 0.66, 0.30])
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

  // Track last palette to detect changes (avoid work every frame)
  const lastPaletteRef = useRef(paletteRef?.current)

  useFrame(({ clock }) => {
    const u  = uniformsRef.current
    const ad = audioRef.current

    // ── Palette color sync (only when palette actually changed) ──
    const palette = paletteRef?.current
    if (palette && palette !== lastPaletteRef.current) {
      lastPaletteRef.current = palette
      const [sR, sG, sB] = safeColor(palette.secondary, [0.9, 0.9, 0.9])
      const [pR, pG, pB] = safeColor(palette.primary,   [0.78, 0.66, 0.30])
      u.uColorA.value.set(sR, sG, sB)
      u.uColorB.value.set(pR, pG, pB)
    }

    // ── Per-frame audio updates ──
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
