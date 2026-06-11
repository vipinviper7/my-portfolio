// ============================================================
// Homepage — preloader + scroll-lit statement
// ============================================================
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ----------------------------------------------------------
  // Preloader — counts up once per session, then wipes away
  // ----------------------------------------------------------
  var pre = document.querySelector('.hm-preloader');
  var count = document.querySelector('.hm-preloader-count');
  var seen = false;
  try { seen = sessionStorage.getItem('hm-preloaded') === '1'; } catch (e) {}

  function finishLoad() {
    document.body.classList.add('is-loaded');
    try { sessionStorage.setItem('hm-preloaded', '1'); } catch (e) {}
  }

  if (!pre || seen || reduceMotion) {
    document.body.classList.add('no-preloader');
    finishLoad();
  } else {
    var start = null;
    var DURATION = 1100;
    var step = function (ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / DURATION, 1);
      // ease-out so the count decelerates into 100
      var eased = 1 - Math.pow(1 - p, 3);
      if (count) count.textContent = String(Math.round(eased * 100)).padStart(3, '0');
      if (p < 1) requestAnimationFrame(step);
      else setTimeout(finishLoad, 150);
    };
    requestAnimationFrame(step);
  }

  // ----------------------------------------------------------
  // Statement — words light up as the block crosses the viewport
  // ----------------------------------------------------------
  var statement = document.querySelector('.hm-statement p');
  if (statement) {
    // wrap each word, preserving <em> runs
    var wrapWords = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === Node.TEXT_NODE) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (piece) {
            if (/^\s+$/.test(piece) || piece === '') {
              frag.appendChild(document.createTextNode(piece));
            } else {
              var w = document.createElement('span');
              w.className = 'hm-word';
              w.textContent = piece;
              frag.appendChild(w);
            }
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          wrapWords(child);
        }
      });
    };
    wrapWords(statement);

    var words = statement.querySelectorAll('.hm-word');

    if (reduceMotion) {
      words.forEach(function (w) { w.classList.add('on'); });
    } else {
      var ticking = false;
      var updateWords = function () {
        ticking = false;
        var rect = statement.getBoundingClientRect();
        var vh = window.innerHeight;
        // 0 when the block enters the lower third, 1 when its bottom
        // clears the upper third
        var progress = (vh * 0.85 - rect.top) / (rect.height + vh * 0.45);
        progress = Math.max(0, Math.min(1, progress));
        var lit = Math.round(progress * words.length);
        words.forEach(function (w, i) {
          w.classList.toggle('on', i < lit);
        });
      };
      window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(updateWords); }
      }, { passive: true });
      updateWords();
    }
  }
})();
