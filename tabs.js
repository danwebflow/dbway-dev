/**
 * The DixonBaxi Way - Tab Functionality
 * Handles season tab switching and content panel activation
 */

// Restore the scroll-to-story functionality
const findStory = document.querySelector("#story-link");
if (findStory) {
  findStory.addEventListener("click", (e) => {
    e.preventDefault();
    const storyAnchor = $(".season-tab_content-panel.active #story-anchor")[0];
    if (storyAnchor) {
      storyAnchor.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  });
}

const findLink = document.querySelector("#find-button");
if (findLink) {
  findLink.addEventListener("click", (e) => {
    e.preventDefault();
    const storyAnchor = $(".season-tab_content-panel.active #story-anchor")[0];
    if (storyAnchor) {
      storyAnchor.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  });
}

console.log("tabs.js loaded");

// Tab Functions - Improved to handle season selection properly with immediate class updates
$(".season-tab_link").on("click", function (e) {
  // Immediately update data-tab attribute and apply season classes
  $(".season-tab_link").attr("data-tab", "");
  $(this).attr("data-tab", "current");

  // Get the season number from the button ID (season-X) or class (is-season-X)
  let seasonNumber = 1; // Default to season 1
  let buttonId = $(this).attr("id");
  let seasonClass = $(this)
    .attr("class")
    .match(/is-season-(\d+)/);

  // Check if the button has a season-X ID
  if (buttonId && buttonId.match(/season-(\d+)/)) {
    seasonNumber = parseInt(buttonId.match(/season-(\d+)/)[1]);
  }
  // Otherwise check for is-season-X class
  else if (seasonClass && seasonClass[1]) {
    seasonNumber = parseInt(seasonClass[1]);
  }

  // Immediately apply season classes before DOM updates
  applySeasonClasses(seasonNumber);

  // Remove active class from all panels
  $(".season-tab_content-panel").removeClass("active");

  // Add active class to the corresponding panel
  // Try first with data-season-X attribute
  let targetPanel = $(`.season-tab_content-panel[data-season="${seasonNumber}"]`);

  // If not found, fall back to index-based selection
  if (targetPanel.length === 0) {
    targetPanel = $(".season-tab_content-panel").eq(seasonNumber - 1);
  }

  // Activate the panel
  if (targetPanel.length) {
    targetPanel.addClass("active");

    // Reset player items and chapters
    $(".player-item").removeClass("active");
    $(".chapter").removeClass("active");
    $(".chapter-item").removeClass("active");

    // Update footer
    updateTab();
  }
});

// Function to immediately apply season-specific CSS classes
function applySeasonClasses(seasonNumber) {
  // Remove all season classes from buttons (using direct DOM manipulation for speed)
  $("#hero-button, #find-button, .season-tab_link").removeClass("s1 s2 s3");

  // Add the appropriate season class
  const seasonClass = "s" + seasonNumber;
  $("#hero-button, #find-button, .season-tab_link[data-tab='current']").addClass(seasonClass);
}

// Legacy function maintained for compatibility
function updateSeasonClasses(seasonNumber) {
  applySeasonClasses(seasonNumber);
}

// Add chapter-info click handler
$(document).on("click", ".chapter-info", function () {
  var chapter = $(this).parent();

  if (chapter.hasClass("active")) {
    chapter.removeClass("active");
  } else {
    $(".chapter").removeClass("active");
    chapter.addClass("active");

    // If this is the first time opening this chapter, activate the first item
    if (!chapter.find(".chapter-item.active").length) {
      var firstItem = chapter.find(".chapter-item").first();
      if (firstItem.length) {
        $(".chapter-item").removeClass("active");
        firstItem.addClass("active");

        // If we have a video ID, play that video
        var videoId = firstItem.attr("data-id");
        if (videoId && typeof videoplay === "function") {
          videoplay(videoId);
        }
      }
    }
  }

  // Scroll to top of scrollbar if it exists
  if ($(".scrollbar").length) {
    $(".scrollbar").animate(
      {
        scrollTop: $(".scrollbar").offset().top,
      },
      50
    );
  }
});

// Update Tab - Enhanced to handle all seasons with immediate class application
function updateTab() {
  // Get current active tab
  let tab = $(".season-tab_content-panel"),
    current = tab.filter(".active");
  let getIndex = current.index();

  if (current.length) {
    // Check for data-season attribute first
    let seasonAttr = current.attr("data-season");
    let seasonNumber;

    if (seasonAttr) {
      // If data-season attribute exists, use it
      seasonNumber = parseInt(seasonAttr);
    } else {
      // Otherwise fall back to index
      seasonNumber = getIndex + 1;
    }

    // Update hero button text immediately
    if ($("#heroBtn").length) {
      $("#heroBtn").text("Season " + seasonNumber);
    }

    // Immediately apply season-specific CSS classes
    applySeasonClasses(seasonNumber);

    // Pause all videos
    $(".player-item video").each(function () {
      this.pause(); // Direct DOM access is faster than jQuery's get(0).pause()
    });

    // Add class to first player-item in current tab
    let firstPlayerItem = current.find(".player-item").first();
    if (firstPlayerItem.length) {
      firstPlayerItem.addClass("active");
    }

    // Add class to first chapter in current tab
    let firstChapter = current.find(".chapter").first();
    if (firstChapter.length) {
      firstChapter.addClass("active");

      // Add class to first chapter-item in first chapter
      let firstChapterItem = firstChapter.find(".chapter-item").first();
      if (firstChapterItem.length) {
        firstChapterItem.addClass("active");

        // If we have a video ID, preload that video
        let videoId = firstChapterItem.attr("data-id");
        if (videoId) {
          // Preload the video but don't play it automatically
          let videoElement = current.find(`.player-item[data-video="${videoId}"]`).find("video");
          if (videoElement.length) {
            videoElement.attr("preload", "auto");
          }
        }
      }
    }

    // Immediately adjust video container sizes
    if (typeof adjustVideoContainerSizes === "function") {
      adjustVideoContainerSizes(); // Remove timeout for immediate execution
    }
  }
}

updateTab();

// CHANGE HERO VIDEO SOURCE
$(".season-tab_link").on("click", function (event) {
  var change = $(this).attr("data-source");
  if (change && $(".hero-video").length > 0) {
    $(".hero-video")[0].pause();
    $(".hero-video").attr("src", change);
    $(".hero-video")[0].load();
    $(".hero-video")[0].play();
  }
});

// Responsive handling for video containers
jQuery(window).on("resize", function () {
  // Use the global adjustVideoContainerSizes function if available
  if (typeof adjustVideoContainerSizes === "function") {
    adjustVideoContainerSizes();
  } else {
    // Fallback implementation if the global function is not available
    jQuery(function () {
      if (jQuery(window).width() >= 1440) {
        // Large screens - fixed height
        var maxHeight = 593.25;
        jQuery(".player-content").each(function () {
          jQuery(this).css("height", maxHeight + "px");
          jQuery(".player-menu_list").css("height", maxHeight + "px");
        });
      } else if (jQuery(window).width() >= 992 && jQuery(window).width() <= 1439) {
        // Medium screens - dynamic height based on video
        var videoElement = jQuery(".player-item.active .player-content").find("video");
        var videoHeight = videoElement.length ? videoElement.height() : 0;

        // If video height is 0 or very small, use a reasonable default
        if (!videoHeight || videoHeight < 10) {
          videoHeight = 400;
        }

        jQuery(".player-content").each(function () {
          jQuery(this).css("height", "auto");
          jQuery(this).css("min-height", videoHeight + "px");
          jQuery(".player-menu_list").css("height", videoHeight + "px");
        });
      } else {
        // Small screens - auto height
        jQuery(".player-content").each(function () {
          jQuery(this).css("min-height", "auto");
          jQuery(".player-menu_list").css("height", "auto");
        });
      }
    });
  }
});

// Initialize tabs on page load - optimized for immediate class application
jQuery(document).ready(function ($) {
  // Apply season classes immediately based on active tab or data attributes
  let seasonNumber = 3; // Default to season 3 as per requirements
  let activePanel = $(".season-tab_content-panel.active");
  let activeTabLink = $(".season-tab_link[data-tab='active'], .season-tab_link[data-tab='current']");

  // If no panel is active, activate one
  if (activePanel.length === 0) {
    // Check if there's a tab with data-tab="active" or data-tab="current"
    if (activeTabLink.length) {
      // Get the season number from the active tab
      let buttonId = activeTabLink.attr("id");
      let seasonClass = activeTabLink.attr("class").match(/is-season-(\d+)/);

      if (buttonId && buttonId.match(/season-(\d+)/)) {
        seasonNumber = parseInt(buttonId.match(/season-(\d+)/)[1]);
      } else if (seasonClass && seasonClass[1]) {
        seasonNumber = parseInt(seasonClass[1]);
      }

      // Activate the corresponding panel
      let targetPanel = $(`.season-tab_content-panel[data-season="${seasonNumber}"]`);
      if (targetPanel.length === 0) {
        targetPanel = $(".season-tab_content-panel").eq(seasonNumber - 1);
      }

      targetPanel.addClass("active");
      activeTabLink.attr("data-tab", "current");
    } else {
      // Default to season 3 tab
      let season3Panel = $(`.season-tab_content-panel[data-season="3"]`);
      if (season3Panel.length === 0) {
        season3Panel = $(".season-tab_content-panel").eq(2); // 0-based index, so 2 is the third panel
      }

      season3Panel.addClass("active");
      $(".season-tab_link.is-season-3, #season-3").attr("data-tab", "current");
    }

    // Get the active panel again after activation
    activePanel = $(".season-tab_content-panel.active");
  }

  // Determine season number from active panel
  if (activePanel.length) {
    let panelSeasonAttr = activePanel.attr("data-season");
    if (panelSeasonAttr) {
      seasonNumber = parseInt(panelSeasonAttr);
    } else {
      // Try to determine from index
      seasonNumber = activePanel.index() + 1;
    }
  }

  // Immediately apply season classes
  applySeasonClasses(seasonNumber);

  // Initialize first player item, chapter, etc.
  if (activePanel.length) {
    // Add class to first player-item in active tab
    let firstPlayerItem = activePanel.find(".player-item").first();
    if (firstPlayerItem.length) {
      firstPlayerItem.addClass("active");
    }

    // Add class to first chapter in active tab
    let firstChapter = activePanel.find(".chapter").first();
    if (firstChapter.length) {
      firstChapter.addClass("active");

      // Add class to first chapter-item in first chapter
      let firstChapterItem = firstChapter.find(".chapter-item").first();
      if (firstChapterItem.length) {
        firstChapterItem.addClass("active");
      }
    }
  }

  // Update hero button text if it exists
  if ($("#heroBtn").length) {
    $("#heroBtn").text("Season " + seasonNumber);
  }

  // Trigger resize to adjust video container sizes
  if (typeof adjustVideoContainerSizes === "function") {
    adjustVideoContainerSizes();
  }
});
