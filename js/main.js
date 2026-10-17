/* ==========================================================================
   PURENINE — front-end interactions (no dependencies)
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Navigation: scrolled state + menu toggle ---------- */
  function initNav() {
    var nav = doc.getElementById('nav');
    if (!nav) return;
    var toggle = nav.querySelector('.nav__toggle');
    var panel = doc.getElementById('menu');
    var SCROLL_TRIGGER = 152;

    var logo = nav.querySelector('.nav__logo');
    // The logo fades as it reaches the homepage clock, or any element marked data-logo-stop (contact page label)
    var clock = doc.querySelector('[data-logo-stop]') || doc.querySelector('.clock');
    var FADE_GAP = 24; // start fading this many px before the logo reaches the clock

    function onScroll() {
      nav.classList.toggle('is-scrolled', window.scrollY > SCROLL_TRIGGER);
      // Logo fades out and the hamburger gets its green disc just before the logo reaches the clock
      if (logo && clock) {
        nav.classList.toggle('is-past-wall', clock.getBoundingClientRect().top <= logo.getBoundingClientRect().bottom + FADE_GAP);
      } else if (logo) {
        // Pages without the hero clock (project pages): switch once the page is scrolled a little
        nav.classList.toggle('is-past-wall', window.scrollY > 80);
      }
    }

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) {
        panel.removeAttribute('inert');
      } else {
        panel.setAttribute('inert', '');
      }
    }

    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });

    // Any menu link closes the menu, including ones that leave the page, so the
    // Back button never returns to a page with the menu still open
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  /* ---------- Live New York clock ---------- */
  function initClock() {
    var el = doc.getElementById('clock');
    if (!el) return;
    var fmt, iso;
    try {
      // Shown as US 12-hour time; the datetime attribute stays 24-hour (valid HTML)
      fmt = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/New_York'
      });
      iso = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'America/New_York'
      });
    } catch (err) {
      return;
    }
    function tick() {
      var now = new Date();
      el.textContent = fmt.format(now);
      el.setAttribute('datetime', iso.format(now));
    }
    tick();
    setInterval(tick, 10000);
  }

  /* ---------- Work data: shuffled once per page load ---------- */
  var workItems = (function () {
    var el = doc.getElementById('work-data');
    var list;
    try { list = JSON.parse(el.textContent); } catch (err) { return []; }
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = list[i]; list[i] = list[j]; list[j] = t;
    }
    return list;
  })();

  /* ---------- Infinite tickers (marquees) ---------- */
  function initTickers() {
    var tickers = doc.querySelectorAll('[data-ticker]');
    if (!tickers.length) return;

    function build(ticker) {
      var track = ticker.querySelector('.ticker__track');
      var set = track.querySelector('.ticker__set:not([aria-hidden])');
      var clones = track.querySelectorAll('.ticker__set[aria-hidden]');

      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      var setWidth = set.getBoundingClientRect().width;
      if (!setWidth) return;
      var distance = setWidth + gap;
      var needed = Math.ceil((ticker.clientWidth + distance) / distance);
      // Same size as the last build: keep the copies that are already there
      if (clones.length === needed && ticker.style.getPropertyValue('--ticker-distance') === distance + 'px') return;
      // Remove previous clones
      clones.forEach(function (n) { n.remove(); });

      for (var i = 0; i < needed; i++) {
        var clone = set.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.setAttribute('inert', '');
        clone.querySelectorAll('img').forEach(function (img) { img.alt = ''; });
        track.appendChild(clone);
      }

      var speed = parseFloat(ticker.getAttribute('data-speed')) || 50;
      ticker.style.setProperty('--ticker-distance', distance + 'px');
      ticker.style.setProperty('--ticker-duration', (distance / speed) + 's');
      if (!reduceMotion) ticker.classList.add('is-running');
    }

    tickers.forEach(function (ticker) {
      build(ticker);
      // Rebuild when images finish loading (widths may change). Only the original
      // set is watched: the copies are rebuilt from it.
      ticker.querySelectorAll('.ticker__set:not([aria-hidden]) img').forEach(function (img) {
        if (!img.complete) img.addEventListener('load', function () { build(ticker); }, { once: true });
      });
    });

    // Pause animations when off-screen (saves CPU/battery)
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var track = entry.target.querySelector('.ticker__track');
          track.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
        });
      });
      tickers.forEach(function (t) { io.observe(t); });
    }

    var lastW = window.innerWidth;
    var rt;
    window.addEventListener('resize', function () {
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      clearTimeout(rt);
      rt = setTimeout(function () { tickers.forEach(build); }, 200);
    });
  }

  /* ---------- Selected-work ring: 3D cylinder carousel ----------
     Cards sit on the inside of a cylinder that slowly turns right to left on its
     own. Sideways trackpad swipes, mouse drags and the arrow keys turn it too;
     vertical scrolling always scrolls the page. There are more
     projects than cards, so a card picks up the next project while it is
     hidden behind the viewer. */
  function initRing() {
    var el = doc.querySelector('[data-ring]');
    var spin = el && el.querySelector('[data-ring-spin]');
    if (!el || !spin) return;
    var items = workItems;
    var M = items.length;
    var ruler = doc.querySelector('.archive-ruler__ticks');
    if (!M) return;

    var R, N, STEP, SENS;
    var cards = [];
    var current = 0, target = 0, velocity = 0;
    // The ruler only follows the user's own turning (drag, swipe, keys), not the idle drift
    var autoTotal = 0, rulerCur = 0, lastRulerPx = null;
    function renderRuler() {
      if (!ruler) return;
      var goal = target - autoTotal;
      rulerCur += (goal - rulerCur) * (reduceMotion ? 1 : 0.12);
      if (Math.abs(goal - rulerCur) < 0.01) rulerCur = goal;
      var x = Math.round(-rulerCur * R * Math.PI / 180 * 10) / 10;
      if (x === lastRulerPx) return;
      lastRulerPx = x;
      ruler.style.setProperty('--ruler-x', x + 'px');
    }
    var running = false, visible = true;

    function px(name) { return parseFloat(getComputedStyle(el).getPropertyValue(name)) || 0; }
    function mod(a, b) { return ((a % b) + b) % b; }

    function build() {
      R = px('--radius');
      var cw = px('--card-w');
      N = Math.max(5, Math.round((2 * Math.PI * R) / (cw * 1.07)));
      STEP = 360 / N;
      SENS = 90 / R; // degrees per dragged pixel
      spin.textContent = '';
      cards = [];
      lastAngle = null;
      for (var i = 0; i < N; i++) {
        var b = doc.createElement('div');
        b.className = 'ring__card';
        b.style.transform = 'rotateY(' + (i * STEP) + 'deg) translateZ(' + (-R) + 'px)';
        var img = doc.createElement('img');
        img.alt = '';
        img.draggable = false;
        img.decoding = 'async';
        b.appendChild(img);
        spin.appendChild(b);
        cards.push({ el: b, img: img, idx: -1 });
      }
      render();
    }

    // Which project a card shows: consecutive along the visible arc; it changes
    // only when the card crosses the back of the cylinder, out of sight.
    function itemFor(i) {
      var t = current + i * STEP;
      var lap = Math.floor((t + 180) / 360);
      return mod(i - lap * N, M);
    }

    var lastAngle = null;
    function render() {
      var a = Math.round(current * 100) / 100;
      if (a === lastAngle) return; // nothing moved: skip style writes
      lastAngle = a;
      spin.style.transform = 'translateZ(' + R + 'px) rotateY(' + a + 'deg)';
      for (var i = 0; i < cards.length; i++) {
        var idx = itemFor(i);
        var c = cards[i];
        if (idx !== c.idx) {
          c.idx = idx;
          c.img.src = items[idx].s;
          c.img.alt = items[idx].t;
        }
      }
    }

    var AUTO_PX = 36; // idle drift: cards travel right to left at about this many px/s in the middle
    var lastFrame = 0;
    function loop(now) {
      var dt = lastFrame ? Math.min(0.05, (now - lastFrame) / 1000) : 0;
      lastFrame = now;
      if (!dragging) {
        target += velocity;
        velocity *= 0.92;
        if (Math.abs(velocity) < 0.01) velocity = 0;
        if (!reduceMotion) {
          var drift = (AUTO_PX / (R * Math.PI / 180)) * dt;
          target += drift;
          autoTotal += drift;
        }
      }
      current += (target - current) * (reduceMotion ? 1 : 0.12);
      if (Math.abs(target - current) < 0.01 && !velocity) current = target;
      render();
      renderRuler();
      if (visible && ((AUTO_PX && !reduceMotion) || current !== target || velocity || dragging)) {
        requestAnimationFrame(loop);
      } else {
        running = false;
        lastFrame = 0;
      }
    }
    function kick() {
      if (running) return;
      running = true;
      requestAnimationFrame(loop);
    }

    // Wheel / trackpad: only sideways swipes turn the ring. Vertical scrolling is
    // left alone, so the page always scrolls down normally.
    function onWheel(e) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      var unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerWidth : 1;
      e.preventDefault();
      target += e.deltaX * unit * 0.1;
      velocity = 0;
      kick();
    }
    el.addEventListener('wheel', onWheel, { passive: false });

    // Drag / flick (touch: sideways only, vertical swipes still scroll the page)
    // The ruler under the ring is a second handle: dragging or swiping it turns the ring the same way.
    var dragging = false, dragEl = null, startX = 0, startTarget = 0, lastX = 0, lastT = 0;
    function startDrag(e) {
      if (e.button !== 0) return;
      dragging = true;
      dragEl = e.currentTarget;
      startX = lastX = e.clientX;
      lastT = performance.now();
      startTarget = target;
      velocity = 0;
      dragEl.classList.add('is-dragging');
      kick();
    }
    el.addEventListener('pointerdown', startDrag);
    if (ruler) {
      ruler.addEventListener('pointerdown', startDrag);
      ruler.addEventListener('wheel', onWheel, { passive: false });
    }
    window.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      target = startTarget - dx * SENS;
      var now = performance.now();
      var dt = Math.max(8, now - lastT);
      velocity = (-(e.clientX - lastX) * SENS / dt) * 16;
      lastX = e.clientX;
      lastT = now;
    }, { passive: true });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      if (dragEl) dragEl.classList.remove('is-dragging');
      if (performance.now() - lastT > 80) velocity = 0;
      kick();
    }
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    // Keyboard
    el.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { target -= STEP; kick(); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { target += STEP; kick(); e.preventDefault(); }
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        root.classList.toggle('ring-in-view', visible);
        if (visible) kick();
      }).observe(el);
    }

    var lastW = window.innerWidth;
    window.addEventListener('resize', function () {
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      build();
    });
    build();
    kick();

    var idle = window.requestIdleCallback || function (fn) { return setTimeout(fn, 1200); };
    idle(function () {
      items.forEach(function (it) {
        var im = new Image();
        im.decoding = 'async';
        im.src = it.s;
        if (im.decode) im.decode().catch(function () {});
      });
    });
  }

  /* ---------- Word-by-word split for headline reveals ---------- */
  function initSplit() {
    doc.querySelectorAll('[data-split]').forEach(function (el) {
      // Group the content into words, keeping inline elements (e.g. a coloured
      // <span>) attached to the word they sit in.
      var words = [[]];
      Array.prototype.slice.call(el.childNodes).forEach(function (node) {
        if (node.nodeType === 3) {
          node.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { if (words[words.length - 1].length) words.push([]); }
            else words[words.length - 1].push(doc.createTextNode(part));
          });
        } else {
          words[words.length - 1].push(node);
        }
      });
      words = words.filter(function (w) { return w.length; });
      el.textContent = '';
      words.forEach(function (parts, i) {
        var span = doc.createElement('span');
        span.className = 'split-word';
        span.style.setProperty('--w-i', i);
        parts.forEach(function (n) { span.appendChild(n); });
        el.appendChild(span);
        if (i < words.length - 1) el.appendChild(doc.createTextNode(' '));
      });
    });
  }

  /* ---------- Scroll reveals ---------- */
  function initReveal() {
    var items = doc.querySelectorAll('[data-reveal], [data-split]');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Count-up numbers ---------- */
  function initCounters() {
    var nums = doc.querySelectorAll('[data-count]');
    if (!nums.length || reduceMotion || !('IntersectionObserver' in window)) return;

    function run(el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var start = null;
      var duration = 1600;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    nums.forEach(function (el) { el.textContent = '0'; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          run(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    nums.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Showreel lightbox ---------- */
  function initReel() {
    var dialog = doc.getElementById('reel-dialog');
    var openBtn = doc.querySelector('[data-reel-open]');
    if (!dialog || !openBtn || typeof dialog.showModal !== 'function') return;
    var video = dialog.querySelector('video');

    openBtn.addEventListener('click', function () {
      dialog.showModal();
      // play() on a clip that has ended starts it again from the beginning
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    });
    dialog.querySelector('[data-reel-close]').addEventListener('click', function () {
      dialog.close();
    });
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', function () {
      video.pause();
    });
  }

  /* ---------- Projects: "View more" shows the rest of the grid ---------- */
  function initProjectsMore() {
    var btn = doc.querySelector('[data-projects-more]');
    if (!btn) return;
    var grid = doc.getElementById(btn.getAttribute('aria-controls'));
    if (!grid) return;
    btn.addEventListener('click', function () {
      // The new cards rise in through the usual scroll reveal as they appear
      grid.classList.add('is-expanded');
      btn.setAttribute('aria-expanded', 'true');
      // Everything is showing now: keyboard focus moves on to the first new card
      var first = grid.querySelector('[data-more] a');
      if (first) first.focus({ preventScroll: true });
      btn.parentNode.remove();
    });
  }

  /* ---------- Services: hovering, tapping or tabbing to a row opens it ---------- */
  function initServices() {
    var box = doc.querySelector('[data-services]');
    if (!box) return;
    var items = box.querySelectorAll('.service');
    var photos = box.querySelectorAll('.services__fill');
    function activate(i) {
      items.forEach(function (it, k) { it.classList.toggle('is-active', k === i); });
      photos.forEach(function (ph, k) { ph.classList.toggle('is-active', k === i); });
    }
    items.forEach(function (item, i) {
      item.addEventListener('mouseenter', function () { activate(i); });
      item.addEventListener('click', function () { activate(i); });
      item.addEventListener('focusin', function () { activate(i); });
    });
  }

  /* ---------- Contact form: no server, so it opens the visitor's email app ---------- */
  function initContactForm() {
    var form = doc.querySelector('[data-contact-form]');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var message = form.elements.message.value.trim();
      var subject = 'Project inquiry from ' + name;
      var body = message + '\n\n' + name + '\n' + email;
      window.location.href = 'mailto:hello@purenine.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }

  /* ---------- Client notes: the quotes rotate every 4 seconds ---------- */
  function initNotes() {
    var box = doc.querySelector('[data-notes]');
    if (!box) return;
    var notes = box.querySelectorAll('.note');
    if (notes.length < 2) return;
    var current = 0;
    setInterval(function () {
      if (doc.hidden) return; // don't advance in a background tab
      notes[current].classList.remove('is-active');
      current = (current + 1) % notes.length;
      notes[current].classList.add('is-active');
    }, 4000);
  }

  /* ---------- Page transitions: a simple ~0.4s crossfade ----------
     Browsers with cross-page View Transitions crossfade the real pages (CSS
     @view-transition). Others, and pages opened as local files: fade to white
     before leaving, fade the white away on arrival. Arriving this way also
     skips the homepage loader. */
  var TRANSITION_KEY = 'pn-transition';
  var arrivedByTransition = false;
  try {
    arrivedByTransition = sessionStorage.getItem(TRANSITION_KEY) === '1';
    sessionStorage.removeItem(TRANSITION_KEY);
  } catch (err) {}
  // Backup flag in the URL (local files don't always share sessionStorage); tidy it away
  if (/[?&]pt=1\b/.test(location.search)) {
    arrivedByTransition = true;
    try {
      var clean = location.search.replace(/([?&])pt=1\b&?/, '$1').replace(/[?&]$/, '');
      history.replaceState(history.state, '', location.pathname + clean + location.hash);
    } catch (err) {}
  }
  // Back / forward button: fade in as well
  try {
    var navEntry = performance.getEntriesByType('navigation')[0];
    if (navEntry && navEntry.type === 'back_forward') arrivedByTransition = true;
  } catch (err) {}
  // Cross-page View Transitions need a real web server; opened as a local file they never run
  var nativeTransitions = 'CSSViewTransitionRule' in window && location.protocol !== 'file:';

  function initPageTransition() {
    var veil = doc.createElement('div');
    veil.className = 'page-fade';
    veil.setAttribute('aria-hidden', 'true');
    doc.body.appendChild(veil);

    // Start white (taking over from the first-paint cover), then fade it away
    function fadeIn() {
      veil.style.transition = 'none';
      veil.classList.add('is-on');
      root.classList.remove('is-arriving');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          veil.style.transition = '';
          veil.classList.remove('is-on');
        });
      });
    }
    if (arrivedByTransition && !nativeTransitions && !reduceMotion) fadeIn();
    root.classList.remove('is-arriving');

    // Back button restoring the page from the browser's cache: fade it back in too
    window.addEventListener('pageshow', function (e) {
      if (!e.persisted) return;
      if (nativeTransitions || reduceMotion) {
        veil.style.transition = 'none';
        veil.classList.remove('is-on');
      } else {
        fadeIn();
      }
    });

    doc.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== '_self') return;
      var url;
      try { url = new URL(a.getAttribute('href'), location.href); } catch (err) { return; }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.hash) return; // in-page anchor: let it scroll
      if (!/\.html?$|\/$/.test(url.pathname)) return;
      try { sessionStorage.setItem(TRANSITION_KEY, '1'); } catch (err) {}
      if (nativeTransitions || reduceMotion) return; // the browser handles the crossfade
      e.preventDefault();
      if (location.protocol === 'file:') url.searchParams.set('pt', '1');
      veil.style.transition = '';
      veil.classList.add('is-on');
      setTimeout(function () { location.href = url.href; }, 400);
    });
  }

  /* ---------- Preloader: cycle the phrases, then swipe the panel up ---------- */
  function initPreloader(done) {
    var el = doc.querySelector('.preloader');
    var text = el && el.querySelector('[data-preloader-text]');
    if (!el || !text || reduceMotion || arrivedByTransition) {
      if (el) el.remove();
      done();
      return;
    }
    var phrases = ['UX / UI.', 'Visual Design.', 'Claude Code.'];
    var HOLD = 0;       // no pause between phrases
    var IN_MS = 400;    // each letter's rise (matches the CSS)
    var IN_STEP = 18;   // stagger between letters on the way in
    var OUT_MS = 260;   // each letter's exit
    var OUT_STEP = 10;  // stagger between letters on the way out
    root.classList.add('is-preloading');

    // Letter-by-letter reveal from behind a mask line
    function show(i) {
      var phrase = phrases[i];
      text.className = 'preloader__text';
      text.textContent = '';
      text.setAttribute('aria-label', phrase);
      phrase.split('').forEach(function (ch, n) {
        var span = doc.createElement('span');
        span.className = 'preloader__letter';
        span.style.setProperty('--l-i', n);
        span.textContent = ch;
        text.appendChild(span);
      });
      var count = phrase.length;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { text.classList.add('is-in'); });
      });
      setTimeout(function () {
        text.classList.add('is-out');
        var outTime = OUT_MS + (count - 1) * OUT_STEP;
        // After the last phrase leaves, play the signature, then lift the panel
        if (i === phrases.length - 1) return setTimeout(playSignature, outTime + 120);
        setTimeout(function () { show(i + 1); }, outTime);
      }, IN_MS * 0.8 + (count - 1) * IN_STEP + HOLD);
    }

    // Hand-lettered signature clip; skipped (straight to the swipe) if it can't play
    var sig = el.querySelector('[data-preloader-sig]');
    function playSignature() {
      if (!sig) return finish();
      var over = false;
      function end() { if (!over) { over = true; setTimeout(finish, 350); } }
      sig.addEventListener('ended', end);
      sig.addEventListener('error', end);
      setTimeout(end, 4000); // safety net if the clip stalls
      sig.classList.add('is-on');
      sig.muted = true;
      sig.playbackRate = 1.5; // play the signature faster than recorded (1.76s -> ~1.2s)
      try { sig.currentTime = 0; } catch (err) {}
      var p = sig.play();
      if (p && p.catch) p.catch(end);
    }

    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      root.classList.remove('is-preloading');
      el.classList.add('is-done');
      done();
      // Only the panel's own slide counts (the words' transitionend events bubble up too)
      el.addEventListener('transitionend', function onEnd(e) {
        if (e.target !== el) return;
        el.removeEventListener('transitionend', onEnd);
        el.remove();
      });
    }

    show(0);
  }

  /* ---------- Boot ---------- */
  initSplit();
  initNav();
  initClock();
  initTickers();
  initRing();
  // Scroll reveals start as the preloader lifts, so the hero animates in on cue
  initPageTransition();
  initPreloader(function () { setTimeout(initReveal, 250); });
  initCounters();
  initReel();
  initProjectsMore();
  initServices();
  initContactForm();
  initNotes();

  requestAnimationFrame(function () {
    root.classList.add('is-loaded');
  });
})();
