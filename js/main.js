// Mobile navigation toggle
const navToggle = document.querySelector('.nav-toggle');
const navPill = document.querySelector('.nav-pill');

if (navToggle && navPill) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navPill.classList.toggle('open');
    document.body.classList.toggle('nav-open');
  });

  // Close mobile nav when a link is clicked
  navPill.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navPill.classList.remove('open');
      document.body.classList.remove('nav-open');
    });
  });
}

// Orbit cursor interaction
const orbitWrap = document.getElementById('orbit-wrap');

if (orbitWrap) {
  const ring = orbitWrap.querySelector('.orbit-ring');
  const maxTilt = 30;
  const maxDist = 400;

  document.addEventListener('mousemove', (e) => {
    const rect = orbitWrap.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    const dist = Math.sqrt(dx * dx + dy * dy);
    const factor = Math.min(dist / maxDist, 1);

    const tiltX = -15 + (-(dy / maxDist) * maxTilt * factor);
    const tiltY = (dx / maxDist) * maxTilt * factor;

    ring.style.animationTimingFunction = 'linear';
    ring.style.transform = 'rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg)';

    // Speed up when cursor is close
    var speed = dist < 200 ? (6 + (1 - dist / 200) * 6) : 12;
    ring.style.animationDuration = speed + 's';
  });

  document.addEventListener('mouseleave', () => {
    ring.style.transform = '';
    ring.style.animationDuration = '12s';
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
