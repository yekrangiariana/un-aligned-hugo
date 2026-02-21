/**
 * Essential Stories Navigation
 * Handles keyboard shortcuts, touch gestures, and partial page loading for smooth navigation
 */

(function () {
  "use strict";

  // Check if we're in a story view
  const storyView = document.querySelector(".essential-story-view");
  if (!storyView) return;

  // Store references to event handlers for cleanup
  let currentKeyboardHandler = null;
  let currentTouchHandlers = {
    start: null,
    move: null,
    end: null,
  };
  let currentMouseHandlers = {
    down: null,
    move: null,
    up: null,
    leave: null,
  };
  let currentMenuHandler = null;
  let currentMenuOutsideHandler = null;
  let isNavigating = false; // Prevent multiple simultaneous navigations

  function isTerminalPage(url) {
    if (!url) return false;
    return (
      url.includes("/essential-stories-quiz/") ||
      url.includes("/essential-stories-quotes/")
    );
  }

  // Partial page loading function
  function loadStoryContent(url, direction) {
    if (isNavigating) return; // Prevent multiple navigations
    isNavigating = true;

    const contentWrapper = storyView.querySelector(".story-content-wrapper");
    const progressBar = storyView.querySelector(".story-progress-bar");

    if (!contentWrapper || !progressBar) {
      // Fallback if structure is unexpected
      window.location.href = url;
      return;
    }

    // Add loading state to content only
    contentWrapper.style.opacity = "0.5";
    contentWrapper.style.pointerEvents = "none";

    fetch(url)
      .then((response) => response.text())
      .then((html) => {
        const parser = new DOMParser();
        const newDoc = parser.parseFromString(html, "text/html");

        // Extract the new content
        const newStoryView = newDoc.querySelector(".essential-story-view");
        if (!newStoryView) {
          // Fallback to full page load if structure doesn't match
          window.location.href = url;
          return;
        }

        const newContentWrapper = newStoryView.querySelector(
          ".story-content-wrapper",
        );
        const newProgressBar = newStoryView.querySelector(
          ".story-progress-bar",
        );

        if (!newContentWrapper || !newProgressBar) {
          window.location.href = url;
          return;
        }

        // Animate out content only
        contentWrapper.style.transition =
          "transform 0.3s ease, opacity 0.3s ease";
        contentWrapper.style.transform =
          direction === "next" ? "translateX(-30px)" : "translateX(30px)";
        contentWrapper.style.opacity = "0";

        setTimeout(() => {
          // Clean up old event listeners before replacing content
          cleanupEventListeners();

          // Replace only the content wrapper
          contentWrapper.innerHTML = newContentWrapper.innerHTML;

          // Update progress bar segments and buttons without replacing the element
          const currentSegments = progressBar.querySelector(
            ".story-progress-segments",
          );
          const newSegments = newProgressBar.querySelector(
            ".story-progress-segments",
          );
          if (currentSegments && newSegments) {
            currentSegments.innerHTML = newSegments.innerHTML;
          }

          // Update prev button
          const currentPrevBtn = progressBar.querySelector("#story-prev");
          const newPrevBtn = newProgressBar.querySelector("#story-prev");
          if (currentPrevBtn && newPrevBtn) {
            currentPrevBtn.outerHTML = newPrevBtn.outerHTML;
          }

          // Update next button
          const currentNextBtn = progressBar.querySelector("#story-next");
          const newNextBtn = newProgressBar.querySelector("#story-next");
          if (currentNextBtn && newNextBtn) {
            currentNextBtn.outerHTML = newNextBtn.outerHTML;
          }

          // Update URL without reload
          window.history.pushState({}, "", url);

          // Update page title
          document.title = newDoc.title;

          // Scroll to top
          window.scrollTo(0, 0);

          // Animate in from opposite direction
          contentWrapper.style.transition = "none";
          contentWrapper.style.transform =
            direction === "next" ? "translateX(30px)" : "translateX(-30px)";
          contentWrapper.style.opacity = "0";

          // Force reflow
          contentWrapper.offsetHeight;

          // Animate in
          contentWrapper.style.transition =
            "transform 0.3s ease, opacity 0.3s ease";
          contentWrapper.style.transform = "translateX(0)";
          contentWrapper.style.opacity = "1";
          contentWrapper.style.pointerEvents = "auto";

          // Clear transform after animation
          setTimeout(() => {
            contentWrapper.style.removeProperty("transform");
            contentWrapper.style.removeProperty("transition");
          }, 300);

          // Reset navigation lock
          isNavigating = false;

          // Reinitialize navigation
          initializeNavigation();
        }, 300);
      })
      .catch((error) => {
        console.error("Failed to load story:", error);
        isNavigating = false;
        // Fallback to full page load
        window.location.href = url;
      });
  }

  function cleanupEventListeners() {
    // Remove keyboard listener
    if (currentKeyboardHandler) {
      document.removeEventListener("keydown", currentKeyboardHandler);
      currentKeyboardHandler = null;
    }

    const currentStoryView = document.querySelector(".essential-story-view");
    if (!currentStoryView) return;

    if (currentMenuHandler) {
      currentStoryView.removeEventListener("click", currentMenuHandler);
      currentMenuHandler = null;
    }

    if (currentMenuOutsideHandler) {
      document.removeEventListener("click", currentMenuOutsideHandler, true);
      currentMenuOutsideHandler = null;
    }

    // Remove touch listeners
    if (currentTouchHandlers.start) {
      currentStoryView.removeEventListener(
        "touchstart",
        currentTouchHandlers.start,
      );
    }
    if (currentTouchHandlers.move) {
      currentStoryView.removeEventListener(
        "touchmove",
        currentTouchHandlers.move,
      );
    }
    if (currentTouchHandlers.end) {
      currentStoryView.removeEventListener(
        "touchend",
        currentTouchHandlers.end,
      );
    }

    // Remove mouse listeners
    if (currentMouseHandlers.down) {
      currentStoryView.removeEventListener(
        "mousedown",
        currentMouseHandlers.down,
      );
    }
    if (currentMouseHandlers.move) {
      currentStoryView.removeEventListener(
        "mousemove",
        currentMouseHandlers.move,
      );
    }
    if (currentMouseHandlers.up) {
      currentStoryView.removeEventListener("mouseup", currentMouseHandlers.up);
    }
    if (currentMouseHandlers.leave) {
      currentStoryView.removeEventListener(
        "mouseleave",
        currentMouseHandlers.leave,
      );
    }

    // Clear references
    currentTouchHandlers = { start: null, move: null, end: null };
    currentMouseHandlers = { down: null, move: null, up: null, leave: null };
  }

  function initializeNavigation() {
    const currentPrevBtn = document.getElementById("story-prev");
    const currentNextBtn = document.getElementById("story-next");
    const currentCoverLink = document.querySelector(".next-story-cover-link");

    // Remove old event listeners by cloning and replacing
    if (currentPrevBtn) {
      const newPrevBtn = currentPrevBtn.cloneNode(true);
      currentPrevBtn.parentNode.replaceChild(newPrevBtn, currentPrevBtn);

      if (!newPrevBtn.disabled) {
        newPrevBtn.addEventListener("click", function (e) {
          const url = newPrevBtn.getAttribute("href");
          if (isTerminalPage(url)) {
            return;
          }
          e.preventDefault();
          if (url) loadStoryContent(url, "prev");
        });
      }
    }

    if (currentNextBtn) {
      const newNextBtn = currentNextBtn.cloneNode(true);
      currentNextBtn.parentNode.replaceChild(newNextBtn, currentNextBtn);

      if (!newNextBtn.disabled) {
        newNextBtn.addEventListener("click", function (e) {
          const url = newNextBtn.getAttribute("href");

          // Allow normal navigation for terminal pages
          if (isTerminalPage(url)) {
            return;
          }

          // Use partial loading for story navigation
          e.preventDefault();
          if (url) loadStoryContent(url, "next");
        });
      }
    }

    // Handle next story cover link
    if (currentCoverLink) {
      const newCoverLink = currentCoverLink.cloneNode(true);
      currentCoverLink.parentNode.replaceChild(newCoverLink, currentCoverLink);

      newCoverLink.addEventListener("click", function (e) {
        e.preventDefault();
        const url = newCoverLink.getAttribute("href");
        if (url) loadStoryContent(url, "next");
      });
    }

    // Reinitialize keyboard, touch, and mouse controls
    initializeControls();

    // Reinitialize story menu links
    initializeMenuLinks();
  }

  function initializeMenuLinks() {
    const currentStoryView = document.querySelector(".essential-story-view");
    if (!currentStoryView) return;

    currentMenuHandler = function (e) {
      const link = e.target.closest(".story-nav-link");
      if (!link) return;

      const details = link.closest("details");
      if (details) {
        details.open = false;
      }

      const url = link.getAttribute("href");
      if (!url) return;

      const isTerminalView =
        currentStoryView.classList.contains("quiz-view") ||
        currentStoryView.classList.contains("quotes-view");
      if (isTerminalPage(url) || isTerminalView) {
        return;
      }

      e.preventDefault();
      loadStoryContent(url, "next");
    };

    currentStoryView.addEventListener("click", currentMenuHandler);

    currentMenuOutsideHandler = function (e) {
      const menu = e.target.closest("details.story-nav-menu");
      if (menu) return;

      const openMenus = currentStoryView.querySelectorAll(
        "details.story-nav-menu[open]",
      );
      openMenus.forEach((details) => {
        details.open = false;
      });
    };

    document.addEventListener("click", currentMenuOutsideHandler, true);
  }

  function initializeControls() {
    const currentStoryView = document.querySelector(".essential-story-view");
    const currentPrevBtn = document.getElementById("story-prev");
    const currentNextBtn = document.getElementById("story-next");

    if (!currentStoryView) return;

    // Create preview containers if they don't exist
    let previewLeft = currentStoryView.querySelector(".story-preview-left");
    let previewRight = currentStoryView.querySelector(".story-preview-right");

    if (!previewLeft) {
      previewLeft = document.createElement("div");
      previewLeft.className = "story-preview-left";
      previewLeft.innerHTML = '<div class="story-preview-content"></div>';
      currentStoryView.appendChild(previewLeft);
    }

    if (!previewRight) {
      previewRight = document.createElement("div");
      previewRight.className = "story-preview-right";
      previewRight.innerHTML = '<div class="story-preview-content"></div>';
      currentStoryView.appendChild(previewRight);
    }

    // Preload preview content
    function loadPreviewContent(url, container) {
      if (!url || !container) return;

      const contentDiv = container.querySelector(".story-preview-content");
      if (!contentDiv) return;

      fetch(url)
        .then((response) => response.text())
        .then((html) => {
          const parser = new DOMParser();
          const newDoc = parser.parseFromString(html, "text/html");
          const newStoryView = newDoc.querySelector(".essential-story-view");

          if (newStoryView) {
            const previewContent = newStoryView.querySelector(
              ".story-content-wrapper",
            );
            if (previewContent) {
              contentDiv.innerHTML = previewContent.innerHTML;
            }
          }
        })
        .catch(() => {});
    }

    // Load preview content for prev/next stories
    if (currentPrevBtn && !currentPrevBtn.disabled) {
      const prevUrl = currentPrevBtn.getAttribute("href");
      if (prevUrl) {
        loadPreviewContent(prevUrl, previewLeft);
      }
    }

    if (currentNextBtn && !currentNextBtn.disabled) {
      const nextUrl = currentNextBtn.getAttribute("href");
      if (nextUrl) {
        loadPreviewContent(nextUrl, previewRight);
      }
    }

    // Keyboard navigation handler
    currentKeyboardHandler = function (e) {
      // Left arrow or A key - previous story
      if (
        (e.key === "ArrowLeft" || e.key === "a") &&
        currentPrevBtn &&
        !currentPrevBtn.disabled &&
        !isNavigating
      ) {
        e.preventDefault();
        currentPrevBtn.click();
      }

      // Right arrow or D key - next story
      if (
        (e.key === "ArrowRight" || e.key === "d") &&
        currentNextBtn &&
        !currentNextBtn.disabled &&
        !isNavigating
      ) {
        e.preventDefault();
        currentNextBtn.click();
      }

      // Escape key - close story (go home)
      if (e.key === "Escape") {
        e.preventDefault();
        window.location.href = "/";
      }
    };

    document.addEventListener("keydown", currentKeyboardHandler);

    // Touch/swipe detection
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let hasSwipedBefore = sessionStorage.getItem("hasSwipedStory") === "true";
    let isSwiping = false;
    let isMouseDrag = false; // Track if it's mouse drag vs touch

    const minSwipeDistance = 50; // Minimum distance for touch swipe
    const minMouseDragDistance = 100; // Higher threshold for mouse drag to prevent accidents
    const maxVerticalDistance = 100;
    const swipeIndicator = currentStoryView.querySelector(
      ".story-swipe-indicator",
    );

    // Hide indicator if user has swiped before
    if (hasSwipedBefore && swipeIndicator) {
      swipeIndicator.style.display = "none";
    }

    // Generic start handler for both touch and mouse
    function handleStart(clientX, clientY, isMouse = false) {
      if (isNavigating) return;
      touchStartX = clientX;
      touchStartY = clientY;
      isSwiping = true;
      isMouseDrag = isMouse;
    }

    // Generic move handler for both touch and mouse
    function handleMove(clientX, clientY) {
      if (!isSwiping || isNavigating) return;

      const horizontalDistance = clientX - touchStartX;
      const verticalDistance = Math.abs(clientY - touchStartY);

      // Only provide feedback for horizontal swipes
      if (
        verticalDistance < maxVerticalDistance &&
        Math.abs(horizontalDistance) > 10
      ) {
        const progress = Math.min(Math.abs(horizontalDistance) / 100, 0.15);
        currentStoryView.style.transition = "none";
        currentStoryView.style.transform = `translateX(${horizontalDistance * 0.3}px)`;
        currentStoryView.style.opacity = 1 - progress;
        currentStoryView.classList.add("is-dragging");

        // Show preview based on swipe direction
        const previewLeft = currentStoryView.querySelector(
          ".story-preview-left",
        );
        const previewRight = currentStoryView.querySelector(
          ".story-preview-right",
        );

        if (
          horizontalDistance > 30 &&
          currentPrevBtn &&
          !currentPrevBtn.disabled &&
          previewLeft
        ) {
          // Swiping right, show left preview
          previewLeft.classList.add("active");
          if (previewRight) previewRight.classList.remove("active");
        } else if (
          horizontalDistance < -30 &&
          currentNextBtn &&
          !currentNextBtn.disabled &&
          previewRight
        ) {
          // Swiping left, show right preview
          previewRight.classList.add("active");
          if (previewLeft) previewLeft.classList.remove("active");
        } else {
          // Not enough distance, hide previews
          if (previewLeft) previewLeft.classList.remove("active");
          if (previewRight) previewRight.classList.remove("active");
        }

        return true;
      }
      return false;
    }

    // Generic end handler for both touch and mouse
    function handleEnd(clientX, clientY) {
      if (!isSwiping) return;

      touchEndX = clientX;
      touchEndY = clientY;
      isSwiping = false;

      currentStoryView.classList.remove("is-dragging");

      // Hide previews
      const previewLeft = currentStoryView.querySelector(".story-preview-left");
      const previewRight = currentStoryView.querySelector(
        ".story-preview-right",
      );
      if (previewLeft) previewLeft.classList.remove("active");
      if (previewRight) previewRight.classList.remove("active");

      // Reset transform if not navigating
      currentStoryView.style.transition = "all 0.2s ease";
      currentStoryView.style.transform = "translateX(0)";
      currentStoryView.style.opacity = "1";

      // Clear transform after animation to restore fixed positioning
      setTimeout(() => {
        currentStoryView.style.removeProperty("transform");
        currentStoryView.style.removeProperty("transition");
      }, 200);

      handleSwipe();
    }

    // Touch event handlers
    currentTouchHandlers.start = function (e) {
      // Ignore touches on progress bar and navigation buttons
      if (
        e.target.closest(".story-progress-bar") ||
        e.target.closest(".story-control-btn") ||
        e.target.closest(".story-controls")
      ) {
        return;
      }
      handleStart(
        e.changedTouches[0].clientX,
        e.changedTouches[0].clientY,
        false,
      );
    };

    currentTouchHandlers.move = function (e) {
      if (!isSwiping) return;
      handleMove(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    };

    currentTouchHandlers.end = function (e) {
      if (!isSwiping) return;
      handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    };

    currentStoryView.addEventListener(
      "touchstart",
      currentTouchHandlers.start,
      { passive: true },
    );
    currentStoryView.addEventListener("touchmove", currentTouchHandlers.move, {
      passive: true,
    });
    currentStoryView.addEventListener("touchend", currentTouchHandlers.end, {
      passive: true,
    });

    // Mouse event handlers
    let isMouseDown = false;

    currentMouseHandlers.down = function (e) {
      // Ignore clicks on progress bar and navigation buttons
      if (
        e.target.closest(".story-progress-bar") ||
        e.target.closest(".story-control-btn") ||
        e.target.closest(".story-controls")
      ) {
        return;
      }
      isMouseDown = true;
      handleStart(e.clientX, e.clientY, true);
    };

    currentMouseHandlers.move = function (e) {
      if (!isMouseDown) return;
      if (handleMove(e.clientX, e.clientY)) {
        e.preventDefault();
      }
    };

    currentMouseHandlers.up = function (e) {
      if (!isMouseDown) return;
      isMouseDown = false;
      handleEnd(e.clientX, e.clientY);
    };

    currentMouseHandlers.leave = function (e) {
      if (!isMouseDown) return;
      isMouseDown = false;
      isSwiping = false;
      currentStoryView.classList.remove("is-dragging");

      // Hide previews
      const previewLeft = currentStoryView.querySelector(".story-preview-left");
      const previewRight = currentStoryView.querySelector(
        ".story-preview-right",
      );
      if (previewLeft) previewLeft.classList.remove("active");
      if (previewRight) previewRight.classList.remove("active");

      currentStoryView.style.transition = "all 0.2s ease";
      currentStoryView.style.transform = "translateX(0)";
      currentStoryView.style.opacity = "1";

      // Clear transform after animation to restore fixed positioning
      setTimeout(() => {
        currentStoryView.style.removeProperty("transform");
        currentStoryView.style.removeProperty("transition");
      }, 200);
    };

    currentStoryView.addEventListener("mousedown", currentMouseHandlers.down);
    currentStoryView.addEventListener("mousemove", currentMouseHandlers.move);
    currentStoryView.addEventListener("mouseup", currentMouseHandlers.up);
    currentStoryView.addEventListener("mouseleave", currentMouseHandlers.leave);

    function handleSwipe() {
      if (isNavigating) return;

      const horizontalDistance = touchEndX - touchStartX;
      const verticalDistance = Math.abs(touchEndY - touchStartY);

      if (verticalDistance > maxVerticalDistance) return;

      // Use different thresholds for mouse vs touch
      const threshold = isMouseDrag ? minMouseDragDistance : minSwipeDistance;

      // Swipe right (previous story)
      if (
        horizontalDistance > threshold &&
        currentPrevBtn &&
        !currentPrevBtn.disabled
      ) {
        hideSwipeIndicator();
        currentPrevBtn.click();
      }

      // Swipe left (next story)
      if (
        horizontalDistance < -threshold &&
        currentNextBtn &&
        !currentNextBtn.disabled
      ) {
        hideSwipeIndicator();
        currentNextBtn.click();
      }
    }

    function hideSwipeIndicator() {
      if (swipeIndicator) {
        swipeIndicator.style.transition = "opacity 0.3s ease";
        swipeIndicator.style.opacity = "0";
        setTimeout(() => {
          swipeIndicator.style.display = "none";
        }, 300);
        sessionStorage.setItem("hasSwipedStory", "true");
      }
    }

    // Preload next story
    if (currentNextBtn && !currentNextBtn.disabled) {
      const nextStoryUrl = currentNextBtn.getAttribute("href");
      if (nextStoryUrl) {
        fetch(nextStoryUrl)
          .then((response) => response.text())
          .then((html) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const nextImage = doc.querySelector(".story-image");
            if (nextImage) {
              const img = new Image();
              img.src = nextImage.src;
            }
          })
          .catch(() => {});
      }
    }
  }

  // Initialize navigation on page load
  initializeNavigation();
})();
