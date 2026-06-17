// ===========================
// Smooth scroll for anchor links only
// (skipped on homepage — motion.js uses Lenis)
// ===========================
const isHomePage = document.body.classList.contains('page-home');

if (!isHomePage) {
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
}

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
// Skipped on homepage — GSAP handles reveals via motion.js
// ===========================
if (!isHomePage) {
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
}

// ===========================
// Wave gradient canvas animation
// ===========================
const canvas = document.getElementById('waveCanvas');

if (canvas) {
  const ctx = canvas.getContext('2d');
  let animationId;
  let time = 0;
  const editorial = isHomePage;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  function drawWave(yOffset, amplitude, frequency, speed, color, blur) {
    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;

    ctx.save();
    ctx.filter = `blur(${blur}px)`;
    ctx.beginPath();
    ctx.moveTo(0, h);

    for (let x = 0; x <= w; x += 2) {
      const y = h - yOffset
        + Math.sin(x * frequency + time * speed) * amplitude
        + Math.sin(x * frequency * 0.5 + time * speed * 0.7) * amplitude * 0.6
        + Math.sin(x * frequency * 1.5 + time * speed * 1.3) * amplitude * 0.3;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;

    ctx.clearRect(0, 0, w, h);

    if (editorial) {
      drawWave(h * 0.32, 22, 0.003, 0.35, 'rgba(18, 18, 28, 0.4)', 50);
      drawWave(h * 0.26, 18, 0.005, 0.5, 'rgba(32, 32, 44, 0.32)', 35);
      drawWave(h * 0.2, 14, 0.007, 0.65, 'rgba(52, 52, 68, 0.22)', 25);
      drawWave(h * 0.14, 10, 0.009, 0.8, 'rgba(80, 80, 98, 0.12)', 18);
    } else {
      drawWave(h * 0.35, 30, 0.003, 0.4, 'rgba(20, 20, 32, 0.52)', 40);
      drawWave(h * 0.28, 25, 0.005, 0.6, 'rgba(38, 38, 52, 0.45)', 30);
      drawWave(h * 0.22, 20, 0.007, 0.8, 'rgba(65, 65, 82, 0.38)', 20);
      drawWave(h * 0.18, 15, 0.009, 1.0, 'rgba(105, 105, 125, 0.24)', 15);
      drawWave(h * 0.12, 10, 0.011, 1.2, 'rgba(165, 165, 185, 0.12)', 10);
    }

    time += 0.02;
    animationId = requestAnimationFrame(animate);
  }

  const contactSection = document.getElementById('contact');
  let isAnimating = false;

  const waveObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !isAnimating) {
        isAnimating = true;
        resize();
        animate();
      } else if (!entry.isIntersecting && isAnimating) {
        isAnimating = false;
        cancelAnimationFrame(animationId);
      }
    });
  }, { threshold: 0.05 });

  if (contactSection) {
    waveObserver.observe(contactSection);
  }

  window.addEventListener('resize', () => {
    if (isAnimating) {
      resize();
    }
  });
}
