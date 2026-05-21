// Icosahedron deformation vertex shader
// Displaces vertices along their normals using bass + time

uniform float uTime;
uniform float uBass;
uniform float uSubBass;
uniform float uAmplitude;

varying vec3 vNormal;
varying float vDisplace;

// Simplex-like smooth noise
float hash(float n) { return fract(sin(n) * 43758.5453123); }
float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n = i.x + i.y * 57.0 + 113.0 * i.z;
  return mix(
    mix(mix(hash(n),       hash(n+1.0),   f.x),
        mix(hash(n+57.0),  hash(n+58.0),  f.x), f.y),
    mix(mix(hash(n+113.0), hash(n+114.0), f.x),
        mix(hash(n+170.0), hash(n+171.0), f.x), f.y), f.z);
}

void main() {
  // Multi-octave noise deformation
  vec3 p = normal * 3.0 + uTime * 0.15;
  float n = noise(p) * 0.5 + noise(p * 2.1 + 1.7) * 0.25 + noise(p * 4.3 + 3.1) * 0.125;

  // Bass drives the deformation magnitude
  float displaceAmount = n * (0.3 + uBass * 2.8 + uSubBass * 1.2);

  // Breathing: slow amplitude pulse
  displaceAmount += sin(uTime * 0.8) * uAmplitude * 0.6;

  vec3 displaced = position + normal * displaceAmount;

  vNormal   = normal;
  vDisplace = displaceAmount;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
