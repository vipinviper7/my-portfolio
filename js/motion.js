/**
 * Homepage motion layer — Lenis, GSAP, cursor, project preview
 * Only loaded on index.html. Content stays visible if scripts fail.
 */
(function () {
  'use strict';

  if (!document.body.classList.contains('page-home')) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  const canUseMotion = !prefersReducedMotion && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

  prepareHeroLines();

  if (!canUseMotion) {
    document.body.classList.add('no-motion');
    return;
  }

  let lenis = null;

  // Lenis only on desktop — native scroll on touch devices
  if (isFinePointer && typeof Lenis !== 'undefined') {
    try {
      lenis = new Lenis({
        duration: 1.1,
        easing: function (t) {
          return Math.min(1, 1.001 - Math.pow(2, -10 * t));
        },
        smoothWheel: true,
      });

      lenis.on('scroll', function () {
        const nav = document.querySelector('.nav');
        if (nav) {
          nav.classList.toggle('scrolled', lenis.scroll > 50);
        }
        ScrollTrigger.update();
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    } catch (err) {
      lenis = null;
    }
  }

  try {
    gsap.registerPlugin(ScrollTrigger);
    initHeroAnimation();
    initProjectIndexAnimation();
    initSectionReveals();
    ScrollTrigger.refresh();
  } catch (err) {
    document.body.classList.add('no-motion');
    return;
  }

  if (isFinePointer) {
    document.body.classList.add('has-custom-cursor');
    initCursor();
    initProjectPreview();
    initMagnetic();
  }

  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href*="#"]');
    if (!link) return;
    const hash = link.getAttribute('href');
    const targetId = hash.includes('#') ? hash.split('#')[1] : null;
    if (!targetId) return;
    const target = document.getElementById(targetId);
    if (!target) return;

    e.preventDefault();
    if (lenis) {
      lenis.scrollTo(target, { offset: -80 });
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  function prepareHeroLines() {
    document.querySelectorAll('.hero-line').forEach(function (line) {
      if (line.querySelector('.hero-line-inner')) return;
      const text = line.textContent.trim();
      line.textContent = '';
      const inner = document.createElement('span');
      inner.className = 'hero-line-inner';
      inner.textContent = text;
      line.appendChild(inner);
    });
  }

  function enableNoMotionFallback() {
    window.setTimeout(function () {
      if (!document.body.classList.contains('no-motion')) return;
      prepareHeroLines();
    }, 100);
  }

  function initHeroAnimation() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from('.hero-meta', { y: 20, opacity: 0, duration: 0.7 })
      .from('.hero-line-inner', { y: '100%', duration: 0.9, stagger: 0.1 }, '-=0.45')
      .from('.hero-deck', { y: 16, opacity: 0, duration: 0.6 }, '-=0.45')
      .from('.hero-foot', { y: 12, opacity: 0, duration: 0.5 }, '-=0.35');
  }

  function initProjectIndexAnimation() {
    gsap.utils.toArray('.project-row').forEach(function (row) {
      gsap.from(row, {
        scrollTrigger: {
          trigger: row,
          start: 'top 90%',
          once: true,
        },
        y: 32,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        immediateRender: false,
      });
    });
  }

  function initSectionReveals() {
    gsap.utils.toArray('.vd-strip-item, .contact-reveal, .works-header .section-title, .vd-header .section-title').forEach(function (el) {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 92%',
          once: true,
        },
        y: 24,
        opacity: 0,
        duration: 0.65,
        ease: 'power3.out',
        immediateRender: false,
      });
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
          x: relX * 0.2,
          y: relY * 0.2,
          duration: 0.3,
          ease: 'power2.out',
        });
      });

      el.addEventListener('mouseleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.4, ease: 'power2.out' });
      });
    });
  }
})();
