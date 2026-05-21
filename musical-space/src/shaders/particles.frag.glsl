// Particle fragment shader
// White-soft at rest → warm gold at high energy

varying float vEnergy;
varying vec3  vPos;

uniform float uAmplitude;

void main() {
  // Circular point shape
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;

  // Soft falloff
  float alpha = smoothstep(0.5, 0.0, d);

  // Color: white (rest) → warm gold (high energy)
  // Gold: vec3(0.788, 0.659, 0.298)  White: vec3(0.85, 0.85, 0.85)
  vec3 white = vec3(0.85, 0.85, 0.85);
  vec3 gold  = vec3(0.788, 0.659, 0.298);
  vec3 col   = mix(white, gold, clamp(vEnergy * 2.2, 0.0, 1.0));

  // Very subtle glow fringe
  float glow = smoothstep(0.5, 0.1, d) * vEnergy * 0.4;
  col += vec3(glow * 0.6, glow * 0.45, glow * 0.0);

  // Base opacity low — creates constellation feel
  float baseAlpha = mix(0.18, 0.75, clamp(vEnergy * 1.5, 0.0, 1.0));
  gl_FragColor = vec4(col, alpha * baseAlpha);
}
