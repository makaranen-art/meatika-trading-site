/*!
 * Meatika Trading — animated candlestick background
 * Self-contained: injects its own <canvas> + styles, no markup changes needed.
 * Respects prefers-reduced-motion and pauses when the tab is hidden.
 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- inject styles -------------------------------------------------
  var style = document.createElement('style');
  style.textContent =
    '#bg-candles{position:fixed;inset:0;width:100vw;height:100vh;z-index:-1;' +
    'pointer-events:none;display:block;}';
  document.head.appendChild(style);

  // ---- inject canvas ---------------------------------------------------
  var canvas = document.createElement('canvas');
  canvas.id = 'bg-candles';
  canvas.setAttribute('aria-hidden', 'true');
  document.addEventListener('DOMContentLoaded', mount);
  if (document.readyState === 'interactive' || document.readyState === 'complete') mount();

  function mount() {
    if (document.getElementById('bg-candles')) return;
    document.body.insertBefore(canvas, document.body.firstChild);
    start();
  }

  function start() {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;

    var SPACING = 26;          // px between candle columns
    var SPEED = 0.28;          // px per frame drift, right -> left
    var columns = [];
    var floaters = [];
    var frame = 0;

    var palette = {
      dark: {
        up: 'rgba(120, 235, 255, ALPHA)',     // cyan
        down: 'rgba(196, 140, 255, ALPHA)',   // violet
        line: 'rgba(160, 200, 255, ALPHA)',
        dot: 'rgba(255, 214, 120, ALPHA)',    // gold accent dots
        bodyAlpha: 0.55,
        wickAlpha: 0.4,
        lineAlpha: 0.22,
        glow: 10
      },
      light: {
        up: 'rgba(20, 130, 150, ALPHA)',
        down: 'rgba(140, 80, 200, ALPHA)',
        line: 'rgba(60, 90, 150, ALPHA)',
        dot: 'rgba(180, 130, 20, ALPHA)',
        bodyAlpha: 0.16,
        wickAlpha: 0.12,
        lineAlpha: 0.10,
        glow: 0
      }
    };

    function theme() {
      return document.body.classList.contains('light') ? palette.light : palette.dark;
    }

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildColumns();
    }

    function rand(min, max) { return min + Math.random() * (max - min); }

    function newCandle(x) {
      var up = Math.random() > 0.46;
      var mid = H * rand(0.14, 0.62);
      var bodyH = rand(10, H * 0.11);
      var wickTop = rand(6, 26);
      var wickBot = rand(6, 26);
      return {
        x: x,
        up: up,
        top: mid - bodyH / 2,
        bottom: mid + bodyH / 2,
        wickTop: mid - bodyH / 2 - wickTop,
        wickBot: mid + bodyH / 2 + wickBot,
        w: rand(5, 9)
      };
    }

    function buildColumns() {
      columns = [];
      var count = Math.ceil(W / SPACING) + 3;
      for (var i = 0; i < count; i++) {
        columns.push(newCandle(i * SPACING));
      }
    }

    function spawnFloater() {
      if (!columns.length) return;
      var col = columns[Math.floor(rand(0, columns.length))];
      if (!col) return;
      floaters.push({
        x: col.x + rand(-4, 4),
        y: col.top - 8,
        text: (rand(8, 98)).toFixed(2),
        life: 0,
        maxLife: 140
      });
      if (floaters.length > 14) floaters.shift();
    }

    function step() {
      frame++;
      var t = theme();

      ctx.clearRect(0, 0, W, H);

      // drift columns leftward, recycle off-screen ones on the right
      for (var i = 0; i < columns.length; i++) {
        var c = columns[i];
        c.x -= SPEED;
      }
      if (columns.length && columns[0].x < -SPACING) {
        columns.shift();
        var lastX = columns.length ? columns[columns.length - 1].x : 0;
        columns.push(newCandle(lastX + SPACING));
      }

      // connecting trend line through candle bodies
      ctx.beginPath();
      ctx.lineWidth = 1.1;
      ctx.strokeStyle = t.line.replace('ALPHA', t.lineAlpha);
      if (t.glow) { ctx.shadowColor = t.line.replace('ALPHA', 0.6); ctx.shadowBlur = t.glow * 0.6; }
      columns.forEach(function (c, idx) {
        var y = (c.top + c.bottom) / 2;
        if (idx === 0) ctx.moveTo(c.x, y); else ctx.lineTo(c.x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;

      // candlesticks
      columns.forEach(function (c) {
        var color = c.up ? t.up : t.down;
        // wick
        ctx.strokeStyle = color.replace('ALPHA', t.wickAlpha);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(c.x, c.wickTop);
        ctx.lineTo(c.x, c.wickBot);
        ctx.stroke();
        // body
        ctx.fillStyle = color.replace('ALPHA', t.bodyAlpha);
        if (t.glow) { ctx.shadowColor = color.replace('ALPHA', 0.75); ctx.shadowBlur = t.glow; }
        ctx.fillRect(c.x - c.w / 2, c.top, c.w, Math.max(2, c.bottom - c.top));
        ctx.shadowBlur = 0;
      });

      // occasional glowing marker dots along the trend line
      if (frame % 70 === 0 && columns.length) {
        var mc = columns[Math.floor(rand(0, columns.length))];
        if (mc) {
          floaters.push({ dot: true, x: mc.x, y: (mc.top + mc.bottom) / 2, life: 0, maxLife: 90 });
        }
      }
      if (frame % 55 === 0) spawnFloater();

      // floating price readouts + dots
      floaters = floaters.filter(function (f) {
        f.life++;
        var p = f.life / f.maxLife;
        var alpha = p < 0.15 ? p / 0.15 : (1 - (p - 0.15) / 0.85);
        f.y -= f.dot ? 0.25 : 0.35;
        if (f.dot) {
          ctx.beginPath();
          ctx.fillStyle = t.dot.replace('ALPHA', Math.max(0, alpha * 0.8));
          if (t.glow) { ctx.shadowColor = t.dot.replace('ALPHA', 0.8); ctx.shadowBlur = t.glow; }
          ctx.arc(f.x, f.y, 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillStyle = t.line.replace('ALPHA', Math.max(0, alpha * 0.5));
          ctx.fillText(f.text, f.x, f.y);
        }
        return f.life < f.maxLife;
      });

      raf = window.requestAnimationFrame(step);
    }

    var raf = null;
    function playIfVisible() {
      if (raf) return;
      raf = window.requestAnimationFrame(step);
    }
    function pause() {
      if (raf) { window.cancelAnimationFrame(raf); raf = null; }
    }

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) pause(); else if (!reduceMotion) playIfVisible();
    });

    if (reduceMotion) {
      // draw a single static frame, no loop
      step();
      pause();
    } else {
      playIfVisible();
    }
  }
})();
