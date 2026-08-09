/**
 * Sticky header shrinks after in-page jumps, which pulls fragment targets under
 * the nav. Force the compact header first, then scroll with a measured offset.
 */
(function () {
  var PAD = 16;
  var headers = null;

  function getHeaders() {
    if (!headers) {
      headers = document.querySelectorAll(".site-header, .page-header");
    }
    return headers;
  }

  function preferReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function withInstantDocumentScroll(fn) {
    var root = document.documentElement;
    var previous = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    fn();
    root.style.scrollBehavior = previous;
  }

  function prepareCompactHeader() {
    var list = getHeaders();
    list.forEach(function (header) {
      header.classList.add("is-anchor-scrolling");
    });
    if (typeof window.dgSetHeaderCompact === "function") {
      window.dgSetHeaderCompact(true);
    } else {
      list.forEach(function (header) {
        header.classList.add("is-compact");
      });
    }
    // Force layout so logo/header heights are the compact sizes before measure.
    if (list[0]) list[0].getBoundingClientRect();
  }

  function clearAnchorScrolling() {
    getHeaders().forEach(function (header) {
      header.classList.remove("is-anchor-scrolling");
    });
  }

  function headerOffset() {
    var list = getHeaders();
    if (!list.length) return PAD;
    return Math.ceil(list[0].getBoundingClientRect().height) + PAD;
  }

  function scrollToEl(el, behavior) {
    if (!el) return;

    // Back-to-top / page-top anchors should go to the true top.
    if (el.id === "top" || el === document.body || el === document.documentElement) {
      withInstantDocumentScroll(function () {
        window.scrollTo({
          top: 0,
          behavior: behavior || (preferReducedMotion() ? "auto" : "smooth"),
        });
      });
      return;
    }

    prepareCompactHeader();
    var top = el.getBoundingClientRect().top + window.pageYOffset - headerOffset();
    withInstantDocumentScroll(function () {
      window.scrollTo({
        top: Math.max(0, top),
        behavior: behavior || (preferReducedMotion() ? "auto" : "smooth"),
      });
    });
    // Keep transitions disabled for a frame after scroll so settle doesn't animate tall.
    requestAnimationFrame(function () {
      requestAnimationFrame(clearAnchorScrolling);
    });
  }

  function targetFromHash(hash) {
    if (!hash || hash === "#" || hash.length < 2) return null;
    try {
      return document.querySelector(hash);
    } catch (err) {
      return null;
    }
  }

  document.addEventListener(
    "click",
    function (event) {
      var anchor = event.target.closest('a[href^="#"]');
      if (!anchor) return;
      var href = anchor.getAttribute("href");
      var target = targetFromHash(href);
      if (!target) return;
      event.preventDefault();
      history.pushState(null, "", href);
      scrollToEl(target);
    },
    true,
  );

  var originalScrollIntoView = Element.prototype.scrollIntoView;
  Element.prototype.scrollIntoView = function (arg) {
    if (this.id) {
      var behavior = "auto";
      if (arg && typeof arg === "object" && arg.behavior) behavior = arg.behavior;
      else if (arg === true) behavior = "smooth";
      scrollToEl(this, behavior === "smooth" && !preferReducedMotion() ? "smooth" : "auto");
      return;
    }
    return originalScrollIntoView.call(this, arg);
  };

  function jumpToLocationHash(behavior) {
    var target = targetFromHash(location.hash);
    if (!target) return;
    scrollToEl(target, behavior || "auto");
  }

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      jumpToLocationHash("auto");
    });
  } else {
    jumpToLocationHash("auto");
  }

  window.addEventListener("load", function () {
    if (location.hash) jumpToLocationHash("auto");
  });

  window.addEventListener("hashchange", function () {
    jumpToLocationHash("auto");
  });
})();
