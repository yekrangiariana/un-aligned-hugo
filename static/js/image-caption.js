// Image caption popup functionality for Style 3
document.addEventListener("DOMContentLoaded", function () {
  const captionIcons = document.querySelectorAll(".image-caption-icon");

  captionIcons.forEach(function (icon) {
    icon.addEventListener("click", function () {
      const popup = this.nextElementSibling;
      if (popup && popup.classList.contains("image-caption-popup")) {
        popup.classList.toggle("show");

        // Close other open popups
        const allPopups = document.querySelectorAll(".image-caption-popup");
        allPopups.forEach(function (otherPopup) {
          if (otherPopup !== popup) {
            otherPopup.classList.remove("show");
          }
        });
      }
    });
  });

  // Close popup when clicking outside
  document.addEventListener("click", function (event) {
    if (
      !event.target.closest(".image-caption-icon") &&
      !event.target.closest(".image-caption-popup")
    ) {
      const openPopups = document.querySelectorAll(".image-caption-popup.show");
      openPopups.forEach(function (popup) {
        popup.classList.remove("show");
      });
    }
  });
});
