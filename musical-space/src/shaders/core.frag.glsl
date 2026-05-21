// Core icosahedron fragment shader — visible at rest

varying vec3  vNormal;
varying float vDisplace;

uniform float uBass;
uniform float uTime;

void main() {
  float edgeFactor = 1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)));

  vec3 gold  = vec3(0.96, 0.80, 0.36);
  vec3 white = vec3(1.0, 0.95, 0.82);
  vec3 col   = mix(gold, white, clamp(vDisplace * 0.4, 0.0, 1.0));
  col += white * edgeFactor * 0.4;

  // Base alpha significantly higher: visible at rest
  float alpha = mix(0.12, 0.55, edgeFactor) + uBass * 0.2;

  gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
}
