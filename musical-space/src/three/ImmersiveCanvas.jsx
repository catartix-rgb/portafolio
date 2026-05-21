import { Canvas } from '@react-three/fiber'
import ParticleField      from './ParticleField'
import GeometricCore      from './GeometricCore'
import ArchitecturalRings from './ArchitecturalRings'
import VolumetricFog      from './VolumetricFog'
import CameraRig          from './CameraRig'
import PostFX             from './PostFX'

export default function ImmersiveCanvas({ audioRef }) {
  return (
    <Canvas
      gl={{
        antialias     : true,
        alpha         : false,
        powerPreference: 'high-performance',
        toneMapping   : 0, // NoToneMapping — we control color ourselves
      }}
      camera={{
        fov     : 75,
        near    : 0.1,
        far     : 500,
        position: [0, 0, 0],
      }}
      style={{ background: '#000000', width: '100%', height: '100%' }}
      dpr={[1, 1.5]}
    >
      {/* Tiny ambient so wireframes aren't completely black */}
      <ambientLight intensity={0.04} />

      <CameraRig          audioRef={audioRef} />
      <ParticleField      audioRef={audioRef} />
      <GeometricCore      audioRef={audioRef} />
      <ArchitecturalRings audioRef={audioRef} />
      <VolumetricFog      audioRef={audioRef} />
      <PostFX             audioRef={audioRef} />
    </Canvas>
  )
}
