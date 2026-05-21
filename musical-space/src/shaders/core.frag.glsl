// Core icosahedron fragment shader
// Emits warm gold wireframe-like glow

varying vec3  vNormal;
varying float vDisplace;

uniform float uBass;
uniform float uTime;

void main() {
  // Edge detection via normal facing
  float edgeFactor = 1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)));

  // Base gold color
  vec3 gold  = vec3(0.788, 0.659, 0.298);
  vec3 white = vec3(1.0, 0.95, 0.82);

  // Brighter at high displacement
  vec3 col = mix(gold, white, clamp(vDisplace * 0.5, 0.0, 1.0));

  // Edge brightening
  col += white * edgeFactor * 0.3;

  // Low base alpha — wireframe feel
  float alpha = mix(0.04, 0.22, edgeFactor) + uBass * 0.12;

  gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
}
