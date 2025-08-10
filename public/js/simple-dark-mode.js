/**
 * Simple Dark Mode Toggle - The One File To Rule Them All
 * Created to fix the missing toggleDarkMode() function
 * Handles everything in one place to avoid conflicts
 */

// Apply dark mode immediately (before page rendering) to avoid flashing
(function () {
  // Check system preference for dark mode
  const prefersDarkMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  
  // Use a single localStorage key to avoid conflicts
  if (localStorage.getItem("darkMode") === null) {
    // Default to system preference on first visit
    if (prefersDarkMode) {
      localStorage.setItem("darkMode", "enabled");
      document.documentElement.classList.add("dark-mode");
    } else {
      localStorage.setItem("darkMode", "disabled");
    }
  } else if (localStorage.getItem("darkMode") === "enabled") {
    // Apply saved preference
    document.documentElement.classList.add("dark-mode");
  }
})();

// The main toggle function that the header button calls
function toggleDarkMode() {
  console.log("toggleDarkMode called");
  
  // Toggle dark mode class on both body and documentElement
  document.body.classList.toggle("dark-mode");
  document.documentElement.classList.toggle("dark-mode");
  
  // Save the preference
  const isDarkMode = document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
  
  // Update toggle button icons
  updateDarkModeIcons();
}

// Function to update the icon state
function updateDarkModeIcons() {
  try {
    const isDarkMode = document.body.classList.contains("dark-mode");
    const darkIcons = document.querySelectorAll(".dark-icon");
    const lightIcons = document.querySelectorAll(".light-icon");

    darkIcons.forEach((icon) => {
      icon.style.display = isDarkMode ? "none" : "inline-block";
    });

    lightIcons.forEach((icon) => {
      icon.style.display = isDarkMode ? "inline-block" : "none";
    });
  } catch (e) {
    console.error("Error updating toggle button state:", e);
  }
}

// When DOM is ready, apply dark mode to body and update icons
document.addEventListener("DOMContentLoaded", function () {
  // Apply dark mode to body if it should be enabled
  if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
  }
  
  // Update toggle button icons
  updateDarkModeIcons();
  
  // Listen for system preference changes
  if (window.matchMedia) {
    const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    if (darkModeMediaQuery.addEventListener) {
      darkModeMediaQuery.addEventListener("change", function (e) {
        // Only change if user hasn't set a preference manually
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
          updateDarkModeIcons();
        }
      });
    }
  }
});
