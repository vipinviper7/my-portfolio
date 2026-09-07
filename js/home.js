// ============================================================
// Home page — mobile menu toggle + scrollspy
// ============================================================
(function () {
  'use strict';

  // ---- Mobile menu toggle ----
  var btn = document.querySelector('.rail-bar-toggle');
  var panel = document.getElementById('rail-panel');
  if (btn && panel) {
    btn.addEventListener('click', function () {
      var open = !panel.hidden;
      panel.hidden = open;
      btn.setAttribute('aria-expanded', String(!open));
    });
  }

  // ---- Scrollspy — mark the current section's nav links ----
  var links = document.querySelectorAll('.rail-nav a[href^="#"]');
  var sections = [];
  links.forEach(function (link) {
    var id = link.getAttribute('href').slice(1);
    var section = document.getElementById(id);
    if (section) sections.push(section);
  });

  var setCurrent = function (id) {
    links.forEach(function (link) {
      if (link.getAttribute('href') === '#' + id) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  if (sections.length && 'IntersectionObserver' in window) {
    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible[entry.target.id] = entry.isIntersecting;
      });
      for (var i = 0; i < sections.length; i++) {
        if (visible[sections[i].id]) { setCurrent(sections[i].id); return; }
      }
    }, { rootMargin: '-15% 0px -70% 0px' });
    sections.forEach(function (s) { io.observe(s); });
    setCurrent(sections[0].id);
  }

  // ---- Close the mobile panel after choosing a section ----
  links.forEach(function (link) {
    link.addEventListener('click', function () {
      if (panel && !panel.hidden) {
        panel.hidden = true;
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // ---- Projects rebuild countdown — targets Oct 2, 2026, IST ----
  var numEls = document.querySelectorAll('#rebuild-timer .hp-rebuild-num');
  if (numEls.length) {
    var target = new Date('2026-10-02T00:00:00+05:30').getTime();
    var els = {};
    numEls.forEach(function (el) { els[el.getAttribute('data-unit')] = el; });
    var pad = function (n) { return n < 10 ? '0' + n : String(n); };
    var rebuildTimer;
    var tick = function () {
      var diff = target - Date.now();
      if (diff <= 0) {
        ['d', 'h', 'm', 's'].forEach(function (u) { if (els[u]) els[u].textContent = '00'; });
        clearInterval(rebuildTimer);
        return;
      }
      var totalSec = Math.floor(diff / 1000);
      if (els.d) els.d.textContent = pad(Math.floor(totalSec / 86400));
      if (els.h) els.h.textContent = pad(Math.floor((totalSec % 86400) / 3600));
      if (els.m) els.m.textContent = pad(Math.floor((totalSec % 3600) / 60));
      if (els.s) els.s.textContent = pad(totalSec % 60);
    };
    tick();
    rebuildTimer = setInterval(tick, 1000);
  }
})();
