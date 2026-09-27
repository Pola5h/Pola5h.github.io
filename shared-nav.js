/**
 * shared-nav.js — Injected navigation for all pages
 * Handles: consistent header, dark/light theme, mobile menu
 *
 * Usage: <script src="/shared-nav.js"></script>
 * Must be placed AFTER <body> opens (or use defer)
 */

(function () {
  'use strict';

  // ── Theme Management ─────────────────────────────────────
  const THEME_KEY = 'pola5h-theme';

  function getTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    updateToggleLabel(theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    applyTheme(current === 'light' ? 'dark' : 'light');
  }

  function updateToggleLabel(theme) {
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.textContent = theme === 'light' ? '🌙 Dark' : '☀️ Light';
      btn.title = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
    }
  }

  // ── Nav HTML ─────────────────────────────────────────────
  function buildNav() {
    const path = window.location.pathname;

    const isHome = path === '/' || path === '/index.html';
    const isBlog = path.startsWith('/blog');
    const isServices = path.startsWith('/services');

    // Determine "Hire Me" link label and href
    const hireHref = '/services/hire-laravel-developer/';

    const navHTML = `
<div id="scroll-progress"></div>
<header class="site-header" role="banner">
  <nav class="site-nav" aria-label="Main navigation">
    <a href="/" class="nav-logo" aria-label="Kamruzzaman Polash — Home">pola5h</a>

    <ul class="nav-links" id="navLinks" role="list">
      <li><a href="/#about">About</a></li>
      <li><a href="/#skills">Skills</a></li>
      <li><a href="/#experience">Experience</a></li>
      <li><a href="/#projects">Projects</a></li>
      <li><a href="/blog/" ${isBlog ? 'aria-current="page"' : ''}>Blog</a></li>
      <li><a href="${hireHref}" class="nav-hire" ${isServices ? 'aria-current="page"' : ''}>Hire Me ⚡</a></li>
      <li><a href="/#contact">Contact</a></li>
    </ul>

    <div class="nav-controls">
      <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme" title="Toggle theme">
        🌙 Dark
      </button>
      <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Open menu" aria-expanded="false">
        ☰
      </button>
    </div>
  </nav>
</header>`;

    return navHTML;
  }

  // ── Footer HTML ─────────────────────────────────────────
  function buildFooter() {
    const year = new Date().getFullYear();
    return `
<footer class="site-footer" role="contentinfo">
  <div class="footer-inner">
    <nav class="footer-links" aria-label="Footer navigation">
      <a href="/">Portfolio</a>
      <a href="/blog/">Laravel Blog</a>
      <a href="/services/hire-laravel-developer/">Hire Me</a>
      <a href="https://github.com/pola5h" target="_blank" rel="noopener noreferrer">GitHub</a>
      <a href="https://linkedin.com/in/pola5h" target="_blank" rel="noopener noreferrer">LinkedIn</a>
    </nav>
    <p class="footer-copy">© ${year} Kamruzzaman Polash · Laravel &amp; PHP Developer · Bangladesh</p>
  </div>
</footer>`;
  }

  // ── Scroll Progress ───────────────────────────────────────
  function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    function update() {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) {
        bar.style.width = ((scrolled / total) * 100).toFixed(1) + '%';
      }
    }
    window.addEventListener('scroll', update, { passive: true });
  }

  // ── Mobile Menu ───────────────────────────────────────────
  function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const links = document.getElementById('navLinks');
    if (!btn || !links) return;

    btn.addEventListener('click', function () {
      const isOpen = links.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
      btn.textContent = isOpen ? '✕' : '☰';
    });

    // Close on link click
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        btn.textContent = '☰';
      });
    });
  }

  // ── Inject & Init ─────────────────────────────────────────
  function init() {
    // Apply theme immediately to prevent flash
    applyTheme(getTheme());

    // Inject nav at start of body if no .site-header exists already
    if (!document.querySelector('.site-header')) {
      const navWrapper = document.createElement('div');
      navWrapper.innerHTML = buildNav();
      while (navWrapper.firstChild) {
        document.body.insertBefore(navWrapper.firstChild, document.body.firstChild);
      }
    }

    // Inject footer before </body> if no .site-footer exists
    if (!document.querySelector('.site-footer')) {
      const footerWrapper = document.createElement('div');
      footerWrapper.innerHTML = buildFooter();
      while (footerWrapper.firstChild) {
        document.body.appendChild(footerWrapper.firstChild);
      }
    }

    // Wire up theme toggle
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', toggleTheme);
    }

    initScrollProgress();
    initMobileMenu();
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
