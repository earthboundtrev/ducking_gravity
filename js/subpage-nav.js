(function () {
  var mobileMq = window.matchMedia('(max-width: 768px)');

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
    menu.classList.add('nav-dropdown-menu--portaled');
  }

  function unportalMenu(dropdown, menu) {
    if (menu.dataset.portaled !== 'true') return;
    var placeholder = dropdown._menuPlaceholder;
    if (placeholder && placeholder.parentNode) {
      placeholder.parentNode.insertBefore(menu, placeholder);
      placeholder.remove();
    }
    delete dropdown._menuPlaceholder;
    delete menu.dataset.portaled;
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
    var menu = dropdown.querySelector('.nav-dropdown-menu');
    if (!menu) return;

    if (!dropdown.classList.contains('active') || !needsPortaledMenu(dropdown)) {
      unportalMenu(dropdown, menu);
      clearMenuStyles(menu);
      return;
    }

    var header = dropdown.closest('.site-header, .page-header');
    var trigger = dropdown.querySelector(':scope > a');
    if (!header || !trigger) return;

    portalMenu(dropdown, menu);

    var headerRect = header.getBoundingClientRect();

    menu.style.position = 'fixed';
    menu.style.top = Math.round(headerRect.bottom + 4) + 'px';
    menu.style.left = '0.75rem';
    menu.style.right = '0.75rem';
    menu.style.width = 'auto';
    menu.style.maxWidth = 'none';
    menu.style.transform = 'none';
    menu.style.minWidth = '0';
    menu.style.zIndex = '500';
  }

  function positionAllActive() {
    document.querySelectorAll('.nav-dropdown.active').forEach(positionDropdownMenu);
    document.querySelectorAll('.nav-dropdown:not(.active)').forEach(function (dropdown) {
      var menu = dropdown.querySelector('.nav-dropdown-menu');
      if (menu) {
        unportalMenu(dropdown, menu);
        clearMenuStyles(menu);
      }
    });
  }

  function closeDropdown(dropdown) {
    dropdown.classList.remove('active');
    var menu = dropdown.querySelector('.nav-dropdown-menu');
    if (menu) {
      unportalMenu(dropdown, menu);
      clearMenuStyles(menu);
    }
  }

  function closeAllExcept(except) {
    document.querySelectorAll('.nav-dropdown.active').forEach(function (dropdown) {
      if (dropdown !== except) closeDropdown(dropdown);
    });
  }

  function isDropdownInteraction(target) {
    if (!target || !target.closest) return false;
    return !!(
      target.closest('.nav-dropdown') ||
      target.closest('.nav-dropdown-menu--portaled')
    );
  }

  function openDropdown(dropdown) {
    closeAllExcept(dropdown);
    dropdown.classList.add('active');
    requestAnimationFrame(function () {
      requestAnimationFrame(positionAllActive);
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
    var dropdownLink = dropdown.querySelector(':scope > a');
    if (!dropdownLink) return;

    dropdownLink.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleDropdown(dropdown);
    });

    dropdown.querySelectorAll('.nav-dropdown-menu a').forEach(function (item) {
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
      setTimeout(function () {
        if (!isDropdownInteraction(e.target)) {
          document.querySelectorAll('.nav-dropdown.active').forEach(closeDropdown);
        }
      }, 0);
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
