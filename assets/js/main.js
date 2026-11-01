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
        var email = 'hello@polash.link';
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
            showToast('hello@polash.link');
          });
        return;
      }
    });
  }

  /* --------------------------------------------------------------------- */
  /* Work showcase                                                          */
  /* --------------------------------------------------------------------- */
  function setupWorkShowcase() {
    var showcase = $('[data-work-showcase]');
    if (!showcase) return;

    var nav = $('.work-showcase__nav', showcase);
    var navItems = $$('.work-nav-item', showcase);
    var panels = $$('.work-panel', showcase);

    function activateTab(tabId, scrollIntoView) {
      navItems.forEach(function (btn) {
        var match = btn.getAttribute('data-work-tab') === tabId;
        btn.classList.toggle('is-active', match);
        btn.setAttribute('aria-selected', match ? 'true' : 'false');
        btn.setAttribute('tabindex', match ? '0' : '-1');
        if (match && scrollIntoView && nav) {
          try {
            btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          } catch (e) {}
        }
      });

      panels.forEach(function (p) {
        var match = p.id === 'panel-' + tabId;
        p.classList.toggle('is-active', match);
        p.hidden = !match;
      });
    }

    navItems.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tabId = btn.getAttribute('data-work-tab');
        activateTab(tabId, true);
      });

      // Keyboard arrow navigation
      btn.addEventListener('keydown', function (e) {
        var idx = navItems.indexOf(btn);
        var target;

        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          target = navItems[(idx + 1) % navItems.length];
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          target = navItems[(idx - 1 + navItems.length) % navItems.length];
        } else if (e.key === 'Home') {
          e.preventDefault();
          target = navItems[0];
        } else if (e.key === 'End') {
          e.preventDefault();
          target = navItems[navItems.length - 1];
        }

        if (target) {
          target.focus();
          activateTab(target.getAttribute('data-work-tab'), true);
        }
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
          'mailto:hello@polash.link?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
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

  function setupRecommendationSlider() {
    var slider = $('[data-rec-slider]');
    var track = $('[data-rec-track]');
    var prevBtn = $('[data-slider-prev]');
    var nextBtn = $('[data-slider-next]');
    if (!slider || !track) return;

    var autoPlayTimer = null;
    var isHovered = false;

    function getStep() {
      var firstCard = track.querySelector('.rec-card');
      if (!firstCard) return 360;
      var cardRect = firstCard.getBoundingClientRect();
      var secondCard = firstCard.nextElementSibling;
      var gap = 22;
      if (secondCard) {
        gap = secondCard.getBoundingClientRect().left - cardRect.right;
      }
      return Math.round(cardRect.width + (gap > 0 ? gap : 22));
    }

    function scrollNext() {
      var maxScroll = track.scrollWidth - track.clientWidth;
      if (track.scrollLeft >= maxScroll - 16) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: getStep(), behavior: 'smooth' });
      }
    }

    function scrollPrev() {
      if (track.scrollLeft <= 16) {
        track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: -getStep(), behavior: 'smooth' });
      }
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        scrollNext();
        resetAuto();
      });
    }
    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        scrollPrev();
        resetAuto();
      });
    }

    function startAuto() {
      if (reduceMotion) return;
      stopAuto();
      autoPlayTimer = setInterval(function () {
        if (!isHovered) scrollNext();
      }, 5000);
    }

    function stopAuto() {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
    }

    function resetAuto() {
      stopAuto();
      startAuto();
    }

    slider.addEventListener('mouseenter', function () { isHovered = true; });
    slider.addEventListener('mouseleave', function () { isHovered = false; });
    slider.addEventListener('touchstart', function () { isHovered = true; }, { passive: true });
    slider.addEventListener('touchend', function () {
      isHovered = false;
      resetAuto();
    }, { passive: true });

    startAuto();
  }

  /* --------------------------------------------------------------------- */
  /* Tech Marquee clone (seamless loop without duplicate HTML)             */
  /* --------------------------------------------------------------------- */
  function setupTechMarquee() {
    var track = $('.tech-marquee__track');
    if (!track) return;
    if (track.children.length === 1) {
      var group = $('.tech-marquee__group', track);
      if (!group) return;
      var clone = group.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    }
  }

  /* --------------------------------------------------------------------- */
  /* 100% White-Label Live Chat Widget (Alwaysdata + Telegram + Ably)      */
  /* --------------------------------------------------------------------- */
  function setupLiveChat() {
    var widget = $('#live-chat');
    if (!widget) return;

    var toggleBtn = $('#live-chat-toggle');
    var closeBtn = $('#live-chat-close');
    var windowEl = $('#live-chat-window');
    var prechatEl = $('#live-chat-prechat');
    var initForm = $('#live-chat-init-form');
    var convEl = $('#live-chat-conversation');
    var messagesEl = $('#live-chat-messages');
    var composerForm = $('#live-chat-composer');
    var replyInput = $('#chat-reply-input');

    var CHAT_ENDPOINT = 'https://rootcode.alwaysdata.net/api/chat/';
    var STORAGE_KEY = 'polash_live_chat_session';
    var session = null;
    var ablyClient = null;
    var ablyChannel = null;
    var pollTimer = null;
    var unreadCount = 0;
    var unreadBadge = $('#live-chat-unread');
    if (!unreadBadge && toggleBtn) {
      unreadBadge = document.createElement('span');
      unreadBadge.id = 'live-chat-unread';
      unreadBadge.className = 'live-chat__unread';
      unreadBadge.setAttribute('aria-label', 'Unread messages');
      unreadBadge.hidden = true;
      toggleBtn.appendChild(unreadBadge);
    }

    function updateUnreadUI() {
      if (!unreadBadge) return;
      var isOpen = widget.classList.contains('is-open');
      if (isOpen || unreadCount <= 0) {
        unreadCount = 0;
        unreadBadge.hidden = true;
        unreadBadge.textContent = '';
      } else {
        unreadBadge.hidden = false;
        unreadBadge.textContent = unreadCount > 9 ? '9+' : String(unreadCount);
      }
    }
    function getStoredSession() {
      try {
        var s = localStorage.getItem(STORAGE_KEY);
        if (s) {
          var parsed = JSON.parse(s);
          if (parsed && parsed.session_id) return parsed;
        }
      } catch (e) {}

      try {
        var match = document.cookie.match(new RegExp('(?:^|; )' + STORAGE_KEY + '=([^;]*)'));
        if (match && match[1]) {
          var cParsed = JSON.parse(decodeURIComponent(match[1]));
          if (cParsed && cParsed.session_id) {
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cParsed)); } catch (err) {}
            return cParsed;
          }
        }
      } catch (e) {}

      return null;
    }

    function saveStoredSession(data) {
      if (!data) return;
      session = data;
      var str = JSON.stringify(data);
      try { localStorage.setItem(STORAGE_KEY, str); } catch (e) {}
      try {
        var d = new Date();
        d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
        var secure = location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = STORAGE_KEY + '=' + encodeURIComponent(str) + '; expires=' + d.toUTCString() + '; path=/; SameSite=Lax' + secure;
      } catch (e) {}
    }

    function clearStoredSession() {
      session = null;
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      document.cookie = STORAGE_KEY + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
      if (pollTimer) clearInterval(pollTimer);
      renderedMsgIds.clear();
      if (messagesEl) messagesEl.innerHTML = '';
      switchView(false);
    }

    var renderedMsgIds = new Set();
    session = getStoredSession();

    function formatTime(isoOrDate) {
      if (!isoOrDate) return '';
      try {
        var d = new Date(isoOrDate);
        if (isNaN(d.getTime())) return '';
        var now = new Date();
        var diffMs = now.getTime() - d.getTime();
        if (diffMs < 0) diffMs = 0;

        var diffSecs = Math.floor(diffMs / 1000);
        var diffMins = Math.floor(diffSecs / 60);
        var diffHours = Math.floor(diffMins / 60);

        if (diffSecs < 60) {
          return 'Just now';
        }
        if (diffMins < 60) {
          return diffMins + 'm ago';
        }
        if (diffHours <= 2) {
          return diffHours + 'h ago';
        }

        var timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        var isToday = d.getFullYear() === now.getFullYear() &&
                      d.getMonth() === now.getMonth() &&
                      d.getDate() === now.getDate();
        if (isToday) {
          return timeStr;
        }

        var yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        var isYesterday = d.getFullYear() === yesterday.getFullYear() &&
                          d.getMonth() === yesterday.getMonth() &&
                          d.getDate() === yesterday.getDate();
        if (isYesterday) {
          return 'Yesterday, ' + timeStr;
        }

        var dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
        return dateStr + ', ' + timeStr;
      } catch (e) {
        return '';
      }
    }

    function updateRelativeTimestamps() {
      if (!messagesEl) return;
      var metas = messagesEl.querySelectorAll('.live-chat__msg-meta[data-timestamp]');
      metas.forEach(function (el) {
        var ts = el.getAttribute('data-timestamp');
        if (ts) {
          var updated = formatTime(ts);
          if (updated && el.textContent !== updated) {
            el.textContent = updated;
          }
        }
      });
    }

    function appendMessage(sender, text, timestamp, msgId, isNewArrival) {
      if (!text) return null;

      // Deduplicate server messages by unique integer ID
      if (msgId) {
        var idKey = 'id:' + msgId;
        if (renderedMsgIds.has(idKey)) return null;
        renderedMsgIds.add(idKey);
      }

      var isVisitor = sender === 'visitor';
      var msgEl = document.createElement('div');
      msgEl.className = 'live-chat__msg ' + (isVisitor ? 'live-chat__msg--visitor' : 'live-chat__msg--polash');
      if (msgId) msgEl.setAttribute('data-msg-id', msgId);

      var bubble = document.createElement('div');
      bubble.className = 'live-chat__bubble';
      bubble.textContent = text;

      var rawTime = timestamp || new Date().toISOString();
      var meta = document.createElement('div');
      meta.className = 'live-chat__msg-meta';
      meta.setAttribute('data-timestamp', rawTime);
      try {
        var dObj = new Date(rawTime);
        if (!isNaN(dObj.getTime())) {
          meta.title = dObj.toLocaleString();
        }
      } catch (e) {}
      meta.textContent = formatTime(rawTime);

      msgEl.appendChild(bubble);
      msgEl.appendChild(meta);
      messagesEl.appendChild(msgEl);

      // Smooth & reliable auto-scroll to bottom
      requestAnimationFrame(function () {
        messagesEl.scrollTop = messagesEl.scrollHeight;
        try {
          msgEl.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        } catch (e) {}
      });

      return msgEl;
    }

    var audioCtx = null;
    function playNotificationChime() {
      try {
        var AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        if (!audioCtx) {
          audioCtx = new AudioContextClass();
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }

        var now = audioCtx.currentTime;

        // Tone 1: 587.33 Hz (D5) - soft gentle attack
        var osc1 = audioCtx.createOscillator();
        var gain1 = audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, now);
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.12, now + 0.02);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.start(now);
        osc1.stop(now + 0.35);

        // Tone 2: 880 Hz (A5) - clear bright notification chime
        var osc2 = audioCtx.createOscillator();
        var gain2 = audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, now + 0.09);
        gain2.gain.setValueAtTime(0, now + 0.09);
        gain2.gain.linearRampToValueAtTime(0.15, now + 0.11);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start(now + 0.09);
        osc2.stop(now + 0.55);
      } catch (e) {}
    }

    var isChatVisible = true;
    function updateVisibilityUI(visibility) {
      isChatVisible = (visibility !== 'hidden');

      if (widget) {
        if (!isChatVisible) {
          widget.classList.add('live-chat--hidden');
          widget.setAttribute('hidden', '');
          widget.style.display = 'none';
          if (widget.classList.contains('is-open')) {
            toggleChat(false);
          }
        } else {
          widget.classList.remove('live-chat--hidden');
          widget.removeAttribute('hidden');
          widget.style.display = '';
        }
      }

      // Sync all buttons/links triggering live chat across pages
      document.querySelectorAll('[data-open-chat]').forEach(function (btn) {
        if (!isChatVisible) {
          if (btn.tagName.toLowerCase() === 'a') {
            if (!btn.getAttribute('data-orig-href')) {
              btn.setAttribute('data-orig-href', btn.getAttribute('href') || '');
              btn.setAttribute('data-orig-text', btn.textContent);
            }
            btn.setAttribute('href', 'https://wa.me/8801791296967?text=' + encodeURIComponent('Hi Polash, I would like to discuss a project.'));
            btn.setAttribute('target', '_blank');
            btn.setAttribute('rel', 'noopener noreferrer');
            btn.textContent = 'Chat on WhatsApp';
          } else {
            btn.style.display = 'none';
          }
        } else {
          if (btn.tagName.toLowerCase() === 'a') {
            var origHref = btn.getAttribute('data-orig-href');
            var origText = btn.getAttribute('data-orig-text');
            if (origHref) btn.setAttribute('href', origHref);
            if (origText) btn.textContent = origText;
            btn.removeAttribute('target');
            btn.removeAttribute('rel');
          } else {
            btn.style.display = '';
          }
        }
      });
    }

    function updateAvailabilityUI(status) {
      var isAway = status === 'away';
      var launcherDot = $('#live-chat-launcher-dot');
      var avatarBadge = $('#live-chat-status-badge');
      var statusText = $('#live-chat-status-text');

      if (launcherDot) launcherDot.classList.toggle('is-away', isAway);
      if (avatarBadge) avatarBadge.classList.toggle('is-away', isAway);
      if (statusText) {
        statusText.textContent = isAway ? 'Away right now' : 'Available for chat';
      }
    }

    function onPolashMessageReceived(text, timestamp, msgId) {
      var isOpen = widget.classList.contains('is-open');
      var msgEl = appendMessage('polash', text, timestamp, msgId, true);
      if (msgEl) {
        playNotificationChime();
        if (!isOpen) {
          unreadCount++;
          updateUnreadUI();
        }
      }
    }

    function subscribeToSessionChannel() {
      if (!ablyClient || !session || !session.session_id) return;
      if (ablyChannel && ablyChannel.name === 'chat:' + session.session_id) return;
      try {
        ablyChannel = ablyClient.channels.get('chat:' + session.session_id);
        ablyChannel.subscribe('message', function (msg) {
          if (msg && msg.data && msg.data.sender === 'polash') {
            onPolashMessageReceived(msg.data.text || '', msg.data.timestamp, msg.data.id);
          }
        });
      } catch (err) {
        console.warn('Ably channel subscribe warning:', err);
      }
    }

    function initAbly(apiKey) {
      if (!apiKey || ablyClient) {
        if (ablyClient) subscribeToSessionChannel();
        return;
      }

      function connect() {
        try {
          if (!window.Ably) return;
          ablyClient = new window.Ably.Realtime({ key: apiKey });

          // Realtime availability & visibility status broadcast
          var statusChan = ablyClient.channels.get('site:status');
          statusChan.subscribe('status_change', function (msg) {
            if (msg && msg.data && msg.data.status) {
              updateAvailabilityUI(msg.data.status);
            }
          });
          statusChan.subscribe('visibility_change', function (msg) {
            if (msg && msg.data && msg.data.visibility) {
              updateVisibilityUI(msg.data.visibility);
            }
          });

          // Session-specific chat messages
          subscribeToSessionChannel();
        } catch (err) {
          console.warn('Ably connection warning:', err);
        }
      }

      if (!window.Ably) {
        var script = document.createElement('script');
        script.src = 'https://cdn.ably.com/lib/ably.min-1.js';
        script.onload = connect;
        document.head.appendChild(script);
      } else {
        connect();
      }
    }

    function fetchConfig() {
      fetch(CHAT_ENDPOINT + '?action=config')
        .then(function (res) { return res.json(); })
        .then(function (cfg) {
          if (cfg) {
            if (cfg.visibility) {
              updateVisibilityUI(cfg.visibility);
            }
            if (cfg.status) {
              updateAvailabilityUI(cfg.status);
            }
            if (cfg.ably_key) {
              initAbly(cfg.ably_key);
              subscribeToSessionChannel();
            }
          }
        })
        .catch(function () {});
    }

    function fetchHistory(syncAbly, isPolling) {
      if (!session || !session.session_id) return;
      fetch(CHAT_ENDPOINT + '?action=history&session_id=' + encodeURIComponent(session.session_id))
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data && data.session_expired) {
            clearStoredSession();
            return;
          }
          if (data && data.success && Array.isArray(data.messages)) {
            data.messages.forEach(function (m) {
              var key = m.id ? 'id:' + m.id : 'm:' + m.sender + ':' + (m.created_at || m.message);
              var isNew = !renderedMsgIds.has(key);
              if (isNew && m.sender === 'polash' && isPolling) {
                onPolashMessageReceived(m.message, m.created_at, m.id);
              } else {
                appendMessage(m.sender, m.message, m.created_at, m.id, false);
              }
            });
          }
        })
        .catch(function () {});

      if (syncAbly) {
        fetchConfig();
      }
    }

    function switchView(hasSession) {
      if (hasSession && session) {
        widget.classList.add('is-chatting');
        prechatEl.hidden = true;
        prechatEl.setAttribute('hidden', '');
        convEl.hidden = false;
        convEl.removeAttribute('hidden');
        fetchHistory(true, false);
        startPolling();
      } else {
        widget.classList.remove('is-chatting');
        prechatEl.hidden = false;
        prechatEl.removeAttribute('hidden');
        convEl.hidden = true;
        convEl.setAttribute('hidden', '');
      }
    }

    function startPolling() {
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = setInterval(function () {
        if (widget.classList.contains('is-open') && session && session.session_id) {
          fetchHistory(false, true);
        }
      }, 7000);
    }

    function toggleChat(open) {
      var isOpen = typeof open === 'boolean' ? open : !widget.classList.contains('is-open');
      widget.classList.toggle('is-open', isOpen);
      toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (isOpen) {
        unreadCount = 0;
        updateUnreadUI();
        windowEl.hidden = false;
        windowEl.removeAttribute('hidden');
        updateRelativeTimestamps();
        if (session && session.session_id) {
          switchView(true);
          setTimeout(function () {
            if (replyInput) replyInput.focus();
            messagesEl.scrollTop = messagesEl.scrollHeight;
          }, 150);
        } else {
          switchView(false);
          var firstInput = initForm.querySelector('input');
          if (firstInput) setTimeout(function () { firstInput.focus(); }, 150);
        }
      } else {
        windowEl.hidden = true;
        windowEl.setAttribute('hidden', '');
      }
    }

    toggleBtn.addEventListener('click', function () { toggleChat(); });
    if (closeBtn) closeBtn.addEventListener('click', function () { toggleChat(false); });
    document.querySelectorAll('[data-open-chat]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        if (!isChatVisible) {
          if (btn.tagName.toLowerCase() === 'a') {
            return;
          }
          e.preventDefault();
          window.open('https://wa.me/8801791296967?text=' + encodeURIComponent('Hi Polash, I would like to discuss a project.'), '_blank', 'noopener,noreferrer');
          return;
        }
        e.preventDefault();
        toggleChat(true);
      });
    });

    // Pre-chat submission
    initForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var submitBtn = initForm.querySelector('button[type="submit"]');
      var originalText = submitBtn ? submitBtn.innerHTML : 'Start Chat';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending…';
      }

      var payload = {
        name: initForm.name.value.trim(),
        email: initForm.email.value.trim(),
        message: initForm.message.value.trim(),
        page: window.location.pathname
      };

      var emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(payload.email)) {
        showToast('Please provide a valid email format (e.g. name@domain.com).');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = originalText; }
        return;
      }

      var emailDomain = (payload.email.split('@')[1] || '').toLowerCase();
      var blockedDomains = ['tempmail.com', 'mailinator.com', '10minutemail.com', 'guerrillamail.com', 'yopmail.com', 'trashmail.com', 'temp-mail.org'];
      if (blockedDomains.indexOf(emailDomain) !== -1) {
        showToast('Temporary/disposable emails are not permitted.');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = originalText; }
        return;
      }

      fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data && data.success && data.session_id) {
          saveStoredSession({
            session_id: data.session_id,
            name: data.name,
            email: data.email
          });
          subscribeToSessionChannel();

          switchView(true);
          if (Array.isArray(data.messages) && data.messages.length > 0) {
            data.messages.forEach(function (m) {
              appendMessage(m.sender, m.message, m.created_at, m.id);
            });
          } else {
            appendMessage('visitor', payload.message, new Date().toISOString(), data.msg_id);
          }

          setTimeout(function () {
            if (replyInput) replyInput.focus();
          }, 200);
        } else {
          showToast(data.message || 'Could not connect. Please try again.');
        }
      })
      .catch(function () {
        showToast('Connection failed. Please check your internet connection.');
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      });
    });

    if (replyInput) {
      replyInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
      });
      replyInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          composerForm.dispatchEvent(new Event('submit', { cancelable: true }));
        }
      });
    }

    // Active conversation reply submission
    composerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!session || !session.session_id) return;
      var text = replyInput.value.trim();
      if (!text) return;

      replyInput.value = '';
      replyInput.style.height = 'auto';
      var optimisticEl = appendMessage('visitor', text, new Date().toISOString());

      fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          session_id: session.session_id,
          message: text,
          page: window.location.pathname
        })
      })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data && data.success) {
          if (data.msg_id) {
            renderedMsgIds.add('id:' + data.msg_id);
            if (optimisticEl) optimisticEl.setAttribute('data-msg-id', data.msg_id);
          }
        } else {
          if (data && data.session_expired) {
            clearStoredSession();
            showToast(data.message || 'Session expired. Please restart the chat.');
            return;
          }
          showToast(data.message || 'Message delivery delayed.');
        }
      })
      .catch(function () {
        showToast('Message not sent. Network issue.');
      });
    });

    // Live relative timestamp auto-updater
    setInterval(updateRelativeTimestamps, 30000);

    // Load availability status and subscribe to realtime updates
    fetchConfig();

    // If returning visitor has active session, pre-load silently
    if (session && session.session_id) {
      switchView(true);
    }
  }

  function init() {
    setupTheme();
    setupHeader();
    setupMenu();
    setupCopy();
    setupWorkShowcase();
    setupBlogFilter();
    setupContactForm();
    setupArticle();
    setupReveal();
    setupScrollToTop();
    setupTechOrbit();
    setupTechMarquee();
    setupDynamicDates();
    setupRecommendationSlider();
    setupLiveChat();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
