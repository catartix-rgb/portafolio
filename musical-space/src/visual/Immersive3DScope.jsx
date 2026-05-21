/* ─── Immersive 3D 360° Oscilloscope ──────────────────────────
   Full React Three Fiber scene — camera inside a waveform tunnel.
   Sub-modes: 'wave' (tunnel rings) | 'lissajous' (3D XY figure)
──────────────────────────────────────────────────────────────── */
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

/* ── Constants ─────────────────────────────────────────────── */
const GREEN      = new THREE.Color('#00ff41')
const GREEN_DIM  = new THREE.Color('#004d14')
const RING_SEGS  = 256     // vertices per waveform ring
const RING_COUNT = 14      // rings in the tunnel
const TUNNEL_HALF = 60     // half-length of tunnel in world units
const BASE_R      = 14     // base ring radius
const PARTICLE_COUNT = 2800

/* ── Waveform ring ─────────────────────────────────────────── */
function WaveRing({ analyzer, zPos, radius, opacity, freqShift }) {
  const loopRef = useRef()

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(RING_SEGS * 3)
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])

  // We share a single timeDomain buffer per render (allocated once)
  const timeDomain = useRef(new Uint8Array(2048))

  useFrame(() => {
    if (!analyzer?.analyser) return

    analyzer.analyser.getByteTimeDomainData(timeDomain.current)
    const td  = timeDomain.current
    const len = td.length
    const bass = analyzer.bands?.bass || 0
    const mids = analyzer.bands?.mids || 0
    const pos  = geo.attributes.position.array

    // Radius breathes with bass, deforms with mids
    const r = radius + bass * 6

    for (let i = 0; i < RING_SEGS; i++) {
      const angle = (i / RING_SEGS) * Math.PI * 2
      const sIdx  = Math.floor(((i + freqShift) / RING_SEGS) * len) % len
      const v     = (td[sIdx] / 128.0) - 1.0

      // Bass pushes ring outward, mids deform waveform shape
      const rFinal = r + v * (2.5 + mids * 4)
      pos[i * 3]     = Math.cos(angle) * rFinal
      pos[i * 3 + 1] = Math.sin(angle) * rFinal
      pos[i * 3 + 2] = zPos
    }

    geo.attributes.position.needsUpdate = true
  })

  return (
    <lineLoop ref={loopRef} geometry={geo}>
      <lineBasicMaterial
        color={GREEN}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineLoop>
  )
}

/* ── Center core — icosahedron wireframe ───────────────────── */
function CoreSphere({ analyzer }) {
  const meshRef = useRef()
  const matRef  = useRef()

  useFrame(({ clock }) => {
    if (!meshRef.current || !matRef.current) return
    const bass = analyzer?.bands?.bass || 0
    const t    = clock.getElapsedTime()
    const scale = 1 + bass * 1.2 + Math.sin(t * 1.8) * 0.06
    meshRef.current.scale.setScalar(scale)
    meshRef.current.rotation.y = t * 0.3
    meshRef.current.rotation.x = t * 0.18
    matRef.current.opacity = 0.08 + bass * 0.22
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[3.5, 4]} />
      <meshBasicMaterial
        ref={matRef}
        color={GREEN}
        transparent
        opacity={0.1}
        wireframe
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

/* ── Floating particles ────────────────────────────────────── */
function AudioParticles({ analyzer }) {
  const ptsRef = useRef()
  const matRef = useRef()

  const positions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Fibonacci sphere distribution
      const phi   = Math.acos(1 - 2 * (i + 0.5) / PARTICLE_COUNT)
      const theta = Math.PI * (1 + Math.sqrt(5)) * i
      const r     = 15 + Math.random() * 55
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [])

  useFrame(({ clock }) => {
    if (!ptsRef.current || !matRef.current) return
    const highs = analyzer?.bands?.highs || 0
    const amp   = analyzer?.amplitude || 0
    const t     = clock.getElapsedTime()

    ptsRef.current.rotation.y = t * 0.03
    ptsRef.current.rotation.x = Math.sin(t * 0.018) * 0.08

    matRef.current.opacity = 0.18 + highs * 0.65
    matRef.current.size    = 0.05 + highs * 0.22 + amp * 0.1
  })

  return (
    <points ref={ptsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        color={GREEN}
        size={0.07}
        transparent
        opacity={0.22}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

/* ── 3D Lissajous / XY figure ──────────────────────────────── */
function Lissajous3D({ analyzer }) {
  const lineRef = useRef()
  const TRAIL   = 512

  const geo = useMemo(() => {
    const g   = new THREE.BufferGeometry()
    const pos = new Float32Array(TRAIL * 3)
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])

  const timeDomain = useRef(new Uint8Array(2048))

  useFrame(({ clock }) => {
    if (!analyzer?.analyser) return
    analyzer.analyser.getByteTimeDomainData(timeDomain.current)

    const td  = timeDomain.current
    const len = td.length
    const pos = geo.attributes.position.array
    const bass = analyzer.bands?.bass || 0
    const SCALE = 8 + bass * 4

    // XY Lissajous: use channel-like offsets for X, Y, Z
    const o1 = Math.floor(len / 3)
    const o2 = Math.floor(2 * len / 3)

    for (let i = 0; i < TRAIL; i++) {
      const t  = Math.floor((i / TRAIL) * len)
      pos[i * 3]     = (td[t] / 128 - 1) * SCALE
      pos[i * 3 + 1] = (td[(t + o1) % len] / 128 - 1) * SCALE
      pos[i * 3 + 2] = (td[(t + o2) % len] / 128 - 1) * SCALE
    }

    geo.attributes.position.needsUpdate = true

    if (lineRef.current) {
      lineRef.current.rotation.y += 0.004
      lineRef.current.rotation.x += 0.0015
    }
  })

  return (
    <line ref={lineRef} geometry={geo}>
      <lineBasicMaterial
        color={GREEN}
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </line>
  )
}

/* ── Outer ambient rings (static, decorative) ──────────────── */
function AmbientRings({ analyzer }) {
  const groupRef = useRef()

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t    = clock.getElapsedTime()
    const bass = analyzer?.bands?.bass || 0
    groupRef.current.rotation.z = t * 0.04
    groupRef.current.rotation.x = t * 0.02
  })

  const rings = useMemo(() => {
    return [55, 70, 85].map((r, i) => {
      const pts = []
      for (let j = 0; j < 128; j++) {
        const a = (j / 128) * Math.PI * 2
        pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0))
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts)
      return { geo, opacity: 0.04 - i * 0.01, radius: r }
    })
  }, [])

  return (
    <group ref={groupRef}>
      {rings.map((ring, i) => (
        <lineLoop key={i} geometry={ring.geo}>
          <lineBasicMaterial
            color={GREEN}
            transparent
            opacity={ring.opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineLoop>
      ))}
    </group>
  )
}

/* ── Complete 3D scene ─────────────────────────────────────── */
function Scene({ analyzer, subMode }) {
  return (
    <>
      {subMode === 'wave' && (
        <>
          {/* Tunnel of waveform rings */}
          {Array.from({ length: RING_COUNT }, (_, i) => {
            const t       = i / (RING_COUNT - 1)
            const z       = -TUNNEL_HALF + t * TUNNEL_HALF * 2
            const distFac = 1 - Math.abs(z) / TUNNEL_HALF
            const opacity = 0.15 + distFac * 0.65
            const radius  = BASE_R + (1 - distFac) * 3
            return (
              <WaveRing
                key={i}
                analyzer={analyzer}
                zPos={z}
                radius={radius}
                opacity={opacity}
                freqShift={i * 18} // offset for variation between rings
              />
            )
          })}
          <CoreSphere analyzer={analyzer} />
          <AudioParticles analyzer={analyzer} />
          <AmbientRings analyzer={analyzer} />
        </>
      )}

      {subMode === 'lissajous' && (
        <>
          <Lissajous3D analyzer={analyzer} />
          <AudioParticles analyzer={analyzer} />
          <AmbientRings analyzer={analyzer} />
          <CoreSphere analyzer={analyzer} />
        </>
      )}

      {/* Bloom — makes phosphor glow feel real */}
      <EffectComposer>
        <Bloom
          intensity={1.6}
          luminanceThreshold={0.05}
          luminanceSmoothing={0.85}
          mipmapBlur
        />
      </EffectComposer>

      <OrbitControls
        enableDamping
        dampingFactor={0.06}
        enableZoom
        zoomSpeed={0.7}
        rotateSpeed={0.5}
        minDistance={2}
        maxDistance={100}
        makeDefault
      />
    </>
  )
}

/* ── Root component ────────────────────────────────────────── */
export default function Immersive3DScope({ analyzer, subMode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000d00' }}>
      <Canvas
        gl={{
          antialias      : true,
          alpha          : false,
          powerPreference: 'high-performance',
          toneMapping    : 0,
        }}
        camera={{ fov: 70, near: 0.1, far: 600, position: [0, 0, 0.1] }}
        style={{ width: '100%', height: '100%' }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={['#000d00']} />
        <Scene analyzer={analyzer} subMode={subMode} />
      </Canvas>
    </div>
  )
}
