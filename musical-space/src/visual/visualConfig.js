/* ─── Visual Config Generator ─────────────────────────────────
   Called once per audio session to produce a random visual theme.
──────────────────────────────────────────────────────────────── */

const PALETTES = [
  { name: 'Golden',   primary: [0.788, 0.659, 0.298], secondary: [0.95, 0.93, 0.85] },
  { name: 'Cyan',     primary: [0.0,   0.82,  0.96 ], secondary: [0.85, 0.97, 1.0 ] },
  { name: 'Crimson',  primary: [0.96,  0.22,  0.30 ], secondary: [1.0,  0.80, 0.82 ] },
  { name: 'Violet',   primary: [0.66,  0.33,  0.97 ], secondary: [0.92, 0.84, 1.0 ] },
  { name: 'Ember',    primary: [1.0,   0.42,  0.21 ], secondary: [1.0,  0.85, 0.75 ] },
  { name: 'Emerald',  primary: [0.06,  0.73,  0.51 ], secondary: [0.82, 1.0,  0.90 ] },
  { name: 'Frost',    primary: [0.55,  0.80,  1.0  ], secondary: [0.92, 0.96, 1.0 ] },
  { name: 'Plasma',   primary: [1.0,   0.20,  0.80 ], secondary: [1.0,  0.80, 0.96 ] },
  { name: 'Solar',    primary: [1.0,   0.75,  0.0  ], secondary: [1.0,  0.95, 0.70 ] },
]

const GEOMETRIES = ['icosahedron', 'octahedron', 'dodecahedron', 'torusknot']

function rand(min, max) {
  return min + Math.random() * (max - min)
}
function randInt(min, max) {
  return Math.floor(rand(min, max + 1))
}
function pick(arr) {
  return arr[randInt(0, arr.length - 1)]
}

export function generateVisualConfig() {
  const palette = pick(PALETTES)

  return {
    palette,

    // Particles
    particleCount : randInt(5000, 9000),
    sphereRadius  : rand(45, 70),
    particleSpeed : rand(0.5, 1.6),

    // Core geometry
    geometry      : pick(GEOMETRIES),
    geometryScale : rand(0.7, 1.4),
    rotSpeed      : rand(0.5, 1.5),

    // Rings
    ringCount     : randInt(4, 8),
    ringSpread    : rand(0.8, 1.3),

    // Atmosphere
    fogDensity    : rand(0.6, 1.2),
    bloomStrength : rand(0.5, 1.0),
  }
}
