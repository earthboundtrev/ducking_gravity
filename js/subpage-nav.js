(function () {
  function isMobileNav() {
    return window.matchMedia('(max-width: 768px)').matches;
  }

  function isCompactHeader(dropdown) {
    var header = dropdown.closest('.site-header, .page-header');
    return header && header.classList.contains('is-compact');
  }

  function clearMenuPosition(menu) {
    menu.style.position = '';
    menu.style.top = '';
    menu.style.left = '';
    menu.style.right = '';
    menu.style.transform = '';
    menu.style.minWidth = '';
    menu.style.maxWidth = '';
    menu.style.zIndex = '';
  }

  function positionDropdownMenu(dropdown) {
    var menu = dropdown.querySelector('.nav-dropdown-menu');
    if (!menu) return;

    if (!dropdown.classList.contains('active') || !isMobileNav() || !isCompactHeader(dropdown)) {
      clearMenuPosition(menu);
      return;
    }

    var header = dropdown.closest('.site-header, .page-header');
    var trigger = dropdown.querySelector(':scope > a');
    if (!header || !trigger) return;

    var headerRect = header.getBoundingClientRect();
    var triggerRect = trigger.getBoundingClientRect();

    menu.style.position = 'fixed';
    menu.style.top = Math.round(headerRect.bottom + 6) + 'px';
    menu.style.left = Math.round(triggerRect.left + triggerRect.width / 2) + 'px';
    menu.style.transform = 'translateX(-50%)';
    menu.style.minWidth = Math.max(200, Math.round(triggerRect.width)) + 'px';
    menu.style.maxWidth = 'min(320px, calc(100vw - 1.5rem))';
    menu.style.zIndex = '350';
  }

  function positionAllActive() {
    document.querySelectorAll('.nav-dropdown.active').forEach(positionDropdownMenu);
    document.querySelectorAll('.nav-dropdown:not(.active) .nav-dropdown-menu').forEach(clearMenuPosition);
  }

  function closeDropdown(dropdown) {
    dropdown.classList.remove('active');
    var menu = dropdown.querySelector('.nav-dropdown-menu');
    if (menu) clearMenuPosition(menu);
  }

  function closeAllExcept(except) {
    document.querySelectorAll('.nav-dropdown.active').forEach(function (dropdown) {
      if (dropdown !== except) closeDropdown(dropdown);
    });
  }

  document.querySelectorAll('.nav-dropdown').forEach(function (dropdown) {
    var dropdownLink = dropdown.querySelector(':scope > a');
    if (!dropdownLink) return;

    dropdownLink.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var willOpen = !dropdown.classList.contains('active');
      closeAllExcept(willOpen ? dropdown : null);
      dropdown.classList.toggle('active', willOpen);
      if (willOpen) {
        requestAnimationFrame(positionAllActive);
      } else {
        var menu = dropdown.querySelector('.nav-dropdown-menu');
        if (menu) clearMenuPosition(menu);
      }
    });

    dropdown.querySelectorAll('.nav-dropdown-menu a').forEach(function (item) {
      item.addEventListener('click', function () {
        setTimeout(function () {
          closeDropdown(dropdown);
        }, 100);
      });
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown.active').forEach(closeDropdown);
    }
  });

  window.addEventListener('scroll', positionAllActive, { passive: true });
  document.addEventListener('scroll', positionAllActive, { passive: true });
  window.addEventListener('resize', positionAllActive, { passive: true });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('scroll', positionAllActive, { passive: true });
    window.visualViewport.addEventListener('resize', positionAllActive, { passive: true });
  }

  var headers = document.querySelectorAll('.site-header, .page-header');
  if (headers.length && 'MutationObserver' in window) {
    var observer = new MutationObserver(positionAllActive);
    headers.forEach(function (header) {
      observer.observe(header, { attributes: true, attributeFilter: ['class'] });
    });
  }
})();
