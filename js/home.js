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

  // ----------------------------------------------------------
  // Lottie microanimations — [data-lottie]
  // (reduced-motion: load but freeze on a representative frame)
  // ----------------------------------------------------------
  if (window.lottie) {
    document.querySelectorAll('[data-lottie]').forEach(function (el) {
      var anim = window.lottie.loadAnimation({
        container: el,
        renderer: 'svg',
        loop: !reduceMotion,
        autoplay: !reduceMotion,
        path: el.getAttribute('data-lottie')
      });
      if (reduceMotion) {
        anim.addEventListener('DOMLoaded', function () {
          anim.goToAndStop(Math.floor(anim.totalFrames * 0.3), true);
        });
      }
    });
  }

  // ----------------------------------------------------------
  // Hero scroll-parallax + scroll progress bar
  // ----------------------------------------------------------
  var heroInner = document.querySelector('.hm-hero .hm-wrap');
  var heroHint = document.querySelector('.hm-scrollhint');
  var progressBar = document.querySelector('.hm-progress span');
  var scrollTicking = false;

  var updateScroll = function () {
    scrollTicking = false;
    var y = window.scrollY || window.pageYOffset;
    var vh = window.innerHeight;

    if (progressBar) {
      var max = document.documentElement.scrollHeight - vh;
      progressBar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    }

    if (!reduceMotion && heroInner && y < vh) {
      var p = y / vh;
      heroInner.style.transform = 'translateY(' + (p * 12) + '%)';
      heroInner.style.opacity = String(Math.max(0, 1 - p * 1.15));
      if (heroHint) heroHint.style.opacity = String(Math.max(0, 1 - p * 3));
    }
  };

  window.addEventListener('scroll', function () {
    if (!scrollTicking) { scrollTicking = true; requestAnimationFrame(updateScroll); }
  }, { passive: true });
  updateScroll();

  // ----------------------------------------------------------
  // Footer name — letters pull toward the cursor when it's near
  // ----------------------------------------------------------
  var footerLetters = document.querySelectorAll('.hm-footer-letter');
  if (footerLetters.length && finePointer && !reduceMotion) {
    var RADIUS = 260;
    var MAX_OFFSET = 46;
    var letters = Array.prototype.map.call(footerLetters, function (el) {
      return { el: el, x: 0, y: 0, tx: 0, ty: 0 };
    });
    var mouseX = -9999, mouseY = -9999;
    var footerRafId = null;
    var footerActive = false;

    var tick = function () {
      var moving = false;
      letters.forEach(function (s) {
        var r = s.el.getBoundingClientRect();
        var cx = r.left + r.width / 2;
        var cy = r.top + r.height / 2;
        var dx = mouseX - cx;
        var dy = mouseY - cy;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < RADIUS) {
          var pull = 1 - dist / RADIUS;
          var tx = dx * pull * 0.5;
          var ty = dy * pull * 0.5;
          var mag = Math.sqrt(tx * tx + ty * ty);
          if (mag > MAX_OFFSET) {
            var k = MAX_OFFSET / mag;
            tx *= k; ty *= k;
          }
          s.tx = tx; s.ty = ty;
        } else {
          s.tx = 0; s.ty = 0;
        }

        s.x += (s.tx - s.x) * 0.15;
        s.y += (s.ty - s.y) * 0.15;
        s.el.style.transform = 'translate(' + s.x.toFixed(2) + 'px,' + s.y.toFixed(2) + 'px)';
        if (Math.abs(s.tx - s.x) > 0.1 || Math.abs(s.ty - s.y) > 0.1) moving = true;
      });
      footerRafId = moving ? requestAnimationFrame(tick) : null;
    };

    var kick = function () { if (!footerRafId) footerRafId = requestAnimationFrame(tick); };

    document.addEventListener('mousemove', function (e) {
      if (!footerActive) return;
      mouseX = e.clientX;
      mouseY = e.clientY;
      kick();
    }, { passive: true });

    var footerNameEl = document.querySelector('.hm-footer-name');
    new IntersectionObserver(function (entries) {
      footerActive = entries[0].isIntersecting;
      if (!footerActive) { mouseX = -9999; mouseY = -9999; kick(); }
    }, { rootMargin: '260px' }).observe(footerNameEl);
  }

  // ----------------------------------------------------------
  // Aurora pointer-drift — backdrop leans toward the cursor
  // ----------------------------------------------------------
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var aurora = document.querySelector('.hm-aurora');
  if (aurora && finePointer && !reduceMotion) {
    var px = 0, py = 0, ax = 0, ay = 0, raf = null;
    document.addEventListener('mousemove', function (e) {
      px = (e.clientX / window.innerWidth - 0.5) * -40;
      py = (e.clientY / window.innerHeight - 0.5) * -40;
      if (!raf) raf = requestAnimationFrame(function follow() {
        ax += (px - ax) * 0.06;
        ay += (py - ay) * 0.06;
        aurora.style.transform = 'translate(' + ax + 'px,' + ay + 'px)';
        if (Math.abs(px - ax) > 0.1 || Math.abs(py - ay) > 0.1) {
          raf = requestAnimationFrame(follow);
        } else { raf = null; }
      });
    }, { passive: true });
  }
})();
