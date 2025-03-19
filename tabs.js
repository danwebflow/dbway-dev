/**
 * Original tabs functionality that was working better before refactoring
 */

// const findStory = document.querySelector("#story-link");
// if (findStory) {
//     findStory.addEventListener("click", (e) => {
//         e.preventDefault();
//         const storyAnchor = $(".season-tab_content-panel.active #story-anchor")[0];
//         if (storyAnchor) {
//             storyAnchor.scrollIntoView({
//                 behavior: "smooth",
//                 block: "start",
//                 inline: "nearest",
//             });
//         }
//     });
// }

// const findLink = document.querySelector("#find-button");
// if (findLink) {
//     findLink.addEventListener("click", (e) => {
//         e.preventDefault();
//         const storyAnchor = $(".season-tab_content-panel.active #story-anchor")[0];
//         if (storyAnchor) {
//             storyAnchor.scrollIntoView({
//                 behavior: "smooth",
//                 block: "start",
//                 inline: "nearest",
//             });
//         }
//     });
// }

console.log("tabs.js loaded");

// Tab Buttons
$(".season-tab_link").on("click", function () {
  $(".season-tab_link").attr("data-tab", "");
  $(this).attr("data-tab", "current");
});

// Tab Functions
$(".season-tab_link").on("click", function () {
  // Tabs
  let current = $(".season-tab_content-panel.active");
  if ($(this).attr("id") === "nextBtn") {
    $(".season-tab_content-panel.active").next(".season-tab_content-panel").addClass("active");
  } else {
    // Active pevious tab
    $(".season-tab_content-panel.active").prev(".season-tab_content-panel").addClass("active");
  }
  if ($(".season-tab_content-panel.active").length > 1) {
    // Remove original active tab
    current.removeClass("active");

    // Player Item
    $(".player-item").removeClass("active");
    // Chapter
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

// Update Tab
function updateTab() {
  // Get current active tab
  let tab = $(".season-tab_content-panel"),
    current = tab.filter(".active");
  let getIndex = current.index();

  if (current) {
    if (getIndex === 0) {
      $("#heroBtn").text("Season 1");
    } else {
      $("#heroBtn").text("Season 2");
    }
    // Pause video
    $(".player-item video").each(function () {
      $(this).get(0).pause();
    });
    // Add class to first player-item
    current.find(".player-item").first().addClass("active");
    current.find(".chapter").first().addClass("active");
    current.find(".chapter-item").first().addClass("active");
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

jQuery(window).on("resize", function ($) {
  jQuery(function () {
    if (jQuery(window).width() >= 1440) {
      var maxHeight = 593.25;
      jQuery(".player-content").each(function () {
        jQuery(this).css("height", maxHeight + "px");
        jQuery(".player-menu_list").css("height", maxHeight + "px");
      });
    } else if (jQuery(window).width() >= 992 && jQuery(window).width() <= 1439) {
      var videoHeight = jQuery(".player-item.active .player-content").find("video").height();
      jQuery(".player-content").each(function () {
        jQuery(this).css("height", "auto");
        jQuery(this).css("min-height", videoHeight + "px");
        jQuery(".player-menu_list").css("height", videoHeight + "px");
      });
    } else {
      jQuery(".player-content").each(function () {
        jQuery(this).css("min-height", "auto");
        jQuery(".player-menu_list").css("height", "auto");
      });
    }
  });
});
