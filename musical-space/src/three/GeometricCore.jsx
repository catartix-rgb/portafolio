import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import vertGLSL from '../shaders/core.vert.glsl?raw'
import fragGLSL from '../shaders/core.frag.glsl?raw'

function buildGeometry(type, scale) {
  const s = Math.max(0.1, scale || 1)
  switch (type) {
    case 'octahedron':   return new THREE.OctahedronGeometry(5 * s, 4)
    case 'dodecahedron': return new THREE.DodecahedronGeometry(5.5 * s, 3)
    case 'torusknot':    return new THREE.TorusKnotGeometry(4 * s, 1.2 * s, 128, 16)
    default:             return new THREE.IcosahedronGeometry(6 * s, 5)
  }
}

export default function GeometricCore({ audioRef, config }) {
  const meshRef = useRef()

  const geometry = useMemo(() =>
    buildGeometry(config.geometry, config.geometryScale),
  [config.geometry, config.geometryScale])

  // Stable uniforms ref — update color in-place, no scene reset
  const uniformsRef = useRef(null)
  if (uniformsRef.current === null) {
    const [pR, pG, pB] = config.palette?.primary ?? [0.78, 0.66, 0.30]
    uniformsRef.current = {
      uTime     : { value: 0 },
      uBass     : { value: 0 },
      uSubBass  : { value: 0 },
      uAmplitude: { value: 0 },
      uColor    : { value: new THREE.Vector3(
        Math.max(0.04, pR || 0.78),
        Math.max(0.04, pG || 0.66),
        Math.max(0.04, pB || 0.30)
      )},
    }
  }

  // Update color when palette changes — in-place
  useEffect(() => {
    if (!config?.palette?.primary || !uniformsRef.current) return
    const [pR, pG, pB] = config.palette.primary
    if ([pR, pG, pB].some(v => v === undefined || isNaN(v))) return
    uniformsRef.current.uColor.value.set(
      Math.max(0.04, pR),
      Math.max(0.04, pG),
      Math.max(0.04, pB)
    )
  }, [config.palette])

  useFrame(({ clock }) => {
    const u   = uniformsRef.current
    const ad  = audioRef.current
    const spd = config.rotSpeed || 1
    u.uTime.value      = clock.getElapsedTime()
    u.uBass.value      = ad.bass      ?? 0
    u.uSubBass.value   = ad.subBass   ?? 0
    u.uAmplitude.value = ad.amplitude ?? 0

    if (meshRef.current) {
      meshRef.current.rotation.x += (0.0008 + (ad.lowMids ?? 0) * 0.003) * spd
      meshRef.current.rotation.y += (0.0012 + (ad.bass    ?? 0) * 0.004) * spd
      meshRef.current.rotation.z += 0.0004 * spd
    }
  })

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <shaderMaterial
        vertexShader={vertGLSL}
        fragmentShader={fragGLSL}
        uniforms={uniformsRef.current}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}
