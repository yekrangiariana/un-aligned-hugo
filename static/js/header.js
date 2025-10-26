// Header functionality - optimized for touch devices
document.addEventListener("DOMContentLoaded", function () {
  // Function to close the site alert
  function closeSiteAlert() {
    const alert = document.getElementById("site-alert");
    if (alert) {
      alert.style.display = "none";
      // Store in localStorage to remember the user closed it
      localStorage.setItem("siteAlertClosed", "true");
    }
  }

  // Check if alert was previously closed
  if (localStorage.getItem("siteAlertClosed") === "true") {
    const alert = document.getElementById("site-alert");
    if (alert) {
      alert.style.display = "none";
    }
  }

  // Category navigation scroll indicators
  const navContainer = document.querySelector(".category-nav");
  const leftIndicator = document.querySelector(".scroll-indicator-left");
  const rightIndicator = document.querySelector(".scroll-indicator-right");

  if (navContainer && leftIndicator && rightIndicator) {
    // Check if scrolling is possible
    function updateScrollIndicators() {
      // Show left indicator if we're not at the start
      if (navContainer.scrollLeft > 0) {
        leftIndicator.style.opacity = "1";
      } else {
        leftIndicator.style.opacity = "0";
      }

      // Show right indicator if we're not at the end
      if (
        navContainer.scrollLeft <
        navContainer.scrollWidth - navContainer.clientWidth - 2
      ) {
        rightIndicator.style.opacity = "1";
      } else {
        rightIndicator.style.opacity = "0";
      }
    }

    // Run on load
    updateScrollIndicators();

    // Run on scroll
    navContainer.addEventListener("scroll", updateScrollIndicators);

    // Run on resize (in case content width changes)
    window.addEventListener("resize", updateScrollIndicators);
  }

  // Mega Menu Popup Functionality
  const menuButton = document.getElementById("menu-popup-toggle");
  const closeButton = document.getElementById("close-menu-popup");
  const menuPopup = document.getElementById("mega-menu-popup");

  // Variables to store scroll position
  let scrollPosition = 0;

  // Helper function to check if the clicked element is a header button
  function isHeaderButton(element) {
    // Check if the element or any of its parents is a header button
    let current = element;
    while (current && current !== document.body) {
      if (
        current.classList.contains("header-button") ||
        current.classList.contains("simple-dark-toggle") ||
        current.classList.contains("header-item") ||
        current.closest(".header-items") ||
        current.closest(".header-top-buttons")
      ) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  // Function to open menu
  function openMenu() {
    // Save current scroll position
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    // Apply menu state
    menuPopup.classList.add("active");
    document.body.classList.add("menu-open");

    // Update button state
    menuButton.innerHTML = '<i class="fas fa-times"></i> Close';
    menuButton.setAttribute("title", "Close menu");
    menuButton.classList.add("active");
  }

  // Function to close menu
  function closeMenu(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Remove menu state
    menuPopup.classList.remove("active");
    document.body.classList.remove("menu-open");

    // Restore scroll position immediately
    setTimeout(() => {
      window.scrollTo(0, scrollPosition);
    }, 0);

    // Update button state
    menuButton.innerHTML = '<i class="fas fa-bars"></i> Menu';
    menuButton.setAttribute("title", "Open menu");
    menuButton.classList.remove("active");
  }

  // Function to toggle menu state
  function toggleMenu(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (menuPopup.classList.contains("active")) {
      closeMenu(event);
    } else {
      openMenu();
    }
  }

  if (menuButton && menuPopup) {
    // Add touch-action CSS to prevent zoom
    menuButton.style.touchAction = "manipulation";

    // Optimize for touch devices - use both touch and click events
    let touchStartTime = 0;
    let touchMoved = false;

    // Handle touch start
    menuButton.addEventListener(
      "touchstart",
      function (e) {
        touchStartTime = Date.now();
        touchMoved = false;
      },
      { passive: true }
    );

    // Handle touch move (to detect if user is scrolling)
    menuButton.addEventListener(
      "touchmove",
      function (e) {
        touchMoved = true;
      },
      { passive: true }
    );

    // Handle touch end
    menuButton.addEventListener("touchend", function (e) {
      e.preventDefault();

      // Only trigger if it's a quick tap (not a long press) and user didn't scroll
      const touchDuration = Date.now() - touchStartTime;
      if (touchDuration < 500 && !touchMoved) {
        toggleMenu(e);
      }
    });

    // Fallback for non-touch devices
    menuButton.addEventListener("click", function (e) {
      // Only handle click if it's not a touch device or touch events failed
      if (!("ontouchstart" in window)) {
        toggleMenu(e);
      }
    });

    // Close menu when clicking the dedicated close button (mostly for mobile)
    if (closeButton) {
      closeButton.style.touchAction = "manipulation";

      closeButton.addEventListener("touchend", function (e) {
        e.preventDefault();
        closeMenu(e);
      });

      closeButton.addEventListener("click", function (e) {
        if (!("ontouchstart" in window)) {
          closeMenu(e);
        }
      });
    }

    // Close menu when clicking outside the menu content
    document.addEventListener("touchend", function (e) {
      if (
        menuPopup.classList.contains("active") &&
        !menuPopup.contains(e.target) &&
        e.target !== menuButton &&
        !menuButton.contains(e.target) &&
        !isHeaderButton(e.target)
      ) {
        closeMenu(e);
      }
    });

    document.addEventListener("click", function (e) {
      if (!("ontouchstart" in window)) {
        if (
          menuPopup.classList.contains("active") &&
          !menuPopup.contains(e.target) &&
          e.target !== menuButton &&
          !menuButton.contains(e.target) &&
          !isHeaderButton(e.target)
        ) {
          closeMenu(e);
        }
      }
    });

    // Close menu when pressing Escape key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuPopup.classList.contains("active")) {
        closeMenu(e);
      }
    });
  }

  // Global site alert close functionality
  window.closeSiteAlert = closeSiteAlert;
});
