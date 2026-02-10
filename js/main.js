// Mobile navigation toggle
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

  // Close mobile nav when a link is clicked
  navPill.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  // Close on overlay tap
  if (navOverlay) {
    navOverlay.addEventListener('click', closeNav);
  }
}

// Works section tab filtering
const filterBtns = document.querySelectorAll('.filter-btn');
const panels = document.querySelectorAll('.works-panel');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;

    // Update active button
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Show matching panel
    panels.forEach(panel => {
      panel.classList.remove('active');
      if (panel.id === filter) {
        panel.classList.add('active');
      }
    });
  });
});
