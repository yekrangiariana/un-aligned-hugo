/**
 * Advanced Grid Layout - Move cards 5, 6, 7 into card 4 container
 * This creates the compact mini-cards layout you requested
 */

document.addEventListener('DOMContentLoaded', function() {
    // Find all article grids on the page
    const articleGrids = document.querySelectorAll('.article-grid');
    
    articleGrids.forEach(grid => {
        // Get the cards we need
        const card4 = grid.querySelector('.article-card:nth-child(4)');
        const card5 = grid.querySelector('.article-card:nth-child(5)');
        const card6 = grid.querySelector('.article-card:nth-child(6)');
        const card7 = grid.querySelector('.article-card:nth-child(7)');
        
        // Only proceed if we have all the cards we need
        if (card4 && card5 && card6 && card7) {
            console.log('Found all cards for advanced layout');
            
            // Transform card 4 into a container
            card4.classList.add('mini-cards-container');
            
            // Check if we're on mobile
            const isMobile = window.innerWidth <= 768;
            
            // Create mini-card versions of cards 5, 6, 7
            const miniCards = [card5, card6, card7].map((card, index) => {
                // Clone the card content
                const miniCard = document.createElement('div');
                miniCard.className = 'mini-card';
                
                // Add unique identifier to prevent selection conflicts
                miniCard.setAttribute('data-mini-card-id', `mini-${index + 1}`);
                
                // Copy the article-card-link content
                const originalLink = card.querySelector('.article-card-link');
                if (originalLink) {
                    const newLink = originalLink.cloneNode(true);
                    
                    // Ensure the link maintains its individual click behavior
                    newLink.addEventListener('click', function(e) {
                        // Stop event bubbling to prevent container selection
                        e.stopPropagation();
                    });
                    
                    // On mobile, ensure proper focus handling
                    if (isMobile) {
                        newLink.addEventListener('focus', function(e) {
                            e.stopPropagation();
                        });
                    }
                    
                    miniCard.appendChild(newLink);
                }
                
                return miniCard;
            });
            
            // Remove original cards 5, 6, 7 from the grid
            card5.remove();
            card6.remove();
            card7.remove();
            
            // Add mini-cards to card 4 container
            miniCards.forEach(miniCard => {
                card4.appendChild(miniCard);
            });
            
            // Adjust container pointer events based on screen size
            function adjustPointerEvents() {
                const isMobile = window.innerWidth <= 768;
                if (isMobile) {
                    // On mobile, allow the container to have pointer events
                    card4.style.pointerEvents = 'auto';
                } else {
                    // On desktop, disable container pointer events to prevent group selection
                    card4.style.pointerEvents = 'none';
                }
            }
            
            // Set initial pointer events
            adjustPointerEvents();
            
            // Listen for window resize to adjust behavior
            window.addEventListener('resize', adjustPointerEvents);
            
            console.log('Advanced grid layout applied successfully');
        } else {
            console.log('Not enough cards for advanced layout, using normal layout');
        }
    });
});
