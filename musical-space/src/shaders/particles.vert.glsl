// Particle vertex shader
// Displaces each particle along its sphere normal using bass + highs
// and scales point size with highs

uniform float uTime;
uniform float uBass;
uniform float uHighs;
uniform float uAmplitude;

attribute vec3 aNormal;
attribute float aPhase;

varying float vEnergy;
varying vec3  vPos;

void main() {
  // Drift offset: slow float using each particle's random phase
  vec3 drifted = position + aNormal * (
    sin(uTime * 0.4 + aPhase * 6.28318) * 0.8 * (0.2 + uAmplitude * 0.8) +
    uBass * 2.5 * sin(uTime * 1.2 + aPhase * 3.14)
  );

  vEnergy = uHighs + uAmplitude * 0.5;
  vPos = drifted;

  vec4 mvPosition = modelViewMatrix * vec4(drifted, 1.0);
  // Size: base 1.5, grows with highs
  gl_PointSize = (1.5 + uHighs * 3.5) * (200.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
