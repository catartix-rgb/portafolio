import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function ArchitecturalRings({ audioRef, config, paletteRef }) {
  const COUNT  = config.ringCount  || 6
  const SPREAD = config.ringSpread || 1

  const rings = useMemo(() => {
    const arr = []
    for (let i = 0; i < COUNT; i++) {
      const t = i / Math.max(1, COUNT - 1)
      arr.push({
        radius  : (10 + t * 44) * SPREAD,
        tube    : 0.045 - t * 0.028,
        rotAxis : [
          Math.sin(i * 1.1),
          Math.cos(i * 0.7),
          Math.sin(i * 0.4 + 1),
        ],
        speed: 0.0006 - t * 0.0003,
      })
    }
    return arr
  }, [COUNT, SPREAD])

  const matsRef = useRef([])
  const meshRef = useRef([])

  // Track palette changes for ring color updates
  const lastPaletteRef = useRef(paletteRef?.current)

  useFrame(() => {
    const ad = audioRef.current

    // ── Color sync on palette change ──
    const palette = paletteRef?.current
    if (palette && palette !== lastPaletteRef.current) {
      lastPaletteRef.current = palette
      const raw = palette.primary ?? [0.78, 0.66, 0.30]
      const [pR, pG, pB] = raw.map(v =>
        (v === undefined || isNaN(v)) ? 0.3 : Math.max(0.04, v)
      )
      const col = new THREE.Color(pR, pG, pB)
      matsRef.current.forEach(mat => mat && mat.color.copy(col))
    }

    // ── Per-frame ring animation ──
    rings.forEach((ring, i) => {
      const mesh = meshRef.current[i]
      const mat  = matsRef.current[i]
      if (!mesh) return

      const [ax, ay, az] = ring.rotAxis
      const spd = ring.speed + (ad.bass ?? 0) * 0.008
      mesh.rotation.x += ax * spd
      mesh.rotation.y += ay * spd
      mesh.rotation.z += az * spd

      const pulse = 1 + (ad.bass ?? 0) * Math.max(0, 0.3 - i * 0.03)
      mesh.scale.setScalar(pulse)

      if (mat) {
        mat.opacity = 0.06 + (ad.amplitude ?? 0) * 0.14 + (ad.bass ?? 0) * 0.08
      }
    })
  })

  // Initial color from paletteRef
  const initColor = useMemo(() => {
    const p   = paletteRef?.current ?? config.palette
    const raw = p?.primary ?? [0.78, 0.66, 0.30]
    const [pR, pG, pB] = raw.map(v =>
      (v === undefined || isNaN(v)) ? 0.3 : Math.max(0.04, v)
    )
    return new THREE.Color(pR, pG, pB).getHex()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <group>
      {rings.map((ring, i) => (
        <mesh
          key={i}
          ref={el => (meshRef.current[i] = el)}
        >
          <torusGeometry args={[ring.radius, ring.tube, 3, 128]} />
          <meshBasicMaterial
            ref={el => (matsRef.current[i] = el)}
            color={initColor}
            transparent
            opacity={0.06}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}
