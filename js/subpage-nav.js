(function () {
  document.querySelectorAll('.nav-dropdown').forEach(function (dropdown) {
    var dropdownLink = dropdown.querySelector(':scope > a');
    if (!dropdownLink) return;

    dropdownLink.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var willOpen = !dropdown.classList.contains('active');
      document.querySelectorAll('.nav-dropdown.active').forEach(function (other) {
        if (other !== dropdown) other.classList.remove('active');
      });
      dropdown.classList.toggle('active', willOpen);
    });

    document.addEventListener('click', function (e) {
      if (dropdown.classList.contains('active') && !dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });

    dropdown.querySelectorAll('.nav-dropdown-menu a').forEach(function (item) {
      item.addEventListener('click', function () {
        setTimeout(function () {
          dropdown.classList.remove('active');
        }, 100);
      });
    });
  });
})();
