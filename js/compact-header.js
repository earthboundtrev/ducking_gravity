(function () {
  var headers = document.querySelectorAll('.site-header, .page-header');
  if (!headers.length) return;

  var COMPACT_AT = 120;
  var EXPAND_AT = 16;
  var COOLDOWN_MS = 450;
  var mobileMq = window.matchMedia('(max-width: 768px)');

  var isCompact = false;
  var suppressUntil = 0;
  var ticking = false;
  var observer = null;
  var sentinel = null;

  function isMobileLayout() {
    return mobileMq.matches;
  }

  function getScrollY() {
    var y =
      window.pageYOffset ||
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    if (window.visualViewport && isMobileLayout()) {
      return Math.max(y, window.visualViewport.pageTop || 0);
    }
    return y;
  }

  function applyCompact(next) {
    if (next === isCompact) return;

    isCompact = next;
    headers.forEach(function (header) {
      header.classList.toggle('is-compact', next);
    });

    suppressUntil = Date.now() + COOLDOWN_MS;
  }

  function resolveTarget(y) {
    if (y <= EXPAND_AT) return false;
    if (y >= COMPACT_AT) return true;
    return isCompact;
  }

  function updateFromScroll() {
    if (Date.now() < suppressUntil) return;
    applyCompact(resolveTarget(getScrollY()));
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        updateFromScroll();
      });
    }
  }

  function syncAfterLayout() {
    suppressUntil = 0;
    updateFromScroll();
  }

  function wrapNavMenus() {
    document.querySelectorAll('.site-nav').forEach(function (nav) {
      if (nav.querySelector('.nav-scroll-outer')) return;
      var menu = nav.querySelector('.nav-menu');
      if (!menu) return;
      var outer = document.createElement('div');
      outer.className = 'nav-scroll-outer';
      nav.appendChild(outer);
      outer.appendChild(menu);
    });
  }

  function bindScrollListeners() {
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', syncAfterLayout, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('scroll', onScroll, { passive: true });
      window.visualViewport.addEventListener('resize', syncAfterLayout, { passive: true });
    }
  }

  function teardownObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (sentinel && sentinel.parentNode) {
      sentinel.parentNode.removeChild(sentinel);
      sentinel = null;
    }
  }

  function setupObserver() {
    teardownObserver();
    if (isMobileLayout() || !('IntersectionObserver' in window)) return;

    var anchor = headers[0];
    sentinel = document.createElement('div');
    sentinel.className = 'header-scroll-sentinel';
    sentinel.setAttribute('aria-hidden', 'true');
    anchor.insertAdjacentElement('afterend', sentinel);

    observer = new IntersectionObserver(
      function (entries) {
        if (Date.now() < suppressUntil) return;
        var entry = entries[0];
        if (!entry) return;
        applyCompact(!entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '-' + COMPACT_AT + 'px 0px 0px 0px',
        threshold: 0
      }
    );

    observer.observe(sentinel);
  }

  function onBreakpointChange() {
    setupObserver();
    syncAfterLayout();
  }

  wrapNavMenus();
  bindScrollListeners();
  setupObserver();
  updateFromScroll();

  if (mobileMq.addEventListener) {
    mobileMq.addEventListener('change', onBreakpointChange);
  } else if (mobileMq.addListener) {
    mobileMq.addListener(onBreakpointChange);
  }
})();
