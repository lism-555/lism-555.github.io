/* ============================================================
   machine.js —— 无用机器 + 多巴胺快抓
   ------------------------------------------------------------
   上半部分：一台只会把自己关掉的开关。
   下半部分：三十秒点击小游戏。
   两者互不依赖，任何一块元素缺失都不会拖垮另一块。
   ============================================================ */

(function () {
  'use strict';

  /* ---------- 本地存储（无痕模式或 file:// 下也不会报错） ---------- */
  function read(key, fallback) {
    try {
      var value = window.localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (err) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(key, String(value));
    } catch (err) {
      /* 存不了就算了，功能照常 */
    }
  }

  /* ==========================================================
     一、无用机器
     ========================================================== */
  (function uselessMachine() {
    var powerSwitch = document.getElementById('powerSwitch');
    var finger = document.getElementById('finger');
    var led = document.getElementById('led');
    var ledText = document.getElementById('ledText');
    var switchText = document.getElementById('switchText');
    var status = document.getElementById('machineStatus');
    var offCountEl = document.getElementById('offCount');

    if (!powerSwitch || !finger || !status) return;

    var busy = false;
    var offCount = parseInt(read('dopamine.offCount', '0'), 10);
    if (isNaN(offCount)) offCount = 0;
    if (offCountEl) offCountEl.textContent = offCount;

    function setOn(on) {
      powerSwitch.classList.toggle('is-on', on);
      powerSwitch.setAttribute('aria-checked', on ? 'true' : 'false');
      if (led) led.classList.toggle('is-on', on);
      if (ledText) ledText.textContent = on ? '电源 ON' : '电源 OFF';
      if (switchText) switchText.textContent = on ? 'ON' : 'OFF';
    }

    function say(text) {
      status.textContent = text;
    }

    function startCycle() {
      busy = true;
      setOn(true);
      say('咔哒。灯亮了，它开始思考。');

      /* 伸出手指 */
      window.setTimeout(function () {
        finger.classList.add('is-out');
        say('……它从洞里伸出了一根手指。');
      }, 760);

      /* 把开关按回去 */
      window.setTimeout(function () {
        finger.classList.remove('is-out');
        finger.classList.add('is-tap');
        setOn(false);

        offCount += 1;
        if (offCountEl) offCountEl.textContent = offCount;
        write('dopamine.offCount', offCount);

        say('啪。开关被按回去了。');
      }, 1520);

      /* 收手，交代遗言 */
      window.setTimeout(function () {
        finger.classList.remove('is-tap');
        say('它只会做这一件事，而且做得很好。');
      }, 2260);

      window.setTimeout(function () {
        busy = false;
      }, 3050);
    }

    powerSwitch.addEventListener('click', function () {
      if (busy) return;

      if (powerSwitch.classList.contains('is-on')) {
        /* 罕见的兜底：状态不同步时，手动关掉 */
        setOn(false);
        say('你自己把它关掉了。机器有点失落。');
        return;
      }

      startCycle();
    });
  })();

  /* ==========================================================
     二、多巴胺快抓
     ========================================================== */
  (function dopaCatch() {
    var field = document.getElementById('gameField');
    var target = document.getElementById('target');
    var overlay = document.getElementById('gameOverlay');
    var overlayTitle = document.getElementById('overlayTitle');
    var overlayText = document.getElementById('overlayText');
    var startBtn = document.getElementById('startGame');
    var scoreEl = document.getElementById('score');
    var timeEl = document.getElementById('time');
    var bestEl = document.getElementById('best');

    if (!field || !target || !overlay || !startBtn) return;

    var DURATION = 30;
    var COLORS = ['#FFD23F', '#FF9AC1', '#7FE9D8', '#C0A8FF', '#FFB27F'];
    var GLYPHS = ['★', '✿', '♥', '☀', '✦'];

    var running = false;
    var score = 0;
    var endAt = 0;
    var tickId = null;
    var hopId = null;

    var best = parseInt(read('dopamine.best', '0'), 10);
    if (isNaN(best)) best = 0;
    if (bestEl) bestEl.textContent = best;

    function randomFrom(list) {
      return list[Math.floor(Math.random() * list.length)];
    }

    /* 把目标扔到场地里的随机位置 */
    function moveTarget() {
      var pad = 12;
      var w = field.clientWidth - target.offsetWidth - pad * 2;
      var h = field.clientHeight - target.offsetHeight - pad * 2;

      if (w < 0) w = 0;
      if (h < 0) h = 0;

      target.style.left = (pad + Math.random() * w) + 'px';
      target.style.top = (pad + Math.random() * h) + 'px';
      target.style.background = randomFrom(COLORS);
      target.textContent = randomFrom(GLYPHS);
    }

    /* 点中时冒出来的 +1 */
    function floatScore() {
      var mark = document.createElement('span');
      mark.className = 'float-score';
      mark.textContent = '+1';
      mark.style.left = target.offsetLeft + 20 + 'px';
      mark.style.top = target.offsetTop + 'px';
      field.appendChild(mark);
      window.setTimeout(function () {
        if (mark.parentNode) mark.parentNode.removeChild(mark);
      }, 720);
    }

    function tick() {
      var left = (endAt - Date.now()) / 1000;
      if (left < 0) left = 0;

      if (timeEl) timeEl.textContent = Math.ceil(left) + 's';

      if (left <= 0) endGame();
    }

    function startGame() {
      running = true;
      score = 0;
      if (scoreEl) scoreEl.textContent = '0';
      if (timeEl) timeEl.textContent = DURATION + 's';

      overlay.classList.add('is-hidden');
      target.hidden = false;
      target.style.left = '0px';
      target.style.top = '0px';

      if (target.offsetWidth === 0) {
        /* 首帧尺寸还没算出来时，等一格再放 */
        window.requestAnimationFrame(moveTarget);
      } else {
        moveTarget();
      }

      endAt = Date.now() + DURATION * 1000;
      window.clearInterval(tickId);
      window.clearInterval(hopId);
      tickId = window.setInterval(tick, 100);
      hopId = window.setInterval(function () {
        if (running) moveTarget();
      }, 1100);
    }

    function endGame() {
      running = false;
      window.clearInterval(tickId);
      window.clearInterval(hopId);

      target.hidden = true;

      var isBest = score > best;
      if (isBest) {
        best = score;
        write('dopamine.best', best);
        if (bestEl) bestEl.textContent = best;
      }

      if (overlayTitle) {
        overlayTitle.textContent = isBest ? '新纪录：' + score + ' 分' : '时间到，' + score + ' 分';
      }

      if (overlayText) {
        if (score === 0) {
          overlayText.textContent = '一个都没抓到。没关系，形状出现的位置是随机的，人生也是。';
        } else if (score < 10) {
          overlayText.textContent = '抓到了 ' + score + ' 个。再来一次，你大概已经摸清它的节奏了。';
        } else if (score < 20) {
          overlayText.textContent = '抓到了 ' + score + ' 个，手速不错。最高分是 ' + best + '。';
        } else {
          overlayText.textContent = '抓到了 ' + score + ' 个 —— 你的眼睛已经比鼠标快了。最高分 ' + best + '。';
        }
      }

      startBtn.textContent = '再来一次';
      overlay.classList.remove('is-hidden');
    }

    target.addEventListener('click', function () {
      if (!running) return;
      score += 1;
      if (scoreEl) scoreEl.textContent = score;
      floatScore();
      moveTarget();
    });

    startBtn.addEventListener('click', function () {
      if (running) return;
      startGame();
    });

    /* 空格开始，但焦点在按钮/链接上时交给它们自己处理 */
    document.addEventListener('keydown', function (event) {
      if (event.code !== 'Space' && event.key !== ' ') return;

      var tag = (event.target && event.target.tagName || '').toLowerCase();
      if (tag === 'button' || tag === 'a' || tag === 'input' || tag === 'textarea') return;

      event.preventDefault();
      if (!running) startGame();
    });

    /* 窗口变化后别把目标留在场外 */
    window.addEventListener('resize', function () {
      if (running) moveTarget();
    });
  })();
})();
