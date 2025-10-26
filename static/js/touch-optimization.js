// Global Touch Optimization for all clickable elements
document.addEventListener("DOMContentLoaded", function () {
  // Function to optimize touch interactions for an element
  function optimizeTouch(element) {
    if (!element) return;

    // Add touch-action style
    element.style.touchAction = "manipulation";

    let touchStartTime = 0;
    let touchMoved = false;
    let touchStartY = 0;

    // Handle touch start
    element.addEventListener(
      "touchstart",
      function (e) {
        touchStartTime = Date.now();
        touchMoved = false;
        touchStartY = e.touches[0].clientY;
      },
      { passive: true }
    );

    // Handle touch move (to detect scrolling)
    element.addEventListener(
      "touchmove",
      function (e) {
        const touchEndY = e.touches[0].clientY;
        const yDiff = Math.abs(touchEndY - touchStartY);

        // If moved more than 10px vertically, consider it scrolling
        if (yDiff > 10) {
          touchMoved = true;
        }
      },
      { passive: true }
    );

    // Handle touch end
    element.addEventListener("touchend", function (e) {
      const touchDuration = Date.now() - touchStartTime;

      // Only handle as click if it's a quick tap and user didn't scroll
      if (touchDuration < 500 && !touchMoved) {
        // Add visual feedback
        element.style.transform = "scale(0.98)";
        setTimeout(() => {
          element.style.transform = "";
        }, 100);

        // If it's a link or has href, don't prevent default
        if (element.tagName === "A" && element.href) {
          return;
        }

        // For buttons and other interactive elements, trigger click
        if (element.tagName === "BUTTON" || element.hasAttribute("role")) {
          e.preventDefault();
          element.click();
        }
      }
    });
  }

  // Apply touch optimization to common interactive elements
  const selectors = [
    "button:not(.lightbox-button)", // Exclude lightbox buttons as requested
    '[role="button"]:not(.lightbox-button)',
    ".btn:not(.lightbox-button)",
    ".header-button",
    ".category-nav-item a",
    ".mega-menu-links a",
    ".tag-link",
    ".pagination a",
    ".social-link",
    ".nav-link:not(.lightbox-button)",
    ".simple-button:not(.lightbox-button)",
    ".gordian-button",
  ];

  selectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      optimizeTouch(element);
    });
  });

  // Add touch optimization to dynamically added elements
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (node.nodeType === 1) {
          // Element node
          selectors.forEach((selector) => {
            // Check if the added node matches any selector
            if (node.matches && node.matches(selector)) {
              optimizeTouch(node);
            }
            // Check children of the added node
            const children =
              node.querySelectorAll && node.querySelectorAll(selector);
            if (children) {
              children.forEach((child) => optimizeTouch(child));
            }
          });
        }
      });
    });
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Optimize form interactions
  const formElements = document.querySelectorAll("input, textarea, select");
  formElements.forEach((element) => {
    element.style.touchAction = "manipulation";
  });

  // Add global touch event handlers for better responsiveness
  let lastTouchEnd = 0;
  document.addEventListener(
    "touchend",
    function (event) {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    },
    false
  );

  // Prevent zoom on double tap for specific elements
  const preventZoomElements = document.querySelectorAll(
    'button, .btn, .header-button, .category-nav-item a, [role="button"]'
  );

  preventZoomElements.forEach((element) => {
    let lastTap = 0;
    element.addEventListener("touchend", function (e) {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      if (tapLength < 500 && tapLength > 0) {
        e.preventDefault();
      }
      lastTap = currentTime;
    });
  });

  // Enhanced category navigation touch handling
  const categoryNav = document.querySelector(".category-nav");
  if (categoryNav) {
    let isScrolling = false;
    let scrollTimeout;

    categoryNav.addEventListener(
      "touchstart",
      function () {
        isScrolling = false;
      },
      { passive: true }
    );

    categoryNav.addEventListener(
      "touchmove",
      function () {
        isScrolling = true;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          isScrolling = false;
        }, 100);
      },
      { passive: true }
    );

    // Improve category link touch handling
    const categoryLinks = categoryNav.querySelectorAll("a");
    categoryLinks.forEach((link) => {
      link.addEventListener("touchend", function (e) {
        if (isScrolling) {
          e.preventDefault();
          return false;
        }
      });
    });
  }
});
