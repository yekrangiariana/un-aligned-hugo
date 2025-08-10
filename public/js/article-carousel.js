/**
 * Article Card Carousel Functionality
 * Handles cycling through multiple images in article cards when carousel: true is set
 */

document.addEventListener("DOMContentLoaded", function () {
  // Find all article card carousels
  const carousels = document.querySelectorAll(".article-card-carousel");

  carousels.forEach(function (carousel) {
    const images = carousel.querySelectorAll(".carousel-image");

    // Only proceed if there are multiple images
    if (images.length <= 1) {
      return;
    }

    let currentIndex = 0;

    // Function to show next image
    function showNextImage() {
      // Hide current image
      images[currentIndex].classList.remove("active");

      // Move to next index (cycle back to 0 if at end)
      currentIndex = (currentIndex + 1) % images.length;

      // Show next image
      images[currentIndex].classList.add("active");
    }

    // Start the carousel with 2.5-second intervals
    setInterval(showNextImage, 2500);
  });
});
