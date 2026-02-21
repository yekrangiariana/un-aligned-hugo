/**
 * Page Transition Handler
 * Provides smooth fade in/out transitions between pages
 */

(function () {
  "use strict";

  // Fade in on page load
  document.addEventListener("DOMContentLoaded", function () {
    // Check if we're coming from a transition
    const isTransitioning = sessionStorage.getItem("pageTransitioning");

    if (isTransitioning) {
      document.body.classList.add("page-loading");
      sessionStorage.removeItem("pageTransitioning");

      // Remove animation class after it completes
      setTimeout(function () {
        document.body.classList.remove("page-loading");
      }, 300);
    }
  });

  // Intercept link clicks for transitions
  document.addEventListener("click", function (e) {
    // Find if click was on a link or inside a link
    let target = e.target;
    while (target && target.tagName !== "A") {
      target = target.parentElement;
    }

    // If not a link, or is an external link, or has specific attributes, skip transition
    if (
      !target ||
      !target.href ||
      target.target === "_blank" ||
      target.href.startsWith("#") ||
      target.href.startsWith("mailto:") ||
      target.href.startsWith("tel:") ||
      target.hostname !== window.location.hostname ||
      target.id === "story-prev" || // Skip Essential Stories navigation
      target.id === "story-next" || // Skip Essential Stories navigation
      target.closest(".story-control-btn") || // Skip all story controls
      e.ctrlKey ||
      e.metaKey ||
      e.shiftKey
    ) {
      return;
    }

    // Prevent default navigation
    e.preventDefault();

    const destination = target.href;

    // Add transitioning class for fade out
    document.body.classList.add("page-transitioning");

    // Store transition state
    sessionStorage.setItem("pageTransitioning", "true");

    // Navigate after fade out animation completes
    setTimeout(function () {
      window.location.href = destination;
    }, 300);
  });

  // Handle browser back/forward buttons
  window.addEventListener("pageshow", function (event) {
    // If page is loaded from cache (back/forward navigation)
    if (event.persisted) {
      document.body.classList.remove("page-transitioning");
      document.body.classList.add("page-loading");

      setTimeout(function () {
        document.body.classList.remove("page-loading");
      }, 300);
    }
  });
})();
