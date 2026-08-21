// ============================================================
// One-page portfolio — segmented controls, tree nav, scrollspy
// ============================================================
(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');

  // ----------------------------------------------------------
  // Segmented controls — swap visible panel inside each stage
  // ----------------------------------------------------------
  document.querySelectorAll('.one-stage').forEach(function (stage) {
    var segs = stage.querySelectorAll('.one-seg');
    var panels = stage.querySelectorAll('.seg-panel');
    var caps = stage.querySelectorAll('.seg-cap');
    if (!segs.length) return;

    // Hidden panels never lazy-load (no layout box). Pre-warm every
    // panel in this stage as soon as the user shows intent.
    var warmed = false;
    var warm = function () {
      if (warmed) return;
      warmed = true;
      panels.forEach(function (p) {
        p.loading = 'eager';
        if (!p.complete && p.src) p.src = p.src; // nudge the fetch
      });
    };
    stage.addEventListener('pointerenter', warm, { once: true });
    stage.addEventListener('touchstart', warm, { once: true, passive: true });

    segs.forEach(function (seg, i) {
      seg.addEventListener('click', function () {
        warm();
        segs.forEach(function (s) { s.classList.remove('active'); });
        panels.forEach(function (p) { p.classList.remove('active'); });
        caps.forEach(function (c) { c.classList.remove('active'); });
        seg.classList.add('active');
        if (panels[i]) panels[i].classList.add('active');
        if (caps[i]) caps[i].classList.add('active');
      });
    });
  });

  // ----------------------------------------------------------
  // Theme toggle — light/dark, persisted
  // ----------------------------------------------------------
  var root = document.body;
  var themeBtn = document.querySelector('.theme-btn');
  try {
    var forced = new URLSearchParams(location.search).get('theme');
    if (forced === 'light' || (!forced && localStorage.getItem('vipin-theme') === 'light')) {
      root.classList.add('light');
    }
  } catch (e) {}
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      root.classList.toggle('light');
      try {
        localStorage.setItem('vipin-theme', root.classList.contains('light') ? 'light' : 'dark');
      } catch (e) {}
    });
  }

  // ----------------------------------------------------------
  // Tree nav — "Work" branch expand/collapse
  // ----------------------------------------------------------
  var group = document.querySelector('.nav-group');
  var parentBtn = document.querySelector('.nav-parent');
  if (group && parentBtn) {
    parentBtn.addEventListener('click', function () {
      group.classList.toggle('closed');
      parentBtn.setAttribute('aria-expanded', String(!group.classList.contains('closed')));
    });
  }

  // ----------------------------------------------------------
  // Scrollspy — Work stays highlighted through all work-*
  // sections; hands off when the next section starts
  // ----------------------------------------------------------
  var links = document.querySelectorAll('.one-nav a[href^="#"]');
  var map = {};
  links.forEach(function (link) {
    var id = link.getAttribute('href').slice(1);
    if (document.getElementById(id)) map[id] = link;
  });

  var sections = Array.prototype.slice.call(document.querySelectorAll('.one-section[id]'));

  var setActive = function (id) {
    links.forEach(function (l) { l.classList.remove('active'); });
    if (parentBtn) parentBtn.classList.remove('active');

    if (id.indexOf('work-') === 0) {
      // inside the Work branch: parent stays lit, child follows
      if (parentBtn) parentBtn.classList.add('active');
      if (map[id]) map[id].classList.add('active');
    } else if (map[id]) {
      map[id].classList.add('active');
    }
  };

  if (sections.length && 'IntersectionObserver' in window) {
    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible[entry.target.id] = entry.isIntersecting;
      });
      // first visible section in document order wins
      for (var i = 0; i < sections.length; i++) {
        if (visible[sections[i].id]) { setActive(sections[i].id); return; }
      }
    }, { rootMargin: '-15% 0px -60% 0px' });
    sections.forEach(function (s) { io.observe(s); });
    setActive(sections[0].id);
  }

  // ----------------------------------------------------------
  // Smooth scroll for nav links
  // ----------------------------------------------------------
  links.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var target = document.getElementById(link.getAttribute('href').slice(1));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', '#' + target.id);
    });
  });
})();
