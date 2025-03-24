/**
 * The DixonBaxi Way - Tab Functionality
 * Handles season tab switching and content panel activation
 */

console.log("tabs.js loaded");

const findLink = document.querySelector("#find-button");
findLink.addEventListener("click", (e) => {
  console.log(e);
  e.preventDefault();
  $(".season-tab_content-panel.active #story-anchor")[0].scrollIntoView({
    behavior: "smooth",
    block: "start",
    inline: "nearest",
  });
});

// Enhanced navigation function for prev/next buttons
function navigateSeasons(direction) {
  // Get all season panels and tabs
  const allPanels = $(".season-tab_content-panel");
  const allTabs = $(".season-tab_link");
  const totalSeasons = allPanels.length;

  if (totalSeasons === 0) return;

  // Get current season number from body data attribute or active panel
  let currentSeason = parseInt($("body").attr("data-current-season"));

  // If data attribute not set, determine from active panel
  if (!currentSeason) {
    const activePanel = $(".season-tab_content-panel.active");

    if (activePanel.length) {
      // Try to get season number from data attribute
      if (activePanel.attr("data-season")) {
        currentSeason = parseInt(activePanel.attr("data-season"));
      } else {
        // Fall back to index
        currentSeason = activePanel.index() + 1;
      }
    } else {
      // Default to first season if no active panel
      currentSeason = 1;
    }
  }

  // Calculate target season number
  let targetSeason;
  if (direction === "next") {
    targetSeason = currentSeason < totalSeasons ? currentSeason + 1 : 1; // Loop back to first season
  } else {
    targetSeason = currentSeason > 1 ? currentSeason - 1 : totalSeasons; // Loop to last season
  }

  // Find the target tab using data attributes, ID, or class
  let targetTab = $(`.season-tab_link[data-season="${targetSeason}"]`);

  // If not found by data-season, try ID
  if (targetTab.length === 0) {
    targetTab = $(`#season-${targetSeason}`);
  }

  // If still not found, try class
  if (targetTab.length === 0) {
    targetTab = $(`.season-tab_link.is-season-${targetSeason}`);
  }

  // If still not found, use index
  if (targetTab.length === 0) {
    targetTab = allTabs.eq(targetSeason - 1);
  }

  // Click the target tab to trigger the change
  if (targetTab.length) {
    targetTab.trigger("click");
  }
}

// Tab Functions - Improved to handle season selection properly with immediate class updates
$(".season-tab_link").on("click", function (e) {
  // Immediately update data-tab attribute and apply season classes
  $(".season-tab_link").attr("data-tab", "");
  $(this).attr("data-tab", "current");

  // Get the season number using multiple methods (in order of priority)
  let seasonNumber = 1; // Default to season 1

  // 1. First check for data-season attribute (new preferred method)
  if ($(this).attr("data-season")) {
    seasonNumber = parseInt($(this).attr("data-season"));
  }
  // 2. Check for season-X ID
  else {
    let buttonId = $(this).attr("id");
    if (buttonId && buttonId.match(/season-(\d+)/)) {
      seasonNumber = parseInt(buttonId.match(/season-(\d+)/)[1]);
    }
    // 3. Check for is-season-X class
    else {
      let seasonClass = $(this)
        .attr("class")
        .match(/is-season-(\d+)/);
      if (seasonClass && seasonClass[1]) {
        seasonNumber = parseInt(seasonClass[1]);
      }
    }

    // Add data-season attribute for future reference if it doesn't exist
    if (!$(this).attr("data-season")) {
      $(this).attr("data-season", seasonNumber);
    }
  }

  // Immediately apply season classes before DOM updates
  applySeasonClasses(seasonNumber);

  // Remove active class from all panels
  $(".season-tab_content-panel").removeClass("active");

  // Add active class to the corresponding panel (try multiple selectors in order of priority)
  let targetPanel;

  // 1. First try with data-season attribute (new preferred method)
  targetPanel = $(`.season-tab_content-panel[data-season="${seasonNumber}"]`);

  // 2. Try with data-season-X attribute (alternative format)
  if (targetPanel.length === 0) {
    targetPanel = $(`.season-tab_content-panel[data-season-${seasonNumber}]`);
  }

  // 3. Fall back to index-based selection
  if (targetPanel.length === 0) {
    targetPanel = $(".season-tab_content-panel").eq(seasonNumber - 1);

    // Add data-season attribute for future reference
    targetPanel.attr("data-season", seasonNumber);
  }

  // Activate the panel
  if (targetPanel.length) {
    targetPanel.addClass("active");

    // Reset player items and chapters
    $(".player-item").removeClass("active");
    $(".chapter").removeClass("active");
    $(".chapter-item").removeClass("active");

    // Store the current season number in a data attribute on the body for easy access
    $("body").attr("data-current-season", seasonNumber);

    // Update footer
    updateTab();
  }
});

// Function to immediately apply season-specific CSS classes
function applySeasonClasses(seasonNumber) {
  // Remove all season classes from buttons (using direct DOM manipulation for speed)
  $("#hero-button, #find-button, .season-tab_link, .video_btn.large-arrow.player-btn").removeClass("s1 s2 s3");

  // Add the appropriate season class
  const seasonClass = "s" + seasonNumber;

  // Add class to standard buttons
  $("#hero-button, #find-button, .season-tab_link[data-tab='current']").addClass(seasonClass);

  // Add class to player buttons - with a slight delay to ensure DOM is updated
  setTimeout(function () {
    $(".player-item.active .video_btn.large-arrow.player-btn").addClass(seasonClass);

    // If no player item is active, add class to the first one
    if (!$(".player-item.active").length && $(".player-item").length) {
      $(".player-item").first().addClass("active");
      $(".player-item.active .video_btn.large-arrow.player-btn").addClass(seasonClass);
    }
  }, 50);
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
    // Determine season number using multiple methods (in order of priority)
    let seasonNumber;

    // 1. First check for data-season attribute (new preferred method)
    let seasonAttr = current.attr("data-season");
    if (seasonAttr) {
      seasonNumber = parseInt(seasonAttr);
    }
    // 2. Check for data-season-X attribute (alternative format)
    else {
      // Try to find data-season-X attribute
      const seasonAttrs = current[0].attributes;
      for (let i = 0; i < seasonAttrs.length; i++) {
        const attr = seasonAttrs[i];
        if (attr.name.match(/data-season-(\d+)/)) {
          seasonNumber = parseInt(attr.name.match(/data-season-(\d+)/)[1]);
          break;
        }
      }

      // 3. Fall back to index if no data attribute found
      if (!seasonNumber) {
        seasonNumber = getIndex + 1;
      }

      // Add data-season attribute for future reference
      current.attr("data-season", seasonNumber);
    }

    // Store the current season number in a data attribute on the body for easy access
    $("body").attr("data-current-season", seasonNumber);

    // Update hero button text immediately
    if ($("#heroBtn").length) {
      $("#heroBtn").text("Play Season " + seasonNumber);
    }

    // Immediately apply season-specific CSS classes
    applySeasonClasses(seasonNumber);

    // Directly apply season class to player buttons
    $(".video_btn.large-arrow.player-btn").removeClass("s1 s2 s3");
    $(".player-item.active .video_btn.large-arrow.player-btn").addClass("s" + seasonNumber);

    // Call again after a short delay to ensure it works
    setTimeout(function () {
      $(".player-item.active .video_btn.large-arrow.player-btn").addClass("s" + seasonNumber);
    }, 100);

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

    // Update the tab links to reflect the current season
    $(".season-tab_link").each(function () {
      const linkSeasonAttr = $(this).attr("data-season");
      const linkId = $(this).attr("id");
      const linkClass = $(this).attr("class");

      let linkSeasonNumber;

      // Determine the season number for this link
      if (linkSeasonAttr) {
        linkSeasonNumber = parseInt(linkSeasonAttr);
      } else if (linkId && linkId.match(/season-(\d+)/)) {
        linkSeasonNumber = parseInt(linkId.match(/season-(\d+)/)[1]);
      } else if (linkClass && linkClass.match(/is-season-(\d+)/)) {
        linkSeasonNumber = parseInt(linkClass.match(/is-season-(\d+)/)[1]);
      }

      // If this link matches the current season, mark it as current
      if (linkSeasonNumber === seasonNumber) {
        $(this).attr("data-tab", "current");
      } else {
        $(this).attr("data-tab", "");
      }
    });
  }
}

// Initialize tabs on page load
$(document).ready(function () {
  // First, ensure all season tabs and panels have proper data attributes
  initializeSeasonAttributes();

  // Initialize the first tab
  updateTab();

  // Directly apply season classes to player buttons
  const seasonNumber = parseInt($("body").attr("data-current-season")) || 1;
  $(".video_btn.large-arrow.player-btn").removeClass("s1 s2 s3");
  $(".player-item.active .video_btn.large-arrow.player-btn").addClass("s" + seasonNumber);

  // If no player item is active, activate the first one
  if (!$(".player-item.active").length && $(".player-item").length) {
    $(".player-item").first().addClass("active");
    $(".player-item.active .video_btn.large-arrow.player-btn").addClass("s" + seasonNumber);
  }

  // Add event handler for player item activation
  $(document).on("click", ".player-item", function () {
    // Get the current season number
    const seasonNumber = parseInt($("body").attr("data-current-season")) || 1;

    // Remove active class from all player items
    $(".player-item").removeClass("active");

    // Add active class to this player item
    $(this).addClass("active");

    // Update the season class on the player button
    $(".player-item.active .video_btn.large-arrow.player-btn")
      .removeClass("s1 s2 s3")
      .addClass("s" + seasonNumber);
  });

  // Call again after a short delay to ensure it works
  setTimeout(function () {
    const seasonNumber = parseInt($("body").attr("data-current-season")) || 1;
    $(".player-item.active .video_btn.large-arrow.player-btn").addClass("s" + seasonNumber);
  }, 500);
});

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
  }
});

/**
 * Initialize data attributes for all season tabs and panels
 * This ensures backward compatibility while adding the new data-season attributes
 */
function initializeSeasonAttributes() {
  // Process all season tab links
  $(".season-tab_link").each(function (index) {
    // Skip if data-season is already set
    if ($(this).attr("data-season")) return;

    let seasonNumber;

    // Try to determine season number from ID
    const id = $(this).attr("id");
    if (id && id.match(/season-(\d+)/)) {
      seasonNumber = parseInt(id.match(/season-(\d+)/)[1]);
    }
    // Try to determine from class
    else {
      const seasonClass = $(this)
        .attr("class")
        .match(/is-season-(\d+)/);
      if (seasonClass && seasonClass[1]) {
        seasonNumber = parseInt(seasonClass[1]);
      }
      // Fall back to index+1
      else {
        seasonNumber = index + 1;
      }
    }

    // Set data-season attribute
    $(this).attr("data-season", seasonNumber);
  });

  // Process all season panels
  $(".season-tab_content-panel").each(function (index) {
    // Skip if data-season is already set
    if ($(this).attr("data-season")) return;

    let seasonNumber;

    // Try to determine from data-season-X attribute
    const attributes = this.attributes;
    let foundSeasonAttr = false;

    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i];
      if (attr.name.match(/data-season-(\d+)/)) {
        seasonNumber = parseInt(attr.name.match(/data-season-(\d+)/)[1]);
        foundSeasonAttr = true;
        break;
      }
    }

    // Fall back to index+1
    if (!foundSeasonAttr) {
      seasonNumber = index + 1;
    }

    // Set data-season attribute
    $(this).attr("data-season", seasonNumber);
  });
}
