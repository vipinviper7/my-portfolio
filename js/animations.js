/**
 * Subtle motion enhancements — vanilla JS, no dependencies.
 * Respects prefers-reduced-motion.
 */
(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  if (reducedMotion) return;

  // Scroll progress bar
  const progressBar = document.querySelector('.scroll-progress');
  if (progressBar) {
    function updateProgress() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const scale = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      progressBar.style.transform = 'scaleX(' + scale + ')';
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  // Soft parallax on project card images (desktop)
  if (finePointer) {
    document.querySelectorAll('.project-card').forEach(function (card) {
      const img = card.querySelector('.project-thumb img');
      if (!img) return;

      card.addEventListener('mousemove', function (e) {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        img.style.transform = 'scale(1.05) translate(' + (x * 10) + 'px, ' + (y * 10) + 'px)';
      });

      card.addEventListener('mouseleave', function () {
        img.style.transform = '';
      });
    });

    document.querySelectorAll('.vd-card').forEach(function (card) {
      const img = card.querySelector('.vd-card-img img');
      if (!img) return;

      card.addEventListener('mousemove', function (e) {
        const rect = card.querySelector('.vd-card-img').getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        img.style.transform = 'scale(1.06) translate(' + (x * 6) + 'px, ' + (y * 6) + 'px)';
      });

      card.addEventListener('mouseleave', function () {
        img.style.transform = '';
      });
    });
  }

  // Stagger section headers when they enter view
  document.querySelectorAll('.section-header-reveal').forEach(function (header) {
    var children = header.querySelectorAll('.reveal-child');
    if (!children.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        children.forEach(function (child, i) {
          child.style.transitionDelay = (i * 0.08) + 's';
          child.classList.add('visible');
        });
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });

    observer.observe(header);
  });
})();
