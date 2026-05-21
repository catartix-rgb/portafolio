// Particle fragment shader — palette-driven color

uniform vec3  uColorA;   // secondary (rest)
uniform vec3  uColorB;   // primary   (energy)
uniform float uAmplitude;

varying float vEnergy;
varying vec3  vPos;

void main() {
  vec2  uv = gl_PointCoord - 0.5;
  float d  = length(uv);
  if (d > 0.5) discard;

  float alpha = smoothstep(0.5, 0.05, d);

  // Blend between resting color and energized color
  vec3 col = mix(uColorA, uColorB, clamp(vEnergy * 2.5, 0.0, 1.0));

  // Glow fringe
  float glow = smoothstep(0.5, 0.05, d) * vEnergy * 0.5;
  col += uColorB * glow * 0.6;

  float baseAlpha = mix(0.55, 0.92, clamp(vEnergy * 2.0, 0.0, 1.0));
  gl_FragColor = vec4(col, alpha * baseAlpha);
}
