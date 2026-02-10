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

// Memoji 3D cursor tracking
const memojiWrap = document.getElementById('memoji-wrap');

if (memojiWrap) {
  const inner = memojiWrap.querySelector('.memoji-inner');
  const shadow = memojiWrap.querySelector('.memoji-shadow');
  const maxTilt = 25;
  const maxDist = 500;

  document.addEventListener('mousemove', (e) => {
    const rect = memojiWrap.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    const dist = Math.sqrt(dx * dx + dy * dy);
    const factor = Math.min(dist / maxDist, 1);

    const rotateY = (dx / maxDist) * maxTilt * factor;
    const rotateX = -(dy / maxDist) * maxTilt * factor;
    const translateX = (dx / maxDist) * 8 * factor;
    const translateY = (dy / maxDist) * 8 * factor;

    // 3D tilt
    inner.style.transform =
      'rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translate(' + translateX + 'px, ' + translateY + 'px)';

    // Dynamic shadow shifts opposite to tilt
    const shadowX = -translateX * 0.8;
    const shadowBlur = 32 + factor * 16;
    shadow.style.transform = 'translateX(calc(-50% + ' + shadowX + 'px))';
    shadow.style.opacity = 0.8 + factor * 0.2;

    // Dynamic box-shadow for depth
    var sX = -rotateY * 0.5;
    var sY = rotateX * 0.5 + 8;
    inner.style.boxShadow = sX + 'px ' + sY + 'px ' + shadowBlur + 'px rgba(0,0,0,0.45)';

    // Move highlight based on cursor
    var hlX = 30 + (dx / maxDist) * 20;
    var hlY = 25 + (dy / maxDist) * 20;
    inner.style.setProperty('--hl-x', hlX + '%');
    inner.style.setProperty('--hl-y', hlY + '%');
  });

  document.addEventListener('mouseleave', () => {
    inner.style.transform = 'rotateX(0deg) rotateY(0deg) translate(0px, 0px)';
    inner.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)';
    shadow.style.transform = 'translateX(-50%)';
    shadow.style.opacity = '0.8';
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
