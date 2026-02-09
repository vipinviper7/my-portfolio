// Scroll reveal with staggered animation
const revealItems = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealItems.forEach(item => revealObserver.observe(item));

// Sticky nav active state based on scroll
const sections = document.querySelectorAll('.gal-section');
const navLinks = document.querySelectorAll('.gal-nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
      });
    }
  });
}, { threshold: 0.3 });

sections.forEach(section => sectionObserver.observe(section));

// Lightbox
const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.innerHTML = '<button class="lightbox-close" aria-label="Close lightbox">&times;</button><img src="" alt="">';
document.body.appendChild(lightbox);

const lbImg = lightbox.querySelector('img');
const lbClose = lightbox.querySelector('.lightbox-close');

// Open lightbox on image click
document.querySelectorAll('.gal-item img').forEach(img => {
  img.addEventListener('click', () => {
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

// Close lightbox
function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const navPill = document.querySelector('.nav-pill');

if (navToggle && navPill) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navPill.classList.toggle('open');
    document.body.classList.toggle('nav-open');
  });

  navPill.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navPill.classList.remove('open');
      document.body.classList.remove('nav-open');
    });
  });
}
