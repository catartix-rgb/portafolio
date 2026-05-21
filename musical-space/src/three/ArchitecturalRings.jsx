import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const RING_CONFIGS = [
  { radius: 14, tube: 0.045, rotAxis: [1, 0, 0], speed: 0.0006, phase: 0.0 },
  { radius: 20, tube: 0.035, rotAxis: [0, 1, 0], speed: 0.0004, phase: 1.2 },
  { radius: 28, tube: 0.025, rotAxis: [1, 1, 0], speed: 0.0003, phase: 2.4 },
  { radius: 36, tube: 0.020, rotAxis: [0, 1, 1], speed: 0.0005, phase: 3.6 },
  { radius: 44, tube: 0.018, rotAxis: [1, 0, 1], speed: 0.0002, phase: 4.8 },
  { radius: 52, tube: 0.015, rotAxis: [1, 1, 1], speed: 0.0001, phase: 6.0 },
]

// Single ring mesh
function Ring({ config, audioRef, index }) {
  const meshRef = useRef()
  const mat     = useRef()

  useFrame(({ clock }) => {
    const t  = clock.getElapsedTime()
    const ad = audioRef.current
    if (!meshRef.current) return

    // Rotation on config axis
    const [ax, ay, az] = config.rotAxis
    const spd = config.speed + ad.bass * 0.008
    meshRef.current.rotation.x += ax * spd
    meshRef.current.rotation.y += ay * spd
    meshRef.current.rotation.z += az * spd

    // Scale pulse: bass drives inward rings more
    const pulse = 1 + ad.bass * (0.3 - index * 0.04)
    meshRef.current.scale.setScalar(pulse)

    // Opacity breathes with amplitude
    if (mat.current) {
      mat.current.opacity = 0.06 + ad.amplitude * 0.14 + ad.bass * 0.08
    }
  })

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[config.radius, config.tube, 3, 128]} />
      <meshBasicMaterial
        ref={mat}
        color="#C9A84C"
        transparent
        opacity={0.06}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

export default function ArchitecturalRings({ audioRef }) {
  return (
    <group>
      {RING_CONFIGS.map((cfg, i) => (
        <Ring key={i} config={cfg} audioRef={audioRef} index={i} />
      ))}
    </group>
  )
}
