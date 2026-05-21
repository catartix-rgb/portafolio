
  /* ════════════════════════════════════════════════
     PIECE DATA
  ════════════════════════════════════════════════ */
  const PIECES = [
    {
      img: 'img/alta-tension.jpg', num: '01', name: 'Alta Tensión',
      desc: 'Exploración de identidad gráfica aplicada a indumentaria. Lenguaje visual crudo inspirado en señalización industrial y simbología de peligro como vehículo estético.',
      year: '2025', cat: 'Identidad / Indumentaria', disc: 'Diseño Gráfico · Textil'
    },
    {
      img: 'img/not-different.jpg', num: '02', name: 'Not Different',
      desc: 'Una exploración de branding e identidad para marca. Concepto visual centrado en la idea de que lo auténtico no necesita diferenciarse — simplemente es.',
      year: '2025', cat: 'Branding / Identidad', disc: 'Diseño Gráfico'
    },
    {
      img: 'img/catartix-popup.jpg', num: '03', name: 'Catartix Pop Up',
      desc: 'Póster para evento musical. Exploración gráfica experimentando con alto contraste de colores y texturas de semitono como recurso visual.',
      year: '2025', cat: 'Cartelismo / Evento', disc: 'Diseño Gráfico'
    },
    {
      img: 'img/editorial-1.jpg', num: '04', name: 'Producción Editorial I',
      desc: 'Dirección de arte y fotografía para producción editorial. Exploración visual de estética de moda y lifestyle con enfoque en movimiento y textura.',
      year: '2025', cat: 'Fotografía / Editorial', disc: 'Dirección de Arte'
    },
    {
      img: 'img/editorial-2.jpg', num: '05', name: 'Producción Editorial II',
      desc: 'Segunda parte de la serie fotográfica, centrada en composición visual, indumentaria y los detalles en los accesorios.',
      year: '2025', cat: 'Fotografía / Editorial', disc: 'Dirección de Arte'
    },
    {
      img: 'img/editorial-libro.jpg', num: '06', name: 'Editorial Libro',
      desc: 'Diseño editorial y maquetación conceptual de un libro. Proyecto experimental enfocado en retículas, jerarquía tipográfica y composición espacial del contenido.',
      year: '2025', cat: 'Diseño Editorial / Libro', disc: 'Photoshop · Illustrator · InDesign'
    },
    {
      img: 'img/editorial-libro-2.jpg', num: '07', name: 'Editorial Libro 2',
      desc: 'Exploración de técnicas en Illustrator aplicadas al diseño editorial. Maquetación tipográfica, retículas y composición en blanco y negro con recursos de semitono y simbología gráfica.',
      year: '2025', cat: 'Diseño Editorial', disc: 'Adobe Illustrator'
    },
    {
      img: 'img/editorial-libro-3.jpg', num: '08', name: 'Editorial Libro 3',
      desc: 'Segunda exploración del proyecto editorial. Paleta cromática restringida — naranja quemado y negro — sobre imágenes de semitono. Textura, contraste y ritmo visual como lenguaje propio.',
      year: '2025', cat: 'Diseño Editorial', disc: 'Adobe Illustrator'
    },
    {
      img: 'img/fika-1.jpg', num: '09', name: 'Fika',
      desc: 'Desarrollo de identidad y de onboarding de UX/UI para una aplicación.',
      year: '2024', cat: 'Identidad & UX/UI', disc: 'Figma'
    },
    {
      img: 'img/fika-logo.jpg', num: '10', name: 'Logo Fika',
      desc: 'Desarrollo del logotipo e identidad visual base para la aplicación de Fika.',
      year: '2024', cat: 'Identidad / Logo', disc: 'Figma'
    }
  ];

  let PIECES_ACTIVE = [...PIECES];
  const FULL_PIECES = [...PIECES];
  let N      = PIECES_ACTIVE.length;
  const RADIUS = 5.6;
  let STEP   = (Math.PI * 2) / N;

  /* ════════════════════════════════════════════════
     RENDERER
  ════════════════════════════════════════════════ */
  const canvas = document.getElementById('three-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  /* ════════════════════════════════════════════════
     SCENE
  ════════════════════════════════════════════════ */
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080808);
  scene.fog = new THREE.FogExp2(0x080808, 0.058);

  /* ════════════════════════════════════════════════
     CAMERA — sits at center of the cylinder
  ════════════════════════════════════════════════ */
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 40);
  camera.position.set(0, 0.25, 0);

  /* ════════════════════════════════════════════════
     LIGHTS
  ════════════════════════════════════════════════ */
  scene.add(new THREE.AmbientLight(0xfff5e8, 0.18));

  const topLight = new THREE.PointLight(0xedecea, 1.1, 20);
  topLight.position.set(0, 5, 0);
  scene.add(topLight);

  // Warm & cool accent lights for atmosphere
  const warmLight = new THREE.PointLight(0xffe4b5, 0.55, 12);
  warmLight.position.set(RADIUS * .55, .8, -RADIUS * .55);
  scene.add(warmLight);

  const coolLight = new THREE.PointLight(0xc8d8ff, 0.35, 10);
  coolLight.position.set(-RADIUS * .55, .8, RADIUS * .55);
  scene.add(coolLight);

  /* ════════════════════════════════════════════════
     FLASHLIGHT (LINTERNA)
  ════════════════════════════════════════════════ */
  const flashLight = new THREE.SpotLight(0xffffff, 0); // starts off
  flashLight.angle = Math.PI / 8;
  flashLight.penumbra = 0.6;
  flashLight.decay = 1.5;
  flashLight.distance = 25;
  camera.add(flashLight);
  scene.add(camera);

  const flashTarget = new THREE.Object3D();
  camera.add(flashTarget);
  flashTarget.position.set(0, 0, -5);
  flashLight.target = flashTarget;

  /* ════════════════════════════════════════════════
     GALLERY GROUP — rotates around Y
  ════════════════════════════════════════════════ */
  const gallery = new THREE.Group();
  scene.add(gallery);

  /* ════════════════════════════════════════════════
     ENVIRONMENT — floor, ceiling, walls
  ════════════════════════════════════════════════ */
  // Floor
  {
    const geo = new THREE.CircleGeometry(RADIUS + 2, 96);
    const mat = new THREE.MeshStandardMaterial({ color: 0x0b0b0b, roughness: 1, metalness: 0 });
    const m   = new THREE.Mesh(geo, mat);
    m.rotation.x = -Math.PI / 2;
    m.position.y = -1.55;
    scene.add(m);

    // Floor ring glow
    const ringGeo = new THREE.TorusGeometry(RADIUS, 0.014, 8, 96);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x1e1e1e });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.54;
    scene.add(ring);

    // Inner floor ring (subtle)
    const inner = new THREE.TorusGeometry(RADIUS * .35, 0.008, 8, 60);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0x141414 });
    const innerM = new THREE.Mesh(inner, innerMat);
    innerM.rotation.x = Math.PI / 2;
    innerM.position.y = -1.54;
    scene.add(innerM);
  }

  // Ceiling
  {
    const geo = new THREE.CircleGeometry(RADIUS + 2, 96);
    const mat = new THREE.MeshStandardMaterial({ color: 0x090909, roughness: 1 });
    const m   = new THREE.Mesh(geo, mat);
    m.rotation.x = Math.PI / 2;
    m.position.y = 2.9;
    scene.add(m);
  }

  // Cylinder wall (dark, backside visible from inside)
  {
    const geo = new THREE.CylinderGeometry(RADIUS + .4, RADIUS + .4, 4.8, 96, 1, true);
    const mat = new THREE.MeshStandardMaterial({ color: 0x0c0c0c, side: THREE.BackSide, roughness: 1 });
    scene.add(new THREE.Mesh(geo, mat));
  }

  /* ════════════════════════════════════════════════
     ATMOSPHERIC PARTICLES
  ════════════════════════════════════════════════ */
  {
    const count  = 150;
    const pos    = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r     = Math.random() * RADIUS * .85;
      pos[i*3]   = Math.cos(theta) * r;
      pos[i*3+1] = (Math.random() - .5) * 4;
      pos[i*3+2] = Math.sin(theta) * r;
      speeds[i]  = .0004 + Math.random() * .0008;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0x443322, size: .022, transparent: true, opacity: .55 });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);

    // Animate particles in render loop via closure
    window._particles = { pts, pos, speeds, count };
  }

  /* ════════════════════════════════════════════════
     LOAD FRAMES
  ════════════════════════════════════════════════ */
  const loader   = new THREE.TextureLoader();
  let frames     = [];
  const allFrames = [];
  let   loaded   = 0;
  const ldBar    = document.getElementById('ld-bar');
  const ldLabel  = document.getElementById('ld-label');

  PIECES.forEach((p, i) => {
    const angle = -i * STEP;
    const x     = Math.sin(angle) * RADIUS;
    const z     = -Math.cos(angle) * RADIUS;  // piece 0 directly in front (-Z)

    loader.load(
      p.img,
      texture => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy  = renderer.capabilities.getMaxAnisotropy();

        const aspect = texture.image.naturalWidth / texture.image.naturalHeight;
        const ph = 2.5;
        const pw = Math.min(ph * aspect, 2.2 * ph); // cap wide images

        buildFrame(i, x, z, pw, ph, texture, p);
        onFrameLoaded();
      },
      undefined,
      () => {
        // Error — placeholder dark frame
        const geo = new THREE.PlaneGeometry(1.8, 2.5);
        const mat = new THREE.MeshBasicMaterial({ color: 0x141414, fog: false });
        const grp = new THREE.Group();
        grp.add(new THREE.Mesh(geo, mat));
        grp.position.set(x, 0, z);
        grp.userData = { index: i, data: p, imgMat: mat, activeIndex: i };
        gallery.add(grp);
        allFrames.push(grp);
        frames.push(grp);
        onFrameLoaded();
      }
    );
  });

  function buildFrame(i, x, z, pw, ph, texture, p) {
    const grp = new THREE.Group();

    // Soft shadow plane behind
    const shadowGeo = new THREE.PlaneGeometry(pw + .8, ph + .8);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .45 });
    const shadow    = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.position.z = -.04;

    // Frame border
    const fGeo = new THREE.PlaneGeometry(pw + .07, ph + .07);
    const fMat = new THREE.MeshBasicMaterial({ color: 0x1c1c1c });
    const frame = new THREE.Mesh(fGeo, fMat);

    // Image
    const iGeo = new THREE.PlaneGeometry(pw, ph);
    const iMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.8,
      metalness: 0.1,
      transparent: true,
      opacity: 0.3,
    });
    const img  = new THREE.Mesh(iGeo, iMat);
    img.position.z = .003;

    // Top accent strip
    const sGeo = new THREE.PlaneGeometry(pw + .07, .007);
    const sMat = new THREE.MeshBasicMaterial({ color: 0x2a2a2a, transparent: true, opacity: .9 });
    const strip = new THREE.Mesh(sGeo, sMat);
    strip.position.set(0, (ph + .07) / 2 + .0035, .004);

    // Wall mount pin (tiny sphere)
    const pinGeo = new THREE.SphereGeometry(.025, 8, 8);
    const pinMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: .4, metalness: .6 });
    const pin    = new THREE.Mesh(pinGeo, pinMat);
    pin.position.set(0, ph / 2 + .25, -.05);

    // Wire from pin to frame top
    const wirePts = [
      new THREE.Vector3(0, ph / 2 + .25, -.05),
      new THREE.Vector3(0, ph / 2 + .03, .0)
    ];
    const wireGeo = new THREE.BufferGeometry().setFromPoints(wirePts);
    const wireMat = new THREE.LineBasicMaterial({ color: 0x1a1a1a });
    const wire    = new THREE.Line(wireGeo, wireMat);

    grp.add(shadow, frame, img, strip, pin, wire);
    grp.position.set(x, 0, z);
    grp.userData = { index: i, data: p, imgMat: iMat, activeIndex: i };
        gallery.add(grp);
        allFrames.push(grp);
        frames.push(grp);
  }

  function onFrameLoaded() {
    loaded++;
    ldBar.style.width = (loaded / N * 100) + '%';
    ldLabel.textContent = `${loaded} / ${N} obras`;
    if (loaded === N) onAllLoaded();
  }

  /* ════════════════════════════════════════════════
     ALL LOADED
  ════════════════════════════════════════════════ */
  function setFilter(filterVal) {
    frames = allFrames.filter(f => {
      if (filterVal === 'all') return true;
      const d = f.userData.data;
      if (filterVal === '2024' || filterVal === '2025') return d.year === filterVal;
      return (d.cat && d.cat.includes(filterVal)) || (d.disc && d.disc.includes(filterVal));
    });

    PIECES_ACTIVE = frames.map(f => f.userData.data);

    allFrames.forEach(f => gallery.remove(f));

    N = frames.length;
    if (N === 0) return;
    STEP = (Math.PI * 2) / N;

    frames.forEach((f, i) => {
      const angle = -i * STEP;
      const x = Math.sin(angle) * RADIUS;
      const z = -Math.cos(angle) * RADIUS;
      f.position.set(x, 0, z);
      f.userData.activeIndex = i;
      gallery.add(f);
    });
    
    const indexEl = document.getElementById('gal-index');
    indexEl.innerHTML = '';
    frames.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'gi-dot';
      d.addEventListener('click', () => navigateTo(i));
      indexEl.appendChild(d);
    });

    currentRot = 0;
    targetRot = 0;
    activeIdx = 0;
    prevActive = -1;
    gallery.rotation.y = 0;
    
    updateActive(0);
  }

  document.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      setFilter(e.target.dataset.filter);
    });
  });

  function onAllLoaded() {
    // Short delay then fade loading
    setTimeout(() => {
      document.getElementById('loading').classList.add('fade');
      setTimeout(() => document.getElementById('loading').style.display = 'none', 900);
    }, 500);

    // Build side dots
    const indexEl = document.getElementById('gal-index');
    PIECES_ACTIVE.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'gi-dot';
      d.addEventListener('click', () => navigateTo(i));
      indexEl.appendChild(d);
    });

    // Show key hint briefly
    const keyHint = document.getElementById('key-hint');
    setTimeout(() => {
      keyHint.classList.add('show');
      setTimeout(() => keyHint.classList.remove('show'), 3500);
    }, 1400);

    updateActive(0);
  }

  /* ════════════════════════════════════════════════
     ROTATION STATE
  ════════════════════════════════════════════════ */
  let targetRot  = 0;   // target gallery.rotation.y
  let currentRot = 0;   // smoothed current
  let activeIdx  = 0;
  let prevActive = -1;
  let hoveredIdx = -1; // Added to track which piece is currently hovered

  function getIdxFromRot(rot) {
    // When gallery.rotation.y = rot, which piece is at front-center?
    let a = (rot / STEP);
    return ((Math.round(a) % N) + N) % N;
  }

  function navigateTo(idx) {
    const target     = idx * STEP;
    const raw        = target - currentRot;
    const normalized = ((raw % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
    targetRot = currentRot + normalized;
  }

  function updateActive(idx) {
    if (frames.length === 0) return;
    activeIdx = idx;
    const p   = PIECES_ACTIVE[idx];

    document.querySelectorAll('.gi-dot').forEach((d, i) => {
      d.classList.toggle('active', i === idx);
    });

    // Brightness
    frames.forEach(f => {
      const mat = f.userData.imgMat;
      if (mat) mat.opacity = 1.0;
    });

    // Show click hint briefly
    const ch = document.getElementById('click-hint');
    ch.classList.add('show');
    setTimeout(() => ch.classList.remove('show'), 2200);
  }

  /* ════════════════════════════════════════════════
     DRAG / TOUCH INTERACTION
  ════════════════════════════════════════════════ */
  let dragging   = false;
  let startX     = 0;
  let startRot   = 0;
  let totalDelta = 0;

  canvas.addEventListener('pointerdown', e => {
    dragging   = true;
    startX     = e.clientX;
    startRot   = targetRot;
    totalDelta = 0;
    canvas.setPointerCapture(e.pointerId);
    document.body.classList.add('cur-drag');
  });

  window.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx   = e.clientX - startX;
    totalDelta = Math.abs(dx);
    targetRot  = startRot + dx * .0072;
  });

  window.addEventListener('pointerup', e => {
    if (!dragging) return;
    dragging = false;
    document.body.classList.remove('cur-drag');

    if (totalDelta < 6) {
      const clickNorm = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
      raycaster.setFromCamera(clickNorm, camera);
      const intersects = raycaster.intersectObjects(gallery.children, true);
      let clickedIdx = -1;
      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj && obj.parent && obj.userData.index === undefined) obj = obj.parent;
        if (obj && obj.userData.activeIndex !== undefined) clickedIdx = obj.userData.activeIndex;
      }

      if (clickedIdx !== -1) {
        navigateTo(clickedIdx);
        openPanel(clickedIdx);
      } else {
        openPanel();
      }
      return;
    }
    // Snap
    const idx = getIdxFromRot(targetRot);
    navigateTo(idx);
  });

  // Touch
  let touchClickX = 0, touchClickY = 0;
  canvas.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;
    dragging = true; 
    startX = e.touches[0].clientX;
    touchClickX = e.touches[0].clientX;
    touchClickY = e.touches[0].clientY;
    startRot = targetRot; totalDelta = 0;
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    if (!dragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - startX;
    totalDelta = Math.abs(dx);
    targetRot  = startRot + dx * .0072;
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    if (!dragging) return; dragging = false;
    if (totalDelta < 6) {
      const clickNorm = new THREE.Vector2(
        (touchClickX / window.innerWidth) * 2 - 1,
        -(touchClickY / window.innerHeight) * 2 + 1
      );
      raycaster.setFromCamera(clickNorm, camera);
      const intersects = raycaster.intersectObjects(gallery.children, true);
      let clickedIdx = -1;
      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj && obj.parent && obj.userData.index === undefined) obj = obj.parent;
        if (obj && obj.userData.activeIndex !== undefined) clickedIdx = obj.userData.activeIndex;
      }
      if (clickedIdx !== -1) {
        navigateTo(clickedIdx);
        openPanel(clickedIdx);
      } else {
        openPanel();
      }
      return; 
    }
    navigateTo(getIdxFromRot(targetRot));
  });

  /* ════════════════════════════════════════════════
     SCROLL — navigate between pieces
  ════════════════════════════════════════════════ */
  let wheelTimer;
  window.addEventListener('wheel', e => {
    e.preventDefault();
    clearTimeout(wheelTimer);
    targetRot += e.deltaY * .0025;
    wheelTimer = setTimeout(() => {
      navigateTo(getIdxFromRot(targetRot));
    }, 180);
  }, { passive: false });

  /* ════════════════════════════════════════════════
     KEYBOARD
  ════════════════════════════════════════════════ */
  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      navigateTo(((activeIdx - 1) + N) % N);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      navigateTo((activeIdx + 1) % N);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); openPanel();
    } else if (e.key === 'Escape') {
      closePanel();
    }
  });

  /* ════════════════════════════════════════════════
     DETAIL PANEL
  ════════════════════════════════════════════════ */
  function openPanel(idx = activeIdx) {
    if (frames.length === 0) return;
    const p = PIECES_ACTIVE[idx];
    document.getElementById('dp-ghost').textContent = p.num;
    document.getElementById('dp-name').textContent  = p.name;
    document.getElementById('dp-desc').textContent  = p.desc;
    document.getElementById('dp-year').textContent  = p.year;
    document.getElementById('dp-cat').textContent   = p.cat;
    document.getElementById('dp-disc').textContent  = p.disc;
    document.getElementById('detail-panel').classList.add('open');

    // Show large image
    const lv = document.getElementById('large-view');
    document.getElementById('lv-img').src = p.img;
    lv.classList.add('open');
  }

  function closePanel() {
    document.getElementById('detail-panel').classList.remove('open');
    document.getElementById('large-view').classList.remove('open');
  }

  document.getElementById('dp-close').addEventListener('click', closePanel);
  document.getElementById('dp-close').addEventListener('mouseenter', () => document.body.classList.add('cur-active'));
  document.getElementById('dp-close').addEventListener('mouseleave', () => document.body.classList.remove('cur-active'));

  document.getElementById('large-view').addEventListener('click', e => {
    if (e.target.id === 'large-view') {
      closePanel();
    }
  });

  /* ════════════════════════════════════════════════
     DRAG HINT AUTO-HIDE
  ════════════════════════════════════════════════ */
  let hintGone = false;
  function hideHint() {
    if (!hintGone) { hintGone = true; document.getElementById('drag-hint').classList.add('gone'); }
  }
  window.addEventListener('pointermove', hideHint, { once: true });
  window.addEventListener('touchstart',  hideHint, { once: true });

  /* ════════════════════════════════════════════════
     CUSTOM CURSOR
  ════════════════════════════════════════════════ */
  const curDot  = document.getElementById('cur-dot');
  const curRing = document.getElementById('cur-ring');
  let cmx = -100, cmy = -100, cdx = -100, cdy = -100;
  
  // Normalized mouse coords for flashlight & raycasting
  const mouseNorm = new THREE.Vector2(-100, -100);
  let mouseActive = false;
  const raycaster = new THREE.Raycaster();

  document.addEventListener('mousemove', e => {
    cmx = e.clientX; cmy = e.clientY;
    curDot.style.left = cmx + 'px';
    curDot.style.top  = cmy + 'px';
    
    mouseNorm.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseNorm.y = -(e.clientY / window.innerHeight) * 2 + 1;
    mouseActive = true;
  });
  
  document.addEventListener('mouseleave', () => {
    mouseActive = false;
  });

  (function curLoop() {
    cdx += (cmx - cdx) * 0.12;
    cdy += (cmy - cdy) * 0.12;
    curRing.style.left = cdx + 'px';
    curRing.style.top  = cdy + 'px';
    requestAnimationFrame(curLoop);
  })();

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cur-active'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cur-active'));
  });

  /* ════════════════════════════════════════════════
     RESIZE
  ════════════════════════════════════════════════ */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ════════════════════════════════════════════════
     RENDER LOOP
  ════════════════════════════════════════════════ */
  const camWP = new THREE.Vector3();
  let   tick  = 0;

  function animate() {
    requestAnimationFrame(animate);
    tick += .008;

    /* — Smooth gallery rotation — */
    currentRot += (targetRot - currentRot) * .065;
    gallery.rotation.y = currentRot;

    /* — Active piece tracking — */
    const newIdx = getIdxFromRot(currentRot);
    if (newIdx !== prevActive) {
      prevActive = newIdx;
      updateActive(newIdx);
    }

    /* — Billboard: every frame faces the camera — */
    camera.getWorldPosition(camWP);
    frames.forEach(f => f.lookAt(camWP));

    /* — Raycasting for hover (linterna effect) — */
    raycaster.setFromCamera(mouseNorm, camera);
    const intersects = raycaster.intersectObjects(gallery.children, true);
    hoveredIdx = -1; // Reset global
    if (mouseActive && intersects.length > 0) {
      let obj = intersects[0].object;
      while (obj && obj.parent && obj.userData.index === undefined) {
        obj = obj.parent;
      }
      if (obj && obj.userData.index !== undefined) {
        hoveredIdx = obj.userData.index;
      }
    }

    /* — Active piece subtle scale pulse & Hover opacity — */
    frames.forEach(f => {
      const isAct   = f.userData.index === activeIdx;
      const isHov   = f.userData.index === hoveredIdx;
      const tgt     = isAct ? 1.045 : 1.0;
      f.scale.x     += (tgt - f.scale.x) * .055;
      f.scale.y     += (tgt - f.scale.y) * .055;
      f.scale.z     += (tgt - f.scale.z) * .055;

      if (f.userData.imgMat) {
        const tgtOpac = isHov ? 1.0 : 0.3;
        f.userData.imgMat.opacity += (tgtOpac - f.userData.imgMat.opacity) * 0.1;
      }
    });

    /* — Flashlight effect — */
    const isPanelOpen = document.getElementById('detail-panel').classList.contains('open');
    if (mouseActive && !isPanelOpen && !dragging) {
      flashLight.intensity += (20.0 - flashLight.intensity) * 0.08;
      flashTarget.position.x += (mouseNorm.x * 6 - flashTarget.position.x) * 0.1;
      flashTarget.position.y += (mouseNorm.y * 4 - flashTarget.position.y) * 0.1;
    } else {
      flashLight.intensity += (0 - flashLight.intensity) * 0.08;
    }

    /* — Particle drift — */
    if (window._particles) {
      const { pts, pos, speeds, count } = window._particles;
      const pa = pts.geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        pa.array[i * 3 + 1] += speeds[i];
        if (pa.array[i * 3 + 1] > 2.2) pa.array[i * 3 + 1] = -2.2;
      }
      pa.needsUpdate = true;
    }

    /* — Subtle top-light breathe — */
    topLight.intensity = .9 + Math.sin(tick * .7) * .08;

    /* — Warm/cool lights slow orbit — */
    const la = tick * .18;
    warmLight.position.x = Math.sin(la)       * RADIUS * .6;
    warmLight.position.z = Math.cos(la)       * RADIUS * .6;
    coolLight.position.x = Math.sin(la + Math.PI) * RADIUS * .6;
    coolLight.position.z = Math.cos(la + Math.PI) * RADIUS * .6;

    renderer.render(scene, camera);
  }

  animate();
  