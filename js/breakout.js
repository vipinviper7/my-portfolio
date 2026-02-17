(function () {
  'use strict';

  // ── Overlay DOM ──
  var overlay = document.createElement('div');
  overlay.id = 'breakout-overlay';
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:1000;background:#0b1121;display:none;' +
    'flex-direction:column;align-items:center;justify-content:center;';

  var closeBtn = document.createElement('button');
  closeBtn.textContent = '\u00d7';
  closeBtn.style.cssText =
    'position:absolute;top:1rem;right:1.5rem;background:none;border:none;' +
    'color:#6b7b99;font-size:2rem;cursor:pointer;z-index:10;line-height:1;';
  closeBtn.setAttribute('aria-label', 'Close game');

  var canvas = document.createElement('canvas');
  canvas.id = 'breakout-canvas';

  var info = document.createElement('div');
  info.style.cssText =
    'color:#6b7b99;font-family:"Space Grotesk",sans-serif;font-size:0.8rem;' +
    'margin-top:0.75rem;text-align:center;';
  info.textContent = 'Arrow keys / mouse / touch to move \u2022 ESC to close';

  overlay.appendChild(closeBtn);
  overlay.appendChild(canvas);
  overlay.appendChild(info);
  document.body.appendChild(overlay);

  // ── Game constants ──
  var ROWS = 5;
  var COLS = 8;
  var BRICK_PAD = 4;
  var PADDLE_H = 14;
  var BALL_R = 6;
  var LIVES_START = 3;
  var BRICK_COLORS = ['#c0392b', '#2980b9', '#e67e22', '#e84393', '#a3cb38'];

  // ── Game state ──
  var ctx, W, H, dpr;
  var paddleW, paddleX, ballX, ballY, ballDX, ballDY;
  var bricks, score, lives, state; // state: 'start' | 'playing' | 'over' | 'win'
  var animId = null;
  var mouseX = null;

  function sizeCanvas() {
    dpr = window.devicePixelRatio || 1;
    var maxW = Math.min(window.innerWidth - 32, 520);
    var maxH = Math.min(window.innerHeight - 100, 640);
    // maintain ~13:16 aspect
    if (maxW / maxH > 13 / 16) maxW = Math.round(maxH * 13 / 16);
    else maxH = Math.round(maxW * 16 / 13);
    W = maxW;
    H = maxH;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function brickW() {
    return (W - BRICK_PAD * (COLS + 1)) / COLS;
  }

  function brickH() {
    return Math.round(H * 0.04);
  }

  function resetBricks() {
    bricks = [];
    var bw = brickW();
    var bh = brickH();
    var topOff = Math.round(H * 0.12);
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        bricks.push({
          x: BRICK_PAD + c * (bw + BRICK_PAD),
          y: topOff + r * (bh + BRICK_PAD),
          w: bw,
          h: bh,
          color: BRICK_COLORS[r],
          alive: true,
        });
      }
    }
  }

  function resetBall() {
    ballX = W / 2;
    ballY = H - 60;
    var speed = H * 0.005;
    var angle = -Math.PI / 4 - Math.random() * Math.PI / 2;
    ballDX = speed * Math.cos(angle);
    ballDY = speed * Math.sin(angle);
    if (ballDY > 0) ballDY = -ballDY;
  }

  function initGame() {
    sizeCanvas();
    paddleW = Math.round(W * 0.18);
    paddleX = (W - paddleW) / 2;
    score = 0;
    lives = LIVES_START;
    state = 'start';
    resetBricks();
    resetBall();
    mouseX = null;
  }

  // ── Drawing ──
  function drawBricks() {
    for (var i = 0; i < bricks.length; i++) {
      var b = bricks[i];
      if (!b.alive) continue;
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.w, b.h);
    }
  }

  function drawPaddle() {
    ctx.fillStyle = '#ecf0f1';
    var radius = PADDLE_H / 2;
    ctx.beginPath();
    ctx.moveTo(paddleX + radius, H - 30);
    ctx.lineTo(paddleX + paddleW - radius, H - 30);
    ctx.arcTo(paddleX + paddleW, H - 30, paddleX + paddleW, H - 30 + radius, radius);
    ctx.lineTo(paddleX + paddleW, H - 30 + PADDLE_H - radius);
    ctx.arcTo(paddleX + paddleW, H - 30 + PADDLE_H, paddleX + paddleW - radius, H - 30 + PADDLE_H, radius);
    ctx.lineTo(paddleX + radius, H - 30 + PADDLE_H);
    ctx.arcTo(paddleX, H - 30 + PADDLE_H, paddleX, H - 30 + PADDLE_H - radius, radius);
    ctx.lineTo(paddleX, H - 30 + radius);
    ctx.arcTo(paddleX, H - 30, paddleX + radius, H - 30, radius);
    ctx.fill();
  }

  function drawBall() {
    ctx.fillStyle = '#ecf0f1';
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_R, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawHUD() {
    ctx.fillStyle = '#5b9bf5';
    ctx.font = '600 14px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + score, 10, 24);
    ctx.textAlign = 'right';
    ctx.fillText('Lives: ' + lives, W - 10, 24);
  }

  function drawMessage(text) {
    ctx.fillStyle = '#c9d1d9';
    ctx.font = '600 20px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, W / 2, H / 2);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawBricks();
    drawPaddle();
    drawBall();
    drawHUD();

    if (state === 'start') drawMessage('Click to Start');
    else if (state === 'over') drawMessage('Game Over \u2014 Click to Restart');
    else if (state === 'win') drawMessage('You Win! \u2014 Click to Restart');
  }

  // ── Update ──
  function update() {
    if (state !== 'playing') return;

    ballX += ballDX;
    ballY += ballDY;

    // Wall collisions
    if (ballX - BALL_R < 0) { ballX = BALL_R; ballDX = Math.abs(ballDX); }
    if (ballX + BALL_R > W) { ballX = W - BALL_R; ballDX = -Math.abs(ballDX); }
    if (ballY - BALL_R < 0) { ballY = BALL_R; ballDY = Math.abs(ballDY); }

    // Paddle collision
    var pTop = H - 30;
    if (
      ballDY > 0 &&
      ballY + BALL_R >= pTop &&
      ballY + BALL_R <= pTop + PADDLE_H + 4 &&
      ballX >= paddleX &&
      ballX <= paddleX + paddleW
    ) {
      ballDY = -Math.abs(ballDY);
      // Angle based on where ball hits paddle
      var hit = (ballX - paddleX) / paddleW; // 0..1
      var angle = (hit - 0.5) * Math.PI * 0.7; // -63° to +63°
      var speed = Math.sqrt(ballDX * ballDX + ballDY * ballDY);
      ballDX = speed * Math.sin(angle);
      ballDY = -speed * Math.cos(angle);
    }

    // Ball out of bounds
    if (ballY - BALL_R > H) {
      lives--;
      if (lives <= 0) {
        state = 'over';
      } else {
        resetBall();
      }
      return;
    }

    // Brick collisions
    for (var i = 0; i < bricks.length; i++) {
      var b = bricks[i];
      if (!b.alive) continue;
      if (
        ballX + BALL_R > b.x &&
        ballX - BALL_R < b.x + b.w &&
        ballY + BALL_R > b.y &&
        ballY - BALL_R < b.y + b.h
      ) {
        b.alive = false;
        score += 10;

        // Determine which side was hit
        var overlapLeft = ballX + BALL_R - b.x;
        var overlapRight = b.x + b.w - (ballX - BALL_R);
        var overlapTop = ballY + BALL_R - b.y;
        var overlapBottom = b.y + b.h - (ballY - BALL_R);
        var minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

        if (minOverlap === overlapTop || minOverlap === overlapBottom) {
          ballDY = -ballDY;
        } else {
          ballDX = -ballDX;
        }
        break;
      }
    }

    // Win check
    var allDead = true;
    for (var j = 0; j < bricks.length; j++) {
      if (bricks[j].alive) { allDead = false; break; }
    }
    if (allDead) state = 'win';
  }

  // ── Game loop ──
  function loop() {
    update();
    draw();
    animId = requestAnimationFrame(loop);
  }

  function startLoop() {
    if (animId) return;
    loop();
  }

  function stopLoop() {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }

  // ── Input ──
  function movePaddle(x) {
    var rect = canvas.getBoundingClientRect();
    paddleX = x - rect.left - paddleW / 2;
    if (paddleX < 0) paddleX = 0;
    if (paddleX + paddleW > W) paddleX = W - paddleW;
  }

  canvas.addEventListener('mousemove', function (e) {
    movePaddle(e.clientX);
  });

  canvas.addEventListener('touchmove', function (e) {
    e.preventDefault();
    movePaddle(e.touches[0].clientX);
  }, { passive: false });

  canvas.addEventListener('click', function () {
    if (state === 'start') {
      state = 'playing';
    } else if (state === 'over' || state === 'win') {
      initGame();
      state = 'playing';
    }
  });

  document.addEventListener('keydown', function (e) {
    if (overlay.style.display === 'none') return;
    if (e.key === 'Escape') {
      closeGame();
      return;
    }
    if (e.key === 'ArrowLeft') {
      paddleX -= 30;
      if (paddleX < 0) paddleX = 0;
    }
    if (e.key === 'ArrowRight') {
      paddleX += 30;
      if (paddleX + paddleW > W) paddleX = W - paddleW;
    }
  });

  // ── Open / Close ──
  function openGame() {
    overlay.style.display = 'flex';
    document.body.classList.add('nav-open');
    initGame();
    startLoop();
  }

  function closeGame() {
    stopLoop();
    overlay.style.display = 'none';
    document.body.classList.remove('nav-open');
  }

  closeBtn.addEventListener('click', closeGame);

  // Handle resize while game is open
  window.addEventListener('resize', function () {
    if (overlay.style.display !== 'none') {
      sizeCanvas();
      draw();
    }
  });

  // ── Public API ──
  window.launchBreakout = openGame;
})();
