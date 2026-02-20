(function () {
  'use strict';

  // ── Overlay ──
  var overlay = document.createElement('div');
  overlay.id = 'breakout-overlay';
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:1000;background:#080810;display:none;' +
    'flex-direction:column;align-items:center;justify-content:center;';

  var closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.cssText =
    'position:absolute;top:0.75rem;right:1.25rem;background:none;border:none;' +
    'color:#445;font-size:1.8rem;cursor:pointer;z-index:10;line-height:1;' +
    'transition:color 0.2s;';
  closeBtn.setAttribute('aria-label', 'Close game');
  closeBtn.onmouseenter = function () { closeBtn.style.color = '#aab'; };
  closeBtn.onmouseleave = function () { closeBtn.style.color = '#445'; };

  var wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:relative;line-height:0;';

  var canvas = document.createElement('canvas');
  canvas.id = 'breakout-canvas';
  canvas.style.cssText =
    'image-rendering:pixelated;image-rendering:crisp-edges;' +
    'border:2px solid #1a1a2e;border-radius:2px;';

  var scanlines = document.createElement('div');
  scanlines.style.cssText =
    'position:absolute;inset:0;pointer-events:none;' +
    'background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.06) 2px,rgba(0,0,0,0.06) 4px);' +
    'border-radius:2px;';

  wrapper.appendChild(canvas);
  wrapper.appendChild(scanlines);

  var info = document.createElement('div');
  info.style.cssText =
    'color:#334;font-family:monospace;font-size:0.7rem;' +
    'margin-top:0.6rem;text-align:center;letter-spacing:0.08em;';
  info.textContent = 'ARROWS / MOUSE \u2022 ESC TO QUIT';

  overlay.appendChild(closeBtn);
  overlay.appendChild(wrapper);
  overlay.appendChild(info);
  document.body.appendChild(overlay);

  // ── Internal resolution ──
  var GW = 224;
  var GH = 280;

  // ── Constants ──
  var ROWS = 5;
  var COLS = 8;
  var BRICK_PAD = 2;
  var BRICK_TOP = 36;
  var PADDLE_W = 36;
  var PADDLE_H = 6;
  var BALL_SIZE = 4;
  var BALL_SPEED = 1.8;
  var LIVES_START = 3;

  var BRICK_THEMES = [
    { fill: '#e74c3c', hi: '#f1948a', lo: '#b03a2e' },
    { fill: '#2e86de', hi: '#74b9ff', lo: '#1b4f8a' },
    { fill: '#e67e22', hi: '#f0b27a', lo: '#a85c15' },
    { fill: '#e84393', hi: '#fd79a8', lo: '#a8326b' },
    { fill: '#27ae60', hi: '#6fcf97', lo: '#1a7a42' },
  ];

  // ── State ──
  var ctx, scale = 1;
  var paddleX, paddleTargetX;
  var ballX, ballY, ballDX, ballDY;
  var bricks, score, lives, state;
  var particles = [];
  var animId = null;
  var keysDown = {};
  var lastTime = 0;
  var accumulator = 0;

  function sizeCanvas() {
    var maxW = window.innerWidth - 40;
    var maxH = window.innerHeight - 90;
    scale = Math.max(1, Math.floor(Math.min(maxW / GW, maxH / GH)));
    canvas.width = GW;
    canvas.height = GH;
    canvas.style.width = (GW * scale) + 'px';
    canvas.style.height = (GH * scale) + 'px';
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
  }

  function brickW() {
    return Math.floor((GW - 8 - BRICK_PAD * (COLS - 1)) / COLS);
  }

  function resetBricks() {
    bricks = [];
    var bw = brickW();
    var bh = 10;
    var totalW = COLS * bw + (COLS - 1) * BRICK_PAD;
    var ox = Math.floor((GW - totalW) / 2);
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        bricks.push({
          x: ox + c * (bw + BRICK_PAD),
          y: BRICK_TOP + r * (bh + BRICK_PAD),
          w: bw, h: bh,
          theme: BRICK_THEMES[r],
          alive: true,
        });
      }
    }
  }

  function resetBall() {
    ballX = GW / 2 - BALL_SIZE / 2;
    ballY = GH - 50;
    var angle = -0.4 - Math.random() * 0.8;
    ballDX = BALL_SPEED * Math.sin(angle);
    ballDY = -BALL_SPEED * Math.cos(angle);
  }

  function initGame() {
    sizeCanvas();
    paddleX = (GW - PADDLE_W) / 2;
    paddleTargetX = paddleX;
    score = 0;
    lives = LIVES_START;
    state = 'start';
    particles = [];
    resetBricks();
    resetBall();
    lastTime = 0;
    accumulator = 0;
  }

  // ── Particles ──
  function spawnParticles(x, y, color) {
    for (var i = 0; i < 6; i++) {
      particles.push({
        x: x, y: y,
        dx: (Math.random() - 0.5) * 2,
        dy: (Math.random() - 0.5) * 2,
        life: 20 + Math.random() * 15,
        color: color,
      });
    }
  }

  function updateParticles() {
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.dx; p.y += p.dy; p.dy += 0.05; p.life--;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function drawParticles() {
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      ctx.globalAlpha = Math.min(1, p.life / 10);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
    }
    ctx.globalAlpha = 1;
  }

  // ── Drawing ──
  function drawBricks() {
    for (var i = 0; i < bricks.length; i++) {
      var b = bricks[i];
      if (!b.alive) continue;
      var t = b.theme;
      ctx.fillStyle = t.fill;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = t.hi;
      ctx.fillRect(b.x, b.y, b.w, 2);
      ctx.fillRect(b.x, b.y, 1, b.h);
      ctx.fillStyle = t.lo;
      ctx.fillRect(b.x, b.y + b.h - 2, b.w, 2);
      ctx.fillRect(b.x + b.w - 1, b.y, 1, b.h);
    }
  }

  function drawPaddle() {
    var px = Math.round(paddleX);
    var py = GH - 24;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(px + 1, py + 1, PADDLE_W, PADDLE_H);
    ctx.fillStyle = '#d0d0e0';
    ctx.fillRect(px, py, PADDLE_W, PADDLE_H);
    ctx.fillStyle = '#f0f0ff';
    ctx.fillRect(px, py, PADDLE_W, 2);
    ctx.fillStyle = '#8888a0';
    ctx.fillRect(px, py + PADDLE_H - 1, PADDLE_W, 1);
  }

  function drawBall() {
    var bx = Math.round(ballX);
    var by = Math.round(ballY);
    ctx.fillStyle = 'rgba(200,200,255,0.15)';
    ctx.fillRect(bx - 1, by - 1, BALL_SIZE + 2, BALL_SIZE + 2);
    ctx.fillStyle = '#fff';
    ctx.fillRect(bx, by, BALL_SIZE, BALL_SIZE);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillRect(bx, by, 1, 1);
  }

  function drawWalls() {
    ctx.fillStyle = '#14142a';
    ctx.fillRect(0, 0, 3, GH);
    ctx.fillRect(GW - 3, 0, 3, GH);
    ctx.fillRect(0, 16, GW, 3);
    ctx.fillStyle = '#1e1e3a';
    ctx.fillRect(3, 0, 1, GH);
    ctx.fillRect(GW - 4, 0, 1, GH);
    ctx.fillRect(0, 19, GW, 1);
  }

  function drawHUD() {
    ctx.fillStyle = '#5b9bf5';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('SCORE', 6, 9);
    ctx.fillStyle = '#8ab4f8';
    ctx.fillText(String(score).padStart(5, '0'), 38, 9);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#5b9bf5';
    ctx.fillText('LIVES', GW - 30, 9);
    for (var i = 0; i < lives; i++) {
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(GW - 24 + i * 8, 4, 6, 4);
      ctx.fillStyle = '#f1948a';
      ctx.fillRect(GW - 24 + i * 8, 4, 6, 1);
    }
  }

  function drawCenterText(line1, color1, line2, color2) {
    ctx.fillStyle = 'rgba(8,8,16,0.9)';
    ctx.fillRect(GW / 2 - 60, GH / 2 - 20, 120, line2 ? 34 : 20);
    ctx.strokeStyle = '#1e1e3a';
    ctx.lineWidth = 1;
    ctx.strokeRect(GW / 2 - 60, GH / 2 - 20, 120, line2 ? 34 : 20);
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = color1;
    ctx.fillText(line1, GW / 2, GH / 2 - 6);
    if (line2) {
      ctx.fillStyle = color2;
      ctx.fillText(line2, GW / 2, GH / 2 + 6);
    }
  }

  function draw() {
    ctx.fillStyle = '#0c0c1a';
    ctx.fillRect(0, 0, GW, GH);
    ctx.fillStyle = '#0e0e20';
    ctx.fillRect(4, 20, GW - 8, GH - 20);
    drawWalls();
    drawBricks();
    drawParticles();
    drawPaddle();
    drawBall();
    drawHUD();

    if (state === 'start') drawCenterText('CLICK TO START', '#5b9bf5');
    else if (state === 'over') drawCenterText('GAME OVER', '#e74c3c', 'CLICK TO RETRY', '#556');
    else if (state === 'win') drawCenterText('YOU WIN!', '#27ae60', 'CLICK TO REPLAY', '#556');
  }

  // ── Physics ──
  function update() {
    if (state !== 'playing') return;

    var pSpeed = 2.8;
    if (keysDown['ArrowLeft']) paddleTargetX -= pSpeed;
    if (keysDown['ArrowRight']) paddleTargetX += pSpeed;
    paddleX += (paddleTargetX - paddleX) * 0.25;
    if (paddleX < 4) { paddleX = 4; paddleTargetX = 4; }
    if (paddleX + PADDLE_W > GW - 4) { paddleX = GW - PADDLE_W - 4; paddleTargetX = paddleX; }

    var steps = 3;
    for (var s = 0; s < steps; s++) {
      ballX += ballDX / steps;
      ballY += ballDY / steps;

      if (ballX < 4) { ballX = 4; ballDX = Math.abs(ballDX); }
      if (ballX + BALL_SIZE > GW - 4) { ballX = GW - 4 - BALL_SIZE; ballDX = -Math.abs(ballDX); }
      if (ballY < 20) { ballY = 20; ballDY = Math.abs(ballDY); }

      var pY = GH - 24;
      var pX = Math.round(paddleX);
      if (
        ballDY > 0 &&
        ballY + BALL_SIZE >= pY && ballY + BALL_SIZE <= pY + PADDLE_H + 3 &&
        ballX + BALL_SIZE > pX - 1 && ballX < pX + PADDLE_W + 1
      ) {
        ballY = pY - BALL_SIZE;
        var hit = (ballX + BALL_SIZE / 2 - pX) / PADDLE_W;
        var angle = (hit - 0.5) * 1.3;
        ballDX = BALL_SPEED * Math.sin(angle);
        ballDY = -BALL_SPEED * Math.cos(angle);
      }

      if (ballY > GH + 8) {
        lives--;
        if (lives <= 0) { state = 'over'; } else { resetBall(); }
        return;
      }

      for (var i = 0; i < bricks.length; i++) {
        var b = bricks[i];
        if (!b.alive) continue;
        if (
          ballX + BALL_SIZE > b.x && ballX < b.x + b.w &&
          ballY + BALL_SIZE > b.y && ballY < b.y + b.h
        ) {
          b.alive = false;
          score += 10;
          spawnParticles(b.x + b.w / 2, b.y + b.h / 2, b.theme.fill);
          var cx = ballX + BALL_SIZE / 2, cy = ballY + BALL_SIZE / 2;
          if (Math.min(cy - b.y, b.y + b.h - cy) < Math.min(cx - b.x, b.x + b.w - cx)) {
            ballDY = -ballDY;
          } else {
            ballDX = -ballDX;
          }
          break;
        }
      }
    }

    updateParticles();

    var alive = false;
    for (var j = 0; j < bricks.length; j++) {
      if (bricks[j].alive) { alive = true; break; }
    }
    if (!alive) state = 'win';
  }

  // ── Game loop (fixed timestep) ──
  function loop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    var elapsed = Math.min(timestamp - lastTime, 50);
    lastTime = timestamp;
    accumulator += elapsed;
    while (accumulator >= 16.67) {
      update();
      accumulator -= 16.67;
    }
    draw();
    animId = requestAnimationFrame(loop);
  }

  function startLoop() {
    if (animId) return;
    lastTime = 0; accumulator = 0;
    animId = requestAnimationFrame(loop);
  }

  function stopLoop() {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
  }

  // ── Input ──
  function screenToGame(clientX) {
    var rect = canvas.getBoundingClientRect();
    return (clientX - rect.left) / scale;
  }

  canvas.addEventListener('mousemove', function (e) {
    paddleTargetX = screenToGame(e.clientX) - PADDLE_W / 2;
  });
  canvas.addEventListener('touchmove', function (e) {
    e.preventDefault();
    paddleTargetX = screenToGame(e.touches[0].clientX) - PADDLE_W / 2;
  }, { passive: false });
  canvas.addEventListener('touchstart', function (e) {
    e.preventDefault();
    if (state !== 'playing') {
      if (state === 'start') state = 'playing';
      else { initGame(); state = 'playing'; }
    }
  }, { passive: false });
  canvas.addEventListener('click', function () {
    if (state !== 'playing') {
      if (state === 'start') state = 'playing';
      else { initGame(); state = 'playing'; }
    }
  });

  document.addEventListener('keydown', function (e) {
    if (overlay.style.display === 'none') return;
    keysDown[e.key] = true;
    if (e.key === 'Escape') { closeGame(); return; }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') e.preventDefault();
    if (e.key === ' ' && state !== 'playing') {
      e.preventDefault();
      if (state === 'start') state = 'playing';
      else { initGame(); state = 'playing'; }
    }
  });
  document.addEventListener('keyup', function (e) { delete keysDown[e.key]; });

  // ── Open / Close ──
  function openGame() {
    overlay.style.display = 'flex';
    document.body.classList.add('nav-open');
    keysDown = {};
    initGame();
    startLoop();
  }

  function closeGame() {
    stopLoop();
    overlay.style.display = 'none';
    document.body.classList.remove('nav-open');
    keysDown = {};
  }

  closeBtn.addEventListener('click', closeGame);
  window.addEventListener('resize', function () {
    if (overlay.style.display !== 'none') sizeCanvas();
  });

  window.launchBreakout = openGame;
})();
