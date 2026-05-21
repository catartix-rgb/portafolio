import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import vertGLSL from '../shaders/core.vert.glsl?raw'
import fragGLSL from '../shaders/core.frag.glsl?raw'

function buildGeometry(type, scale) {
  switch (type) {
    case 'octahedron':   return new THREE.OctahedronGeometry(5 * scale, 4)
    case 'dodecahedron': return new THREE.DodecahedronGeometry(5.5 * scale, 3)
    case 'torusknot':    return new THREE.TorusKnotGeometry(4 * scale, 1.2 * scale, 128, 16)
    default:             return new THREE.IcosahedronGeometry(6 * scale, 5)
  }
}

export default function GeometricCore({ audioRef, config }) {
  const meshRef = useRef()

  const geometry = useMemo(() =>
    buildGeometry(config.geometry, config.geometryScale),
  [config.geometry, config.geometryScale])

  const [pR, pG, pB] = config.palette.primary
  const uniforms = useMemo(() => ({
    uTime     : { value: 0 },
    uBass     : { value: 0 },
    uSubBass  : { value: 0 },
    uAmplitude: { value: 0 },
    uColor    : { value: new THREE.Vector3(pR, pG, pB) },
  }), [pR, pG, pB])

  useFrame(({ clock }) => {
    const u  = uniforms
    const ad = audioRef.current
    const spd = config.rotSpeed
    u.uTime.value      = clock.getElapsedTime()
    u.uBass.value      = ad.bass
    u.uSubBass.value   = ad.subBass
    u.uAmplitude.value = ad.amplitude

    if (meshRef.current) {
      meshRef.current.rotation.x += (0.0008 + ad.lowMids * 0.003) * spd
      meshRef.current.rotation.y += (0.0012 + ad.bass    * 0.004) * spd
      meshRef.current.rotation.z += 0.0004 * spd
    }
  })

  return (
    <mesh ref={meshRef} geometry={geometry}>
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
