// Password gate for protected case studies
(function () {
  var HASH = 'f9757f9e';
  var STORAGE_KEY = 'cs_access';
  var NDA_KEY = 'cs_nda';

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
    localStorage.setItem(STORAGE_KEY, '1');
  }

  // Already unlocked this session (both password + NDA)
  if (localStorage.getItem(STORAGE_KEY) === '1' && localStorage.getItem(NDA_KEY) === '1') {
    var gate = document.querySelector('.pw-gate');
    if (gate) gate.remove();
    return;
  }

  // Wire up the form
  var form = document.querySelector('.pw-form');
  var input = document.querySelector('.pw-input');
  var error = document.querySelector('.pw-error');
  var submit = document.querySelector('.pw-submit');
  var ndaCheck = document.querySelector('.pw-nda-check');

  if (!form) return;

  // Start with submit disabled
  submit.disabled = true;
  submit.classList.add('pw-submit--disabled');

  // NDA checkbox toggles submit
  if (ndaCheck) {
    ndaCheck.addEventListener('change', function () {
      if (ndaCheck.checked) {
        submit.disabled = false;
        submit.classList.remove('pw-submit--disabled');
      } else {
        submit.disabled = true;
        submit.classList.add('pw-submit--disabled');
      }
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Belt-and-suspenders: verify NDA is checked
    if (ndaCheck && !ndaCheck.checked) {
      error.textContent = 'Please acknowledge the NDA first.';
      return;
    }

    var val = input.value.trim();
    if (simpleHash(val) === HASH) {
      localStorage.setItem(STORAGE_KEY, '1');
      localStorage.setItem(NDA_KEY, '1');
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
