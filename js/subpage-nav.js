(function () {
  var mobileMq = window.matchMedia('(max-width: 768px)');
  var ignoreOutsideCloseUntil = 0;

  function isMobileNav() {
    return mobileMq.matches;
  }

  function isCompactHeader(dropdown) {
    var header = dropdown.closest('.site-header, .page-header');
    return header && header.classList.contains('is-compact');
  }

  function needsPortaledMenu(dropdown) {
    return isMobileNav() && isCompactHeader(dropdown);
  }

  function getMenu(dropdown) {
    return dropdown._menuEl || null;
  }

  function ensureNavScrollWrapper() {
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

  function portalMenu(dropdown, menu) {
    if (menu.dataset.portaled === 'true') return;
    var placeholder = document.createComment('nav-dropdown-menu');
    menu.parentNode.insertBefore(placeholder, menu);
    dropdown._menuPlaceholder = placeholder;
    document.body.appendChild(menu);
    menu.dataset.portaled = 'true';
    menu.dataset.dropdownOwner = dropdown.id || (dropdown.id = 'nav-dropdown-' + Math.random().toString(36).slice(2, 9));
    menu.classList.add('nav-dropdown-menu--portaled');
  }

  function unportalMenu(dropdown, menu) {
    if (!menu || menu.dataset.portaled !== 'true') return;
    var placeholder = dropdown._menuPlaceholder;
    if (placeholder && placeholder.parentNode) {
      placeholder.parentNode.insertBefore(menu, placeholder);
      placeholder.remove();
    }
    delete dropdown._menuPlaceholder;
    delete menu.dataset.portaled;
    delete menu.dataset.dropdownOwner;
    menu.classList.remove('nav-dropdown-menu--portaled');
  }

  function clearMenuStyles(menu) {
    menu.style.position = '';
    menu.style.top = '';
    menu.style.left = '';
    menu.style.right = '';
    menu.style.bottom = '';
    menu.style.transform = '';
    menu.style.minWidth = '';
    menu.style.maxWidth = '';
    menu.style.width = '';
    menu.style.zIndex = '';
  }

  function positionDropdownMenu(dropdown) {
    var menu = getMenu(dropdown);
    if (!menu) return;

    if (!dropdown.classList.contains('active') || !needsPortaledMenu(dropdown)) {
      unportalMenu(dropdown, menu);
      clearMenuStyles(menu);
      return;
    }

    var header = dropdown.closest('.site-header, .page-header');
    if (!header) return;

    portalMenu(dropdown, menu);

    var headerRect = header.getBoundingClientRect();

    menu.style.position = 'fixed';
    menu.style.top = Math.round(headerRect.bottom + 6) + 'px';
    menu.style.left = '50%';
    menu.style.right = 'auto';
    menu.style.width = 'min(320px, calc(100vw - 1.5rem))';
    menu.style.maxWidth = 'min(320px, calc(100vw - 1.5rem))';
    menu.style.transform = 'translateX(-50%)';
    menu.style.minWidth = '200px';
    menu.style.zIndex = '500';
  }

  function positionAllActive() {
    document.querySelectorAll('.nav-dropdown.active').forEach(positionDropdownMenu);
    document.querySelectorAll('.nav-dropdown:not(.active)').forEach(function (dropdown) {
      var menu = getMenu(dropdown);
      if (menu) {
        unportalMenu(dropdown, menu);
        clearMenuStyles(menu);
      }
    });
  }

  function closeDropdown(dropdown) {
    dropdown.classList.remove('active');
    var menu = getMenu(dropdown);
    if (menu) {
      unportalMenu(dropdown, menu);
      clearMenuStyles(menu);
    }
  }

  function closeAllDropdowns() {
    document.querySelectorAll('.nav-dropdown.active').forEach(closeDropdown);
  }

  function closeAllExcept(except) {
    document.querySelectorAll('.nav-dropdown.active').forEach(function (dropdown) {
      if (dropdown !== except) closeDropdown(dropdown);
    });
  }

  function isDropdownInteraction(target) {
    if (!target || !target.closest) return false;
    if (target.closest('.nav-dropdown')) return true;
    if (target.closest('.nav-dropdown-menu--portaled')) return true;
    return false;
  }

  function openDropdown(dropdown) {
    closeAllExcept(dropdown);
    dropdown.classList.add('active');
    requestAnimationFrame(function () {
      positionDropdownMenu(dropdown);
    });
  }

  function toggleDropdown(dropdown) {
    if (dropdown.classList.contains('active')) {
      closeDropdown(dropdown);
    } else {
      openDropdown(dropdown);
    }
  }

  ensureNavScrollWrapper();

  document.querySelectorAll('.nav-dropdown').forEach(function (dropdown) {
    var menu = dropdown.querySelector('.nav-dropdown-menu');
    var dropdownLink = dropdown.querySelector(':scope > a');
    if (!menu || !dropdownLink) return;

    dropdown._menuEl = menu;

    dropdownLink.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      ignoreOutsideCloseUntil = Date.now() + 300;
      toggleDropdown(dropdown);
    });

    menu.querySelectorAll('a').forEach(function (item) {
      item.addEventListener('click', function () {
        setTimeout(function () {
          closeDropdown(dropdown);
        }, 100);
      });
    });
  });

  document.addEventListener(
    'click',
    function (e) {
      if (Date.now() < ignoreOutsideCloseUntil) return;
      if (!isDropdownInteraction(e.target)) {
        closeAllDropdowns();
      }
    },
    false
  );

  window.addEventListener('scroll', positionAllActive, { passive: true });
  document.addEventListener('scroll', positionAllActive, { passive: true });
  window.addEventListener('resize', positionAllActive, { passive: true });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('scroll', positionAllActive, { passive: true });
    window.visualViewport.addEventListener('resize', positionAllActive, { passive: true });
  }

  if (mobileMq.addEventListener) {
    mobileMq.addEventListener('change', positionAllActive);
  }

  var headers = document.querySelectorAll('.site-header, .page-header');
  if (headers.length && 'MutationObserver' in window) {
    var observer = new MutationObserver(positionAllActive);
    headers.forEach(function (header) {
      observer.observe(header, { attributes: true, attributeFilter: ['class'] });
    });
  }
})();
