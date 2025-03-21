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

// Tab Buttons - Update data-tab attribute
$(".season-tab_link").on("click", function () {
  $(".season-tab_link").attr("data-tab", "");
  $(this).attr("data-tab", "current");
});

// Tab Functions - Improved to handle season selection properly
$(".season-tab_link").on("click", function () {
  // Get the season number from the class (is-season-X)
  let seasonClass = $(this).attr("class").match(/is-season-(\d+)/);
  let seasonNumber = 1; // Default to season 1

  if (seasonClass && seasonClass[1]) {
    seasonNumber = parseInt(seasonClass[1]);
  } else if ($(this).attr("id") === "nextBtn") {
    // Handle next button
    let current = $(".season-tab_content-panel.active");
    let next = current.next(".season-tab_content-panel");
    if (next.length) {
      current.removeClass("active");
      next.addClass("active");
      // Update footer
      updateTab();
      return;
    }
  } else if ($(this).attr("id") === "prevBtn") {
    // Handle previous button
    let current = $(".season-tab_content-panel.active");
    let prev = current.prev(".season-tab_content-panel");
    if (prev.length) {
      current.removeClass("active");
      prev.addClass("active");
      // Update footer
      updateTab();
      return;
    }
  }

  // Remove active class from all panels
  $(".season-tab_content-panel").removeClass("active");

  // Add active class to the corresponding panel
  // Try first with data-season-X attribute
  let targetPanel = $(`.season-tab_content-panel[data-season-${seasonNumber}]`);

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

// Update Tab - Enhanced to handle all seasons
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

    // Update hero button text
    if ($("#heroBtn").length) {
      $("#heroBtn").text("Season " + seasonNumber);
    }

    // Pause all videos
    $(".player-item video").each(function () {
      $(this).get(0).pause();
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

    // Trigger resize to adjust video container sizes
    if (typeof adjustVideoContainerSizes === "function") {
      setTimeout(adjustVideoContainerSizes, 100);
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

// Initialize tabs on page load
jQuery(document).ready(function($) {
  // If no tab is active, activate the first one
  if ($(".season-tab_content-panel.active").length === 0) {
    $(".season-tab_content-panel").first().addClass("active");
    $(".season-tab_link").first().attr("data-tab", "current");
  }

  // Run updateTab to initialize the active tab
  updateTab();
});
