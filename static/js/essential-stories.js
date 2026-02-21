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

        // Quick fade animation for smooth transition
        contentWrapper.style.transition =
          "transform 0.2s ease, opacity 0.2s ease";
        contentWrapper.style.transform =
          direction === "next" ? "translateX(-20px)" : "translateX(20px)";
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
            direction === "next" ? "translateX(20px)" : "translateX(-20px)";
          contentWrapper.style.opacity = "0";

          // Force reflow
          contentWrapper.offsetHeight;

          // Quick animate in for smooth feel
          contentWrapper.style.transition =
            "transform 0.2s ease, opacity 0.2s ease";
          contentWrapper.style.transform = "translateX(0)";
          contentWrapper.style.opacity = "1";
          contentWrapper.style.pointerEvents = "auto";

          // Clear transform after animation
          setTimeout(() => {
            contentWrapper.style.removeProperty("transform");
            contentWrapper.style.removeProperty("transition");
          }, 200);

          // Reset navigation lock
          isNavigating = false;

          // Reinitialize navigation
          initializeNavigation();
        }, 200);
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

    // Touch/swipe detection - improved for native feel
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let currentX = 0;
    let hasSwipedBefore = sessionStorage.getItem("hasSwipedStory") === "true";
    let isSwiping = false;
    let isHorizontalSwipe = false;
    let rafId = null;

    const SWIPE_THRESHOLD = 70; // Minimum distance to trigger navigation
    const VELOCITY_THRESHOLD = 0.25; // Speed to trigger navigation on quick swipe
    const MAX_VERTICAL_RATIO = 0.6; // Max vertical/horizontal ratio to consider horizontal
    const DAMPING = 0.75; // How much the view follows the finger

    const swipeIndicator = currentStoryView.querySelector(
      ".story-swipe-indicator",
    );

    // Hide indicator if user has swiped before
    if (hasSwipedBefore && swipeIndicator) {
      swipeIndicator.style.display = "none";
    }

    // Update transform with requestAnimationFrame for smoothness
    function updateTransform(distance) {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        const dampedDistance = distance * DAMPING;
        currentStoryView.style.transform = `translateX(${dampedDistance}px)`;

        // Show preview based on swipe direction
        const previewLeft = currentStoryView.querySelector(
          ".story-preview-left",
        );
        const previewRight = currentStoryView.querySelector(
          ".story-preview-right",
        );

        if (
          dampedDistance > 50 &&
          currentPrevBtn &&
          !currentPrevBtn.disabled &&
          previewLeft
        ) {
          previewLeft.classList.add("active");
          if (previewRight) previewRight.classList.remove("active");
        } else if (
          dampedDistance < -50 &&
          currentNextBtn &&
          !currentNextBtn.disabled &&
          previewRight
        ) {
          previewRight.classList.add("active");
          if (previewLeft) previewLeft.classList.remove("active");
        } else {
          if (previewLeft) previewLeft.classList.remove("active");
          if (previewRight) previewRight.classList.remove("active");
        }
      });
    }

    // Touch event handlers
    currentTouchHandlers.start = function (e) {
      // Ignore touches on interactive elements
      if (
        e.target.closest(".story-progress-bar") ||
        e.target.closest(".story-control-btn") ||
        e.target.closest(".story-controls") ||
        e.target.closest("a") ||
        e.target.closest("button")
      ) {
        return;
      }

      if (isNavigating) return;

      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
      currentX = 0;
      isSwiping = true;
      isHorizontalSwipe = false;

      currentStoryView.style.transition = "none";
    };

    currentTouchHandlers.move = function (e) {
      if (!isSwiping || isNavigating) return;

      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      const deltaX = touchX - touchStartX;
      const deltaY = touchY - touchStartY;

      // Determine if this is a horizontal swipe
      if (
        !isHorizontalSwipe &&
        (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)
      ) {
        const ratio = Math.abs(deltaY) / Math.abs(deltaX);
        isHorizontalSwipe = ratio < MAX_VERTICAL_RATIO;

        if (!isHorizontalSwipe) {
          // This is a vertical scroll, cancel the swipe
          isSwiping = false;
          return;
        }
      }

      if (isHorizontalSwipe) {
        // Prevent default to stop scrolling during horizontal swipe
        if (e.cancelable) {
          e.preventDefault();
        }

        currentX = deltaX;

        // Apply light resistance at edges for smooth feel
        let resistance = 1;
        if (
          (deltaX > 0 && (!currentPrevBtn || currentPrevBtn.disabled)) ||
          (deltaX < 0 && (!currentNextBtn || currentNextBtn.disabled))
        ) {
          resistance = Math.max(0.2, 1 - Math.abs(deltaX) / 400);
        }

        updateTransform(deltaX * resistance);
        currentStoryView.classList.add("is-dragging");
      }
    };

    currentTouchHandlers.end = function (e) {
      if (!isSwiping) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndTime = Date.now();
      const deltaX = touchEndX - touchStartX;
      const deltaTime = touchEndTime - touchStartTime;
      const velocity = Math.abs(deltaX) / deltaTime; // pixels per millisecond

      isSwiping = false;
      currentStoryView.classList.remove("is-dragging");

      // Hide previews
      const previewLeft = currentStoryView.querySelector(".story-preview-left");
      const previewRight = currentStoryView.querySelector(
        ".story-preview-right",
      );
      if (previewLeft) previewLeft.classList.remove("active");
      if (previewRight) previewRight.classList.remove("active");

      // Determine if we should navigate
      let shouldNavigate = false;
      let direction = null;

      if (isHorizontalSwipe) {
        // Navigate if either distance threshold or velocity threshold is met
        if (
          deltaX > SWIPE_THRESHOLD ||
          (deltaX > 30 && velocity > VELOCITY_THRESHOLD)
        ) {
          if (currentPrevBtn && !currentPrevBtn.disabled) {
            shouldNavigate = true;
            direction = "prev";
          }
        } else if (
          deltaX < -SWIPE_THRESHOLD ||
          (deltaX < -30 && velocity > VELOCITY_THRESHOLD)
        ) {
          if (currentNextBtn && !currentNextBtn.disabled) {
            shouldNavigate = true;
            direction = "next";
          }
        }
      }

      if (shouldNavigate) {
        // Quick smooth animation to completion
        currentStoryView.style.transition =
          "transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)";
        const targetX =
          direction === "prev" ? window.innerWidth : -window.innerWidth;
        currentStoryView.style.transform = `translateX(${targetX}px)`;

        // Navigate immediately without delay for instant feel
        setTimeout(() => {
          hideSwipeIndicator();
          if (direction === "prev") {
            currentPrevBtn.click();
          } else {
            currentNextBtn.click();
          }
        }, 100);
      } else {
        // Quick snap back to original position
        currentStoryView.style.transition =
          "transform 0.25s cubic-bezier(0.33, 1, 0.68, 1)";
        currentStoryView.style.transform = "translateX(0)";

        setTimeout(() => {
          currentStoryView.style.removeProperty("transform");
          currentStoryView.style.removeProperty("transition");
        }, 250);
      }
    };

    currentStoryView.addEventListener(
      "touchstart",
      currentTouchHandlers.start,
      { passive: true },
    );
    currentStoryView.addEventListener("touchmove", currentTouchHandlers.move, {
      passive: false,
    });
    currentStoryView.addEventListener("touchend", currentTouchHandlers.end, {
      passive: true,
    });
    currentStoryView.addEventListener("touchcancel", currentTouchHandlers.end, {
      passive: true,
    });

    // Mouse handlers removed - touch optimized for mobile only

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
