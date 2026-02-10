// Position the timeline line exactly from first dot to last dot
const timelineLine = document.querySelector('.timeline-line');
const dots = document.querySelectorAll('.exp-dot');
const timelineSection = document.querySelector('.timeline-section');

function positionLine() {
  if (dots.length < 2) return;
  const first = dots[0];
  const last = dots[dots.length - 1];
  const sectionRect = timelineSection.getBoundingClientRect();
  const firstRect = first.getBoundingClientRect();
  const lastRect = last.getBoundingClientRect();

  const top = firstRect.top - sectionRect.top + firstRect.height / 2;
  const bottom = lastRect.top - sectionRect.top + lastRect.height / 2;

  timelineLine.style.top = top + 'px';
  timelineLine.style.height = (bottom - top) + 'px';
  timelineLine.style.opacity = '1';
}

// Reveal stops on scroll
const stops = document.querySelectorAll('.exp-stop');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

stops.forEach(stop => observer.observe(stop));

// Accordion dropdowns
const accordions = document.querySelectorAll('.exp-accordion');

accordions.forEach(btn => {
  btn.addEventListener('click', () => {
    const panel = btn.nextElementSibling;
    const isOpen = btn.classList.contains('open');

    // Close all other panels
    accordions.forEach(other => {
      other.classList.remove('open');
      other.nextElementSibling.classList.remove('open');
    });

    // Toggle current
    if (!isOpen) {
      btn.classList.add('open');
      panel.classList.add('open');
    }

    // Reposition line after accordion animation
    setTimeout(positionLine, 450);
  });
});

// Position line on load and resize
window.addEventListener('load', positionLine);
window.addEventListener('resize', positionLine);
// Reposition after reveal animations settle
setTimeout(positionLine, 800);
setTimeout(positionLine, 1500);

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
