(function () {
  var headers = document.querySelectorAll('.site-header, .page-header');
  if (!headers.length) return;

  var COMPACT_AT = 120;
  var EXPAND_AT = 16;
  var COOLDOWN_MS = 450;

  var isCompact = false;
  var suppressUntil = 0;
  var ticking = false;
  var mobileMq = window.matchMedia('(max-width: 768px)');

  function readCompact(header) {
    return header.classList.contains('is-compact');
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

  function update() {
    ticking = false;
    if (Date.now() < suppressUntil) return;

    var y = window.scrollY;
    var target = resolveTarget(y);
    applyCompact(target);
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  function syncFromDom() {
    isCompact = readCompact(headers[0]);
  }

  function onBreakpointChange() {
    suppressUntil = 0;
    syncFromDom();
    update();
  }

  syncFromDom();
  update();

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  if (mobileMq.addEventListener) {
    mobileMq.addEventListener('change', onBreakpointChange);
  } else if (mobileMq.addListener) {
    mobileMq.addListener(onBreakpointChange);
  }
})();
