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

// Memoji cursor tracking
const memojiWrap = document.getElementById('memoji-wrap');

if (memojiWrap) {
  const inner = memojiWrap.querySelector('.memoji-inner');
  const maxTilt = 20;

  document.addEventListener('mousemove', (e) => {
    const rect = memojiWrap.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 500;
    const factor = Math.min(dist / maxDist, 1);

    const rotateY = (dx / maxDist) * maxTilt * factor;
    const rotateX = -(dy / maxDist) * maxTilt * factor;
    const translateX = (dx / maxDist) * 6 * factor;
    const translateY = (dy / maxDist) * 6 * factor;

    inner.style.transform =
      'rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translate(' + translateX + 'px, ' + translateY + 'px)';
  });

  document.addEventListener('mouseleave', () => {
    inner.style.transform = 'rotateX(0deg) rotateY(0deg) translate(0px, 0px)';
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
