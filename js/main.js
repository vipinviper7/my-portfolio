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
// Scroll reveal (IntersectionObserver)
// ===========================
const revealElements = document.querySelectorAll('.reveal, .reveal-scale, .section-title, .challenge-subtitle, .challenge-progress, .contact-reveal');

if (revealElements.length > 0) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach(el => revealObserver.observe(el));
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

  function animate() {
    const { dpr, w, h } = getSize();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    if (isMobile) {
      drawWave(w, h, h * 0.32, 28, 0.004, 0.45, 'rgba(28, 28, 42, 0.65)', 0);
      drawWave(w, h, h * 0.24, 22, 0.006, 0.65, 'rgba(48, 48, 64, 0.55)', 0);
      drawWave(w, h, h * 0.17, 16, 0.008, 0.85, 'rgba(72, 72, 92, 0.42)', 0);
      drawWave(w, h, h * 0.1, 12, 0.01, 1.0, 'rgba(110, 110, 130, 0.28)', 0);
    } else {
      drawWave(w, h, h * 0.35, 30, 0.003, 0.4, 'rgba(20, 20, 32, 0.52)', 40);
      drawWave(w, h, h * 0.28, 25, 0.005, 0.6, 'rgba(38, 38, 52, 0.45)', 30);
      drawWave(w, h, h * 0.22, 20, 0.007, 0.8, 'rgba(65, 65, 82, 0.38)', 20);
      drawWave(w, h, h * 0.18, 15, 0.009, 1.0, 'rgba(105, 105, 125, 0.24)', 15);
      drawWave(w, h, h * 0.12, 10, 0.011, 1.2, 'rgba(165, 165, 185, 0.12)', 10);
    }

    time += 0.02;
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
      if (entry.isIntersecting) {
        startAnimation();
      } else {
        stopAnimation();
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
