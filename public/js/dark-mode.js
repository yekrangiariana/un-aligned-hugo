/**
 * Dark Mode Toggle Functionality
 * Handles switching between light and dark modes
 * Last updated: May 11, 2025
 */

// Apply dark mode immediately (before page rendering) to avoid flashing
(function () {
  if (localStorage.getItem("simpleDarkMode") === null) {
    // Set dark mode as default on first visit
    localStorage.setItem("simpleDarkMode", "on");
    document.documentElement.classList.add("dark-mode");
    console.log("First visit: Dark mode set as default");
  } else if (localStorage.getItem("simpleDarkMode") === "on") {
    // Apply saved preference
    document.documentElement.classList.add("dark-mode");
    console.log("Applying saved dark mode preference: on");
  } else {
    console.log("Light mode applied based on preference");
  }
})();

// Very Simple Dark Mode Toggle
function toggleSimpleDarkMode() {
  document.body.classList.toggle("dark-mode");
  document.documentElement.classList.toggle("dark-mode");

  // Save the preference in localStorage
  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("simpleDarkMode", "on");
    console.log("Dark mode enabled and saved");
    console.log(
      "Body has dark-mode class:",
      document.body.classList.contains("dark-mode")
    );
  } else {
    localStorage.setItem("simpleDarkMode", "off");
    console.log("Dark mode disabled and saved");
    console.log(
      "Body has dark-mode class:",
      document.body.classList.contains("dark-mode")
    );
  }
}

// Additional check when DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log(
    "DOM loaded, dark mode state:",
    localStorage.getItem("simpleDarkMode")
  );

  // Apply to body again to ensure consistency
  if (localStorage.getItem("simpleDarkMode") === "on") {
    document.body.classList.add("dark-mode");
    console.log("DOMContentLoaded: Dark mode applied to body");
  }

  // Make sure the toggle button shows the correct state
  const isDarkMode = document.body.classList.contains("dark-mode");
  console.log("Current dark mode class applied:", isDarkMode);

  try {
    if (isDarkMode) {
      document.querySelector(".dark-icon").style.display = "none";
      document.querySelector(".light-icon").style.display = "inline-block";
    } else {
      document.querySelector(".dark-icon").style.display = "inline-block";
      document.querySelector(".light-icon").style.display = "none";
    }
  } catch (e) {
    console.error("Error updating toggle button:", e);
  }
});
