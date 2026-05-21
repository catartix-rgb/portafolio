import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function ArchitecturalRings({ audioRef, config }) {
  const COUNT  = config.ringCount
  const SPREAD = config.ringSpread
  const [pR, pG, pB] = config.palette.primary
  const hexColor = new THREE.Color(pR, pG, pB).getHex()

  const rings = useMemo(() => {
    const arr = []
    for (let i = 0; i < COUNT; i++) {
      const t = i / (COUNT - 1)
      arr.push({
        radius  : (10 + t * 44) * SPREAD,
        tube    : 0.045 - t * 0.028,
        rotAxis : [
          Math.sin(i * 1.1),
          Math.cos(i * 0.7),
          Math.sin(i * 0.4 + 1),
        ],
        speed : (0.0006 - t * 0.0003),
      })
    }
    return arr
  }, [COUNT, SPREAD])

  const refsArr = useRef(rings.map(() => ({ mesh: null, mat: null })))
  const matsRef = useRef([])
  const meshRef = useRef([])

  useFrame(({ clock }) => {
    const ad = audioRef.current
    rings.forEach((ring, i) => {
      const mesh = meshRef.current[i]
      const mat  = matsRef.current[i]
      if (!mesh) return

      const [ax, ay, az] = ring.rotAxis
      const spd = ring.speed + ad.bass * 0.008
      mesh.rotation.x += ax * spd
      mesh.rotation.y += ay * spd
      mesh.rotation.z += az * spd

      const pulse = 1 + ad.bass * Math.max(0, 0.3 - i * 0.03)
      mesh.scale.setScalar(pulse)

      if (mat) {
        mat.opacity = 0.06 + ad.amplitude * 0.14 + ad.bass * 0.08
      }
    })
  })

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
            color={hexColor}
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
