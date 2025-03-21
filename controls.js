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

  // Initialize controls
  initVideoControls();

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
/**
 * The DixonBaxi Way - Unified Video Controls
 *
 * This script provides a unified control system for all video players:
 * - Play/pause functionality
 * - Volume control with custom gradient slider
 * - Fullscreen toggle
 * - Caption support
 * - Progress bar
 *
 * Supports multiple seasons with different color schemes via data-gradient attribute
 */

(function () {
  // Default colors for seasons (fallback if data-gradient is not set)
  const DEFAULT_COLORS = {
    "season-1": "#EF9EA7", // Season 1 pink
    "season-2": "#C8B4FF", // Season 2 purple
    "season-3": "#A7EFEF", // Season 3 teal (new)
    // Add new seasons here with their default colors
  };

  // Track initialized players to avoid duplicate initialization
  const initializedPlayers = new Set();

  /**
   * Initialize all video players when DOM is loaded
   */
  document.addEventListener("DOMContentLoaded", function () {
    // Find all season containers and initialize them
    const seasonContainers = document.querySelectorAll('[id^="season-"]');

    if (seasonContainers.length > 0) {
      // Initialize players for each season container found
      seasonContainers.forEach((container) => {
        const containerId = container.id;
        initializeVideoPlayers(`#${containerId} .player-item`, containerId);
      });
    } else {
      // Fallback to old IDs if new format not found
      initializeVideoPlayers("#player-videos .player-item", "player-videos");
      initializeVideoPlayers("#player-videos-2 .player-item", "player-videos-2");
    }

    // Season 3 will be automatically initialized if it exists with id="season-3"
  });

  /**
   * Helper function to register a new season player
   * @param {string} playerSelector - Selector for player items
   * @param {string} containerId - ID of the container element
   *
   * Example usage for Season 3:
   * registerSeasonPlayer("#season-3 .player-item", "season-3");
   */
  function registerSeasonPlayer(playerSelector, containerId) {
    initializeVideoPlayers(playerSelector, containerId);
  }

  /**
   * Initializes video players with controls
   * @param {string} playerSelector - Selector for player items
   * @param {string} containerId - ID of the container element
   */
  function initializeVideoPlayers(playerSelector, containerId) {
    const players = document.querySelectorAll(playerSelector);

    players.forEach((player) => {
      // Skip if already initialized
      if (initializedPlayers.has(player)) return;
      initializedPlayers.add(player);

      const video = player.querySelector("video");
      if (!video) return;

      // Set up all controls
      setupPlayPauseControl(player, video);
      setupVolumeControl(player, video, containerId);
      setupProgressBar(player, video);
      setupFullscreenControl(player, video);
      setupCaptionsControl(player, video);

      // Initialize volume slider gradient
      initializeVolumeSliderGradient(player, containerId);

      // Auto-mute if debug mode is active
      if (debugMode) {
        video.muted = true;

        // Update volume icons if they exist
        const volumeButton = player.querySelector(".volume-button");
        if (volumeButton) {
          const volumeSlider = player.querySelector(".volume");
          if (volumeSlider) {
            // Store original volume for restoration if debug mode is disabled
            volumeButton.dataset.debugOriginalVolume = volumeSlider.value;
            volumeSlider.value = 0;
            updateVolumeSliderGradient(volumeSlider, containerId);
          }
          const volumeMute = volumeButton.querySelector(".volume-mute");
          const volumeIcon = volumeButton.querySelector(".volume-on");
          if (volumeMute && volumeIcon) {
            volumeMute.style.display = "block";
            volumeIcon.style.display = "none";
          }
        }
      }

      // Handle video end
      video.addEventListener("ended", function () {
        const playButton = player.querySelector(".play-button");
        if (playButton) {
          playButton.classList.remove("is-playing");
        }
      });
    });
  }

  /**
   * Sets up play/pause functionality
   * @param {Element} player - The player container
   * @param {HTMLVideoElement} video - The video element
   */
  function setupPlayPauseControl(player, video) {
    const playButton = player.querySelector(".play-button");
    if (!playButton) return;

    playButton.addEventListener("click", function () {
      if (video.paused) {
        // Pause all other videos first
        document.querySelectorAll("video").forEach((v) => {
          if (v !== video) {
            v.pause();
            const otherPlayer = v.closest(".player-item");
            if (otherPlayer) {
              const otherPlayButton = otherPlayer.querySelector(".play-button");
              if (otherPlayButton) {
                otherPlayButton.classList.remove("is-playing");
              }
            }
          }
        });

        // Play this video
        video.play();
        playButton.classList.add("is-playing");
      } else {
        video.pause();
        playButton.classList.remove("is-playing");
      }
    });
  }

  /**
   * Sets up volume control with custom gradient slider
   * @param {Element} player - The player container
   * @param {HTMLVideoElement} video - The video element
   * @param {string} containerId - ID of the container element
   */
  function setupVolumeControl(player, video, containerId) {
    const volumeButton = player.querySelector(".volume-button");
    const volumeSlider = player.querySelector(".volume");

    if (!volumeButton || !volumeSlider) return;

    // Set initial volume
    video.volume = volumeSlider.value;

    // Update volume on slider change
    volumeSlider.addEventListener("input", function () {
      video.volume = this.value;
      updateVolumeIcon(volumeButton, this.value);
      volumeSlider.style.setProperty("--volume-level", this.value);

      // Update gradient
      updateVolumeSliderGradient(this, containerId);
    });

    // Toggle mute on button click
    volumeButton.addEventListener("click", function () {
      if (video.volume > 0) {
        // Store current volume before muting
        volumeButton.dataset.previousVolume = video.volume;
        video.volume = 0;
        volumeSlider.value = 0;
      } else {
        // Restore previous volume or default to 1
        const previousVolume = parseFloat(volumeButton.dataset.previousVolume || 1);
        video.volume = previousVolume;
        volumeSlider.value = previousVolume;
      }

      updateVolumeIcon(volumeButton, video.volume);
      volumeSlider.style.setProperty("--volume-level", video.volume);

      // Update gradient
      updateVolumeSliderGradient(volumeSlider, containerId);
    });
  }

  /**
   * Initializes the volume slider gradient on page load
   * @param {Element} player - The player container
   * @param {string} containerId - ID of the container element
   */
  function initializeVolumeSliderGradient(player, containerId) {
    const volumeSlider = player.querySelector(".volume");
    if (!volumeSlider) return;

    // Set initial volume level
    volumeSlider.style.setProperty("--volume-level", volumeSlider.value);

    // Initialize gradient
    updateVolumeSliderGradient(volumeSlider, containerId);
  }

  /**
   * Updates the volume slider gradient based on current value
   * @param {HTMLInputElement} slider - The volume slider element
   * @param {string} containerId - ID of the container element
   */
  function updateVolumeSliderGradient(slider, containerId) {
    let color;

    // First try to get color from data-gradient attribute
    color = slider.getAttribute("data-gradient");

    // If not found, try to get from container's border-color style
    if (!color) {
      const container = document.getElementById(containerId);
      if (container && container.style && container.style.borderColor) {
        color = container.style.borderColor;
      }
    }

    // If still not found, use default color from mapping
    if (!color) {
      color = DEFAULT_COLORS[containerId] || "#CCCCCC";
    }

    // Calculate percentage
    const percent = slider.value * 100;

    // Create gradient
    slider.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${percent}%, #333333 ${percent}%, #333333 100%)`;
  }

  /**
   * Updates the volume icon based on current volume
   * @param {Element} volumeButton - The volume button element
   * @param {number} volume - Current volume level (0-1)
   */
  function updateVolumeIcon(volumeButton, volume) {
    const muteIcon = volumeButton.querySelector(".volume-mute");
    const volumeIcon = volumeButton.querySelector(".volume-on");

    if (!muteIcon || !volumeIcon) return;

    if (volume > 0) {
      muteIcon.style.display = "none";
      volumeIcon.style.display = "block";
    } else {
      muteIcon.style.display = "block";
      volumeIcon.style.display = "none";
    }
  }

  /**
   * Sets up progress bar functionality
   * @param {Element} player - The player container
   * @param {HTMLVideoElement} video - The video element
   */
  function setupProgressBar(player, video) {
    const progressBar = player.querySelector(".progress-bar");
    const progressIndicator = player.querySelector(".progress-indicator");

    if (!progressBar || !progressIndicator) return;

    // Update progress as video plays
    video.addEventListener("timeupdate", function () {
      if (video.duration) {
        const progress = (video.currentTime / video.duration) * 100;
        progressIndicator.style.width = `${progress}%`;
      }
    });

    // Allow seeking by clicking on progress bar
    progressBar.addEventListener("click", function (e) {
      const rect = this.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      video.currentTime = pos * video.duration;
    });
  }

  /**
   * Sets up fullscreen functionality
   * @param {Element} player - The player container
   * @param {HTMLVideoElement} video - The video element
   */
  function setupFullscreenControl(player, video) {
    const fullscreenButton = player.querySelector(".fullscreen-button");
    if (!fullscreenButton) return;

    fullscreenButton.addEventListener("click", function () {
      const body = document.body;
      const videoWrapper = player.closest(".season-tab_content-panel") || player.parentElement;

      // Check if already in fullscreen
      if (
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      ) {
        // Exit fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
        body.classList.remove("fullscreen");
      } else {
        // Enter fullscreen with the video wrapper (not just the video)
        if (videoWrapper) {
          if (videoWrapper.requestFullscreen) {
            videoWrapper.requestFullscreen();
          } else if (videoWrapper.webkitRequestFullscreen) {
            videoWrapper.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
          } else if (videoWrapper.mozRequestFullScreen) {
            videoWrapper.mozRequestFullScreen();
          } else if (videoWrapper.msRequestFullscreen) {
            videoWrapper.msRequestFullscreen();
          }
          body.classList.add("fullscreen");
        }
      }

      // Toggle fullscreen icons if they exist
      const fullscreenIcons = fullscreenButton.querySelectorAll("use");
      if (fullscreenIcons && fullscreenIcons.length) {
        fullscreenIcons.forEach((icon) => icon.classList.toggle("hidden"));
      }
    });

    // Add event listeners for fullscreen change
    const events = ["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "MSFullscreenChange"];
    events.forEach((event) => {
      document.addEventListener(event, function () {
        if (
          !document.fullscreenElement &&
          !document.webkitFullscreenElement &&
          !document.mozFullScreenElement &&
          !document.msFullscreenElement
        ) {
          document.body.classList.remove("fullscreen");

          // Reset fullscreen icons if they exist
          const fullscreenIcons = fullscreenButton.querySelectorAll("use");
          if (fullscreenIcons && fullscreenIcons.length > 1) {
            fullscreenIcons[0].classList.remove("hidden");
            fullscreenIcons[1].classList.add("hidden");
          }
        }
      });
    });
  }

  /**
   * Sets up captions functionality
   * @param {Element} player - The player container
   * @param {HTMLVideoElement} video - The video element
   */
  function setupCaptionsControl(player, video) {
    // Try both possible caption button classes
    const captionsButton = player.querySelector(".captions-button") || player.querySelector(".subtitles-button");
    const controlsSubtitles = player.querySelector(".controls_subtitles");

    if (!captionsButton) return;

    // Check if video has caption tracks by examining track elements directly
    const trackElements = video.querySelectorAll("track");
    let hasCaptionTracks = false;

    if (trackElements && trackElements.length > 0) {
      for (let i = 0; i < trackElements.length; i++) {
        const track = trackElements[i];
        // Consider a track valid if it has a src attribute with content
        if (
          (track.kind === "subtitles" || track.kind === "captions") &&
          track.getAttribute("src") &&
          track.getAttribute("src").trim() !== ""
        ) {
          hasCaptionTracks = true;
          break;
        }
      }
    }

    // Also check textTracks as a fallback
    if (!hasCaptionTracks && video.textTracks && video.textTracks.length > 0) {
      for (let i = 0; i < video.textTracks.length; i++) {
        const textTrack = video.textTracks[i];
        if (textTrack.kind === "subtitles" || textTrack.kind === "captions") {
          // TextTrack objects might not have direct src access, but we can check if they're valid
          if (textTrack.cues && textTrack.cues.length > 0) {
            hasCaptionTracks = true;
            break;
          }
        }
      }
    }

    if (!hasCaptionTracks) {
      // Hide the captions button by adding the .hide class
      captionsButton.classList.add("hide");

      // Also hide the controls_subtitles element if it exists
      if (controlsSubtitles) {
        controlsSubtitles.classList.add("hide");
      }
      return;
    } else {
      // Ensure the button is visible by removing any hide class
      captionsButton.classList.remove("hide");

      // Show the controls_subtitles element if it exists
      if (controlsSubtitles) {
        controlsSubtitles.classList.remove("hide");
      }
    }
  }

  // Export the registerSeasonPlayer function for external use
  window.registerSeasonPlayer = registerSeasonPlayer;
})();
/**
 * Unified Video Controls
 * This file combines functionality from controls-1.js and controls-2.js
 * to provide a single control system for all video players.
 *
 * Usage Notes:
 * - For volume slider colors, add a data-gradient attribute to the volume input element
 *   Example: <input type="range" class="volume" data-gradient="#FF5500">
 * - Default colors if data-gradient is not specified:
 *   - Season 1 (player-videos): #EF9EA7
 *   - Season 2 (player-videos-2): #C8B4FF
 *   - Future seasons: Add the data-gradient attribute with your desired color
 */

// Initialize RangeTouch for better range input handling on touch devices
const ranges = RangeTouch.setup("input[type='range']", {
  thumbWidth: "16",
});

// Global variables
let fullscreenActive = false;
let lang;
let stopScrolling = false;

// Touch event handling for mobile
window.addEventListener("touchmove", handleTouchMove, {
  passive: false,
});

function handleTouchMove(e) {
  if (!stopScrolling) {
    return;
  }
  e.preventDefault();
}

function onTouchStart() {
  stopScrolling = true;
}

function onTouchEnd() {
  stopScrolling = false;
}

// Prevent default spacebar behavior to avoid page scrolling when using keyboard controls
document.addEventListener("keyup", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
  }
});

// Fullscreen scroll handling
function scrollFullscreenClose() {
  setTimeout(function () {
    var target = $("#tab-anchor");
    if (target.length) {
      $("html, body").animate({ scrollTop: target.offset().top }, 300);
      return false;
    }
  }, 500);
}

// Exit fullscreen function
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
    fullscreenActive = false;
  }
}

/**
 * Helper function to register a new season's video player
 * Call this function to add support for a new season
 *
 * @param {string} seasonSelector - The CSS selector for the season's player items
 * @param {string} seasonWrapperId - The ID of the season's wrapper element
 */
function registerSeasonPlayer(seasonSelector, seasonWrapperId) {
  jQuery(document).ready(function ($) {
    initializeVideoControls(seasonSelector, seasonWrapperId);
  });
}

// Main initialization function for video controls
jQuery(document).ready(function ($) {
  $(function () {
    var deviceAgent = navigator.userAgent.toLowerCase();

    // Find all season containers and initialize them
    const seasonContainers = document.querySelectorAll('[id^="season-"]');

    if (seasonContainers.length > 0) {
      // Initialize players for each season container found
      seasonContainers.forEach((container) => {
        const containerId = container.id;
        initializeVideoControls(`#${containerId} .player-item`, containerId);
      });
    } else {
      // Fallback to old IDs if new format not found
      initializeVideoControls("#player-videos .player-item", "player-videos");
      initializeVideoControls("#player-videos-2 .player-item", "player-videos-2");
    }

    // For future seasons, they will be automatically initialized if they exist with id="season-3", etc.

    function initializeVideoControls(playerSelector, videoWrapperId) {
      $(playerSelector).each(function () {
        var player = jQuery(this).get(0);
        const body = document.body;
        // Find the video wrapper - try both by ID and by closest parent with season-tab_content-panel class
        var videoWrapper =
          document.getElementById(videoWrapperId) ||
          player.closest(".season-tab_content-panel") ||
          player.parentElement;
        var video = player.querySelector(".player-video");

        // Check if video exists before proceeding
        if (!video) return;

        var videoControls = player.querySelector(".video-controls");

        // Check if video controls exist - if not, the player might be using a different structure
        if (!videoControls) {
          console.warn("Video controls not found for player:", player);
          return;
        }

        var videoTap = player.querySelector(".video-tap");
        // Try to find the play button with either class
        var playButton = player.querySelector(".play") || player.querySelector(".play-button");

        // Check if play button exists
        if (!playButton) {
          console.warn("Play button not found for player:", player);
          return;
        }

        var playbackIcons = player.querySelectorAll(".playback-icons use");
        var timeElapsed = player.querySelector(".time-elapsed");
        var duration = player.querySelector(".duration");
        var progressBar = player.querySelector(".progress-bar");
        var seek = player.querySelector(".seek");
        var seekTooltip = player.querySelector(".seek-tooltip");
        var volumeButton = player.querySelector(".volume-button");
        var volumeIcons = player.querySelectorAll(".volume-button use");
        var volumeMute = player.querySelector('use[href="#volume-mute"]');
        var volumeLow = player.querySelector('use[href="#volume-low"]');
        var volumeHigh = player.querySelector('use[href="#volume-high"]');
        var volume = player.querySelector(".volume");
        var playbackAnimation = player.querySelector(".playback-animation");
        var fullscreenButton = player.querySelector(".fullscreen-button");
        var captionsButton = player.querySelector(".subtitles-button");
        var captionsPanel = player.querySelector(".video-captions");
        var captionRadiosButton = player.querySelectorAll("[name='caption-language-selector']");
        var globalCaptions = document.querySelectorAll(".subtitles-button");
        var play = player.querySelector(".fullscreen-button");
        var time;
        var fullscreenIcons = fullscreenButton ? fullscreenButton.querySelectorAll("use") : null;
        var captionsIcons = captionsButton ? captionsButton.querySelectorAll("use") : null;

        // Check if video is supported
        var videoWorks = !!document.createElement("video").canPlayType;
        if (videoWorks) {
          video.controls = false;
          videoControls.classList.remove("hidden");
        }

        // We'll check for captions in the initializeVideo function

        // PLAY
        function togglePlay() {
          if (video.paused || video.ended) {
            video.play();
            videoTap.classList.remove("hide");
            if (captionsPanel) {
              captionsPanel.classList.remove("is-active");
            }
          } else {
            video.pause();
          }
        }

        // PLAY ICON
        function updatePlayButton() {
          playbackIcons.forEach((icon) => icon.classList.toggle("hidden"));
        }

        // TIME
        function formatTime(timeInSeconds) {
          const result = new Date(timeInSeconds * 1000).toISOString().substr(11, 8);

          return {
            minutes: result.substr(3, 2),
            seconds: result.substr(6, 2),
          };
        }

        // PROGRESS
        function initializeVideo() {
          // Check if video has caption tracks with valid src using the same improved logic
          let hasCaptionTracks = false;
          const controlsSubtitles = player.querySelector(".controls_subtitles");

          // Check track elements directly
          const trackElements = video.querySelectorAll("track");

          if (trackElements && trackElements.length > 0) {
            for (let i = 0; i < trackElements.length; i++) {
              const track = trackElements[i];
              if (
                (track.kind === "subtitles" || track.kind === "captions") &&
                track.getAttribute("src") &&
                track.getAttribute("src").trim() !== ""
              ) {
                hasCaptionTracks = true;
                break;
              }
            }
          }

          // Fallback to textTracks check
          if (!hasCaptionTracks && video.textTracks && video.textTracks.length > 0) {
            for (let i = 0; i < video.textTracks.length; i++) {
              const textTrack = video.textTracks[i];
              if (textTrack.kind === "subtitles" || textTrack.kind === "captions") {
                // Try to detect if the track has actual content
                if (textTrack.cues && textTrack.cues.length > 0) {
                  hasCaptionTracks = true;
                  break;
                }
              }
            }
          }

          // Handle caption button and controls visibility
          if (captionsButton) {
            if (!hasCaptionTracks) {
              captionsButton.style.display = "none";
              if (controlsSubtitles) {
                controlsSubtitles.classList.add("hide");
              }
            } else {
              captionsButton.style.display = "";
              if (controlsSubtitles) {
                controlsSubtitles.classList.remove("hide");
              }

              // For Season 2 and above, initialize language selection
              if (
                (videoWrapperId === "season-2" ||
                  videoWrapperId === "player-videos-2" ||
                  (videoWrapperId.startsWith("season-") && parseInt(videoWrapperId.split("-")[1]) >= 2)) &&
                typeof selectLanguageCaption === "function"
              ) {
                selectLanguageCaption();
              }
            }
          }

          const videoDuration = Math.round(video.duration);
          seek.setAttribute("max", videoDuration);
          progressBar.setAttribute("max", videoDuration);
          const time = formatTime(videoDuration);

          // Initialize volume slider with correct gradient
          if (volume) {
            volumeSlider();
          }

          if (duration) {
            duration.innerText = `${time.minutes}:${time.seconds}`;
            duration.setAttribute("datetime", `${time.minutes}m ${time.seconds}s`);
            togglePlay();
          }

          // Ensure video stays muted in debug mode
          if (debugMode && !video.muted) {
            video.muted = true;
          }
        }

        // ELAPSED TIME
        function updateTimeElapsed() {
          const time = formatTime(Math.round(video.currentTime));
          timeElapsed.innerText = `${time.minutes}:${time.seconds}`;
          timeElapsed.setAttribute("datetime", `${time.minutes}m ${time.seconds}s`);
        }

        // UPDATE PROGRESS
        function updateProgress() {
          seek.value = Math.floor(video.currentTime);
          progressBar.value = Math.floor(video.currentTime);
        }

        // Update seek tooltip (for player-videos-2)
        function updateSeekTooltip(event) {
          if (!seekTooltip) return;

          const skipTo = Math.round(
            (event.offsetX / event.target.clientWidth) * parseInt(event.target.getAttribute("max"), 10)
          );
          seek.setAttribute("data-seek", skipTo);
        }

        // PROGRESS SKIP
        function skipAhead(event) {
          if ("touchstart" in seek) {
            seek.classList.add("hidden");
            setTimeout(() => {
              seek.classList.remove("hidden");
            }, 500);
          }

          const skipTo = event.target.dataset.seek ? event.target.dataset.seek : event.target.value;
          video.currentTime = skipTo;
          progressBar.value = skipTo;
          seek.value = skipTo;
        }

        // VOLUME
        function updateVolume() {
          if (video.muted) {
            video.muted = false;
          }

          video.volume = volume.value;
        }

        // VOLUME ICONS
        function updateVolumeIcon() {
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
          playbackAnimation.animate(
            [
              {
                opacity: 1,
                transform: "scale(1)",
              },
              {
                opacity: 0,
                transform: "scale(1.3)",
              },
            ],
            {
              duration: 500,
            }
          );
        }

        // FULLSCREEN
        function toggleFullScreen() {
          if (!deviceAgent.match(/(iphone|ipod|ipad)/)) {
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
        }

        // FULLSCREEN ICON
        function updateFullscreenButton() {
          if (fullscreenIcons) {
            fullscreenIcons.forEach((icon) => icon.classList.toggle("hidden"));
          }

          // Check if we're in fullscreen mode
          const isFullscreen =
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement;

          // Add or remove fullscreen class based on actual fullscreen state
          if (isFullscreen) {
            body.classList.add("fullscreen");
            document.body.classList.add("fullscreen");
          } else {
            body.classList.remove("fullscreen");
            document.body.classList.remove("fullscreen");
          }
        }

        // HIDE CONTROLS
        function hideControls() {
          if (video.paused) {
            showControls();
            return;
          }

          videoControls.classList.add("hide");
          videoTap.classList.remove("hide");
          if (captionsPanel) {
            captionsPanel.classList.remove("is-active");
          }
        }

        // SHOW CONTROLS
        function showControls() {
          videoControls.classList.remove("hide");
          videoTap.classList.add("hide");
        }

        // Add transition animation to video controls and improve hover behavior
        function setupHoverBehavior() {
          // Variable to store timeout
          let controlsTimeout;

          // Find the player-content element (if it exists) or fallback to player
          const playerContent = player.querySelector(".player-content") || player;

          // Identify elements that should be excluded from hover behavior
          const videoInfo = player.querySelector(".video-info");
          const videoOptions = player.querySelector(".video-options");

          // Function to check if an element or its parents have specific classes
          function hasClass(element, className) {
            while (element) {
              if (element.classList && element.classList.contains(className)) {
                return true;
              }
              element = element.parentElement;
            }
            return false;
          }

          // Function to handle mouse movement
          function handleMouseMove(e) {
            // Skip if hovering over video-info or video-options
            if (e.target && (hasClass(e.target, "video-info") || hasClass(e.target, "video-options"))) {
              return;
            }

            // Clear any existing timeout
            clearTimeout(controlsTimeout);

            // Show controls immediately
            showControls();

            // Set timeout to hide controls after 2.5 seconds of inactivity
            if (!video.paused) {
              controlsTimeout = setTimeout(function () {
                hideControls();
              }, 2500);
            }
          }

          // Show controls on mouse move over player content
          playerContent.addEventListener("mousemove", handleMouseMove);

          // For the video element itself, always show controls on hover
          video.addEventListener("mousemove", function (e) {
            e.stopPropagation(); // Prevent event from bubbling
            clearTimeout(controlsTimeout);
            showControls();

            if (!video.paused) {
              controlsTimeout = setTimeout(function () {
                hideControls();
              }, 2500);
            }
          });

          // Keep controls visible when hovering over controls themselves
          videoControls.addEventListener("mouseenter", function () {
            clearTimeout(controlsTimeout);
            showControls();
          });

          // Handle mouse leave properly for player-content
          playerContent.addEventListener("mouseleave", function (e) {
            // Don't hide if moving to video-info or video-options
            if (
              e.relatedTarget &&
              (hasClass(e.relatedTarget, "video-info") || hasClass(e.relatedTarget, "video-options"))
            ) {
              return;
            }

            if (!video.paused) {
              hideControls();
            }
          });

          // Handle touch interactions for mobile
          video.addEventListener("touchstart", function (e) {
            // Toggle controls visibility on touch
            if (videoControls.classList.contains("hide")) {
              showControls();

              // Hide controls after a delay if video is playing
              if (!video.paused) {
                clearTimeout(controlsTimeout);
                controlsTimeout = setTimeout(hideControls, 3000);
              }
            } else {
              hideControls();
            }
          });
        }

        // Setup enhanced hover behavior (use modified function above)
        setupHoverBehavior();

        // VOLUME SLIDER
        function volumeSlider() {
          var value = ((volume.value - volume.min) / (volume.max - volume.min)) * 100;

          // Get color from various sources
          var color;

          // First try to get color from data-gradient attribute
          color = $(volume).attr("data-gradient");

          // If not found, try to get from container's border-color style
          if (!color) {
            var container = document.getElementById(videoWrapperId);
            if (container && container.style && container.style.borderColor) {
              color = container.style.borderColor;
            }
          }

          // If still not found, try to find the season container
          if (!color) {
            var seasonContainer = $(player).closest('[id^="season-"]');
            if (seasonContainer.length > 0) {
              color = seasonContainer.css("border-color");
            }
          }

          // If still not found, use default color from mapping
          if (!color) {
            color = DEFAULT_COLORS[videoWrapperId] || "#CCCCCC";
          }

          volume.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${value}%, #fff ${value}%, white 100%)`;
        }

        // PLAY CURRENT
        let currentVideo = $(`#${videoWrapperId} .player-video`).get(0);
        function togglePlayFullscreenPlay() {
          currentVideo.play();
          videoTap.classList.remove("hide");
        }
        function togglePlayFullscreenPause() {
          currentVideo.pause();
          videoTap.classList.add("hide");
        }

        // KEYBOARD SHORTCUTS
        function keyboardShortcuts(event) {
          const { key } = event;
          switch (key) {
            case " ":
              if (fullscreenActive === true && currentVideo.paused) {
                togglePlayFullscreenPlay();
              } else if (fullscreenActive === true && !currentVideo.paused) {
                togglePlayFullscreenPause();
              }
              break;
            case "m":
              toggleMute();
              break;
          }
        }

        // CAPTIONS FUNCTIONS
        if (video.textTracks && video.textTracks.length > 0) {
          // HIDDEN CAPTIONS ALL VIDEOS
          document.querySelectorAll(".is-hidden").forEach((elem) => {
            elem.removeAttribute("default");
          });

          for (let i = 0; i < video.textTracks.length; i++) {
            const track = video.textTracks[i];
            track.kind = "subtitles";
            track.mode = "hidden";
          }

          function checkCaptionBar() {
            if (captionsPanel) {
              captionsPanel.classList.toggle("is-active");
              let captionBar = $(".video-captions.is-active");
              let findVid = $(".player-item.active").find("video")[0];
              if (captionBar.length > 1) {
                if (findVid) findVid.pause();
              } else {
                if (findVid) findVid.play();
              }
            }
          }

          // DEFAULT TOGGLECAPTIONS
          function toggleCaptions() {
            checkCaptionBar();
            if (captionsButton) {
              captionsButton.classList.toggle("subtitles-on");
              captionsButton.classList.toggle("is-active");
            }
          }

          function selectLanguageCaption() {
            lang = lang === undefined ? "Disabled" : lang;
            let languageRadio = player.querySelector(`#caption-scroll [name='caption-language-selector']#${lang}`);
            if (languageRadio && !$(languageRadio.previousElementSibling).hasClass("w--redirected-checked")) {
              $(languageRadio).trigger("click");
              languageRadio.previousElementSibling.classList.add("w--redirected-checked");
            }
          }

          // CHECK CAPTION RADIOS
          function languageRadios(e) {
            if (e) {
              lang = e.target.lang || "Disabled";
            }
            for (let i = 0; i < video.textTracks.length; i++) {
              if (video.textTracks[i].language === lang) {
                video.textTracks[i].mode = "showing";
              } else {
                video.textTracks[i].mode = "hidden";
              }
            }
            if (e.target.lang == "") {
              // Disabled option
              captionsIcons[0].classList.remove("hidden");
              captionsIcons[1].classList.add("hidden");
              $(".video-captions").removeClass("is-active");
              setTimeout(function () {
                video.play();
                videoControls.classList.add("hide");
                videoTap.classList.remove("hide");
              }, 500);
            } else {
              captionsIcons[0].classList.add("hidden");
              captionsIcons[1].classList.remove("hidden");
              $(".video-captions").removeClass("is-active");
              setTimeout(function () {
                video.play();
                videoControls.classList.add("hide");
                videoTap.classList.remove("hide");
              }, 500);
            }
          }

          // Add caption-specific event listeners
          if (captionRadiosButton && typeof languageRadios === "function") {
            captionRadiosButton.forEach((radio) => {
              radio.addEventListener("click", (e) => languageRadios(e));
            });
          }

          if (globalCaptions && typeof toggleCaptions === "function") {
            globalCaptions.forEach((button) => {
              button.addEventListener("click", toggleCaptions);
            });
          }

          // Add direct event listener to captionsButton if it exists
          if (captionsButton && typeof toggleCaptions === "function") {
            captionsButton.addEventListener("click", toggleCaptions);
          }
        }

        // EVENT LISTENERS
        if (playButton) {
          playButton.addEventListener("click", function(e) {
            e.preventDefault();
            togglePlay();
          });
        }

        if (videoTap) {
          videoTap.addEventListener("click", function(e) {
            e.preventDefault();
            togglePlay();
            showControls();
          });
        }

        video.addEventListener("play", updatePlayButton);
        video.addEventListener("pause", updatePlayButton);
        video.addEventListener("loadedmetadata", initializeVideo);
        video.addEventListener("timeupdate", updateTimeElapsed);
        video.addEventListener("timeupdate", updateProgress);
        video.addEventListener("volumechange", updateVolumeIcon);

        // Combine click handlers to avoid conflicts
        video.addEventListener("click", function(e) {
          e.preventDefault();
          togglePlay();
          animatePlayback();
        });

        // Remove conflicting mouseleave event on video that might interfere with controls
        // video.addEventListener("mouseleave", hideControls);

        // Setup enhanced hover behavior
        setupHoverBehavior();

        // Keep the remaining event listeners for video controls
        if (videoControls) {
          videoControls.addEventListener("mouseenter", function() {
            clearTimeout(controlsTimeout);
            showControls();
          });

          videoControls.addEventListener("mouseleave", function() {
            if (!video.paused) {
              hideControls();
            }
          });
        }

        if (seekTooltip && seek) {
          seek.addEventListener("mousemove", updateSeekTooltip);
        }

        if (seek) {
          seek.addEventListener("input", skipAhead);
          // Add change event for better mobile support
          seek.addEventListener("change", skipAhead);
        }

        if (volume) {
          // Combine volume handlers to avoid conflicts
          volume.addEventListener("input", function() {
            updateVolume();
            volumeSlider();
          });
        }

        if (volumeButton) {
          volumeButton.addEventListener("click", toggleMute);
        }

        if (fullscreenButton && videoWrapper) {
          fullscreenButton.addEventListener("click", function(e) {
            e.preventDefault();
            toggleFullScreen();
          });

          // Add fullscreen change event listeners to both document and videoWrapper for better compatibility
          document.addEventListener("fullscreenchange", updateFullscreenButton);
          document.addEventListener("mozfullscreenchange", updateFullscreenButton);
          document.addEventListener("webkitfullscreenchange", updateFullscreenButton);
          document.addEventListener("msfullscreenchange", updateFullscreenButton);

          videoWrapper.addEventListener("fullscreenchange", updateFullscreenButton);
          videoWrapper.addEventListener("mozfullscreenchange", updateFullscreenButton);
          videoWrapper.addEventListener("webkitfullscreenchange", updateFullscreenButton);
          videoWrapper.addEventListener("msfullscreenchange", updateFullscreenButton);
        }

        document.addEventListener("keyup", keyboardShortcuts);

        video.addEventListener("play", function () {
          setTimeout(() => {
            hideControls();
          }, 500);
        });

        video.addEventListener("pause", function () {
          setTimeout(() => {
            showControls();
          }, 500);
        });

        video.onwaiting = function () {
          body.classList.add("buffering");
        };

        video.onplaying = function () {
          // Caption handling is now done in initializeVideo
          body.classList.remove("buffering");
        };

        if (deviceAgent.match(/(iphone|ipod|ipad)/)) {
          video.addEventListener("webkitbeginfullscreen", function () {
            window.clearInterval(time);
            body.classList.add("fsios");
          });
          video.addEventListener("webkitendfullscreen", function () {
            video.pause();
            body.classList.remove("fsios");
          });
          play.addEventListener("touchstart", function (e) {
            // Prevent default behavior to avoid conflicts
            e.preventDefault();

            time = window.setInterval(function () {
              try {
                video.webkitEnterFullscreen();
              } catch (e) {}
            }, 250);
            video.play();
          });
        }
      });
    }
  });
});
