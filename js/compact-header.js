(function () {
  var headers = document.querySelectorAll('.site-header, .page-header');
  if (!headers.length) return;

  var COMPACT_AT = 96;
  var EXPAND_AT = 12;
  var COOLDOWN_MS = 400;

  var isCompact = false;
  var suppressUntil = 0;
  var ticking = false;

  function getScrollY() {
    return (
      window.pageYOffset ||
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0
    );
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

  var anchor = headers[0];
  var sentinel = document.createElement('div');
  sentinel.className = 'header-scroll-sentinel';
  sentinel.setAttribute('aria-hidden', 'true');
  anchor.insertAdjacentElement('afterend', sentinel);

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
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

    window.addEventListener('resize', syncAfterLayout, { passive: true });

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', syncAfterLayout, { passive: true });
    }
  } else {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }

  applyCompact(resolveTarget(getScrollY()));
})();
