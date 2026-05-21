// Particle vertex shader — reactive, color driven by uniforms

uniform float uTime;
uniform float uBass;
uniform float uHighs;
uniform float uAmplitude;
uniform float uSpeed;

attribute vec3  aNormal;
attribute float aPhase;

varying float vEnergy;
varying vec3  vPos;

void main() {
  float spd = uSpeed;
  vec3 drifted = position + aNormal * (
    sin(uTime * 0.35 * spd + aPhase * 6.28318) * 1.2
    + uBass * 3.0 * sin(uTime * 1.0 * spd + aPhase * 3.14)
  );

  vEnergy = uHighs * 0.7 + uAmplitude * 0.5;
  vPos = drifted;

  vec4 mvPosition = modelViewMatrix * vec4(drifted, 1.0);
  gl_PointSize = (2.8 + uHighs * 4.0 + uAmplitude * 1.5) * (200.0 / -mvPosition.z);
  gl_Position  = projectionMatrix * mvPosition;
}
