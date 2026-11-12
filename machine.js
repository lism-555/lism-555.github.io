/* ============================================================
   machine.js —— 装置 + 三十秒计时器
   ------------------------------------------------------------
   上半：只会关掉自己的开关。
   下半：点标本的小游戏。
   两块互相独立，任何一块元素缺失都不影响另一块。
   ============================================================ */

(function () {
  'use strict';

  function read(key, fallback) {
    try {
      var v = window.localStorage.getItem(key);
      return v === null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(key, String(value));
    } catch (e) { /* 存不了就算了 */ }
  }

  /* ==========================================================
     一、装置
     ========================================================== */
  (function device() {
    var sw = document.getElementById('powerSwitch');
    var arm = document.getElementById('arm');
    var lamp = document.getElementById('lamp');
    var lampText = document.getElementById('lampText');
    var caption = document.getElementById('switchCaption');
    var status = document.getElementById('statusText');
    var offCountEl = document.getElementById('offCount');

    if (!sw || !arm || !status) return;

    var busy = false;
    var count = parseInt(read('slowpress.offCount', '0'), 10);
    if (isNaN(count)) count = 0;
    if (offCountEl) offCountEl.textContent = count;

    function setOn(on) {
      sw.classList.toggle('is-on', on);
      sw.setAttribute('aria-checked', on ? 'true' : 'false');
      if (lamp) lamp.classList.toggle('is-on', on);
      if (lampText) lampText.textContent = on ? 'Live' : 'Standby';
      if (caption) caption.textContent = on ? 'On' : 'Off';
    }

    function say(text) {
      status.textContent = text;
    }

    function run() {
      busy = true;
      setOn(true);
      say('咔哒。它通电了，正在想。');

      window.setTimeout(function () {
        arm.classList.add('is-out');
        say('它从孔里伸出了一根手指。');
      }, 780);

      window.setTimeout(function () {
        arm.classList.remove('is-out');
        arm.classList.add('is-press');
        setOn(false);
        count += 1;
        if (offCountEl) offCountEl.textContent = count;
        write('slowpress.offCount', count);
        say('啪。开关被拨回去了。');
      }, 1560);

      window.setTimeout(function () {
        arm.classList.remove('is-press');
        say('它只会做这一件事，而且做得很稳。');
      }, 2320);

      window.setTimeout(function () {
        busy = false;
      }, 3150);
    }

    sw.addEventListener('click', function () {
      if (busy) return;
      if (sw.classList.contains('is-on')) {
        setOn(false);
        say('你自己把它关了。它有点失落。');
        return;
      }
      run();
    });
  })();

  /* ==========================================================
     二、三十秒计时器
     ========================================================== */
  (function specimenRun() {
    var arena = document.getElementById('arena');
    var specimen = document.getElementById('specimen');
    var veil = document.getElementById('veil');
    var veilTitle = document.getElementById('veilTitle');
    var veilText = document.getElementById('veilText');
    var startBtn = document.getElementById('startBtn');
    var scoreEl = document.getElementById('score');
    var timeEl = document.getElementById('time');
    var bestEl = document.getElementById('best');

    if (!arena || !specimen || !veil || !startBtn) return;

    var DURATION = 30;
    var running = false;
    var score = 0;
    var endAt = 0;
    var tickId = null;
    var hopId = null;

    var best = parseInt(read('slowpress.best', '0'), 10);
    if (isNaN(best)) best = 0;
    if (bestEl) bestEl.textContent = best;

    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    function place() {
      var pad_ = 14;
      var w = arena.clientWidth - specimen.offsetWidth - pad_ * 2;
      var h = arena.clientHeight - specimen.offsetHeight - pad_ * 2;
      if (w < 0) w = 0;
      if (h < 0) h = 0;

      specimen.style.left = (pad_ + Math.random() * w) + 'px';
      specimen.style.top = (pad_ + Math.random() * h) + 'px';
      specimen.textContent = pad(Math.floor(Math.random() * 12) + 1);

      if (Math.random() > 0.55) {
        specimen.setAttribute('data-tone', 'clay');
      } else {
        specimen.removeAttribute('data-tone');
      }
    }

    function mark() {
      var t = document.createElement('span');
      t.className = 'tick';
      t.textContent = '+1';
      t.style.left = (specimen.offsetLeft + 24) + 'px';
      t.style.top = specimen.offsetTop + 'px';
      arena.appendChild(t);
      window.setTimeout(function () {
        if (t.parentNode) t.parentNode.removeChild(t);
      }, 820);
    }

    function tick() {
      var left = (endAt - Date.now()) / 1000;
      if (left < 0) left = 0;
      if (timeEl) timeEl.textContent = Math.ceil(left) + 's';
      if (left <= 0) stop();
    }

    function start() {
      running = true;
      score = 0;
      if (scoreEl) scoreEl.textContent = '0';
      if (timeEl) timeEl.textContent = DURATION + 's';

      veil.classList.add('is-hidden');
      specimen.hidden = false;

      if (specimen.offsetWidth === 0) {
        window.requestAnimationFrame(place);
      } else {
        place();
      }

      endAt = Date.now() + DURATION * 1000;
      window.clearInterval(tickId);
      window.clearInterval(hopId);
      tickId = window.setInterval(tick, 100);
      hopId = window.setInterval(function () {
        if (running) place();
      }, 1150);
    }

    function stop() {
      running = false;
      window.clearInterval(tickId);
      window.clearInterval(hopId);
      specimen.hidden = true;

      var isBest = score > best;
      if (isBest) {
        best = score;
        write('slowpress.best', best);
        if (bestEl) bestEl.textContent = best;
      }

      if (veilTitle) {
        veilTitle.textContent = isBest ? '新纪录 · ' + score + ' 分' : '时间到 · ' + score + ' 分';
      }

      if (veilText) {
        if (score === 0) {
          veilText.textContent = '一个也没抓到。标本的位置是随机的，人生也是。';
        } else if (score < 10) {
          veilText.textContent = '抓到 ' + score + ' 个。再来一次，你大概已经摸清它的节奏了。';
        } else if (score < 20) {
          veilText.textContent = '抓到 ' + score + ' 个，手速不错。最高分 ' + best + '。';
        } else {
          veilText.textContent = '抓到 ' + score + ' 个 —— 眼睛已经比手快了。最高分 ' + best + '。';
        }
      }

      startBtn.innerHTML = '再来一次 <span aria-hidden="true">→</span>';
      veil.classList.remove('is-hidden');
    }

    specimen.addEventListener('click', function () {
      if (!running) return;
      score += 1;
      if (scoreEl) scoreEl.textContent = score;
      mark();
      place();
    });

    startBtn.addEventListener('click', function () {
      if (running) return;
      start();
    });

    document.addEventListener('keydown', function (e) {
      if (e.code !== 'Space' && e.key !== ' ') return;
      var tag = (e.target && e.target.tagName || '').toLowerCase();
      if (tag === 'button' || tag === 'a' || tag === 'input' || tag === 'textarea') return;
      e.preventDefault();
      if (!running) start();
    });

    window.addEventListener('resize', function () {
      if (running) place();
    });
  })();
})();
