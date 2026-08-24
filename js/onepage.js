// ============================================================
// One-page portfolio — segmented controls, tree nav, scrollspy
// ============================================================
(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');

  // ----------------------------------------------------------
  // Segmented controls — swap visible panel + slide the thumb
  // behind the active segment (the iOS segmented-control move)
  // ----------------------------------------------------------
  var thumbUpdaters = [];

  document.querySelectorAll('.one-stage').forEach(function (stage) {
    var segsWrap = stage.querySelector('.one-segs');
    var segs = stage.querySelectorAll('.one-seg');
    var panels = stage.querySelectorAll('.seg-panel');
    var caps = stage.querySelectorAll('.seg-cap');
    if (!segs.length) return;

    // Sliding thumb, injected once behind the buttons
    var thumb = document.createElement('span');
    thumb.className = 'one-seg-thumb';
    thumb.setAttribute('aria-hidden', 'true');
    if (segsWrap) segsWrap.insertBefore(thumb, segsWrap.firstChild);

    var moveThumb = function (seg) {
      if (!seg) return;
      thumb.style.width = seg.offsetWidth + 'px';
      thumb.style.transform = 'translateX(' + seg.offsetLeft + 'px)';
    };
    var activeSeg = stage.querySelector('.one-seg.active') || segs[0];
    moveThumb(activeSeg);
    thumbUpdaters.push(function () {
      moveThumb(stage.querySelector('.one-seg.active'));
    });

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
        moveThumb(seg);
      });
    });
  });

  // Re-measure every thumb on resize (debounced to one rAF)
  var thumbResizeQueued = false;
  window.addEventListener('resize', function () {
    if (thumbResizeQueued) return;
    thumbResizeQueued = true;
    requestAnimationFrame(function () {
      thumbResizeQueued = false;
      thumbUpdaters.forEach(function (fn) { fn(); });
    });
  });

  // ----------------------------------------------------------
  // Magnifier — glass loupe over case-study images.
  // Desktop: follows the mouse directly. Mobile: engages on a
  // brief long-press (so it doesn't fight page scrolling), then
  // tracks the finger until release.
  // ----------------------------------------------------------
  var ZOOM = 2.2;
  var lensResizers = [];

  document.querySelectorAll('.one-stage').forEach(function (stage) {
    var hasImage = stage.querySelector('img.seg-panel, img.seg-gif');
    if (!hasImage) return;

    var lens = document.createElement('div');
    lens.className = 'mag-lens';
    lens.setAttribute('aria-hidden', 'true');
    stage.appendChild(lens);

    var lensSize = 150;
    var measureLens = function () { lensSize = lens.offsetWidth || 150; };
    measureLens();
    lensResizers.push(measureLens);

    var activeImg = function () {
      return stage.querySelector('img.seg-panel.active, img.seg-gif.active') || hasImage;
    };

    var position = function (clientX, clientY) {
      var img = activeImg();
      if (!img || !img.complete || !img.naturalWidth) return false;

      var imgRect = img.getBoundingClientRect();
      var stageRect = stage.getBoundingClientRect();

      // Clamp the sample point inside the image bounds
      var x = Math.min(Math.max(clientX - imgRect.left, 0), imgRect.width);
      var y = Math.min(Math.max(clientY - imgRect.top, 0), imgRect.height);
      var pctX = x / imgRect.width;
      var pctY = y / imgRect.height;

      lens.style.left = (clientX - stageRect.left - lensSize / 2) + 'px';
      lens.style.top = (clientY - stageRect.top - lensSize / 2) + 'px';

      lens.style.backgroundImage = 'url("' + (img.currentSrc || img.src) + '")';
      lens.style.backgroundSize = (imgRect.width * ZOOM) + 'px ' + (imgRect.height * ZOOM) + 'px';
      lens.style.backgroundPosition =
        '-' + (pctX * imgRect.width * ZOOM - lensSize / 2) + 'px ' +
        '-' + (pctY * imgRect.height * ZOOM - lensSize / 2) + 'px';
      return true;
    };

    var show = function () { lens.classList.add('active'); };
    var hide = function () { lens.classList.remove('active'); };

    // ---- Desktop: mouse follows continuously ----
    stage.addEventListener('mousemove', function (e) {
      if (e.target.tagName !== 'IMG') { hide(); return; }
      if (position(e.clientX, e.clientY)) show(); else hide();
    });
    stage.addEventListener('mouseleave', hide);

    // ---- Mobile: long-press to engage, then drag to inspect ----
    var pressTimer = null;
    var engaged = false;

    stage.addEventListener('touchstart', function (e) {
      if (e.target.tagName !== 'IMG') return;
      var touch = e.touches[0];
      pressTimer = setTimeout(function () {
        engaged = true;
        if (position(touch.clientX, touch.clientY)) show();
        if (navigator.vibrate) navigator.vibrate(8);
      }, 380);
    }, { passive: true });

    stage.addEventListener('touchmove', function (e) {
      if (!engaged) { clearTimeout(pressTimer); return; }
      e.preventDefault(); // only steal the gesture once the loupe is engaged
      var touch = e.touches[0];
      position(touch.clientX, touch.clientY);
    }, { passive: false });

    var endTouch = function () {
      clearTimeout(pressTimer);
      engaged = false;
      hide();
    };
    stage.addEventListener('touchend', endTouch);
    stage.addEventListener('touchcancel', endTouch);
  });

  window.addEventListener('resize', function () {
    lensResizers.forEach(function (fn) { fn(); });
  });

  // ----------------------------------------------------------
  // Theme toggle — light/dark, persisted
  // ----------------------------------------------------------
  var root = document.body;
  var themeBtns = document.querySelectorAll('.theme-btn');
  try {
    var forced = new URLSearchParams(location.search).get('theme');
    if (forced === 'light' || (!forced && localStorage.getItem('vipin-theme') === 'light')) {
      root.classList.add('light');
    }
  } catch (e) {}
  themeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      root.classList.toggle('light');
      try {
        localStorage.setItem('vipin-theme', root.classList.contains('light') ? 'light' : 'dark');
      } catch (e) {}
    });
  });

  // ----------------------------------------------------------
  // Mobile drawer — sidebar becomes a toggleable overlay below 880px
  // ----------------------------------------------------------
  var side = document.getElementById('one-side');
  var menuBtn = document.querySelector('.one-mobile-menu');
  var scrim = document.querySelector('.one-scrim');
  var mobileLabel = document.querySelector('[data-mobile-label]');

  var closeDrawer = function () {
    if (!side) return;
    side.classList.remove('mobile-open');
    if (scrim) scrim.classList.remove('open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
  };
  var openDrawer = function () {
    if (!side) return;
    side.classList.add('mobile-open');
    if (scrim) scrim.classList.add('open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
  };
  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      var isOpen = side && side.classList.contains('mobile-open');
      if (isOpen) closeDrawer(); else openDrawer();
    });
  }
  if (scrim) scrim.addEventListener('click', closeDrawer);

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

    var isWork = id.indexOf('work-') === 0;
    if (isWork) {
      // inside the Work branch: parent stays lit, child follows
      if (parentBtn) parentBtn.classList.add('active');
      if (map[id]) map[id].classList.add('active');
    } else if (map[id]) {
      map[id].classList.add('active');
    }

    if (mobileLabel && map[id]) {
      var label = map[id].textContent.trim();
      mobileLabel.textContent = isWork ? 'Work · ' + label : label;
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
  // Scroll entrance — fade + rise each section in once
  // ----------------------------------------------------------
  var revealSections = document.querySelectorAll('.one-section:not(:first-of-type)');
  if (revealSections.length && 'IntersectionObserver' in window) {
    var rIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          rIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealSections.forEach(function (s) { rIO.observe(s); });
  }

  // ----------------------------------------------------------
  // Smooth scroll for nav links
  // ----------------------------------------------------------
  links.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var target = document.getElementById(link.getAttribute('href').slice(1));
      if (!target) return;
      e.preventDefault();
      closeDrawer();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', '#' + target.id);
    });
  });
})();
