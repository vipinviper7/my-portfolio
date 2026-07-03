// ============================================================
// Global layer — loaded on every page.
// Lenis smooth scroll, scroll reveals, local-time ticker.
// ============================================================
(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ----------------------------------------------------------
  // Lenis smooth scroll (CDN; degrade gracefully if absent)
  // ----------------------------------------------------------
  var lenis = null;
  if (window.Lenis && !reduceMotion) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    window.__lenis = lenis;
    (function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    })(0);
  }

  // Anchor links — capture phase so legacy handlers don't double-fire
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href*="#"]');
    if (!link) return;
    var href = link.getAttribute('href');
    var hashIndex = href.indexOf('#');
    var pagePart = href.slice(0, hashIndex);
    if (pagePart && pagePart !== window.location.pathname.split('/').pop()) return;
    var id = href.slice(hashIndex + 1);
    if (!id) {
      e.preventDefault();
      e.stopPropagation();
      closeMobileNav();
      if (lenis) lenis.scrollTo(0); else window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      return;
    }
    var target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    e.stopPropagation();
    closeMobileNav();
    if (lenis) lenis.scrollTo(target, { offset: -80 });
    else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  }, true);

  function closeMobileNav() {
    var toggle = document.querySelector('.nav-toggle');
    var pill = document.querySelector('.nav-pill');
    var overlay = document.querySelector('.nav-overlay');
    if (toggle) toggle.classList.remove('active');
    if (pill) pill.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.classList.remove('nav-open');
  }

  // ----------------------------------------------------------
  // Scroll reveals — [data-reveal] (opacity only)
  // ----------------------------------------------------------
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = entry.target.getAttribute('data-reveal-delay');
          if (delay) entry.target.style.transitionDelay = delay + 'ms';
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  // ----------------------------------------------------------
  // Local time ticker — [data-local-time]
  // ----------------------------------------------------------
  var clocks = document.querySelectorAll('[data-local-time]');
  if (clocks.length) {
    var fmt = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata'
    });
    var tick = function () {
      var now = fmt.format(new Date());
      clocks.forEach(function (el) { el.textContent = now; });
    };
    tick();
    setInterval(tick, 30000);
  }
})();
