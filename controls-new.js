/**
 * Video player controls functionality
 */

// Debug mode flags - set to true to enable debugging features
const debugMode = true;
const debugSeasonNav = true; // Set to true to enable season navigation debugging

// Display a notice in console when debug modes are active
if (debugMode) {
  console.log(
    "⚠️ DEBUG MODE ACTIVE: All videos are muted for testing",
    "To disable debug mode, set debugMode variable to false."
  );
}

if (debugSeasonNav) {
  console.log(
    "🔄 SEASON NAVIGATION DEBUG MODE ACTIVE: Detailed logging enabled for season navigation",
    "To disable, set debugSeasonNav variable to false."
  );
}

// Global variables for fullscreen functionality
let fullscreenActive = false;

// Fullscreen Spacebar prevent default function
document.addEventListener("keyup", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
  }
});

// Fullscreen scroll
function scrollFullscreenClose() {
  setTimeout(function () {
    var target = $("#tab-anchor");
    if (target.length) {
      $("html, body").animate({ scrollTop: target.offset().top }, 300);
      return false;
    }
  }, 500);
}

// Close fullscreen function
function closeFullscreen() {
  if (document.exitFullscreen) {
    scrollFullscreenClose();
    document.exitFullscreen();
    fullscreenActive = false;
  } else if (document.webkitExitFullscreen) {
    /* Safari */
    scrollFullscreenClose();
    document.webkitExitFullscreen();
    fullscreenActive = false;
  } else if (document.msExitFullscreen) {
    /* IE11 */
    scrollFullscreenClose();
    document.msExitFullscreen();
    fullscreenActive = false;
  }
}

jQuery(document).ready(function ($) {
  // Initialize video controls
  console.log("controls.js loaded");
  function initVideoControls() {
    // Add event listeners to videos for end event
    $(".player-item video").each(function () {
      $(this).on("ended", function () {
        var videoID = $(this).closest(".player-item").attr("data-video");
        if (typeof videoend === "function") {
          videoend(videoID);
        }
      });
    });

    // Add event listeners for video navigation
    $(".video-next").click(function () {
      var videoID = $(this).closest(".player-item").attr("data-video");
      var video = $('.player-item[data-video="' + videoID + '"]');
      var nextVideo = $(video).next(".player-item");
      var nextVideoID = $(nextVideo).attr("data-video");

      if (nextVideoID && typeof videoplay === "function") {
        videoplay(nextVideoID);
      }
    });

    $(".video-prev").click(function () {
      var videoID = $(this).closest(".player-item").attr("data-video");
      var video = $('.player-item[data-video="' + videoID + '"]');
      var prevVideo = $(video).prev(".player-item");
      var prevVideoID = $(prevVideo).attr("data-video");

      if (prevVideoID && typeof videoplay === "function") {
        videoplay(prevVideoID);
      }
    });

    // Add event listeners for season navigation
    initSeasonNavigation();
    
    // Initialize the actual video player controls
    initializePlayerControls();
  }

  // Initialize season navigation controls
  function initSeasonNavigation() {
    // Function to navigate between seasons
    function navigateToSeason(direction) {
      if (debugSeasonNav) console.log("Navigating to season:", direction);

      // Get current active panel - try multiple possible selectors
      const currentPanel = $(".season-tab_content-panel.active, .w-tab-pane.w--tab-active, [data-w-tab].w--tab-active").first();

      if (!currentPanel.length) {
        console.warn("No active season panel found");

        // If no active panel found, try to find any panel and activate the first one
        const anyPanel = $(".season-tab_content-panel, .w-tab-pane, [data-w-tab]").first();
        if (anyPanel.length) {
          if (debugSeasonNav) console.log("No active panel found, activating first panel");
          anyPanel.addClass("active w--tab-active");
          return;
        }

        return;
      }

      if (debugSeasonNav) console.log("Current panel:", currentPanel);

      // Get all panels - try multiple possible selectors
      const allPanels = $(".season-tab_content-panel, .w-tab-pane, [data-w-tab]");
      const totalPanels = allPanels.length;

      if (totalPanels === 0) {
        console.warn("No season panels found");
        return;
      }

      // Find the index of the current panel among all panels
      const currentIndex = allPanels.index(currentPanel);
      if (debugSeasonNav) console.log("Current index:", currentIndex, "Total panels:", totalPanels);

      // Calculate target season index
      let targetIndex;
      if (direction === "next") {
        targetIndex = (currentIndex + 1) % totalPanels;
      } else {
        targetIndex = (currentIndex - 1 + totalPanels) % totalPanels;
      }

      if (debugSeasonNav) console.log("Target index:", targetIndex);

      // Try multiple approaches to find and click the target tab

      // Approach 1: Using season number
      const targetSeason = targetIndex + 1;

      // Try multiple possible selectors for season buttons
      const seasonButton = $(
        `#season-${targetSeason},
        .season-tab_link.is-season-${targetSeason},
        [data-w-tab="Season ${targetSeason}"],
        .w-tab-link[data-w-tab="Season ${targetSeason}"],
        .w-tab-link[data-w-tab="Tab ${targetIndex+1}"],
        .season-tab_link:eq(${targetIndex})`
      ).first();

      // Approach 2: Using tab links that correspond to the panels
      const tabLinks = $(".w-tab-link, .season-tab_link");
      const targetTabLink = tabLinks.eq(targetIndex);

      // Try clicking the season button first
      if (seasonButton.length) {
        if (debugSeasonNav) console.log("Clicking season button:", seasonButton);
        seasonButton.trigger("click");

        // Also try to directly activate the panel for redundancy
        const targetPanel = allPanels.eq(targetIndex);
        if (targetPanel.length) {
          setTimeout(function() {
            if (!targetPanel.hasClass("active") && !targetPanel.hasClass("w--tab-active")) {
              if (debugSeasonNav) console.log("Directly activating panel as backup");
              allPanels.removeClass("active w--tab-active");
              targetPanel.addClass("active w--tab-active");
            }
          }, 100);
        }
      }
      // If no season button found, try clicking the tab link
      else if (targetTabLink.length) {
        if (debugSeasonNav) console.log("Clicking tab link:", targetTabLink);
        targetTabLink.trigger("click");
      }
      // If all else fails, try to directly show the target panel
      else {
        if (debugSeasonNav) console.log("No suitable button found, trying to show panel directly");
        const targetPanel = allPanels.eq(targetIndex);
        if (targetPanel.length) {
          allPanels.removeClass("active w--tab-active");
          targetPanel.addClass("active w--tab-active");
        }
      }
    }

    // Add event listeners for next/prev buttons - include all possible class names
    $(".season-next, #nextBtn, .next-btn, .w-slider-arrow-right, .season-arrow-next")
      .off("click.seasonNav")
      .on("click.seasonNav", function (e) {
        if (debugSeasonNav) console.log("Next button clicked:", this);
        e.preventDefault();
        e.stopPropagation(); // Prevent event bubbling
        navigateToSeason("next");
        return false; // Ensure no default action
      });

    $(".season-prev, #prevBtn, .prev-btn, .w-slider-arrow-left, .season-arrow-prev")
      .off("click.seasonNav")
      .on("click.seasonNav", function (e) {
        if (debugSeasonNav) console.log("Prev button clicked:", this);
        e.preventDefault();
        e.stopPropagation(); // Prevent event bubbling
        navigateToSeason("prev");
        return false; // Ensure no default action
      });

    // Log all navigation buttons found for debugging
    if (debugSeasonNav) {
      const nextButtons = $(".season-next, #nextBtn, .next-btn, .w-slider-arrow-right, .season-arrow-next");
      const prevButtons = $(".season-prev, #prevBtn, .prev-btn, .w-slider-arrow-left, .season-arrow-prev");

      console.log("Found next buttons:", nextButtons.length, nextButtons);
      console.log("Found prev buttons:", prevButtons.length, prevButtons);
    }

    // Add keyboard navigation support
    $(document)
      .off("keydown.seasonNav")
      .on("keydown.seasonNav", function (e) {
        // Only handle if we're on a page with season tabs
        // Check for multiple possible selectors to be more robust
        const seasonElements = $(".season-tab_content-panel, .w-tab-pane, [data-w-tab]");
        if (seasonElements.length === 0) return;

        if (debugSeasonNav) console.log("Season elements found for keyboard navigation:", seasonElements.length);

        // Left arrow key - previous season
        if (e.keyCode === 37) {
          if (debugSeasonNav) console.log("Left arrow key pressed - navigating to previous season");
          navigateToSeason("prev");
          return false; // Prevent default
        }

        // Right arrow key - next season
        if (e.keyCode === 39) {
          if (debugSeasonNav) console.log("Right arrow key pressed - navigating to next season");
          navigateToSeason("next");
          return false; // Prevent default
        }
      });

    // Add swipe support for touch devices if Hammer.js is available
    if (typeof Hammer !== "undefined") {
      // Try multiple possible container selectors to be more robust
      const seasonContainers = document.querySelectorAll(".season-tab_content, .w-tab-content, .tabs-content, .season-tab_content-panel, .w-tab-pane");

      if (debugSeasonNav) console.log("Found potential swipe containers:", seasonContainers.length);

      seasonContainers.forEach(function(seasonContainer) {
        if (seasonContainer && !seasonContainer._hammer) {
          if (debugSeasonNav) console.log("Setting up Hammer.js swipe on container:", seasonContainer);

          try {
            const hammer = new Hammer(seasonContainer);
            seasonContainer._hammer = hammer;

            hammer.on("swipeleft", function () {
              if (debugSeasonNav) console.log("Swipe left detected - navigating to next season");
              navigateToSeason("next");
            });

            hammer.on("swiperight", function () {
              if (debugSeasonNav) console.log("Swipe right detected - navigating to previous season");
              navigateToSeason("prev");
            });
          } catch (error) {
            console.error("Error setting up Hammer.js:", error);
          }
        }
      });
    } else if (debugSeasonNav) {
      console.log("Hammer.js not available for swipe support");
    }
  }

  // Initialize the actual video player controls
  function initializePlayerControls() {
    // Initialize RangeTouch for better range input handling on touch devices
    const ranges = RangeTouch ? RangeTouch.setup('input[type="range"]', { thumbWidth: "16" }) : null;
    
    // Process each player item
    $(".player-item").each(function() {
      var player = this;
      const body = document.body;
      
      // Find the video wrapper - try both by ID and by closest parent
      var videoWrapper = player.closest(".season-tab_content-panel") || player.parentElement;
      var video = player.querySelector("video");
      
      // Skip if no video found
      if (!video) return;
      
      var videoControls = player.querySelector(".video-controls");
      var videoTap = player.querySelector(".video-tap");
      var playButton = player.querySelector(".play-button");
      var playbackIcons = player.querySelectorAll(".playback-icons use");
      var timeElapsed = player.querySelector(".time-elapsed");
      var duration = player.querySelector(".duration");
      var progressBar = player.querySelector(".progress-bar");
      var seek = player.querySelector(".seek");
      var volumeButton = player.querySelector(".volume-button");
      var volumeIcons = player.querySelectorAll(".volume-button use");
      var volumeMute = player.querySelector('use[href="#volume-mute"]');
      var volumeLow = player.querySelector('use[href="#volume-low"]');
      var volumeHigh = player.querySelector('use[href="#volume-high"]');
      var volume = player.querySelector(".volume");
      var playbackAnimation = player.querySelector(".playback-animation");
      var fullscreenButton = player.querySelector(".fullscreen-button");
      var fullscreenIcons = fullscreenButton ? fullscreenButton.querySelectorAll("use") : null;
      
      // Check if video is supported
      var videoWorks = !!document.createElement("video").canPlayType;
      if (videoWorks && videoControls) {
        video.controls = false;
        videoControls.classList.remove("hidden");
      }
      
      // Auto-mute if debug mode is active
      if (debugMode && video) {
        video.muted = true;
      }
      
      // PLAY
      function togglePlay() {
        if (!video) return;
        
        if (video.paused || video.ended) {
          video.play();
          if (videoTap) videoTap.classList.remove("hide");
        } else {
          video.pause();
        }
      }
      
      // PLAY ICON
      function updatePlayButton() {
        if (playbackIcons) {
          playbackIcons.forEach((icon) => icon.classList.toggle("hidden"));
        }
        
        if (playButton) {
          if (video.paused) {
            playButton.classList.remove("is-playing");
          } else {
            playButton.classList.add("is-playing");
          }
        }
      }
      
      // TIME
      function formatTime(timeInSeconds) {
        const result = new Date(timeInSeconds * 1000).toISOString().substr(11, 8);
        
        return {
          minutes: result.substr(3, 2),
          seconds: result.substr(6, 2)
        };
      }
      
      // PROGRESS
      function initializeVideo() {
        if (!video) return;
        
        const videoDuration = Math.round(video.duration);
        if (seek) seek.setAttribute("max", videoDuration);
        if (progressBar) progressBar.setAttribute("max", videoDuration);
        
        const time = formatTime(videoDuration);
        if (duration) {
          duration.innerText = `${time.minutes}:${time.seconds}`;
          duration.setAttribute("datetime", `${time.minutes}m ${time.seconds}s`);
        }
        
        // Initialize volume slider
        if (volume) {
          volumeSlider();
        }
      }
      
      // ELAPSED TIME
      function updateTimeElapsed() {
        if (!video || !timeElapsed) return;
        
        const time = formatTime(Math.round(video.currentTime));
        timeElapsed.innerText = `${time.minutes}:${time.seconds}`;
        timeElapsed.setAttribute("datetime", `${time.minutes}m ${time.seconds}s`);
      }
      
      // UPDATE PROGRESS
      function updateProgress() {
        if (!video) return;
        
        if (seek) seek.value = Math.floor(video.currentTime);
        if (progressBar) progressBar.value = Math.floor(video.currentTime);
      }
      
      // PROGRESS SKIP
      function skipAhead(event) {
        if (!video || !seek || !progressBar) return;
        
        const skipTo = event.target.dataset.seek ? event.target.dataset.seek : event.target.value;
        video.currentTime = skipTo;
        progressBar.value = skipTo;
        seek.value = skipTo;
      }
      
      // VOLUME
      function updateVolume() {
        if (!video || !volume) return;
        
        if (video.muted) {
          video.muted = false;
        }
        
        video.volume = volume.value;
      }
      
      // VOLUME ICONS
      function updateVolumeIcon() {
        if (!volumeIcons || !volumeMute || !volumeLow || !volumeHigh) return;
        
        volumeIcons.forEach((icon) => {
          icon.classList.add("hidden");
        });
        
        if (video.muted || video.volume === 0) {
          volumeMute.classList.remove("hidden");
        } else if (video.volume > 0 && video.volume <= 0.5) {
          volumeLow.classList.remove("hidden");
        } else {
          volumeHigh.classList.remove("hidden");
        }
      }
      
      // MUTE TOGGLE
      function toggleMute() {
        if (!video || !volume) return;
        
        video.muted = !video.muted;
        
        if (video.muted) {
          volume.setAttribute("data-volume", volume.value);
          volume.value = 0;
        } else {
          volume.value = volume.dataset.volume;
        }
      }
      
      // ANIMATE
      function animatePlayback() {
        if (!playbackAnimation) return;
        
        playbackAnimation.animate(
          [
            {
              opacity: 1,
              transform: "scale(1)"
            },
            {
              opacity: 0,
              transform: "scale(1.3)"
            }
          ],
          {
            duration: 500
          }
        );
      }
      
      // FULLSCREEN
      function toggleFullScreen() {
        if (!videoWrapper) return;
        
        const deviceAgent = navigator.userAgent.toLowerCase();
        if (deviceAgent.match(/(iphone|ipod|ipad)/)) return;
        
        if (
          document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.mozFullScreenElement ||
          document.msFullscreenElement
        ) {
          closeFullscreen();
          fullscreenActive = false;
        } else {
          if (videoWrapper.requestFullscreen) {
            videoWrapper.requestFullscreen();
            fullscreenActive = true;
          } else if (videoWrapper.mozRequestFullScreen) {
            videoWrapper.mozRequestFullScreen();
            fullscreenActive = true;
          } else if (videoWrapper.webkitRequestFullscreen) {
            videoWrapper.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            fullscreenActive = true;
          }
        }
      }
      
      // FULLSCREEN ICON
      function updateFullscreenButton() {
        if (!fullscreenIcons) return;
        
        fullscreenIcons.forEach((icon) => icon.classList.toggle("hidden"));
        body.classList.toggle("fullscreen");
      }
      
      // HIDE CONTROLS
      function hideControls() {
        if (!videoControls || !videoTap) return;
        
        if (video.paused) {
          showControls();
          return;
        }
        
        videoControls.classList.add("hide");
        videoTap.classList.remove("hide");
      }
      
      // SHOW CONTROLS
      function showControls() {
        if (!videoControls || !videoTap) return;
        
        videoControls.classList.remove("hide");
        videoTap.classList.add("hide");
      }
      
      // Variable to store timeout for controls hiding
      let controlsTimeout;
      
      // VOLUME SLIDER
      function volumeSlider() {
        if (!volume) return;
        
        var value = ((volume.value - volume.min) / (volume.max - volume.min)) * 100;
        
        // Get color from data-gradient attribute or use default pink
        var color = $(volume).attr("data-gradient") || "#EF9EA7";
        
        volume.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${value}%, #fff ${value}%, white 100%)`;
      }
      
      // KEYBOARD SHORTCUTS
      function keyboardShortcuts(event) {
        if (!video) return;
        
        const { key } = event;
        switch (key) {
          case " ":
            if (fullscreenActive && video.paused) {
              video.play();
              if (videoTap) videoTap.classList.remove("hide");
            } else if (fullscreenActive && !video.paused) {
              video.pause();
              if (videoTap) videoTap.classList.add("hide");
            }
            break;
          case "m":
            toggleMute();
            break;
        }
      }
      
      // Add event listeners if elements exist
      if (playButton) {
        playButton.addEventListener("click", togglePlay);
      }
      
      if (videoTap) {
        videoTap.addEventListener("click", function() {
          togglePlay();
          showControls();
        });
      }
      
      if (video) {
        video.addEventListener("play", updatePlayButton);
        video.addEventListener("pause", updatePlayButton);
        video.addEventListener("loadedmetadata", initializeVideo);
        video.addEventListener("timeupdate", updateTimeElapsed);
        video.addEventListener("timeupdate", updateProgress);
        video.addEventListener("volumechange", updateVolumeIcon);
        
        video.addEventListener("click", function() {
          togglePlay();
          animatePlayback();
        });
        
        video.addEventListener("play", function() {
          setTimeout(() => {
            hideControls();
          }, 500);
        });
        
        video.addEventListener("pause", function() {
          setTimeout(() => {
            showControls();
          }, 500);
        });
        
        video.onwaiting = function() {
          body.classList.add("buffering");
        };
        
        video.onplaying = function() {
          body.classList.remove("buffering");
        };
      }
      
      // Add hover behavior for controls
      if (videoControls) {
        videoControls.addEventListener("mouseenter", function() {
          clearTimeout(controlsTimeout);
          showControls();
        });
        
        videoControls.addEventListener("mouseleave", function() {
          if (video && !video.paused) {
            hideControls();
          }
        });
      }
      
      if (seek) {
        seek.addEventListener("input", skipAhead);
      }
      
      if (volume) {
        volume.addEventListener("input", function() {
          updateVolume();
          volumeSlider();
        });
      }
      
      if (volumeButton) {
        volumeButton.addEventListener("click", toggleMute);
      }
      
      if (fullscreenButton) {
        fullscreenButton.addEventListener("click", toggleFullScreen);
      }
      
      if (videoWrapper) {
        videoWrapper.addEventListener("fullscreenchange", updateFullscreenButton);
        videoWrapper.addEventListener("mozfullscreenchange", updateFullscreenButton);
        videoWrapper.addEventListener("webkitfullscreenchange", updateFullscreenButton);
        videoWrapper.addEventListener("msfullscreenchange", updateFullscreenButton);
      }
      
      // iOS specific handling
      if (video) {
        const deviceAgent = navigator.userAgent.toLowerCase();
        if (deviceAgent.match(/(iphone|ipod|ipad)/)) {
          video.addEventListener("webkitbeginfullscreen", function() {
            body.classList.add("fsios");
          });
          
          video.addEventListener("webkitendfullscreen", function() {
            video.pause();
            body.classList.remove("fsios");
          });
          
          if (fullscreenButton) {
            fullscreenButton.addEventListener("touchstart", function() {
              let time = window.setInterval(function() {
                try {
                  video.webkitEnterFullscreen();
                } catch (e) {}
              }, 250);
              
              video.play();
              
              // Clear interval after a short time
              setTimeout(function() {
                clearInterval(time);
              }, 1000);
            });
          }
        }
      }
      
      // Global keyboard shortcuts
      document.addEventListener("keyup", keyboardShortcuts);
    });
  }

  // Function to check and fix season navigation buttons
  function checkAndFixSeasonNavButtons() {
    if (debugSeasonNav) console.log("Checking and fixing season navigation buttons");

    // Find all season navigation buttons
    const nextButtons = $(".season-next, #nextBtn, .next-btn, .w-slider-arrow-right, .season-arrow-next");
    const prevButtons = $(".season-prev, #prevBtn, .prev-btn, .w-slider-arrow-left, .season-arrow-prev");

    // If no buttons found with standard classes, try to identify them by their position or content
    if (nextButtons.length === 0 || prevButtons.length === 0) {
      if (debugSeasonNav) console.log("Standard navigation buttons not found, looking for alternatives");

      // Look for elements that might be navigation buttons based on their content or position
      $("a, button, div").each(function() {
        const $this = $(this);
        const text = $this.text().toLowerCase();
        const hasNextIcon = $this.find('[class*="next"], [class*="right"], [class*="arrow"]').length > 0;
        const hasPrevIcon = $this.find('[class*="prev"], [class*="left"], [class*="arrow"]').length > 0;

        // Check if this element looks like a next button
        if (
          (text.includes("next") || hasNextIcon) &&
          !$this.hasClass("season-next") &&
          !$this.attr("id") === "nextBtn"
        ) {
          if (debugSeasonNav) console.log("Found potential next button:", $this);
          $this.addClass("season-next");
        }

        // Check if this element looks like a prev button
        if (
          (text.includes("prev") || text.includes("previous") || hasPrevIcon) &&
          !$this.hasClass("season-prev") &&
          !$this.attr("id") === "prevBtn"
        ) {
          if (debugSeasonNav) console.log("Found potential prev button:", $this);
          $this.addClass("season-prev");
        }
      });

      // Re-initialize season navigation to apply event handlers to newly identified buttons
      initSeasonNavigation();
    }
  }

  // Initialize controls
  initVideoControls();

  // Make sure season navigation is initialized even if no videos are present
  initSeasonNavigation();

  // Check and fix season navigation buttons
  setTimeout(checkAndFixSeasonNavButtons, 1000);

  // Re-initialize controls when new content is loaded
  $(document).on("contentLoaded", function () {
    if (debugSeasonNav) console.log("Content loaded event detected - reinitializing controls");
    initVideoControls();
    initSeasonNavigation();
    setTimeout(checkAndFixSeasonNavButtons, 500);
  });

  // Also initialize on document ready to ensure it runs after Webflow's own initialization
  $(window).on("load", function() {
    if (debugSeasonNav) console.log("Window load event - reinitializing season navigation");
    initVideoControls();
    initSeasonNavigation();
    setTimeout(checkAndFixSeasonNavButtons, 500);
  });

  // Add a global function that can be called from the browser console for debugging
  window.fixSeasonNavigation = function() {
    console.log("Manual fix of season navigation requested");
    initSeasonNavigation();
    checkAndFixSeasonNavButtons();
    return "Season navigation initialization attempted";
  };
});