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
// ===========================
(function () {
  const cs = document.querySelector('.cs');

  const footer = document.querySelector('.footer');
  if (footer) footer.classList.add('reveal');

  if (!cs) return;

  cs.querySelectorAll('.cs-tldr-section, .cs-impact-banner, .cs-takeaways, .cs-section, .cs-end-cta')
    .forEach(el => el.classList.add('reveal'));

  const sections = cs.querySelectorAll('.cs-section');
  sections.forEach(section => {
    section.querySelectorAll('.cs-image-block, .cs-insight, .cs-outcome').forEach((el, i) => {
      el.classList.add('reveal-settle', 'reveal-d' + (Math.min(i, 5) + 1));
    });
  });

  cs.querySelectorAll('.cs-image-block, .cs-insight, .cs-outcome').forEach(el => {
    if (!el.classList.contains('reveal-settle')) el.classList.add('reveal-settle', 'reveal-d1');
  });
})();

// ===========================
// Scroll reveal (IntersectionObserver)
// ===========================
const revealElements = document.querySelectorAll('.reveal, .reveal-scale, .reveal-settle, .section-title, .contact-reveal');

if (revealElements.length > 0) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
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
