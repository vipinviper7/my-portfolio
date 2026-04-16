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
const revealElements = document.querySelectorAll('.reveal');

if (revealElements.length > 0) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

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

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
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

    // Deep background wave — large, slow
    drawWave(h * 0.35, 30, 0.003, 0.4, 'rgba(15, 30, 120, 0.5)', 40);

    // Mid wave — medium
    drawWave(h * 0.28, 25, 0.005, 0.6, 'rgba(30, 64, 175, 0.45)', 30);

    // Bright wave — sharper
    drawWave(h * 0.22, 20, 0.007, 0.8, 'rgba(59, 130, 246, 0.35)', 20);

    // Top shimmer wave — fast, subtle
    drawWave(h * 0.18, 15, 0.009, 1.0, 'rgba(96, 165, 250, 0.2)', 15);

    // Lightest accent
    drawWave(h * 0.12, 10, 0.011, 1.2, 'rgba(147, 197, 253, 0.1)', 10);

    time += 0.02;
    animationId = requestAnimationFrame(animate);
  }

  // Only animate when contact section is visible
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
