/* ─── ImmersiveCanvas ──────────────────────────────────────────
   Wrapped in React.memo — only re-renders when a new song loads
   (config reference changes). Palette changes go through paletteRef
   and never cause a re-render here at all.
──────────────────────────────────────────────────────────────── */
import { memo } from 'react'
import { Canvas } from '@react-three/fiber'
import ParticleField      from './ParticleField'
import GeometricCore      from './GeometricCore'
import ArchitecturalRings from './ArchitecturalRings'
import VolumetricFog      from './VolumetricFog'
import CameraRig          from './CameraRig'
import PostFX             from './PostFX'

export default memo(function ImmersiveCanvas({ audioRef, config, paletteRef }) {
  return (
    <Canvas
      gl={{
        antialias      : true,
        alpha          : false,
        powerPreference: 'high-performance',
        toneMapping    : 0,
      }}
      camera={{ fov: 75, near: 0.1, far: 500, position: [0, 0, 0] }}
      style={{ background: '#000000', width: '100%', height: '100%' }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.04} />
      <CameraRig          audioRef={audioRef} />
      <ParticleField      audioRef={audioRef} config={config} paletteRef={paletteRef} />
      <GeometricCore      audioRef={audioRef} config={config} paletteRef={paletteRef} />
      <ArchitecturalRings audioRef={audioRef} config={config} paletteRef={paletteRef} />
      <VolumetricFog      audioRef={audioRef} />
      <PostFX             audioRef={audioRef} config={config} />
    </Canvas>
  )
})
