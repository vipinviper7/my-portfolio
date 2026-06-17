/**
 * Homepage motion layer — Lenis, GSAP, cursor, project preview
 * Only loaded on index.html
 */
(function () {
  'use strict';

  if (!document.body.classList.contains('page-home')) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  if (prefersReducedMotion) {
    document.body.classList.add('no-motion');
    initReducedMotion();
    return;
  }

  document.body.classList.add('motion-ready');

  let lenis = null;

  // Lenis smooth scroll
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: function (t) {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    lenis.on('scroll', function () {
      const nav = document.querySelector('.nav');
      if (nav) {
        if (lenis.scroll > 50) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
      }
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.update();
      }
    });

    if (typeof gsap !== 'undefined') {
      gsap.ticker.add(function (time) {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  // GSAP animations
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    initHeroAnimation();
    initProjectIndexAnimation();
    initSectionReveals();

    ScrollTrigger.refresh();
  } else {
    document.body.classList.remove('motion-ready');
    document.body.classList.add('no-motion');
    initReducedMotion();
  }

  if (isFinePointer) {
    initCursor();
    initProjectPreview();
    initMagnetic();
  }

  // Anchor scroll via Lenis
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href*="#"]');
    if (!link || !lenis) return;
    const hash = link.getAttribute('href');
    const targetId = hash.includes('#') ? hash.split('#')[1] : null;
    if (!targetId) return;
    const target = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      lenis.scrollTo(target, { offset: -80 });
    }
  });

  function initHeroAnimation() {
    const lines = document.querySelectorAll('.hero-line');
    lines.forEach(function (line) {
      const text = line.textContent;
      line.textContent = '';
      const inner = document.createElement('span');
      inner.className = 'hero-line-inner';
      inner.textContent = text;
      line.appendChild(inner);
    });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from('.hero-meta', { y: 24, opacity: 0, duration: 0.8 })
      .from('.hero-line-inner', { y: '110%', duration: 1, stagger: 0.12 }, '-=0.5')
      .from('.hero-deck', { y: 20, opacity: 0, duration: 0.7 }, '-=0.5')
      .from('.hero-foot', { y: 16, opacity: 0, duration: 0.6 }, '-=0.4');
  }

  function initProjectIndexAnimation() {
    gsap.from('.project-row', {
      scrollTrigger: {
        trigger: '.project-index',
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
    });
  }

  function initSectionReveals() {
    gsap.utils.toArray('.vd-strip-item, .contact-reveal, .section-title').forEach(function (el) {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      });
    });
  }

  function initReducedMotion() {
    document.querySelectorAll('.hero-line').forEach(function (line) {
      if (!line.querySelector('.hero-line-inner')) {
        const text = line.textContent;
        line.textContent = '';
        const inner = document.createElement('span');
        inner.className = 'hero-line-inner';
        inner.textContent = text;
        line.appendChild(inner);
      }
    });
    fallbackReveal();
  }

  function fallbackReveal() {
    document.querySelectorAll('.reveal, .reveal-scale, .section-title, .contact-reveal').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  function initCursor() {
    const cursor = document.querySelector('.cursor');
    if (!cursor) return;

    let x = 0;
    let y = 0;
    let cx = 0;
    let cy = 0;

    document.addEventListener('mousemove', function (e) {
      x = e.clientX;
      y = e.clientY;
      cursor.classList.add('is-visible');
    });

    document.addEventListener('mouseleave', function () {
      cursor.classList.remove('is-visible');
    });

    const interactive = 'a, button, .project-row, .magnetic, .nav-link';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(interactive)) {
        cursor.classList.add('is-hover');
      }
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(interactive)) {
        cursor.classList.remove('is-hover');
      }
    });

    function tick() {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      cursor.style.transform = 'translate3d(' + cx + 'px, ' + cy + 'px, 0)';
      requestAnimationFrame(tick);
    }
    tick();
  }

  function initProjectPreview() {
    const preview = document.querySelector('.project-preview');
    const previewImg = preview && preview.querySelector('img');
    const rows = document.querySelectorAll('.project-row[data-preview]');
    if (!preview || !previewImg || !rows.length) return;

    let activeSrc = '';
    let px = 0;
    let py = 0;
    let previewX = 0;
    let previewY = 0;

    rows.forEach(function (row) {
      row.addEventListener('mouseenter', function () {
        const src = row.getAttribute('data-preview');
        if (src && src !== activeSrc) {
          activeSrc = src;
          previewImg.src = src;
        }
        preview.classList.add('is-visible');
      });

      row.addEventListener('mouseleave', function () {
        preview.classList.remove('is-visible');
      });

      row.addEventListener('mousemove', function (e) {
        px = e.clientX;
        py = e.clientY;
      });
    });

    function animatePreview() {
      previewX += (px - previewX) * 0.12;
      previewY += (py - previewY) * 0.12;
      const offsetX = 24;
      const offsetY = -140;
      const scale = preview.classList.contains('is-visible') ? 1 : 0.92;
      preview.style.transform = 'translate3d(' + (previewX + offsetX) + 'px, ' + (previewY + offsetY) + 'px, 0) scale(' + scale + ')';
      requestAnimationFrame(animatePreview);
    }
    animatePreview();
  }

  function initMagnetic() {
    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, {
          x: relX * 0.25,
          y: relY * 0.25,
          duration: 0.3,
          ease: 'power2.out',
        });
      });

      el.addEventListener('mouseleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
      });
    });
  }
})();
