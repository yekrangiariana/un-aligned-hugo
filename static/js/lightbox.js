// Site-wide Image Lightbox
document.addEventListener("DOMContentLoaded", function () {
  // Create lightbox elements
  const lightbox = document.createElement("div");
  lightbox.className = "lightbox-overlay";
  lightbox.innerHTML = `
    <div class="lightbox-container">
      <img class="lightbox-image" src="" alt="">
      
      <!-- Control Panel - Full Width Top Bar -->
      <div class="lightbox-controls">
        <div class="lightbox-controls-left">
          <button class="lightbox-caption-toggle" title="Hide caption" aria-label="Toggle caption">
            <i class="fas fa-info"></i>
          </button>
          
          <button class="lightbox-prev" title="Previous image" aria-label="Previous image">
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <button class="lightbox-next" title="Next image" aria-label="Next image">
            <i class="fas fa-chevron-right"></i>
          </button>
          
          <div class="lightbox-counter">1 / 1</div>
        </div>
        
        <div class="lightbox-controls-right">
          <button class="lightbox-close" title="Close" aria-label="Close">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <!-- Caption Panel -->
      <div class="lightbox-caption-panel">
        <div class="lightbox-caption-content"></div>
      </div>
    </div>
  `;
  document.body.appendChild(lightbox);

  const lightboxImage = lightbox.querySelector(".lightbox-image");
  const lightboxCaptionPanel = lightbox.querySelector(
    ".lightbox-caption-panel"
  );
  const lightboxCaptionContent = lightbox.querySelector(
    ".lightbox-caption-content"
  );
  const lightboxCounter = lightbox.querySelector(".lightbox-counter");
  const closeBtn = lightbox.querySelector(".lightbox-close");
  const prevBtn = lightbox.querySelector(".lightbox-prev");
  const nextBtn = lightbox.querySelector(".lightbox-next");
  const captionToggleBtn = lightbox.querySelector(".lightbox-caption-toggle");

  let currentImages = [];
  let currentIndex = 0;
  let captionPanelOpen = false; // Track caption panel state

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
      // Exclude lightbox's own image
      if (img.classList.contains("lightbox-image")) {
        return false;
      }

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
        ".mega-menu-popup, .mega-menu-content, .gordian-cover, .mega-menu, .menu, .nav, .header, .navigation, .post-featured-image-style-2, .comment-author-image"
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

    // Set caption panel to open by default for new lightbox session
    captionPanelOpen = true;

    showCurrentImage();
    lightbox.classList.add("active");

    // Prevent body scrolling on all devices
    document.body.style.overflow = "hidden";
    document.body.classList.add("lightbox-open");
    document.documentElement.classList.add("lightbox-open");

    console.log("Lightbox should be visible now"); // Debug log
  }

  // Function to show current image
  function showCurrentImage() {
    if (currentImages.length === 0) return;

    const img = currentImages[currentIndex];
    lightboxImage.src = img.src;
    lightboxImage.alt = img.alt || "";

    // Update counter
    lightboxCounter.textContent = `${currentIndex + 1} / ${
      currentImages.length
    }`;

    const caption = getImageCaption(img);
    if (caption) {
      lightboxCaptionContent.textContent = caption;
      captionToggleBtn.style.display = "flex";

      // Show caption panel by default, but maintain state if it was previously closed
      if (captionPanelOpen !== false) {
        lightboxCaptionPanel.classList.add("active");
        captionToggleBtn.classList.add("active");
        captionToggleBtn.title = "Hide caption";
        captionPanelOpen = true;
      } else {
        lightboxCaptionPanel.classList.remove("active");
        captionToggleBtn.classList.remove("active");
        captionToggleBtn.title = "Show caption";
      }
    } else {
      lightboxCaptionContent.textContent = "";
      captionToggleBtn.style.display = "none";
      lightboxCaptionPanel.classList.remove("active");
    }

    // Show/hide navigation buttons based on number of images
    if (currentImages.length > 1) {
      prevBtn.style.display = "flex";
      nextBtn.style.display = "flex";
    } else {
      prevBtn.style.display = "none";
      nextBtn.style.display = "none";
    }
  }

  // Function to close lightbox
  function closeLightbox() {
    lightbox.classList.remove("active");

    // Restore body scrolling
    document.body.style.overflow = "";
    document.body.classList.remove("lightbox-open");
    document.documentElement.classList.remove("lightbox-open");

    // Reset caption panel state for next session
    captionPanelOpen = false;
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

  // Function to toggle caption panel
  function toggleCaption() {
    const isActive = lightboxCaptionPanel.classList.contains("active");

    if (isActive) {
      lightboxCaptionPanel.classList.remove("active");
      captionToggleBtn.classList.remove("active");
      captionToggleBtn.title = "Show caption";
      captionPanelOpen = false; // Update state
    } else {
      lightboxCaptionPanel.classList.add("active");
      captionToggleBtn.classList.add("active");
      captionToggleBtn.title = "Hide caption";
      captionPanelOpen = true; // Update state
    }
  }

  // Event listeners
  closeBtn.addEventListener("click", closeLightbox);
  prevBtn.addEventListener("click", previousImage);
  nextBtn.addEventListener("click", nextImage);
  captionToggleBtn.addEventListener("click", toggleCaption);

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
      case "i":
      case "I":
        if (captionToggleBtn.style.display !== "none") {
          toggleCaption();
        }
        break;
    }
  });

  // Make images clickable
  function initializeImages() {
    const images = getClickableImages();

    images.forEach((img) => {
      // Skip if already initialized
      if (img.hasAttribute("data-lightbox-initialized")) {
        return;
      }

      // Mark as initialized
      img.setAttribute("data-lightbox-initialized", "true");

      // Add cursor pointer style
      img.style.cursor = "pointer";
      img.title = img.title || "Click to view fullscreen"; // Add helpful tooltip

      // Add fullscreen icon overlay
      if (!img.parentElement.querySelector(".lightbox-hover-icon")) {
        const icon = document.createElement("div");
        icon.className = "lightbox-hover-icon";
        icon.innerHTML = "⛶"; // Fullscreen Unicode character

        // Make sure parent has relative positioning
        const parent = img.parentElement;
        if (window.getComputedStyle(parent).position === "static") {
          parent.style.position = "relative";
        }

        parent.appendChild(icon);
      }

      // Create and store the handler
      const handler = function (e) {
        e.preventDefault();
        console.log("Image clicked:", img.src); // Debug log
        openLightbox(img);
      };

      // Store reference and add the event listener
      img._lightboxHandler = handler;
      img.addEventListener("click", handler);
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
        // Ignore mutations caused by lightbox elements
        const isLightboxMutation = Array.from(mutation.addedNodes).some(
          (node) =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.classList?.contains("lightbox-overlay") ||
              node.classList?.contains("lightbox-hover-icon") ||
              node.closest?.(".lightbox-overlay"))
        );

        if (isLightboxMutation) {
          return; // Skip lightbox-related mutations
        }

        // Check if new images were added (excluding lightbox images)
        const hasNewImages = Array.from(mutation.addedNodes).some(
          (node) =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.tagName === "IMG" || node.querySelector("img")) &&
            !node.classList?.contains("lightbox-image") &&
            !node.closest?.(".lightbox-overlay")
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
