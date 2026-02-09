// Timeline progress line that fills as you scroll
const progressBar = document.querySelector('.timeline-progress');
const timelineSection = document.querySelector('.timeline-section');

function updateProgress() {
  const rect = timelineSection.getBoundingClientRect();
  const sectionTop = rect.top + window.scrollY;
  const sectionHeight = rect.height;
  const scrolled = window.scrollY - sectionTop + window.innerHeight * 0.5;
  const progress = Math.min(Math.max(scrolled / sectionHeight, 0), 1);
  progressBar.style.height = (progress * 100) + '%';
}

// Reveal timeline items on scroll
const timelineItems = document.querySelectorAll('.timeline-item');
const yearMarkers = document.querySelectorAll('.timeline-year');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

timelineItems.forEach(item => observer.observe(item));

// Year markers fade in
const yearObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      yearObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

yearMarkers.forEach(marker => {
  marker.style.opacity = '0';
  marker.style.transform = 'translateY(20px)';
  marker.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  yearObserver.observe(marker);
});

// Update progress on scroll
window.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();

// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const navPill = document.querySelector('.nav-pill');

if (navToggle && navPill) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navPill.classList.toggle('open');
  });

  navPill.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navPill.classList.remove('open');
    });
  });
}
