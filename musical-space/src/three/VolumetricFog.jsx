import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PLANE_COUNT = 14

// Perlin-ish noise functions inlined for the fragment shader
const fogFragGLSL = /* glsl */`
uniform float uTime;
uniform float uMids;
uniform float uAmplitude;

varying vec2 vUv;
varying float vDepth;

// Hash + smooth noise
float hash2(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}

float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash2(i),           hash2(i + vec2(1,0)), f.x),
    mix(hash2(i + vec2(0,1)), hash2(i + vec2(1,1)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise2(p);
    p *= 2.1;
    a *= 0.5;
  }
  return v;
}

void main() {
  // Animated fog: slow drift
  vec2 uv = vUv;
  uv += vec2(uTime * 0.018, uTime * 0.009);

  float fog = fbm(uv * 2.5);
  fog = smoothstep(0.32, 0.68, fog);

  // Edge falloff so planes don't have hard borders
  vec2 edge = vUv * 2.0 - 1.0;
  float mask = 1.0 - smoothstep(0.6, 1.0, length(edge));

  // Mids drive opacity
  float alpha = fog * mask * (0.04 + uMids * 0.10 + uAmplitude * 0.04);

  // Very dark grey-blue color
  vec3 col = vec3(0.04, 0.04, 0.06);

  gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
}
`

const fogVertGLSL = /* glsl */`
varying vec2 vUv;
varying float vDepth;

void main() {
  vUv = uv;
  vDepth = position.z;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export default function VolumetricFog({ audioRef }) {
  const matsRef = useRef([])

  const { planes } = useMemo(() => {
    const arr = []
    for (let i = 0; i < PLANE_COUNT; i++) {
      const angle  = (i / PLANE_COUNT) * Math.PI * 2
      const radius = 25 + Math.random() * 30
      arr.push({
        x: Math.cos(angle) * radius,
        y: (Math.random() - 0.5) * 40,
        z: Math.sin(angle) * radius,
        rx: Math.random() * Math.PI,
        ry: angle,
        rz: Math.random() * Math.PI,
        size: 60 + Math.random() * 40,
      })
    }
    return { planes: arr }
  }, [])

  const uniformsArray = useMemo(() =>
    planes.map(() => ({
      uTime     : { value: 0 },
      uMids     : { value: 0 },
      uAmplitude: { value: 0 },
    })),
  [planes])

  useFrame(({ clock }) => {
    const t  = clock.getElapsedTime()
    const ad = audioRef.current
    uniformsArray.forEach(u => {
      u.uTime.value      = t
      u.uMids.value      = ad.mids
      u.uAmplitude.value = ad.amplitude
    })
  })

  return (
    <group>
      {planes.map((p, i) => (
        <mesh
          key={i}
          position={[p.x, p.y, p.z]}
          rotation={[p.rx, p.ry, p.rz]}
        >
          <planeGeometry args={[p.size, p.size, 1, 1]} />
          <shaderMaterial
            vertexShader={fogVertGLSL}
            fragmentShader={fogFragGLSL}
            uniforms={uniformsArray[i]}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.NormalBlending}
          />
        </mesh>
      ))}
    </group>
  )
}
