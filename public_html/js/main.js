/* Octagreen Nano — modern vanilla JS (no dependencies) */
(function () {
  'use strict';

  window.dataLayer = window.dataLayer || [];
  function track(name, params) { window.dataLayer.push(Object.assign({ event: name }, params || {})); }
  window.OCTAGREEN_TRACK = track;

  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;

  var KEY_FAVS = 'octagreen_favs';
  var KEY_CMP  = 'octagreen_compare';
  var KEY_RECENT = 'octagreen_recent';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initThemeToggle();
    initHeader();
    initScrollProgress();
    initMobileNav();
    initHero();
    initParticles();
    initReveal();
    initBrushReTrigger();
    initCountUp();
    initBackToTop();
    initFaq();
    initFabTracking();
    initForms();
    initYear();
    if (isHover && !prefersReduced) {
      initTilt();
      initMagnetic();
      initSpotlight();
    }
    initBeforeAfter();
    initProductFilter();
    initRecentlyViewed();
    initFavourites();
    initCompare();
    initChatbot();
    initComparePageRender();
    initVideoCards();
    initOffscreenPause();
  }

  function initOffscreenPause() {
    document.querySelectorAll('.marquee-track').forEach(function (track) { pauseAnimsOffscreen(track); });
  }

  // =========================================================
  // Click-to-play video cards (lazy-load the heavy video)
  // =========================================================
  function initVideoCards() {
    document.querySelectorAll('.video-card').forEach(function (card) {
      var poster = card.querySelector('.video-poster');
      if (!poster) return;
      poster.addEventListener('click', function () {
        var src = card.getAttribute('data-video');
        if (!src) return;
        var video = document.createElement('video');
        video.src = src;
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        video.preload = 'auto';
        video.setAttribute('controlsList', 'nodownload');
        card.classList.add('is-playing');
        card.appendChild(video);
        video.focus();
        track('video_play', { src: src });
      });
    });
  }

  // =========================================================
  // Theme toggle with ink-pour
  // =========================================================
  function initThemeToggle() {
    var btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') || 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      if (!prefersReduced) {
        var rect = btn.getBoundingClientRect();
        var pour = document.createElement('span');
        pour.className = 'theme-pour';
        pour.style.left = (rect.left + rect.width / 2) + 'px';
        pour.style.top = (rect.top + rect.height / 2) + 'px';
        pour.style.background = next === 'dark' ? '#0E1814' : '#FFFFFF';
        document.body.appendChild(pour);
        requestAnimationFrame(function () {
          pour.classList.add('is-active');
          setTimeout(function () { document.documentElement.setAttribute('data-theme', next); }, 350);
          setTimeout(function () { pour.remove(); }, 750);
        });
      } else {
        document.documentElement.setAttribute('data-theme', next);
      }
      try { localStorage.setItem('theme', next); } catch (e) {}
      btn.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
      track('theme_toggle', { theme: next });
    });
    var current = document.documentElement.getAttribute('data-theme') || 'light';
    btn.setAttribute('aria-pressed', current === 'dark' ? 'true' : 'false');
  }

  function initHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var onScroll = function () {
      if (window.scrollY > 8) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initScrollProgress() {
    var bar = document.querySelector('.scroll-progress');
    if (!bar) return;
    var ticking = false;
    var update = function () {
      var doc = document.documentElement;
      var max = (doc.scrollHeight - doc.clientHeight) || 1;
      bar.style.width = Math.min(100, (window.scrollY / max) * 100) + '%';
      ticking = false;
    };
    window.addEventListener('scroll', function () { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
    update();
  }

  function initMobileNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.primary-nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        if (window.innerWidth >= 1024) return;
        if (a.closest('.has-submenu') && a.classList.contains('nav-link')) return;
        nav.classList.remove('is-open');
        toggle.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
    document.querySelectorAll('.has-submenu > .nav-link').forEach(function (link) {
      link.addEventListener('click', function (e) {
        if (window.innerWidth >= 1024) return;
        e.preventDefault();
        var li = link.parentElement;
        var open = li.classList.toggle('is-open');
        link.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
  }

  function initHero() {
    var slides = document.querySelectorAll('.hero-slide');
    var dots = document.querySelectorAll('.hero-dot');
    if (!slides.length) return;
    var idx = 0, timer;
    var go = function (i) {
      slides[idx].classList.remove('is-active');
      if (dots[idx]) dots[idx].classList.remove('is-active');
      idx = (i + slides.length) % slides.length;
      slides[idx].classList.add('is-active');
      if (dots[idx]) dots[idx].classList.add('is-active');
    };
    var play = function () { if (prefersReduced) return; stop(); timer = setInterval(function () { go(idx + 1); }, 6000); };
    var stop = function () { if (timer) clearInterval(timer); };
    dots.forEach(function (d, i) { d.addEventListener('click', function () { go(i); play(); }); });
    var hero = document.querySelector('.hero');
    if (!hero) return;
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', play);

    // Touch swipe (mobile)
    var startX = 0, startY = 0, swiping = false;
    hero.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') return;
      // Skip if pointer started on the dot bar
      if (e.target.closest('.hero-dots')) return;
      startX = e.clientX; startY = e.clientY; swiping = true;
      stop();
    });
    hero.addEventListener('pointerup', function (e) {
      if (!swiping || e.pointerType === 'mouse') return;
      swiping = false;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      // Require a horizontal-dominant swipe of at least 40px
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) go(idx + 1);
        else go(idx - 1);
        track('hero_swipe', { dir: dx < 0 ? 'next' : 'prev' });
      }
      play();
    });
    hero.addEventListener('pointercancel', function () { swiping = false; play(); });

    // Pause when offscreen
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) play(); else stop(); });
      }, { threshold: 0.1 });
      io.observe(hero);
    }
    play();
  }

  function initParticles() {
    var host = document.querySelector('.particles');
    if (!host || prefersReduced) return;
    var leaf = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 9-9 4 0 7 3 7 7 0 5-4 9-9 9Z"/></svg>';
    for (var i = 0; i < 14; i++) {
      var p = document.createElement('span');
      p.className = 'particle';
      p.innerHTML = leaf;
      p.style.left = (Math.random() * 100) + '%';
      p.style.setProperty('--dur', (12 + Math.random() * 16) + 's');
      p.style.setProperty('--delay', (Math.random() * -20) + 's');
      var s = (8 + Math.random() * 14);
      p.style.width = s + 'px'; p.style.height = s + 'px';
      p.style.opacity = (0.2 + Math.random() * 0.3).toString();
      host.appendChild(p);
    }
    pauseAnimsOffscreen(host);
  }

  // Generic helper: stop CSS animations on element children when scrolled offscreen
  function pauseAnimsOffscreen(host) {
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        host.style.animationPlayState = e.isIntersecting ? 'running' : 'paused';
        host.querySelectorAll('*').forEach(function (n) {
          n.style.animationPlayState = e.isIntersecting ? 'running' : 'paused';
        });
      });
    }, { threshold: 0 });
    io.observe(host);
  }
  window.OCTAGREEN_PAUSE_OFFSCREEN = pauseAnimsOffscreen;

  function initReveal() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  }

  // Brush stroke replays each time it scrolls back into view (CSS width transition)
  function initBrushReTrigger() {
    var strokes = document.querySelectorAll('.brush-stroke');
    if (!strokes.length) return;
    if (!('IntersectionObserver' in window)) {
      strokes.forEach(function (el) { el.classList.add('is-painting'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.remove('is-painting');
          // double rAF — guarantees the browser flushes the width-reset before we set 100%
          requestAnimationFrame(function () {
            requestAnimationFrame(function () { e.target.classList.add('is-painting'); });
          });
        } else {
          e.target.classList.remove('is-painting');
        }
      });
    }, { threshold: 0.6 });
    strokes.forEach(function (el) { io.observe(el); });
  }

  function initCountUp() {
    var nodes = document.querySelectorAll('[data-count]');
    if (!nodes.length || !('IntersectionObserver' in window)) {
      nodes.forEach(function (n) { n.textContent = n.getAttribute('data-count'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        animateNumber(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.4 });
    nodes.forEach(function (n) { io.observe(n); });
  }
  function animateNumber(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) return;
    var dur = 1400, start = performance.now();
    var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
    function step(now) {
      var t = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(target * ease(t)).toLocaleString();
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString();
    }
    requestAnimationFrame(step);
  }

  function initBackToTop() {
    var btn = document.querySelector('.fab.top');
    if (!btn) return;
    btn.addEventListener('click', function (e) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    var onScroll = function () { btn.classList.toggle('is-visible', window.scrollY > 500); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initFaq() {
    document.querySelectorAll('.faq-q').forEach(function (q) {
      q.addEventListener('click', function () {
        var item = q.parentElement;
        var open = item.classList.toggle('is-open');
        q.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
  }

  function initFabTracking() {
    document.querySelectorAll('[data-track]').forEach(function (el) {
      el.addEventListener('click', function () {
        var name = el.getAttribute('data-track');
        track(name + '_click', { url: el.getAttribute('href') });
      });
    });
  }

  // =========================================================
  // Tilt
  // =========================================================
  function initTilt() {
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      var max = parseFloat(card.getAttribute('data-tilt-max') || '8');
      card.style.perspective = '900px';
      var raf = null;
      card.addEventListener('mousemove', function (e) {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          var rect = card.getBoundingClientRect();
          var px = ((e.clientX - rect.left) / rect.width) - 0.5;
          var py = ((e.clientY - rect.top) / rect.height) - 0.5;
          card.style.transform = 'rotateX(' + (-py * max).toFixed(2) + 'deg) rotateY(' + (px * max).toFixed(2) + 'deg) translateY(-4px)';
        });
      });
      card.addEventListener('mouseleave', function () { if (raf) cancelAnimationFrame(raf); card.style.transform = ''; });
    });
  }

  function initMagnetic() {
    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      el.classList.add('magnetic');
      var s = parseFloat(el.getAttribute('data-magnetic') || '14');
      var raf = null;
      el.addEventListener('mousemove', function (e) {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          var rect = el.getBoundingClientRect();
          var x = e.clientX - rect.left - rect.width / 2;
          var y = e.clientY - rect.top - rect.height / 2;
          el.style.transform = 'translate(' + ((x / (rect.width / 2)) * s) + 'px, ' + ((y / (rect.height / 2)) * s) + 'px)';
        });
      });
      el.addEventListener('mouseleave', function () { if (raf) cancelAnimationFrame(raf); el.style.transform = ''; });
    });
  }

  function initSpotlight() {
    document.querySelectorAll('.spotlight-host').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width) * 100 + '%');
        el.style.setProperty('--my', ((e.clientY - rect.top) / rect.height) * 100 + '%');
      });
    });
  }

  // =========================================================
  // Before / After (still here for case-study reuse if needed)
  // =========================================================
  function initBeforeAfter() {
    document.querySelectorAll('.before-after').forEach(function (el) {
      var divider = el.querySelector('.ba-divider');
      var handle = el.querySelector('.ba-handle');
      var dragging = false;
      var setPos = function (cx) {
        var rect = el.getBoundingClientRect();
        var x = Math.max(0, Math.min(rect.width, cx - rect.left));
        el.style.setProperty('--ba', ((x / rect.width) * 100) + '%');
      };
      var down = function (e) { dragging = true; el.setPointerCapture(e.pointerId); setPos(e.clientX); };
      var move = function (e) { if (dragging) setPos(e.clientX); };
      var up = function (e) { dragging = false; try { el.releasePointerCapture(e.pointerId); } catch (err) {} };
      [divider, handle, el].forEach(function (t) { if (t) t.addEventListener('pointerdown', down); });
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
      // keyboard support
      el.tabIndex = 0;
      el.addEventListener('keydown', function (e) {
        var rect = el.getBoundingClientRect();
        var current = parseFloat(getComputedStyle(el).getPropertyValue('--ba')) || 50;
        if (e.key === 'ArrowLeft') { el.style.setProperty('--ba', Math.max(0, current - 5) + '%'); e.preventDefault(); }
        if (e.key === 'ArrowRight') { el.style.setProperty('--ba', Math.min(100, current + 5) + '%'); e.preventDefault(); }
      });
    });
  }

  // =========================================================
  // Product filter
  // =========================================================
  function initProductFilter() {
    var filterButtons = document.querySelectorAll('.product-filter button');
    if (!filterButtons.length) return;
    var cards = document.querySelectorAll('.product-card[data-cat]');
    filterButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterButtons.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var f = btn.getAttribute('data-filter');
        cards.forEach(function (c) {
          var match = (f === 'all' || c.getAttribute('data-cat') === f);
          c.classList.toggle('is-hidden', !match);
        });
        track('filter_products', { filter: f });
      });
    });
  }

  // =========================================================
  // Recently-viewed (cross-page)
  // =========================================================
  function initRecentlyViewed() {
    var info = document.querySelector('[data-product-info]');
    if (info) {
      var item = {
        slug: info.getAttribute('data-product-slug'),
        name: info.getAttribute('data-product-name'),
        image: info.getAttribute('data-product-image'),
      };
      try {
        var list = readJSON(KEY_RECENT, []);
        list = list.filter(function (i) { return i.slug !== item.slug; });
        list.unshift(item);
        if (list.length > 6) list.length = 6;
        writeJSON(KEY_RECENT, list);
      } catch (e) {}
    }
    var host = document.querySelector('[data-recently-viewed]');
    if (!host) return;
    try {
      var list = readJSON(KEY_RECENT, []);
      var slug = (info && info.getAttribute('data-product-slug')) || '';
      list = list.filter(function (i) { return i.slug !== slug; });
      if (!list.length) return;
      host.innerHTML = '<div class="container"><h4 style="margin-bottom:1rem">Recently viewed</h4>' +
        '<div class="recently-viewed-row">' + list.map(productCardMini).join('') + '</div></div>';
    } catch (e) {}
  }

  function productCardMini(i) {
    var base = i.image ? i.image.replace(/\.(jpe?g|png)$/i, '') : '';
    var p = base ? '<picture><source srcset="' + base + '.webp" type="image/webp"><img src="' + i.image + '" alt="' + i.name + '" loading="lazy"></picture>' : '';
    return '<a class="recently-viewed-card" href="' + i.slug + '">' + p + '<div class="name">' + i.name + '</div></a>';
  }

  // =========================================================
  // Favourites (heart)
  // =========================================================
  function initFavourites() {
    var favs = readJSON(KEY_FAVS, []);
    document.querySelectorAll('[data-fav]').forEach(function (btn) {
      var slug = btn.getAttribute('data-fav');
      if (favs.indexOf(slug) > -1) btn.classList.add('is-fav');
      btn.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        var f = readJSON(KEY_FAVS, []);
        var idx = f.indexOf(slug);
        if (idx > -1) { f.splice(idx, 1); btn.classList.remove('is-fav'); }
        else {
          f.push(slug); btn.classList.add('is-fav');
          // collect product card data for footer strip
          var card = btn.closest('.product-card, [data-product-slug]');
          if (card) {
            var name = card.querySelector('h3') ? card.querySelector('h3').textContent : slug;
            var img = card.querySelector('img');
            cacheProductMeta(slug, { slug: slug, name: name, image: img ? img.getAttribute('src') : '' });
          }
        }
        writeJSON(KEY_FAVS, f);
        renderFavourites();
        track('favourite_toggle', { slug: slug, on: idx === -1 });
      });
    });
    renderFavourites();
  }

  function renderFavourites() {
    var host = document.querySelector('[data-favourites]');
    if (!host) return;
    var f = readJSON(KEY_FAVS, []);
    if (!f.length) { host.innerHTML = ''; return; }
    var meta = readJSON('octagreen_meta', {});
    var items = f.map(function (s) { return meta[s]; }).filter(Boolean);
    if (!items.length) { host.innerHTML = ''; return; }
    host.innerHTML = '<div class="container"><h4 style="margin-bottom:1rem">❤ Your favourites</h4>' +
      '<div class="recently-viewed-row">' + items.map(productCardMini).join('') + '</div></div>';
  }

  function cacheProductMeta(slug, item) {
    var meta = readJSON('octagreen_meta', {});
    meta[slug] = item;
    writeJSON('octagreen_meta', meta);
  }

  // =========================================================
  // Compare (drawer + button toggle)
  // =========================================================
  function initCompare() {
    var cmp = readJSON(KEY_CMP, []);
    document.querySelectorAll('[data-cmp]').forEach(function (btn) {
      var slug = btn.getAttribute('data-cmp');
      if (cmp.indexOf(slug) > -1) btn.classList.add('is-cmp');
      btn.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        var list = readJSON(KEY_CMP, []);
        var idx = list.indexOf(slug);
        if (idx > -1) { list.splice(idx, 1); btn.classList.remove('is-cmp'); }
        else {
          if (list.length >= 3) { toast('You can compare up to 3 products at once.'); return; }
          list.push(slug); btn.classList.add('is-cmp');
          var card = btn.closest('.product-card');
          if (card) {
            var name = card.querySelector('h3') ? card.querySelector('h3').textContent : slug;
            var img = card.querySelector('img');
            cacheProductMeta(slug, { slug: slug, name: name, image: img ? img.getAttribute('src') : '' });
          }
        }
        writeJSON(KEY_CMP, list);
        renderCompareDrawer();
        track('compare_toggle', { slug: slug, on: idx === -1 });
      });
    });
    var clear = document.getElementById('compare-drawer-clear');
    if (clear) clear.addEventListener('click', function () {
      writeJSON(KEY_CMP, []);
      document.querySelectorAll('[data-cmp].is-cmp').forEach(function (b) { b.classList.remove('is-cmp'); });
      renderCompareDrawer();
    });
    renderCompareDrawer();
  }

  function renderCompareDrawer() {
    var drawer = document.getElementById('compare-drawer');
    if (!drawer) return;
    var list = readJSON(KEY_CMP, []);
    if (!list.length) { drawer.hidden = true; return; }
    drawer.hidden = false;
    var meta = readJSON('octagreen_meta', {});
    var host = document.getElementById('compare-drawer-list');
    if (!host) return;
    host.innerHTML = list.map(function (s) {
      var m = meta[s] || { name: s, image: '' };
      var base = m.image ? m.image.replace(/\.(jpe?g|png)$/i, '') : '';
      var pic = m.image ? '<picture><source srcset="' + base + '.webp" type="image/webp"><img src="' + m.image + '" alt="' + m.name + '"></picture>' : '';
      return '<div class="compare-drawer-item">' + pic + '<span>' + m.name + '</span><button class="compare-drawer-remove" data-remove="' + s + '" aria-label="Remove">×</button></div>';
    }).join('');
    host.querySelectorAll('[data-remove]').forEach(function (b) {
      b.addEventListener('click', function () {
        var s = b.getAttribute('data-remove');
        var l = readJSON(KEY_CMP, []);
        var i = l.indexOf(s); if (i > -1) l.splice(i, 1);
        writeJSON(KEY_CMP, l);
        document.querySelectorAll('[data-cmp="' + s + '"]').forEach(function (btn) { btn.classList.remove('is-cmp'); });
        renderCompareDrawer();
      });
    });
  }

  // Compare page renderer
  function initComparePageRender() {
    var host = document.getElementById('compare-host');
    var registryEl = document.getElementById('product-registry');
    if (!host || !registryEl) return;
    var registry = {};
    try { registry = JSON.parse(registryEl.textContent); } catch (e) {}
    var list = readJSON(KEY_CMP, []);
    if (!list.length) return; // already shows empty message
    var rows = ['type', 'finish', 'coverage', 'voc', 'washability'];
    var rowLabels = { type: 'Type', finish: 'Finish', coverage: 'Coverage', voc: 'VOC', washability: 'Washability' };
    var headers = list.map(function (s) {
      var p = registry[s] || { name: s, image: '' };
      var base = p.image ? p.image.replace(/\.(jpe?g|png)$/i, '') : '';
      var pic = p.image ? '<picture><source srcset="' + base + '.webp" type="image/webp"><img src="' + p.image + '" alt="' + p.name + '" loading="lazy"></picture>' : '';
      return '<th><div class="compare-card">' + pic + '<div class="compare-name"><strong>' + p.name + '</strong></div><a href="' + s + '" class="btn btn-outline btn-sm">View product →</a><button class="btn btn-ghost btn-sm" data-remove-cmp="' + s + '">Remove</button></div></th>';
    }).join('');
    var bodyRows = rows.map(function (key) {
      return '<tr><th class="compare-row-label">' + rowLabels[key] + '</th>' +
        list.map(function (s) {
          var p = registry[s] || {};
          return '<td>' + (p[key] || '—') + '</td>';
        }).join('') + '</tr>';
    }).join('');
    var highlightRow = '<tr><th class="compare-row-label">Highlight</th>' +
      list.map(function (s) {
        var p = registry[s] || {};
        return '<td>' + (p.highlight || '—') + '</td>';
      }).join('') + '</tr>';

    host.innerHTML = '<div class="compare-table-wrap"><table class="compare-table"><thead><tr><th></th>' + headers + '</tr></thead><tbody>' + bodyRows + highlightRow + '</tbody></table></div>' +
      '<div class="text-center mt-3"><a href="contact-quote.html" class="btn btn-primary">Get a quote with these →</a> <a href="index.html#products" class="btn btn-outline">Browse more products</a></div>';

    host.querySelectorAll('[data-remove-cmp]').forEach(function (b) {
      b.addEventListener('click', function () {
        var s = b.getAttribute('data-remove-cmp');
        var l = readJSON(KEY_CMP, []);
        var i = l.indexOf(s); if (i > -1) l.splice(i, 1);
        writeJSON(KEY_CMP, l);
        renderCompareDrawer();
        location.reload();
      });
    });
  }

  // =========================================================
  // Chatbot (scripted decision tree, no backend)
  // =========================================================
  var chatTree = {
    start: {
      msg: '👋 Hi! I\'m the Octagreen helper. What can I help you with today?',
      options: [
        { label: '🎨 Pick a paint colour', next: 'colour' },
        { label: '🧮 Calculate paint needed', next: 'calc' },
        { label: '🛡 Waterproofing question', next: 'water' },
        { label: '▶ Watch the Izogreen demo', url: 'izonil.html#vis-stage' },
        { label: '📍 Find a dealer', next: 'dealer' },
        { label: '💬 Talk to an expert', next: 'expert' },
      ],
    },
    colour: {
      msg: 'Great! You can take our 60-second quiz, or jump straight into the visualizer.',
      options: [
        { label: '📋 Take colour quiz', url: 'quiz.html' },
        { label: '🖌 Open visualizer', url: 'visualizer.html' },
        { label: '🎨 Browse palette', url: 'colours.html' },
        { label: '← Back', next: 'start' },
      ],
    },
    calc: {
      msg: 'Tell us your room dimensions — our calculator will tell you exactly how much paint you need.',
      options: [
        { label: '🧮 Open calculator', url: 'calculator.html' },
        { label: '← Back', next: 'start' },
      ],
    },
    water: {
      msg: "Octagreen makes two waterproofing products: Izonil (a waterproof breathable plaster) and Ultra Mastic Coat (an elastomeric membrane). What's the surface?",
      options: [
        { label: 'Terrace / roof', next: 'water_roof' },
        { label: 'Walls / leakage', next: 'water_walls' },
        { label: '💬 Just talk to expert', next: 'expert' },
        { label: '← Back', next: 'start' },
      ],
    },
    water_roof: {
      msg: 'For terraces and roofs we usually recommend Ultra Mastic Coat — multiple coats same-day, UV-resistant, walks-on-able.',
      options: [
        { label: 'Open Ultra Mastic Coat', url: 'ultramasticcoat.html' },
        { label: '💬 Get a quote', url: 'contact-quote.html' },
        { label: '← Back', next: 'water' },
      ],
    },
    water_walls: {
      msg: 'For wet walls and rising damp, Izonil is the right call — replaces both plaster and waterproof membrane in one step.',
      options: [
        { label: 'Open Izonil', url: 'izonil.html' },
        { label: '💬 Get a quote', url: 'contact-quote.html' },
        { label: '← Back', next: 'water' },
      ],
    },
    dealer: {
      msg: 'We have authorised dealers across India. Drop us a note with your city and we will share the nearest one.',
      options: [
        { label: '✉ Contact us', url: 'contact.html' },
        { label: 'Become a dealer', url: 'BeADealer.html' },
        { label: '← Back', next: 'start' },
      ],
    },
    expert: {
      msg: 'Our team is on call Mon–Sat, 9:30 AM – 5:30 PM IST. Pick a channel:',
      options: [
        { label: '💬 WhatsApp now', url: 'https://wa.me/918606511141?text=Hi%20Octagreen' },
        { label: '📞 Call +91 86065 11141', url: 'tel:+918606511141' },
        { label: '✉ Send a message', url: 'contact.html' },
        { label: '← Back', next: 'start' },
      ],
    },
  };

  function initChatbot() {
    var toggle = document.getElementById('chatbot-toggle');
    var panel = document.querySelector('.chatbot-panel');
    var body = document.getElementById('chatbot-body');
    if (!toggle || !panel || !body) return;
    var open = false;
    var step = 'start';

    toggle.addEventListener('click', function () {
      open = !open;
      panel.classList.toggle('is-open', open);
      panel.setAttribute('aria-hidden', open ? 'false' : 'true');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.classList.toggle('is-open', open);
      if (open && body.children.length === 0) {
        renderStep('start');
      }
      track('chatbot_toggle', { open: open });
    });

    function renderStep(key) {
      step = key;
      var node = chatTree[key];
      if (!node) return;
      addBubble('bot', node.msg);
      addOptions(node.options);
    }

    function addBubble(who, text) {
      var b = document.createElement('div');
      b.className = 'chat-bubble chat-' + who;
      b.innerHTML = text;
      body.appendChild(b);
      requestAnimationFrame(function () { body.scrollTop = body.scrollHeight; });
    }

    function addOptions(options) {
      var wrap = document.createElement('div');
      wrap.className = 'chat-options';
      options.forEach(function (o) {
        var btn = document.createElement('button');
        btn.className = 'chat-option';
        btn.textContent = o.label;
        btn.addEventListener('click', function () {
          // freeze previous options
          wrap.querySelectorAll('button').forEach(function (b) { b.disabled = true; b.classList.toggle('is-chosen', b === btn); });
          addBubble('user', o.label);
          if (o.url) {
            track('chatbot_route', { to: o.url });
            setTimeout(function () { window.location.href = o.url; }, 400);
          } else if (o.next) {
            setTimeout(function () { renderStep(o.next); }, 400);
          }
        });
        wrap.appendChild(btn);
      });
      body.appendChild(wrap);
      requestAnimationFrame(function () { body.scrollTop = body.scrollHeight; });
    }
  }

  // =========================================================
  // Confetti (paint splash on form success)
  // =========================================================
  function burstConfetti() {
    if (prefersReduced) return;
    var canvas = document.querySelector('.confetti-canvas');
    if (!canvas) return;
    canvas.classList.add('is-active');
    var w = canvas.width = window.innerWidth;
    var h = canvas.height = window.innerHeight;
    var ctx = canvas.getContext('2d');
    var colors = ['#2D8E5F', '#4ABB7E', '#A4B79B', '#F4A949', '#365C73', '#FFFFFF'];
    var count = 120;
    var particles = [];
    for (var i = 0; i < count; i++) {
      particles.push({
        x: w / 2, y: h / 2.4,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 12 - 6,
        g: 0.3 + Math.random() * 0.2,
        size: 6 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI,
        rv: (Math.random() - 0.5) * 0.3,
        life: 1,
      });
    }
    var start = performance.now();
    (function loop(t) {
      var dt = 16 / 1000;
      ctx.clearRect(0, 0, w, h);
      var alive = false;
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        if (p.life <= 0) continue;
        alive = true;
        p.vy += p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rv;
        p.life -= dt * 0.4;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
      if (alive && (performance.now() - start) < 4000) requestAnimationFrame(loop);
      else { ctx.clearRect(0, 0, w, h); canvas.classList.remove('is-active'); }
    })();
  }
  window.OCTAGREEN_CONFETTI = burstConfetti;

  // =========================================================
  // Forms (with confetti on success)
  // =========================================================
  function initForms() {
    var forms = document.querySelectorAll('form[data-form="lead"]');
    forms.forEach(function (form) {
      form.dataset.rendered = Date.now();

      // Pre-fill from URL params (e.g., ?colour=... or ?area=...)
      var params = new URLSearchParams(window.location.search);
      var prefillMessage = '';
      if (params.get('colour')) prefillMessage += 'Colour preference: ' + params.get('colour') + '\n';
      if (params.get('area')) prefillMessage += 'Area: ' + params.get('area') + '\n';
      if (params.get('service')) prefillMessage += 'Product/service: ' + params.get('service') + '\n';
      if (prefillMessage) {
        var msg = form.querySelector('textarea[name="message"]');
        if (msg && !msg.value) msg.value = prefillMessage;
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var status = form.querySelector('.form-status');
        var btn = form.querySelector('button[type="submit"], button.btn');
        var hp = form.querySelector('input[name="company_website"]');
        if (hp && hp.value) return;
        var rendered = parseInt(form.dataset.rendered || '0', 10);
        if (Date.now() - rendered < 2000) return;
        if (!validate(form, status)) return;

        var endpoint = form.getAttribute('data-endpoint') || window.OCTAGREEN_FORM_ENDPOINT || '';
        var data = new FormData(form);
        if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = 'Sending…'; }

        if (endpoint && endpoint.indexOf('http') === 0) {
          fetch(endpoint, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
            .then(function (r) { if (r.ok) success(); else fallbackMailto(); })
            .catch(fallbackMailto);
        } else {
          fallbackMailto();
        }

        function success() {
          if (status) { status.className = 'form-status is-success'; status.textContent = 'Thanks — your message was sent. Our team will get back to you within one business day.'; }
          form.reset();
          if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || 'Send'; }
          burstConfetti();
          track('form_submit', { form: form.getAttribute('data-name') || 'lead' });
        }

        function fallbackMailto() {
          var name = (data.get('name') || '').toString().trim();
          var email = (data.get('email') || '').toString().trim();
          var phone = (data.get('phone') || '').toString().trim();
          var subject = (data.get('subject') || 'Enquiry from octagreennano.com').toString().trim();
          var message = (data.get('message') || '').toString().trim();
          var quoteFor = (data.get('quote_for') || '').toString().trim();
          var city = (data.get('city') || '').toString().trim();
          var lines = [];
          if (name) lines.push('Name: ' + name);
          if (email) lines.push('Email: ' + email);
          if (phone) lines.push('Phone: ' + phone);
          if (city) lines.push('City: ' + city);
          if (quoteFor) lines.push('Service: ' + quoteFor);
          lines.push('');
          lines.push(message);
          var to = form.getAttribute('data-mailto') || 'mail@octagreennano.com';
          var href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
          window.location.href = href;
          if (status) { status.className = 'form-status is-success'; status.textContent = 'Opening your email app — please send the prepared message. Or call us at +91 86065 11141.'; }
          if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || 'Send'; }
          burstConfetti();
          track('form_mailto_fallback', { form: form.getAttribute('data-name') || 'lead' });
        }
      });
    });
  }

  function validate(form, status) {
    var ok = true;
    form.querySelectorAll('[required]').forEach(function (el) {
      if (!el.value || (el.type === 'email' && !/^\S+@\S+\.\S+$/.test(el.value))) {
        el.style.borderColor = 'var(--c-danger)';
        ok = false;
      } else { el.style.borderColor = ''; }
    });
    if (!ok && status) { status.className = 'form-status is-error'; status.textContent = 'Please fill in all required fields with valid information.'; }
    return ok;
  }

  function initYear() {
    var y = new Date().getFullYear();
    document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = y; });
  }

  // =========================================================
  // Helpers
  // =========================================================
  function readJSON(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch (e) { return fallback; } }
  function writeJSON(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }
  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'toast'; t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('is-visible'); });
    setTimeout(function () { t.classList.remove('is-visible'); setTimeout(function () { t.remove(); }, 400); }, 2200);
  }
  window.OCTAGREEN_TOAST = toast;
})();
