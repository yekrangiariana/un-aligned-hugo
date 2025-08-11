// PDF Viewer JavaScript Functions

// Check if PDF embed is supported
document.addEventListener('DOMContentLoaded', function() {
  const embeds = document.querySelectorAll('embed[type="application/pdf"]');
  embeds.forEach(function(embed) {
    embed.onerror = function() {
      const fallback = embed.parentNode.querySelector('.pdf-fallback');
      if (fallback) {
        embed.style.display = 'none';
        fallback.style.display = 'block';
      }
    };
  });
});

function toggleFullscreen(button) {
  const overlay = document.getElementById('pdf-fullscreen-overlay');
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeFullscreen() {
  const overlay = document.getElementById('pdf-fullscreen-overlay');
  overlay.style.display = 'none';
  document.body.style.overflow = 'auto';
}

// Close fullscreen with Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeFullscreen();
  }
});

// Close fullscreen when clicking outside PDF
document.addEventListener('DOMContentLoaded', function() {
  const overlay = document.getElementById('pdf-fullscreen-overlay');
  if (overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === this) {
        closeFullscreen();
      }
    });
  }
});
