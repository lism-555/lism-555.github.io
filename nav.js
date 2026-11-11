/* ============================================================
   nav.js —— 全站导航与页脚
   ------------------------------------------------------------
   1) 用 fetch() 把 nav.html 注入到每个页面的 #site-nav
   2) 自动高亮当前页面
   3) 注入页脚（同样只写一次）
   4) 兜底：如果直接双击 HTML（file:// 协议）导致 fetch 失败，
      就使用下面这份与 nav.html 完全一致的备用标记。
   ============================================================ */

(function () {
  'use strict';

  /* 与 nav.html 保持一致的兜底副本（file:// 下 fetch 会被浏览器拦截） */
  var FALLBACK_NAV = [
    '<nav class="site-nav" aria-label="主导航">',
    '  <a class="brand" href="index.html">',
    '    <span class="brand-dot" aria-hidden="true"></span>',
    '    <span>多巴胺档案馆<small>RETRO DOPAMINE CLUB</small></span>',
    '  </a>',
    '  <ul class="nav-links">',
    '    <li><a href="index.html" data-nav="index.html">首页</a></li>',
    '    <li><a href="quotes.html" data-nav="quotes.html">名言墙</a></li>',
    '    <li><a href="project.html" data-nav="project.html">项目</a></li>',
    '    <li><a href="machine.html" data-nav="machine.html">无用机器</a></li>',
    '  </ul>',
    '</nav>',
    '<div class="ticker" aria-hidden="true">',
    '  <div class="ticker-track">',
    '    <span>&nbsp;\u2605&nbsp; 保持高饱和 &nbsp;\u00b7&nbsp; STAY LOUD &nbsp;\u00b7&nbsp; 复古多巴胺 &nbsp;\u00b7&nbsp; 手写 HTML &nbsp;\u00b7&nbsp; 没有框架也没有构建 &nbsp;\u00b7&nbsp; 双击就能打开 &nbsp;\u00b7&nbsp;</span>',
    '    <span>&nbsp;\u2605&nbsp; 保持高饱和 &nbsp;\u00b7&nbsp; STAY LOUD &nbsp;\u00b7&nbsp; 复古多巴胺 &nbsp;\u00b7&nbsp; 手写 HTML &nbsp;\u00b7&nbsp; 没有框架也没有构建 &nbsp;\u00b7&nbsp; 双击就能打开 &nbsp;\u00b7&nbsp;</span>',
    '  </div>',
    '</div>'
  ].join('\n');

  var mount = document.getElementById('site-nav');
  var footerMount = document.getElementById('site-footer');

  /* ---------- 当前页高亮 ---------- */
  function highlightCurrent() {
    var file = window.location.pathname.split('/').pop() || 'index.html';
    if (file === '' || file === '/') file = 'index.html';

    var links = document.querySelectorAll('.nav-links a[data-nav]');
    Array.prototype.forEach.call(links, function (link) {
      var target = link.getAttribute('data-nav');
      if (target === file) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('is-current');
      } else {
        link.removeAttribute('aria-current');
        link.classList.remove('is-current');
      }
    });
  }

  /* ---------- 页脚（只写一次） ---------- */
  function renderFooter() {
    if (!footerMount) return;
    var year = new Date().getFullYear();
    footerMount.innerHTML = [
      '<footer class="site-footer">',
      '  <div class="footer-inner">',
      '    <div>',
      '      <p class="footer-logo">多巴胺档案馆</p>',
      '      <p class="footer-note">四个页面，一份样式表，一段公共导航。全部手写 HTML、CSS 与 JavaScript —— 没有框架，没有构建步骤，双击就能打开。</p>',
      '    </div>',
      '    <ul class="footer-links">',
      '      <li><a href="index.html">首页</a></li>',
      '      <li><a href="quotes.html">名言墙</a></li>',
      '      <li><a href="project.html">项目</a></li>',
      '      <li><a href="machine.html">无用机器</a></li>',
      '    </ul>',
      '    <p class="footer-small">&copy; ' + year + ' &nbsp;·&nbsp; 保持高饱和 &nbsp;·&nbsp; STAY LOUD</p>',
      '  </div>',
      '</footer>'
    ].join('\n');
  }

  function paint(html) {
    if (mount) mount.innerHTML = html;
    highlightCurrent();
    renderFooter();
  }

  /* ---------- 先尝试外链 nav.html，失败就用兜底 ---------- */
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
      .catch(function () {
        paint(FALLBACK_NAV);
      });
  } else {
    paint(FALLBACK_NAV);
  }
})();
