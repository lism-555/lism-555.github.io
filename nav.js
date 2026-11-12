/* ============================================================
   nav.js —— 导航与页脚
   ------------------------------------------------------------
   1) fetch('nav.html') 注入到每一页的 #site-nav
   2) 按文件名高亮当前页
   3) 注入页脚（同样只写一次）
   4) 直接双击打开（file:// 会拦 fetch）时，使用下面这份
      与 nav.html 内容一致的备用标记
   ============================================================ */

(function () {
  'use strict';

  var FALLBACK_NAV = [
    '<header class="site-head">',
    '  <div class="shell site-head-inner">',
    '    <a class="wordmark" href="index.html">',
    '      <span class="wordmark-mark">The Slow Press</span>',
    '      <span class="wordmark-sub">慢印 · 第 01 期</span>',
    '    </a>',
    '    <nav aria-label="主导航">',
    '      <ul class="nav-list">',
    '        <li><a href="index.html" data-nav="index.html">目录</a></li>',
    '        <li><a href="quotes.html" data-nav="quotes.html">引语</a></li>',
    '        <li><a href="project.html" data-nav="project.html">提案</a></li>',
    '        <li><a href="machine.html" data-nav="machine.html">装置</a></li>',
    '      </ul>',
    '    </nav>',
    '  </div>',
    '</header>',
    '<div class="masthead">',
    '  <div class="shell masthead-inner">',
    '    <span>Issue 01 <span class="dot">/</span> Winter</span>',
    '    <span>Paper, Pixels <span class="dot">&amp;</span> Handwork</span>',
    '    <span>18 Quotes <span class="dot">·</span> 7 Proposals <span class="dot">·</span> 1 Machine</span>',
    '  </div>',
    '</div>'
  ].join('\n');

  var mount = document.getElementById('site-nav');
  var footMount = document.getElementById('site-foot');

  function highlight() {
    var file = window.location.pathname.split('/').pop() || 'index.html';
    if (!file) file = 'index.html';
    var links = document.querySelectorAll('.nav-list a[data-nav]');
    Array.prototype.forEach.call(links, function (a) {
      if (a.getAttribute('data-nav') === file) {
        a.setAttribute('aria-current', 'page');
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }

  function renderFooter() {
    if (!footMount) return;
    var year = new Date().getFullYear();
    footMount.innerHTML = [
      '<footer class="colophon">',
      '  <div class="shell">',
      '    <div class="colophon-top">',
      '      <div>',
      '        <h2>The Slow Press</h2>',
      '        <p>一份关于网页、纸张与手上功夫的小刊物。四个页面，一套样式表，没有构建步骤 —— 打开文件就是成品。</p>',
      '      </div>',
      '      <ul class="colophon-links">',
      '        <li><a href="index.html">目录</a></li>',
      '        <li><a href="quotes.html">引语</a></li>',
      '        <li><a href="project.html">提案</a></li>',
      '        <li><a href="machine.html">装置</a></li>',
      '        <li><a href="index.html#editorial">编者按</a></li>',
      '        <li><a href="index.html#colophon">版权页</a></li>',
      '      </ul>',
      '    </div>',
      '    <div class="colophon-bottom">',
      '      <span>&copy; ' + year + ' The Slow Press</span>',
      '      <span>Instrument Serif &amp; Noto Serif &nbsp;·&nbsp; 手工排版，无框架</span>',
      '    </div>',
      '  </div>',
      '</footer>'
    ].join('\n');
  }

  function paint(html) {
    if (mount) mount.innerHTML = html;
    highlight();
    renderFooter();
  }

  if (!mount) {
    renderFooter();
    return;
  }

  if (typeof fetch === 'function') {
    fetch('nav.html', { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('nav.html ' + res.status);
        return res.text();
      })
      .then(paint)
      .catch(function () { paint(FALLBACK_NAV); });
  } else {
    paint(FALLBACK_NAV);
  }
})();
