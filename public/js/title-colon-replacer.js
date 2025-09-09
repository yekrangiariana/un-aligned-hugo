/**
 * Title Colon Replacer - Pure CSS Implementation Helper
 * Replaces colons (:) with slashes (/) in article card titles
 * and wraps the text after the colon in a span for CSS styling
 */
(function() {
  'use strict';
  
  function replaceColonsInTitles() {
    // Find all article card titles
    const titles = document.querySelectorAll('.article-card-title');
    
    titles.forEach(function(titleElement) {
      const titleText = titleElement.textContent || titleElement.innerText;
      
      // Check if the title contains a colon
      if (titleText.includes(':')) {
        // Split the title at the first colon
        const colonIndex = titleText.indexOf(':');
        const beforeColon = titleText.substring(0, colonIndex).trim();
        const afterColon = titleText.substring(colonIndex + 1).trim();
        
        // Create the new HTML structure
        titleElement.innerHTML = beforeColon + '/<span class="title-suffix">' + afterColon + '</span>';
      }
    });
  }
  
  // Run immediately when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', replaceColonsInTitles);
  } else {
    // DOM is already loaded
    replaceColonsInTitles();
  }
  
  // Also run on dynamic content changes (for SPA-like behavior)
  if (window.MutationObserver) {
    const observer = new MutationObserver(function(mutations) {
      let shouldRun = false;
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1 && (node.classList.contains('article-card') || node.querySelector('.article-card'))) {
              shouldRun = true;
            }
          });
        }
      });
      
      if (shouldRun) {
        setTimeout(replaceColonsInTitles, 10); // Small delay to ensure DOM is ready
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
})();
