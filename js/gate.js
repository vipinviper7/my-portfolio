// ============================================================
// Site gate — cordons off the whole portfolio until launch.
// Mounts a blurred, taped-off overlay over the real page and
// unlocks itself automatically the moment the target time
// passes — no manual redeploy needed on launch day.
//
// Paired with a tiny inline script in <head> (adds "pre-gate"
// to <html>, which gate.css uses to hide body pre-paint) so
// there's never a flash of the real content underneath.
// ============================================================
(function () {
  'use strict';

  var TARGET = new Date('2026-10-02T00:00:00+05:30').getTime();

  // Reveal body now (was hidden by the pre-gate head script) —
  // do this even if we're past launch, so the page isn't stuck hidden.
  document.documentElement.classList.remove('pre-gate');

  if (Date.now() >= TARGET) return; // already launched — nothing to gate

  document.body.classList.add('is-gated');

  var tapeHTML = '<div class="site-gate-tape-track">' +
    new Array(8).fill('<span>UNDER REBUILD</span>').join('') +
    '</div>';

  var gate = document.createElement('div');
  gate.className = 'site-gate';
  gate.setAttribute('role', 'alert');
  gate.innerHTML =
    '<div class="site-gate-tape" aria-hidden="true">' + tapeHTML + '</div>' +
    '<div class="site-gate-body">' +
      '<p class="site-gate-name">Vipin Ebenezer</p>' +
      '<h1 class="site-gate-title">Portfolio under rebuild</h1>' +
      '<p class="site-gate-sub">Relaunching <time datetime="2026-10-02">October 2, 2026</time>.</p>' +
      '<div class="site-gate-timer">' +
        '<div class="site-gate-unit"><span class="site-gate-num" data-unit="d">00</span><span class="site-gate-label">days</span></div>' +
        '<div class="site-gate-unit"><span class="site-gate-num" data-unit="h">00</span><span class="site-gate-label">hrs</span></div>' +
        '<div class="site-gate-unit"><span class="site-gate-num" data-unit="m">00</span><span class="site-gate-label">min</span></div>' +
        '<div class="site-gate-unit"><span class="site-gate-num" data-unit="s">00</span><span class="site-gate-label">sec</span></div>' +
      '</div>' +
      '<a class="site-gate-email" href="mailto:vipvipernezer7@gmail.com">vipvipernezer7@gmail.com</a>' +
    '</div>' +
    '<div class="site-gate-tape" aria-hidden="true">' + tapeHTML + '</div>';
  document.body.appendChild(gate);

  var els = {};
  gate.querySelectorAll('.site-gate-num').forEach(function (el) {
    els[el.getAttribute('data-unit')] = el;
  });
  var pad = function (n) { return n < 10 ? '0' + n : String(n); };

  var timer;
  var unlock = function () {
    clearInterval(timer);
    document.body.classList.remove('is-gated');
    gate.remove();
  };

  var tick = function () {
    var diff = TARGET - Date.now();
    if (diff <= 0) { unlock(); return; }
    var totalSec = Math.floor(diff / 1000);
    if (els.d) els.d.textContent = pad(Math.floor(totalSec / 86400));
    if (els.h) els.h.textContent = pad(Math.floor((totalSec % 86400) / 3600));
    if (els.m) els.m.textContent = pad(Math.floor((totalSec % 3600) / 60));
    if (els.s) els.s.textContent = pad(totalSec % 60);
  };
  tick();
  timer = setInterval(tick, 1000);
})();
