/* Portfolio v2 — progressive enhancement only. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');

  function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }
  function $$(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  /* --------------------------------------------------------------------- */
  /* Theme                                                                  */
  /* --------------------------------------------------------------------- */
  function setupTheme() {
    $$('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        root.classList.add('theme-animating');
        var isDark = root.classList.toggle('dark');
        try {
          localStorage.setItem('theme', isDark ? 'dark' : 'light');
        } catch (e) {}
        setTimeout(function () {
          root.classList.remove('theme-animating');
        }, 300);
      });
    });
  }

  /* --------------------------------------------------------------------- */
  /* Header scroll state                                                    */
  /* --------------------------------------------------------------------- */
  function setupHeader() {
    var header = $('#site-header');
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --------------------------------------------------------------------- */
  /* Mobile menu                                                            */
  /* --------------------------------------------------------------------- */
  function setupMenu() {
    var menu = $('#mobile-menu');
    if (!menu) return;
    var openBtn = $('[data-menu-open]');
    var closeBtn = $('[data-menu-close]');

    function open() {
      menu.hidden = false;
      requestAnimationFrame(function () {
        menu.classList.add('is-open');
      });
      if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }
    function close() {
      menu.classList.remove('is-open');
      if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      window.setTimeout(function () {
        menu.hidden = true;
      }, 280);
      if (openBtn) openBtn.focus();
    }

    if (openBtn) openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    $$('[data-menu-link]', menu).forEach(function (link) {
      link.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) close();
    });
  }

  /* --------------------------------------------------------------------- */
  /* Toast                                                                  */
  /* --------------------------------------------------------------------- */
  var toastTimer;
  function showToast(message) {
    var toast = $('#global-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'global-toast';
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.remove('toast-exit');
    toast.classList.add('toast-enter');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove('toast-enter');
      toast.classList.add('toast-exit');
    }, 2200);
  }

  /* --------------------------------------------------------------------- */
  /* Copy to clipboard                                                      */
  /* --------------------------------------------------------------------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand('copy');
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(area);
      }
    });
  }

  function setupCopy() {
    document.addEventListener('click', function (e) {
      var codeBtn = e.target.closest('.copy-code-btn');
      if (codeBtn) {
        var block = codeBtn.closest('.code-block');
        var code = block ? block.querySelector('code') : null;
        if (!code) return;
        copyText(code.innerText)
          .then(function () {
            var label = codeBtn.querySelector('span');
            var original = label ? label.textContent : 'Copy';
            if (label) label.textContent = 'Copied';
            window.setTimeout(function () {
              if (label) label.textContent = original;
            }, 1800);
          })
          .catch(function () {
            showToast('Copy failed — select the code manually.');
          });
        return;
      }

      var linkBtn = e.target.closest('[data-copy-link]');
      if (linkBtn) {
        var url = window.location.href;
        copyText(url)
          .then(function () {
            showToast('Link copied to clipboard');
          })
          .catch(function () {
            showToast(url);
          });
        return;
      }

      var emailBtn = e.target.closest('[data-copy-email]');
      if (emailBtn) {
        var email = 'kzaman3055@gmail.com';
        copyText(email)
          .then(function () {
            var orig = emailBtn.textContent;
            emailBtn.textContent = 'Copied!';
            showToast('Copied ' + email + ' to clipboard');
            window.setTimeout(function () {
              emailBtn.textContent = orig;
            }, 2000);
          })
          .catch(function () {
            showToast('kzaman3055@gmail.com');
          });
        return;
      }
    });
  }

  /* --------------------------------------------------------------------- */
  /* Work filtering                                                        */
  /* --------------------------------------------------------------------- */
  function setupWorkFilter() {
    var bar = $('[data-work-filters]');
    var grid = $('[data-work-grid]');
    if (!bar || !grid) return;
    var buttons = $$('[data-work-filter]', bar);
    var items = $$('[data-work-category]', grid);

    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-work-filter]');
      if (!btn) return;
      var filter = btn.getAttribute('data-work-filter');

      buttons.forEach(function (b) {
        b.classList.toggle('is-active', b === btn);
      });

      items.forEach(function (item) {
        var cats = (item.getAttribute('data-work-category') || '').split(' ');
        var match = filter === 'all' || cats.indexOf(filter) !== -1;
        item.style.display = match ? '' : 'none';
      });
    });
  }
  /* Blog filtering                                                         */
  /* --------------------------------------------------------------------- */
  function setupBlogFilter() {
    var bar = $('[data-blog-filters]');
    var grid = $('[data-blog-grid]');
    if (!bar || !grid) return;
    var empty = $('[data-blog-empty]');
    var buttons = $$('[data-blog-filter]', bar);
    var cards = $$('[data-category]', grid);

    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-blog-filter]');
      if (!btn) return;
      var filter = btn.getAttribute('data-blog-filter');

      buttons.forEach(function (b) {
        b.classList.toggle('is-active', b === btn);
      });

      var visible = 0;
      cards.forEach(function (card) {
        var match = filter === 'All' || card.getAttribute('data-category') === filter;
        card.style.display = match ? '' : 'none';
        if (match) visible += 1;
      });
      if (empty) empty.classList.toggle('hidden', visible !== 0);
    });
  }

  /* --------------------------------------------------------------------- */
  /* Contact form submission with AJAX & mailto fallback                   */
  /* --------------------------------------------------------------------- */
  function setupContactForm() {
    var form = $('[data-contact-form]');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var action = form.getAttribute('action') || '';
      var submitBtn = form.querySelector('button[type="submit"]');
      var originalBtnText = submitBtn ? submitBtn.textContent : 'Send project brief';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending brief…';
      }

      var formData = new FormData(form);

      function doFallback() {
        var subject = 'Project enquiry — ' + (formData.get('scope') || 'general');
        var body =
          'Name: ' + (formData.get('name') || '') + '\n' +
          'Email: ' + (formData.get('email') || '') + '\n' +
          'Phone / WhatsApp: ' + (formData.get('phone') || '') + '\n' +
          'Project type: ' + (formData.get('scope') || '') + '\n\n' +
          (formData.get('message') || '');
        window.location.href =
          'mailto:kzaman3055@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        showToast('Opening your email client…');
      }

      fetch(action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, status: res.status, data: data };
        });
      })
      .then(function (result) {
        if (result.ok && result.data && result.data.success) {
          showToast(result.data.message || 'Brief sent! I will respond within 4 hours.');
          form.reset();
        } else if (result.status === 429) {
          showToast(result.data.message || 'Too many submissions. Please wait a few minutes.');
        } else {
          showToast(result.data.message || 'Could not send. Opening email client…');
          doFallback();
        }
      })
      .catch(function () {
        doFallback();
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      });
    });
  }

  /* --------------------------------------------------------------------- */
  /* Reading progress + TOC                                                */
  /* --------------------------------------------------------------------- */
  function setupArticle() {
    var progress = $('#reading-progress');
    var article = $('.article');
    if (progress && article) {
      var update = function () {
        var rect = article.getBoundingClientRect();
        var total = rect.height - window.innerHeight;
        var scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
        progress.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
      };
      update();
      window.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
    }

    var toc = $('[data-toc]');
    if (toc) {
      var links = $$('[data-toc-link]', toc);
      var targets = links
        .map(function (link) {
          var id = link.getAttribute('href').slice(1);
          return document.getElementById(id);
        })
        .filter(Boolean);

      if (targets.length && 'IntersectionObserver' in window) {
        var observer = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (!entry.isIntersecting) return;
              links.forEach(function (l) {
                l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id);
              });
            });
          },
          { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
        );
        targets.forEach(function (t) {
          observer.observe(t);
        });
      }
    }
  }


  /* --------------------------------------------------------------------- */
  /* Reveal on scroll                                                       */
  /* --------------------------------------------------------------------- */
  function setupReveal() {
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    var targets = $$('.work__item, .skill, .xp__row, .svc__panel, .post-row, [data-reveal]');
    if (!targets.length) return;

    targets.forEach(function (el) {
      el.classList.add('reveal');
    });

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    targets.forEach(function (el) {
      observer.observe(el);
    });

    // Safety net: never leave content hidden if the observer misbehaves.
    window.setTimeout(function () {
      targets.forEach(function (el) {
        el.classList.add('is-visible');
      });
    }, 2500);
  }

  /* --------------------------------------------------------------------- */
  /* Tech Orbit — Interactive Tooltips & Accessibility                     */
  /* --------------------------------------------------------------------- */
  function setupTechOrbit() {
    var orbit = $('#tech-orbit');
    if (!orbit) return;

    var nodes = $$('.orbit-node', orbit);
    nodes.forEach(function (node) {
      var btn = $('.orbit-node__inner', node);
      if (!btn) return;
      btn.setAttribute('tabindex', '0');
      btn.setAttribute('role', 'button');
      var techName = node.getAttribute('data-tech') || '';
      var techRole = node.getAttribute('data-role') || '';
      btn.setAttribute('aria-label', techName + ' (' + techRole + ')');
    });
  }

  /* --------------------------------------------------------------------- */
  /* Scroll to top                                                          */
  /* --------------------------------------------------------------------- */
  function setupScrollToTop() {
    var btn = $('#back-to-top');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'back-to-top';
      btn.type = 'button';
      btn.className = 'back-to-top';
      btn.setAttribute('aria-label', 'Scroll to top');
      btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg>';
      document.body.appendChild(btn);
    }

    var ticking = false;
    var onScroll = function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          if (window.scrollY > 350) {
            btn.classList.add('is-visible');
          } else {
            btn.classList.remove('is-visible');
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    btn.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
      btn.blur();
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function setupDynamicDates() {
    var startYear = 2022;
    var currentYear = new Date().getFullYear();
    var years = Math.max(4, currentYear - startYear);
    $$('[data-experience-years]').forEach(function (el) {
      el.textContent = years + '+';
    });
  }

  function init() {
    setupTheme();
    setupHeader();
    setupMenu();
    setupCopy();
    setupWorkFilter();
    setupBlogFilter();
    setupContactForm();
    setupArticle();
    setupReveal();
    setupScrollToTop();
    setupTechOrbit();
    setupDynamicDates();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
