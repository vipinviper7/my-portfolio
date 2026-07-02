// ===========================
// Shared scroll manager
// One passive scroll listener + rAF tick dispatching to registered callbacks.
// ===========================
const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const scrollCallbacks = [];
let scrollTickQueued = false;

function onScrollTick(fn) {
  scrollCallbacks.push(fn);
}

function runScrollTick() {
  scrollTickQueued = false;
  const y = window.scrollY;
  for (let i = 0; i < scrollCallbacks.length; i++) scrollCallbacks[i](y);
}

window.addEventListener('scroll', () => {
  if (!scrollTickQueued) {
    scrollTickQueued = true;
    requestAnimationFrame(runScrollTick);
  }
}, { passive: true });

// ===========================
// Smooth scroll for anchor links only
// ===========================
document.addEventListener('click', function(e) {
  const link = e.target.closest('a[href*="#"]');
  if (!link) return;
  const hash = link.getAttribute('href');
  const targetId = hash.includes('#') ? hash.split('#')[1] : null;
  if (!targetId) return;
  const target = document.getElementById(targetId);
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  }
});

// ===========================
// Mobile navigation toggle
// ===========================
const navToggle = document.querySelector('.nav-toggle');
const navPill = document.querySelector('.nav-pill');
const navOverlay = document.querySelector('.nav-overlay');

function closeNav() {
  if (navToggle) navToggle.classList.remove('active');
  if (navPill) navPill.classList.remove('open');
  if (navOverlay) navOverlay.classList.remove('open');
  document.body.classList.remove('nav-open');
}

if (navToggle && navPill) {
  navToggle.addEventListener('click', () => {
    const isOpen = navPill.classList.contains('open');
    if (isOpen) {
      closeNav();
    } else {
      navToggle.classList.add('active');
      navPill.classList.add('open');
      if (navOverlay) navOverlay.classList.add('open');
      document.body.classList.add('nav-open');
    }
  });

  navPill.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  if (navOverlay) {
    navOverlay.addEventListener('click', closeNav);
  }
}

// ===========================
// Nav scroll effect
// ===========================
const nav = document.querySelector('.nav');

if (nav) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });
}

// ===========================
// Case-study auto-reveal
// Adds reveal classes via JS so the 5 case-study HTML files stay untouched.
// JS failure = fully visible static page.
// ===========================
(function () {
  const cs = document.querySelector('.cs');

  // Footer reveal site-wide
  const footer = document.querySelector('.footer');
  if (footer) footer.classList.add('reveal');

  if (!cs) return;

  cs.querySelectorAll('.cs-tldr-section, .cs-impact-banner, .cs-takeaways, .cs-section, .cs-end-cta')
    .forEach(el => el.classList.add('reveal'));

  // Staggered settle on media/insert blocks, restarting the count per section
  const sections = cs.querySelectorAll('.cs-section');
  sections.forEach(section => {
    section.querySelectorAll('.cs-image-block, .cs-insight, .cs-outcome').forEach((el, i) => {
      el.classList.add('reveal-settle', 'reveal-d' + (Math.min(i, 5) + 1));
    });
  });

  // Settle blocks living outside .cs-section (e.g. the lead image)
  cs.querySelectorAll('.cs-image-block, .cs-insight, .cs-outcome').forEach(el => {
    if (!el.classList.contains('reveal-settle')) el.classList.add('reveal-settle', 'reveal-d1');
  });
})();

// ===========================
// Scroll reveal (IntersectionObserver)
// ===========================
const revealElements = document.querySelectorAll('.reveal, .reveal-scale, .reveal-settle, .section-title, .challenge-subtitle, .challenge-progress, .contact-reveal');

if (revealElements.length > 0) {
  // After the entrance transition completes, swap to a fast hover-lift transition
  function markRevealDone(el) {
    const done = (e) => {
      if (e && (e.target !== el || e.propertyName !== 'transform')) return;
      el.removeEventListener('transitionend', done);
      clearTimeout(timer);
      el.classList.add('reveal-done');
    };
    el.addEventListener('transitionend', done);
    const timer = setTimeout(() => done(), 1300);
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        markRevealDone(entry.target);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));
}

// ===========================
// Reading progress bar (case-study pages only)
// ===========================
if (document.querySelector('.cs')) {
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  progressBar.setAttribute('aria-hidden', 'true');
  document.body.prepend(progressBar);

  onScrollTick((y) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
  });
}

// ===========================
// Hero parallax — gradient drifts slower than content
// ===========================
if (motionOK && document.querySelector('.hero')) {
  onScrollTick((y) => {
    if (y < 1000) {
      document.documentElement.style.setProperty('--hero-par', (y * 0.12).toFixed(2));
    }
  });
}

// ===========================
// Wave gradient canvas animation
// ===========================
const canvas = document.getElementById('waveCanvas');

if (canvas) {
  const ctx = canvas.getContext('2d');
  let animationId;
  let time = 0;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  function getDpr() {
    return Math.min(window.devicePixelRatio || 1, isMobile ? 2 : 3);
  }

  function getSize() {
    const dpr = getDpr();
    return { dpr, w: canvas.width / dpr, h: canvas.height / dpr };
  }

  // Scroll energy — waves surge while scrolling, then calm down
  let energy = 0;
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    energy = Math.min(energy + Math.abs(y - lastScrollY) * 0.012, 2.0);
    lastScrollY = y;
  }, { passive: true });

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = getDpr();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  function drawWave(w, h, yOffset, amplitude, frequency, speed, color, blur) {
    ctx.save();
    if (!isMobile && blur > 0) {
      ctx.filter = `blur(${blur}px)`;
    }
    ctx.beginPath();
    ctx.moveTo(0, h);

    const amp = isMobile ? amplitude * 0.85 : amplitude;
    for (let x = 0; x <= w; x += isMobile ? 3 : 2) {
      const y = h - yOffset
        + Math.sin(x * frequency + time * speed) * amp
        + Math.sin(x * frequency * 0.5 + time * speed * 0.7) * amp * 0.6
        + Math.sin(x * frequency * 1.5 + time * speed * 1.3) * amp * 0.3;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  function drawFrame() {
    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;
    const amp = 1 + energy * 0.35;

    ctx.clearRect(0, 0, w, h);

    // Deep background wave — large, slow
    drawWave(h * 0.35, 30 * amp, 0.003, 0.4, 'rgba(20, 20, 32, 0.52)', 40);

    // Mid wave — medium
    drawWave(h * 0.28, 25 * amp, 0.005, 0.6, 'rgba(38, 38, 52, 0.45)', 30);

    // Bright wave — sharper
    drawWave(h * 0.22, 20 * amp, 0.007, 0.8, 'rgba(65, 65, 82, 0.38)', 20);

    // Top shimmer wave — fast, subtle
    drawWave(h * 0.18, 15 * amp, 0.009, 1.0, 'rgba(105, 105, 125, 0.24)', 15);

    // Lightest accent
    drawWave(h * 0.12, 10 * amp, 0.011, 1.2, 'rgba(165, 165, 185, 0.12)', 10);
  }

  function animate() {
    drawFrame();
    energy *= 0.93;
    time += 0.02 * (1 + energy);
    animationId = requestAnimationFrame(animate);
  }

  const contactSection = document.getElementById('contact');
  let isAnimating = false;

  function startAnimation() {
    if (isAnimating) return;
    isAnimating = true;
    resize();
    animate();
  }

  function stopAnimation() {
    isAnimating = false;
    cancelAnimationFrame(animationId);
  }

  const waveObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !isAnimating) {
        if (!motionOK) {
          // Reduced motion: render a single static frame, no loop
          resize();
          energy = 0;
          drawFrame();
          return;
        }
        isAnimating = true;
        resize();
        animate();
      } else if (!entry.isIntersecting && isAnimating) {
        isAnimating = false;
        cancelAnimationFrame(animationId);
      }
    });
  }, { threshold: 0, rootMargin: '80px 0px' });

  if (contactSection) {
    waveObserver.observe(contactSection);
    // Start immediately if contact is already on screen (common on mobile)
    requestAnimationFrame(() => {
      const rect = contactSection.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        startAnimation();
      }
    });
  }

  window.addEventListener('resize', () => {
    if (isAnimating) resize();
  });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      if (isAnimating) resize();
    });
  }
}

// ===========================
// Pixel-to-Polish boot sequence (index only)
// Page loads as an 8-bit "boot screen" and resolves into the
// polished site over the first ~180px of scroll. Fully reversible.
// JS failure or any guard tripping = current site unchanged.
// ===========================
(function () {
  const heroHeading = document.querySelector('.hero-heading');
  if (!heroHeading) return;

  // Guards: never enter pixel mode on reduced motion, anchor landings,
  // or restored scroll positions.
  if (!motionOK || location.hash || window.scrollY > 60) return;

  const root = document.documentElement;
  const hero = document.querySelector('.hero');
  root.classList.add('pixel-mode');

  // --- 8-bit text layer (built from hero text — no HTML duplication, zero CLS)
  const layer = document.createElement('div');
  layer.className = 'hero-pixel-layer';
  layer.setAttribute('aria-hidden', 'true');

  const title = document.createElement('div');
  title.className = 'hero-pixel-title';
  title.textContent = heroHeading.textContent;

  const prompt = document.createElement('div');
  prompt.className = 'hero-pixel-prompt';
  prompt.textContent = '\u25BC SCROLL TO START';

  layer.appendChild(title);
  layer.appendChild(prompt);

  // Gate on the pixel font so the title never flashes in the wrong face.
  // Race against 250ms — the fallback stack (Courier New) takes over if slow.
  const fontReady = (document.fonts && document.fonts.load)
    ? Promise.race([
        document.fonts.load('1em "Press Start 2P"').catch(() => {}),
        new Promise(resolve => setTimeout(resolve, 250))
      ])
    : Promise.resolve();

  fontReady.then(() => hero.appendChild(layer));

  // --- Dither dissolve canvas (desktop only)
  let dither = null;
  if (window.matchMedia('(min-width: 769px)').matches) {
    dither = (function () {
      const CELL = 14; // CSS pixels per dither cell (~3,500 cells at 1080p)
      const COLORS = ['#06060f', '#0c0c1a', '#111128'];
      const canvas = document.createElement('canvas');
      canvas.className = 'pixel-dither-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;

      let cols, rows, thresholds, colorIdx;

      function initGrid() {
        cols = Math.ceil(window.innerWidth / CELL);
        rows = Math.ceil(window.innerHeight / CELL);
        canvas.width = cols;   // 1 backing-store pixel per cell,
        canvas.height = rows;  // CSS stretches it (image-rendering: pixelated)
        thresholds = new Float32Array(cols * rows);
        colorIdx = new Uint8Array(cols * rows);
        for (let i = 0; i < thresholds.length; i++) {
          thresholds[i] = Math.random();
          colorIdx[i] = (Math.random() * COLORS.length) | 0;
        }
      }

      function draw(p) {
        ctx.clearRect(0, 0, cols, rows);
        if (p >= 0.999) return; // fully dissolved — nothing to draw, zero idle cost
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const i = r * cols + c;
            if (thresholds[i] > p) {
              ctx.fillStyle = COLORS[colorIdx[i]];
              ctx.fillRect(c, r, 1, 1);
            }
          }
        }
      }

      initGrid();
      document.body.appendChild(canvas);

      window.addEventListener('resize', () => {
        if (root.classList.contains('px-out')) return;
        initGrid();
        draw(currentP);
      });

      return { draw };
    })();
  }

  // --- Scroll scrub: p goes 0 → 1 over the first 180px, smoothstepped
  let currentP = -1;

  function scrub(y) {
    const t = Math.min(Math.max(y / 180, 0), 1);
    const p = t * t * (3 - 2 * t); // smoothstep
    if (p === currentP) return;
    currentP = p;
    root.style.setProperty('--px', p.toFixed(4));
    root.classList.toggle('px-out', p >= 0.999);
    if (dither) dither.draw(p);
  }

  onScrollTick(scrub);
  scrub(window.scrollY); // initial boot-state paint
})();
