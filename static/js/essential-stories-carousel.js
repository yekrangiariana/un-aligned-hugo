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

    const cardWidth = firstCard.offsetWidth + 15; // Card width + gap

    // Read tracking functionality
    const STORAGE_KEY = "essentialStoriesRead";

    // Get read articles from localStorage
    function getReadArticles() {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }

    // Save article as read
    function markAsRead(url) {
      const readArticles = getReadArticles();
      if (!readArticles.includes(url)) {
        readArticles.push(url);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(readArticles));
      }
    }

    // Mark existing read cards on page load
    const readArticles = getReadArticles();
    const cards = carousel.querySelectorAll(".article-card");
    cards.forEach(function (card) {
      const link = card.querySelector(".article-card-link");
      if (link) {
        const href = link.getAttribute("href");
        if (readArticles.includes(href)) {
          card.classList.add("read");
        }

        // Track clicks to mark as read
        link.addEventListener("click", function () {
          markAsRead(href);
          card.classList.add("read");
        });
      }
    });

    // Button controls - smooth scroll by card width
    prevButton.addEventListener("click", function () {
      carousel.scrollBy({ left: -cardWidth, behavior: "smooth" });
    });

    nextButton.addEventListener("click", function () {
      carousel.scrollBy({ left: cardWidth, behavior: "smooth" });
    });

    // Simple drag to scroll
    let isDragging = false;
    let startX;
    let scrollStart;

    carousel.addEventListener("mousedown", function (e) {
      isDragging = true;
      carousel.style.cursor = "grabbing";
      startX = e.pageX - carousel.offsetLeft;
      scrollStart = carousel.scrollLeft;
    });

    carousel.addEventListener("mousemove", function (e) {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - startX) * 2;
      carousel.scrollLeft = scrollStart - walk;
    });

    carousel.addEventListener("mouseup", function () {
      isDragging = false;
      carousel.style.cursor = "grab";
    });

    carousel.addEventListener("mouseleave", function () {
      isDragging = false;
      carousel.style.cursor = "grab";
    });

    // Set cursor
    carousel.style.cursor = "grab";
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCarousel);
  } else {
    initCarousel();
  }
})();
