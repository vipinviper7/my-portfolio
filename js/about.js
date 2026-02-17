// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const navPill = document.querySelector('.nav-pill');
const navOverlay = document.querySelector('.nav-overlay');

function closeNav() {
  navToggle.classList.remove('active');
  navPill.classList.remove('open');
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

// Hobby tooltip tap-to-reveal on touch devices
const hobbyCards = document.querySelectorAll('.hobby-card');

hobbyCards.forEach(card => {
  card.addEventListener('click', (e) => {
    // Gaming card launches Breakout game
    if (card.id === 'gaming-card' && typeof window.launchBreakout === 'function') {
      e.preventDefault();
      window.launchBreakout();
      return;
    }

    const tooltip = card.querySelector('.hobby-tooltip');
    if (!tooltip) return;

    // Don't interfere with link cards on desktop
    if (card.tagName === 'A' && !('ontouchstart' in window)) return;

    // On touch devices, prevent link navigation on first tap (show tooltip first)
    if (card.tagName === 'A' && !card.classList.contains('tooltip-visible')) {
      e.preventDefault();
    }

    // Close other open tooltips
    hobbyCards.forEach(other => {
      if (other !== card) other.classList.remove('tooltip-visible');
    });

    card.classList.toggle('tooltip-visible');
  });
});

// Close tooltips when tapping outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.hobby-card')) {
    hobbyCards.forEach(card => card.classList.remove('tooltip-visible'));
  }
});
