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

  // Update icons immediately after toggle
  updateDarkModeIcons();
}

// Function to update the icon state
function updateDarkModeIcons() {
  try {
    const isDarkMode = document.body.classList.contains("dark-mode");
    const darkIcons = document.querySelectorAll(".dark-icon");
    const lightIcons = document.querySelectorAll(".light-icon");

    console.log("Updating icons - isDarkMode:", isDarkMode);
    console.log("Found dark icons:", darkIcons.length);
    console.log("Found light icons:", lightIcons.length);

    // Update all instances of dark/light icons if there are multiple toggles
    darkIcons.forEach((icon) => {
      icon.style.display = isDarkMode ? "none" : "inline-block";
    });

    lightIcons.forEach((icon) => {
      icon.style.display = isDarkMode ? "inline-block" : "none";
    });

    console.log("Toggle button display updated");
  } catch (e) {
    console.error("Error updating toggle button state:", e);
  }
}

// Apply dark mode immediately (before page rendering) to avoid flashing
(function () {
  console.log(
    "Initial dark mode state:",
    localStorage.getItem("simpleDarkMode")
  );

  // Check system preference for dark mode
  const prefersDarkMode =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  console.log("System prefers dark mode:", prefersDarkMode);

  if (localStorage.getItem("simpleDarkMode") === null) {
    // Default to system preference on first visit
    if (prefersDarkMode) {
      localStorage.setItem("simpleDarkMode", "on");
      document.documentElement.classList.add("dark-mode");
      console.log("First visit: Dark mode applied based on system preference");
    } else {
      localStorage.setItem("simpleDarkMode", "off");
      console.log("First visit: Light mode applied based on system preference");
    }
  } else if (localStorage.getItem("simpleDarkMode") === "on") {
    // Apply saved preference
    document.documentElement.classList.add("dark-mode");
    console.log("Applying saved dark mode preference: on");
  } else {
    console.log("Light mode applied based on saved preference");
  }

  // Ensure the body gets the class too once it's loaded
  document.addEventListener("DOMContentLoaded", function () {
    console.log(
      "DOMContentLoaded - current simpleDarkMode:",
      localStorage.getItem("simpleDarkMode")
    );

    if (localStorage.getItem("simpleDarkMode") === "on") {
      document.body.classList.add("dark-mode");
      console.log("DOMContentLoaded: Dark mode applied to body");
    }

    // Update toggle button state if it exists
    updateDarkModeIcons();

    // Listen for system preference changes
    if (window.matchMedia) {
      const darkModeMediaQuery = window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

      if (darkModeMediaQuery.addEventListener) {
        darkModeMediaQuery.addEventListener("change", function (e) {
          // Only change if user hasn't set a preference
          if (localStorage.getItem("simpleDarkMode") === null) {
            if (e.matches) {
              document.body.classList.add("dark-mode");
              document.documentElement.classList.add("dark-mode");
              localStorage.setItem("simpleDarkMode", "on");
            } else {
              document.body.classList.remove("dark-mode");
              document.documentElement.classList.remove("dark-mode");
              localStorage.setItem("simpleDarkMode", "off");
            }
            updateDarkModeIcons();
          }
        });
      }
    }
  });
})();
