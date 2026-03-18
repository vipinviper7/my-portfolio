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
// Nav scroll border effect
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
// Card glow mouse-tracking
// ===========================
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--card-mouse-x', (e.clientX - rect.left) + 'px');
    card.style.setProperty('--card-mouse-y', (e.clientY - rect.top) + 'px');
    card.classList.add('card-glow');
  });

  card.addEventListener('mouseleave', () => {
    card.classList.remove('card-glow');
  });
});

// ===========================
// Scroll progress bar
// ===========================
const scrollProgress = document.querySelector('.scroll-progress');

if (scrollProgress) {
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = progress + '%';
  }, { passive: true });
}

// ===========================
// Challenge carousel scroll
// ===========================
const challengeGrid = document.querySelector('.challenge-grid');
const navLeft = document.querySelector('.challenge-nav--left');
const navRight = document.querySelector('.challenge-nav--right');
const dotsContainer = document.querySelector('.challenge-dots');

if (challengeGrid && navLeft && navRight) {
  const cardWidth = 280 + 24; // card width + gap
  const scrollAmount = cardWidth * 3;

  function updateNavState() {
    const { scrollLeft, scrollWidth, clientWidth } = challengeGrid;
    navLeft.disabled = scrollLeft <= 5;
    navRight.disabled = scrollLeft + clientWidth >= scrollWidth - 5;
    updateDots();
  }

  navLeft.addEventListener('click', () => {
    challengeGrid.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  navRight.addEventListener('click', () => {
    challengeGrid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });

  // Dot indicators
  function buildDots() {
    if (!dotsContainer) return;
    const cards = challengeGrid.querySelectorAll('.app-card');
    const visibleCards = Math.floor(challengeGrid.clientWidth / cardWidth) || 3;
    const pages = Math.ceil(cards.length / visibleCards);
    dotsContainer.innerHTML = '';
    for (let i = 0; i < pages; i++) {
      const dot = document.createElement('span');
      dot.className = 'challenge-dot';
      dot.addEventListener('click', () => {
        challengeGrid.scrollTo({ left: i * visibleCards * cardWidth, behavior: 'smooth' });
      });
      dotsContainer.appendChild(dot);
    }
    updateDots();
  }

  function updateDots() {
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll('.challenge-dot');
    const visibleCards = Math.floor(challengeGrid.clientWidth / cardWidth) || 3;
    const currentPage = Math.round(challengeGrid.scrollLeft / (visibleCards * cardWidth));
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentPage);
    });
  }

  challengeGrid.addEventListener('scroll', updateNavState, { passive: true });
  window.addEventListener('resize', () => { buildDots(); updateNavState(); });
  buildDots();
  updateNavState();
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
