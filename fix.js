const fs = require('fs');

let html = fs.readFileSync('galeria.html', 'utf8');

// Fix 1: PIECES variables
html = html.replace(
  /const N\s*=\s*PIECES\.length;\r?\n\s*const RADIUS\s*=\s*5\.6;\r?\n\s*const STEP\s*=\s*\(Math\.PI \* 2\) \/ N;/,
  `let PIECES_ACTIVE = [...PIECES];
  const FULL_PIECES = [...PIECES];
  let N      = PIECES_ACTIVE.length;
  const RADIUS = 5.6;
  let STEP   = (Math.PI * 2) / N;`
);

// Fix 2: loader frames
html = html.replace(
  /const loader\s*=\s*new THREE\.TextureLoader\(\);\r?\n\s*const frames\s*=\s*\[\];\r?\n\s*let\s+loaded\s*=\s*0;/,
  `const loader   = new THREE.TextureLoader();
  let frames     = [];
  const allFrames = [];
  let   loaded   = 0;`
);

// Fix 3: updateActive
html = html.replace(
  /function updateActive\(idx\) \{\r?\n\s*activeIdx = idx;\r?\n\s*const p\s*=\s*PIECES\[idx\];/,
  `function updateActive(idx) {
    if (frames.length === 0) return;
    activeIdx = idx;
    const p   = PIECES_ACTIVE[idx];`
);

// Fix 4: openPanel
html = html.replace(
  /function openPanel\(idx = activeIdx\) \{\r?\n\s*const p = PIECES\[idx\];/,
  `function openPanel(idx = activeIdx) {
    if (frames.length === 0) return;
    const p = PIECES_ACTIVE[idx];`
);

fs.writeFileSync('galeria.html', html);
console.log('Fixed missing replacements!');
