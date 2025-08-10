// Immediately redirect from old Gordian category URL to new section
(function() {
  // Check if current URL starts with /categories/the-gordian-magazine
  var currentPath = window.location.pathname;
  if (currentPath.toLowerCase().indexOf('/categories/the-gordian-magazine') === 0) {
    window.location.href = '/gordian/';
  }
})();
