/**
 * The DixonBaxi Way - Season Navigation Controls
 * 
 * This file handles all season navigation functionality:
 * - Next/Previous season buttons
 * - Keyboard navigation (left/right arrows)
 * - Touch swipe navigation
 */

jQuery(document).ready(function($) {
  console.log("navigation.js loaded");
  
  // Initialize navigation controls
  initNavigation();
  
  // Function to initialize all navigation controls
  function initNavigation() {
    // Function to navigate between seasons
    function navigateToSeason(direction) {
      // Get current active panel
      const currentPanel = $(".season-tab_content-panel.active");
      const currentIndex = currentPanel.index();
      const totalPanels = $(".season-tab_content-panel").length;
      
      // Calculate target season index
      let targetIndex;
      if (direction === 'next') {
        targetIndex = (currentIndex + 1) % totalPanels;
      } else {
        targetIndex = (currentIndex - 1 + totalPanels) % totalPanels;
      }
      
      // Convert to 1-based season number
      const targetSeason = targetIndex + 1;
      
      console.log(`Navigating from season ${currentIndex + 1} to season ${targetSeason}`);
      
      // Find the corresponding season button
      const seasonButton = $(`#season-${targetSeason}, .season-tab_link.is-season-${targetSeason}`);
      
      // Click the button to trigger the season change
      if (seasonButton.length) {
        seasonButton.trigger('click');
      }
    }
    
    // Add event listeners for next/prev buttons with all possible selectors
    $("#nextBtn, .season-next, .next-season, .season-nav-next").off('click.seasonNav').on("click.seasonNav", function(e) {
      e.preventDefault();
      console.log("Next season button clicked");
      navigateToSeason('next');
    });
    
    $("#prevBtn, .season-prev, .prev-season, .season-nav-prev").off('click.seasonNav').on("click.seasonNav", function(e) {
      e.preventDefault();
      console.log("Previous season button clicked");
      navigateToSeason('prev');
    });
    
    // Add keyboard navigation support
    $(document).off('keydown.seasonNav').on("keydown.seasonNav", function(e) {
      // Only handle if we're on the seasons page
      if ($(".season-tab_content-panel").length === 0) return;
      
      // Left arrow key - previous season
      if (e.keyCode === 37) {
        console.log("Left arrow key pressed - navigating to previous season");
        navigateToSeason('prev');
        return false; // Prevent default
      }
      
      // Right arrow key - next season
      if (e.keyCode === 39) {
        console.log("Right arrow key pressed - navigating to next season");
        navigateToSeason('next');
        return false; // Prevent default
      }
    });
    
    // Add swipe support for touch devices if Hammer.js is available
    if (typeof Hammer !== 'undefined') {
      const seasonContainer = document.querySelector('.season-tab_content');
      if (seasonContainer && !seasonContainer._hammer) {
        console.log("Initializing touch swipe navigation");
        const hammer = new Hammer(seasonContainer);
        seasonContainer._hammer = hammer;
        hammer.on('swipeleft', function() {
          console.log("Swipe left detected - navigating to next season");
          navigateToSeason('next');
        });
        hammer.on('swiperight', function() {
          console.log("Swipe right detected - navigating to previous season");
          navigateToSeason('prev');
        });
      }
    }
  }
  
  // Re-initialize navigation when content is loaded
  $(document).on("contentLoaded", function() {
    console.log("Content loaded - reinitializing navigation");
    initNavigation();
  });
});