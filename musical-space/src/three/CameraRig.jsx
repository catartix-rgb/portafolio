import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const _target = new THREE.Vector3()
const _mouse  = { x: 0, y: 0 }

// Track mouse globally
if (typeof window !== 'undefined') {
  window.addEventListener('mousemove', e => {
    _mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2
    _mouse.y = (e.clientY / window.innerHeight - 0.5) * 2
  }, { passive: true })
}

export default function CameraRig({ audioRef }) {
  const { camera } = useThree()
  const angle  = useRef(0)
  const tiltY  = useRef(0)

  // Camera starts at origin — it's INSIDE the sphere
  // We give it a very small orbit around the center
  useFrame(({ clock }) => {
    const ad  = audioRef.current
    const t   = clock.getElapsedTime()

    // Slow orbital drift — speed up with lowMids
    const driftSpeed = 0.04 + ad.lowMids * 0.08
    angle.current += driftSpeed * 0.016

    // Orbital position: tiny circle, very close to origin
    const orbitRadius = 1.5 + ad.amplitude * 1.2
    const targetX = Math.cos(angle.current) * orbitRadius + _mouse.x * 0.8
    const targetY = Math.sin(t * 0.25) * 0.8 + _mouse.y * -0.5
    const targetZ = Math.sin(angle.current) * orbitRadius

    // Smooth lerp position
    camera.position.x += (targetX - camera.position.x) * 0.025
    camera.position.y += (targetY - camera.position.y) * 0.025
    camera.position.z += (targetZ - camera.position.z) * 0.025

    // Always look at origin with slight vertical drift
    _target.set(
      Math.cos(angle.current + 0.3) * 5,
      Math.sin(t * 0.18) * 2,
      Math.sin(angle.current + 0.3) * 5
    )
    camera.lookAt(_target)
  })

  return null
}
