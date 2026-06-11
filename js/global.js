// ============================================================
// Global polish layer — loaded on every page.
// Custom cursor, Lenis smooth scroll, page transitions,
// parallax, scroll reveals, local-time ticker.
// ============================================================
(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ----------------------------------------------------------
  // Inject shared chrome (grain, veil, cursor)
  // ----------------------------------------------------------
  var grain = document.createElement('div');
  grain.className = 'gl-grain';
  grain.setAttribute('aria-hidden', 'true');
  document.body.appendChild(grain);

  var veil = document.createElement('div');
  veil.className = 'gl-veil';
  veil.setAttribute('aria-hidden', 'true');
  document.body.appendChild(veil);

  // ----------------------------------------------------------
  // Custom cursor
  // ----------------------------------------------------------
  if (finePointer && !reduceMotion) {
    var dot = document.createElement('div');
    dot.className = 'gl-cursor-dot';
    dot.setAttribute('aria-hidden', 'true');

    var ring = document.createElement('div');
    ring.className = 'gl-cursor';
    ring.setAttribute('aria-hidden', 'true');
    var label = document.createElement('span');
    label.className = 'gl-cursor-label';
    ring.appendChild(label);

    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.body.classList.add('has-cursor');

    var mx = -100, my = -100, rx = -100, ry = -100;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = 'translate(' + (mx - 3) + 'px,' + (my - 3) + 'px)';
    }, { passive: true });

    (function followLoop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = 'translate(' + (rx - ring.offsetWidth / 2) + 'px,' + (ry - ring.offsetHeight / 2) + 'px)';
      requestAnimationFrame(followLoop);
    })();

    document.addEventListener('mouseover', function (e) {
      var labelled = e.target.closest('[data-cursor]');
      var interactive = e.target.closest('a, button, [role="button"]');
      if (labelled) {
        label.textContent = labelled.getAttribute('data-cursor');
        ring.classList.add('has-label');
        ring.classList.remove('is-hover');
      } else if (interactive) {
        ring.classList.remove('has-label');
        ring.classList.add('is-hover');
      } else {
        ring.classList.remove('has-label', 'is-hover');
      }
    }, { passive: true });

    document.addEventListener('mousedown', function () { ring.classList.add('is-down'); });
    document.addEventListener('mouseup', function () { ring.classList.remove('is-down'); });
  }

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

  // stopPropagation above keeps legacy handlers (incl. the nav-close
  // listeners in main.js) from firing, so close the menu here too
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
  // Page transitions — fade veil on internal navigation
  // ----------------------------------------------------------
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href]');
    if (!link) return;
    var href = link.getAttribute('href');
    if (!href || href.indexOf('#') === 0 || link.target === '_blank' || link.hasAttribute('download')) return;
    if (/^(https?:|mailto:|tel:)/.test(href) && href.indexOf(window.location.origin) !== 0) return;
    if (href.indexOf('#') > -1) return;
    if (reduceMotion) return;
    e.preventDefault();
    document.body.classList.add('is-leaving');
    setTimeout(function () { window.location.href = href; }, 380);
  });

  window.addEventListener('pageshow', function (e) {
    if (e.persisted) document.body.classList.remove('is-leaving');
  });

  // ----------------------------------------------------------
  // Scroll reveals — [data-reveal]
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
  // Parallax — [data-parallax] images drift on scroll
  // ----------------------------------------------------------
  var pxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  if (pxEls.length && !reduceMotion) {
    var ticking = false;
    var updateParallax = function () {
      ticking = false;
      var vh = window.innerHeight;
      pxEls.forEach(function (el) {
        var rect = el.parentElement.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        var progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
        var speed = parseFloat(el.getAttribute('data-parallax')) || 8;
        el.style.transform = 'translateY(' + (progress * speed - speed) + '%)';
      });
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(updateParallax); }
    }, { passive: true });
    updateParallax();
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

  // ----------------------------------------------------------
  // Magnetic elements — [data-magnetic]
  // ----------------------------------------------------------
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      el.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + dx * 0.25 + 'px,' + dy * 0.25 + 'px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = 'translate(0, 0)';
      });
    });
  }
})();
