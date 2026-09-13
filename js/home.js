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
})();
