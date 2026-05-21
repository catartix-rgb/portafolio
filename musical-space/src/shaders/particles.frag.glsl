// Particle fragment shader
// White-soft at rest → warm gold at high energy
// BASE OPACITY IS HIGH so scene is always visible

varying float vEnergy;
varying vec3  vPos;

uniform float uAmplitude;

void main() {
  // Circular point shape with soft edge
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;

  float alpha = smoothstep(0.5, 0.05, d);

  // Color: white (rest) → warm gold (high energy)
  vec3 white = vec3(0.90, 0.90, 0.90);
  vec3 gold  = vec3(0.96, 0.80, 0.36);
  vec3 col   = mix(white, gold, clamp(vEnergy * 2.5, 0.0, 1.0));

  // Glow fringe
  float glow = smoothstep(0.5, 0.05, d) * vEnergy * 0.5;
  col += vec3(glow * 0.7, glow * 0.5, 0.0);

  // HIGH base opacity so particles are visible even with silence
  float baseAlpha = mix(0.55, 0.92, clamp(vEnergy * 2.0, 0.0, 1.0));

  gl_FragColor = vec4(col, alpha * baseAlpha);
}
