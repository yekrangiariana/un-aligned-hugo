// Site-wide Image Lightbox
document.addEventListener("DOMContentLoaded", function () {
  // Create lightbox elements
  const lightbox = document.createElement("div");
  lightbox.className = "lightbox-overlay";
  lightbox.innerHTML = `
    <div class="lightbox-container">
      <div class="lightbox-close">&times;</div>
      <img class="lightbox-image" src="" alt="">
      <div class="lightbox-caption"></div>
      <div class="lightbox-nav">
        <button class="lightbox-prev" title="Previous image">‹</button>
        <button class="lightbox-next" title="Next image">›</button>
      </div>
    </div>
  `;
  document.body.appendChild(lightbox);

  const lightboxImage = lightbox.querySelector(".lightbox-image");
  const lightboxCaption = lightbox.querySelector(".lightbox-caption");
  const closeBtn = lightbox.querySelector(".lightbox-close");
  const prevBtn = lightbox.querySelector(".lightbox-prev");
  const nextBtn = lightbox.querySelector(".lightbox-next");

  let currentImages = [];
  let currentIndex = 0;

  // Function to get caption from various sources
  function getImageCaption(img) {
    // Check for figcaption in parent figure
    const figure = img.closest("figure");
    if (figure) {
      const figcaption = figure.querySelector(
        "figcaption .caption, figcaption"
      );
      if (figcaption) {
        return figcaption.textContent.trim();
      }
    }

    // Check for caption in photo block containers
    const photoContainer = img.closest(
      ".photo-large-wrapper, .photo-custom-wrapper, .photo-block"
    );
    if (photoContainer) {
      const caption = photoContainer.querySelector(
        ".photo-large-caption .caption, .photo-custom-caption .caption, .caption"
      );
      if (caption) {
        return caption.textContent.trim();
      }
    }

    // Check img alt attribute
    if (img.alt && img.alt.trim()) {
      return img.alt.trim();
    }

    // Check img title attribute
    if (img.title && img.title.trim()) {
      return img.title.trim();
    }

    return "";
  }

  // Function to get all clickable images on the page
  function getClickableImages() {
    const images = document.querySelectorAll("img");
    return Array.from(images).filter((img) => {
      // Exclude very small images (likely icons), profile images, and navigation images
      const rect = img.getBoundingClientRect();
      const isSmall = rect.width < 100 || rect.height < 100;
      const isProfileImage = img.classList.contains("author-profile-image");
      const isIcon = img.closest(
        ".image-caption-icon, .gordian-badge, .text-size-adjuster, .favorite-article"
      );

      // Exclude article card images and similar article images
      const isArticleCard =
        img.classList.contains("article-card-image") ||
        img.classList.contains("carousel-image") ||
        img.closest(".article-card, .similar-article, .related-content-grid");

      // Exclude mega menu images
      const isMegaMenuImage = img.closest(
        ".mega-menu-popup, .mega-menu-content, .gordian-cover, .mega-menu, .menu, .nav, .header, .navigation"
      );

      return (
        !isSmall &&
        !isProfileImage &&
        !isIcon &&
        !isArticleCard &&
        !isMegaMenuImage &&
        img.src
      );
    });
  }

  // Function to open lightbox
  function openLightbox(clickedImg) {
    console.log("Opening lightbox for image:", clickedImg.src); // Debug log

    currentImages = getClickableImages();
    currentIndex = currentImages.indexOf(clickedImg);

    if (currentIndex === -1) {
      currentIndex = 0;
    }

    showCurrentImage();
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";

    console.log("Lightbox should be visible now"); // Debug log
  }

  // Function to show current image
  function showCurrentImage() {
    if (currentImages.length === 0) return;

    const img = currentImages[currentIndex];
    lightboxImage.src = img.src;
    lightboxImage.alt = img.alt || "";

    const caption = getImageCaption(img);
    if (caption) {
      lightboxCaption.textContent = caption;
      lightboxCaption.style.display = "block";
    } else {
      lightboxCaption.style.display = "none";
    }

    // Show/hide navigation buttons
    if (currentImages.length > 1) {
      prevBtn.style.display = "block";
      nextBtn.style.display = "block";
    } else {
      prevBtn.style.display = "none";
      nextBtn.style.display = "none";
    }
  }

  // Function to close lightbox
  function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
  }

  // Function to go to previous image
  function previousImage() {
    if (currentImages.length > 1) {
      currentIndex =
        (currentIndex - 1 + currentImages.length) % currentImages.length;
      showCurrentImage();
    }
  }

  // Function to go to next image
  function nextImage() {
    if (currentImages.length > 1) {
      currentIndex = (currentIndex + 1) % currentImages.length;
      showCurrentImage();
    }
  }

  // Event listeners
  closeBtn.addEventListener("click", closeLightbox);
  prevBtn.addEventListener("click", previousImage);
  nextBtn.addEventListener("click", nextImage);

  // Close on backdrop click
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("active")) return;

    switch (e.key) {
      case "Escape":
        closeLightbox();
        break;
      case "ArrowLeft":
        previousImage();
        break;
      case "ArrowRight":
        nextImage();
        break;
    }
  });

  // Make images clickable
  function initializeImages() {
    const images = getClickableImages();

    images.forEach((img) => {
      // Remove any existing lightbox listeners
      img.removeEventListener("click", img._lightboxHandler);

      // Add cursor pointer style
      img.style.cursor = "pointer";
      img.title = img.title || "Click to view fullscreen"; // Add helpful tooltip

      // Create and store the handler
      img._lightboxHandler = function (e) {
        e.preventDefault();
        console.log("Image clicked:", img.src); // Debug log
        openLightbox(img);
      };

      // Add the event listener
      img.addEventListener("click", img._lightboxHandler);
    });
  }

  // Initialize on page load
  initializeImages();

  // Also initialize after a short delay to catch any lazy-loaded images
  setTimeout(initializeImages, 1000);

  console.log(
    "Lightbox initialized. Found",
    getClickableImages().length,
    "clickable images"
  ); // Debug log

  // Reinitialize when new content is loaded (for dynamic content)
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.addedNodes.length > 0) {
        // Check if new images were added
        const hasNewImages = Array.from(mutation.addedNodes).some(
          (node) =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.tagName === "IMG" || node.querySelector("img"))
        );

        if (hasNewImages) {
          setTimeout(initializeImages, 100); // Small delay to ensure images are fully loaded
        }
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Touch support for mobile
  let touchStartX = 0;
  let touchStartY = 0;

  lightbox.addEventListener("touchstart", function (e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  });

  lightbox.addEventListener("touchend", function (e) {
    if (!e.changedTouches[0]) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Only consider horizontal swipes (more horizontal than vertical)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        previousImage();
      } else {
        nextImage();
      }
    }
  });

  // Add a global test function for debugging
  window.testLightbox = function () {
    console.log("Testing lightbox...");
    const testImages = getClickableImages();
    console.log("Found clickable images:", testImages.length);
    if (testImages.length > 0) {
      console.log("Opening lightbox with first image...");
      openLightbox(testImages[0]);
    } else {
      console.log("No clickable images found");
    }
  };
});
