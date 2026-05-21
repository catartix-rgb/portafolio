// Core geometry fragment shader — palette-driven

uniform vec3  uColor;   // primary palette color
uniform float uBass;
uniform float uTime;

varying vec3  vNormal;
varying float vDisplace;

void main() {
  float edgeFactor = 1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)));
  vec3  bright     = vec3(1.0, 0.97, 0.90);
  vec3  col        = mix(uColor, bright, clamp(vDisplace * 0.4, 0.0, 1.0));
  col += bright * edgeFactor * 0.4;

  float alpha = mix(0.12, 0.55, edgeFactor) + uBass * 0.2;
  gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
}
