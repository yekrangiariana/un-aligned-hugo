/**
 * Simple Dark Mode Toggle - Handles toggle functionality only
 * Initial dark mode application is handled by inline script in head.html
 */

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

// When DOM is ready, just update icons and set up system preference listener
document.addEventListener("DOMContentLoaded", function () {
  // Update toggle button icons based on current state
  updateDarkModeIcons();

  // Listen for system preference changes
  if (window.matchMedia) {
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );
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
