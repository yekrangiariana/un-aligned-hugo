/**
 * Enhanced Dark Mode Toggle for UN-aligned website
 * Updated May 11, 2025
 */

// Execute immediately
(function () {
  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    console.log("Simple dark mode initialized");

    // Apply preference before page rendering to avoid flickering
    applyDarkModePreference();

    // Listen for system preference changes
    if (window.matchMedia) {
      const darkModeMediaQuery = window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

      if (darkModeMediaQuery.addEventListener) {
        darkModeMediaQuery.addEventListener("change", function (e) {
          // Only change if user hasn't set a preference
          if (localStorage.getItem("darkMode") === null) {
            if (e.matches) {
              document.body.classList.add("dark-mode");
              document.documentElement.classList.add("dark-mode");
              localStorage.setItem("darkMode", "enabled");
            } else {
              document.body.classList.remove("dark-mode");
              document.documentElement.classList.remove("dark-mode");
              localStorage.setItem("darkMode", "disabled");
            }
            updateDarkModeIconState();
          }
        });
      }
    }

    // Make sure toggleDarkMode is available globally, regardless of when it's called
  }
})();

/**
 * Toggle dark mode - called by the onclick attribute in the header
 * Defined globally to ensure it's always available
 */
function toggleDarkMode() {
  console.log("toggleDarkMode called");

  // Toggle the class on both body and documentElement for consistency
  document.body.classList.toggle("dark-mode");
  document.documentElement.classList.toggle("dark-mode");

  // Save the preference
  const isDarkMode = document.body.classList.contains("dark-mode");
  const isGalleryPage = document.body.classList.contains("gallery-body");

  if (isGalleryPage) {
    // For gallery pages (which are dark by default)
    localStorage.setItem("darkMode", isDarkMode ? "disabled" : "enabled");
  } else {
    // For regular pages
    localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
  }

  console.log(
    "Dark mode preference saved:",
    localStorage.getItem("darkMode")
  );

  // Update icon state
  updateDarkModeIconState();
  }

  function applyDarkModePreference() {
    const preference = localStorage.getItem("darkMode");
    const isGalleryPage = document.body.classList.contains("gallery-body");
    const systemPrefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    let shouldApplyDarkMode;

    if (preference === null) {
      // No saved preference, use system preference
      shouldApplyDarkMode = systemPrefersDark;

      // Save the system preference
      localStorage.setItem(
        "darkMode",
        shouldApplyDarkMode ? "enabled" : "disabled"
      );
      console.log(
        "No preference found, using system preference:",
        shouldApplyDarkMode ? "dark" : "light"
      );
    } else if (isGalleryPage) {
      // For gallery pages (dark by default)
      shouldApplyDarkMode = preference === "disabled";
    } else {
      // For regular pages (light by default)
      shouldApplyDarkMode = preference === "enabled";
    }

    console.log("Applying dark mode:", shouldApplyDarkMode);

    if (shouldApplyDarkMode) {
      document.body.classList.add("dark-mode");
      document.documentElement.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
      document.documentElement.classList.remove("dark-mode");
    }

    // Update icon state after DOM is ready
    if (document.readyState === "complete") {
      updateDarkModeIconState();
    } else {
      window.addEventListener("load", updateDarkModeIconState);
    }
  }

  // Helper function to update icon state
  function updateDarkModeIconState() {
    try {
      const isDarkMode = document.body.classList.contains("dark-mode");
      const darkIcons = document.querySelectorAll(".dark-icon");
      const lightIcons = document.querySelectorAll(".light-icon");

      console.log("Updating icons - isDarkMode:", isDarkMode);

      // Update all instances of dark/light icons if there are multiple toggles
      darkIcons.forEach((icon) => {
        icon.style.display = isDarkMode ? "none" : "inline-block";
      });

      lightIcons.forEach((icon) => {
        icon.style.display = isDarkMode ? "inline-block" : "none";
      });
    } catch (e) {
      console.error("Error updating icon state:", e);
    }
  }
})();
