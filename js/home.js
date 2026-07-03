// ============================================================
// Homepage — scroll progress bar
// ============================================================
(function () {
  'use strict';

  // ----------------------------------------------------------
  // Scroll progress bar
  // ----------------------------------------------------------
  var progressBar = document.querySelector('.hm-progress span');
  if (!progressBar) return;

  var ticking = false;
  var updateProgress = function () {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    var vh = window.innerHeight;
    var max = document.documentElement.scrollHeight - vh;
    progressBar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
  };

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  updateProgress();
})();
