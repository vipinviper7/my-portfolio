// Password gate for protected case studies
(function () {
  var HASH = 'f9757f9e';
  var STORAGE_KEY = 'cs_access';

  function simpleHash(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return (hash >>> 0).toString(16);
  }

  // Check URL key parameter
  var params = new URLSearchParams(window.location.search);
  var urlKey = params.get('key');
  if (urlKey && simpleHash(urlKey) === HASH) {
    sessionStorage.setItem(STORAGE_KEY, '1');
  }

  // Already unlocked this session
  if (sessionStorage.getItem(STORAGE_KEY) === '1') {
    var gate = document.querySelector('.pw-gate');
    if (gate) gate.remove();
    return;
  }

  // Wire up the form
  var form = document.querySelector('.pw-form');
  var input = document.querySelector('.pw-input');
  var error = document.querySelector('.pw-error');

  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var val = input.value.trim();
    if (simpleHash(val) === HASH) {
      sessionStorage.setItem(STORAGE_KEY, '1');
      document.querySelector('.pw-gate').classList.add('unlocked');
      setTimeout(function () {
        document.querySelector('.pw-gate').remove();
      }, 400);
    } else {
      error.textContent = 'Incorrect password. Try again.';
      input.value = '';
      input.focus();
    }
  });
})();
