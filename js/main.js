// Mobile navigation toggle
const navToggle = document.querySelector('.nav-toggle');
const navPill = document.querySelector('.nav-pill');

if (navToggle && navPill) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navPill.classList.toggle('open');
  });

  // Close mobile nav when a link is clicked
  navPill.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navPill.classList.remove('open');
    });
  });
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
