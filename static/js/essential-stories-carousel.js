// Essential Stories Carousel functionality
(function () {
  "use strict";

  function initCarousel() {
    const carousel = document.querySelector(".essential-stories-grid");
    if (!carousel) return;

    const prevButton = document.querySelector(".essential-prev");
    const nextButton = document.querySelector(".essential-next");

    if (!prevButton || !nextButton) return;

    const firstCard = carousel.querySelector(".article-card");
    if (!firstCard) return;

    const cardWidth = firstCard.offsetWidth + 20; // Card width + gap

    // Scroll by one card width
    prevButton.addEventListener("click", function () {
      carousel.scrollBy({ left: -cardWidth, behavior: "smooth" });
    });

    nextButton.addEventListener("click", function () {
      carousel.scrollBy({ left: cardWidth, behavior: "smooth" });
    });

    // Touch and swipe functionality
    let isDown = false;
    let startX;
    let scrollLeft;
    let startTime;
    let velocity = 0;
    let hasMoved = false;

    // Touch start / Mouse down
    const handleStart = function (e) {
      isDown = true;
      hasMoved = false;
      carousel.style.cursor = "grabbing";
      carousel.style.scrollSnapType = "none"; // Disable snap during drag

      startX =
        (e.type === "touchstart" ? e.touches[0].pageX : e.pageX) -
        carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
      startTime = Date.now();
      velocity = 0;
    };

    // Touch move / Mouse move
    const handleMove = function (e) {
      if (!isDown) return;

      const x =
        (e.type === "touchmove" ? e.touches[0].pageX : e.pageX) -
        carousel.offsetLeft;
      const walk = (x - startX) * 1.5; // Scroll speed multiplier

      // If user has moved more than 5px, consider it a drag
      if (Math.abs(walk) > 5) {
        hasMoved = true;
        e.preventDefault();
      }

      const currentScrollLeft = scrollLeft - walk;
      carousel.scrollLeft = currentScrollLeft;

      // Calculate velocity for momentum
      const currentTime = Date.now();
      const timeElapsed = currentTime - startTime;
      if (timeElapsed > 0) {
        velocity = walk / timeElapsed;
      }
    };

    // Touch end / Mouse up
    const handleEnd = function (e) {
      if (!isDown) return;
      isDown = false;
      carousel.style.cursor = "grab";

      // Re-enable scroll snap
      setTimeout(() => {
        carousel.style.scrollSnapType = "x mandatory";
      }, 50);

      // Apply momentum based on velocity
      if (Math.abs(velocity) > 0.5) {
        const momentumDistance = velocity * 200; // Adjust momentum strength
        carousel.scrollBy({
          left: -momentumDistance,
          behavior: "smooth",
        });
      }
    };

    // Prevent click if dragged
    const handleClick = function (e) {
      if (hasMoved) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Mouse events
    carousel.addEventListener("mousedown", handleStart);
    carousel.addEventListener("mousemove", handleMove);
    carousel.addEventListener("mouseup", handleEnd);
    carousel.addEventListener("mouseleave", handleEnd);

    // Touch events
    carousel.addEventListener("touchstart", handleStart, { passive: true });
    carousel.addEventListener("touchmove", handleMove, { passive: false });
    carousel.addEventListener("touchend", handleEnd);

    // Prevent clicks after dragging
    carousel.addEventListener("click", handleClick, true);

    // Set initial cursor
    carousel.style.cursor = "grab";
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCarousel);
  } else {
    initCarousel();
  }
})();
