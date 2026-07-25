(function () {
  var root = document.querySelector("[data-carousel]");
  if (!root) return;

  var viewport = root.querySelector(".about-carousel-viewport");
  var slides = root.querySelectorAll(".about-carousel-slide");
  var dots = root.querySelectorAll(".about-carousel-dot");
  if (!slides.length || !viewport) return;

  var index = 0;
  var intervalMs = 3500;
  var timer = null;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var landscapeHeight = window.matchMedia("(max-width: 600px)").matches ? 260 : 380;
  var maxPortraitHeight = window.matchMedia("(max-width: 600px)").matches ? 520 : 680;

  function fitActiveSlide() {
    var img = slides[index].querySelector("img");
    if (!img) return;

    function apply() {
      var width = viewport.clientWidth || img.clientWidth || 1;
      var naturalW = img.naturalWidth || width;
      var naturalH = img.naturalHeight || landscapeHeight;
      var isPortrait = naturalH > naturalW;
      var height = landscapeHeight;

      if (isPortrait) {
        // Grow the frame so the full tall image fits at the carousel width.
        height = Math.round(width * (naturalH / naturalW));
        height = Math.max(landscapeHeight, Math.min(maxPortraitHeight, height));
      }

      viewport.style.height = height + "px";
    }

    if (img.complete && img.naturalWidth) {
      apply();
    } else {
      img.addEventListener("load", apply, { once: true });
    }
  }

  function goTo(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === index);
    });
    dots.forEach(function (dot, i) {
      var active = i === index;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-selected", active ? "true" : "false");
    });
    fitActiveSlide();
  }

  function next() {
    goTo(index + 1);
  }

  function start() {
    if (reducedMotion || slides.length < 2) return;
    stop();
    timer = window.setInterval(next, intervalMs);
  }

  function stop() {
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      goTo(i);
      start();
    });
  });

  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  root.addEventListener("focusin", stop);
  root.addEventListener("focusout", function (e) {
    if (!root.contains(e.relatedTarget)) start();
  });

  window.addEventListener("resize", function () {
    landscapeHeight = window.matchMedia("(max-width: 600px)").matches ? 260 : 380;
    maxPortraitHeight = window.matchMedia("(max-width: 600px)").matches ? 520 : 680;
    fitActiveSlide();
  });

  goTo(0);
  start();
})();
