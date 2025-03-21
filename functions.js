/**
 * Core functionality for video player and chapter navigation
 */
jQuery(document).ready(function ($) {
  console.log("functions.js loaded");
  // Initialize first active item
  $(function () {
    var firstItem = $(".chapter.active").find(".chapter-list .chapter-item").first();
    var image = $(".player-item.active").find("img");
    var imagesrc = $(image).attr("data-src");
    if (imagesrc) {
      $(image).attr("src", imagesrc);
    }
    $(firstItem).addClass("active");
  });

  // Handle chapter item clicks
  $(".chapter-item").click(function () {
    // ADD CLASS
    $(".chapter-item").removeClass("active");
    $(this).addClass("active");

    // STOP VIDEOS
    $(".player-item video").each(function () {
      $(this).get(0).pause();
    });

    // GET DATA
    var item = $(this).attr("data-id");
    var video = $("#player-videos").find('[data-video="' + item + '"]');
    var videoPreload = $(video).find("video");
    var image = $(video).find("img");
    var imagesrc = $(image).attr("data-src");

    // USE DATA
    if (imagesrc) {
      $(image).attr("src", imagesrc);
    }
    if (videoPreload) {
      $(videoPreload).attr("preload", "auto");
    }

    $(image).on("load", function () {
      $(".player-item").removeClass("active");
      $(video).addClass("active");

      // Adjust video container sizes after changing video
      if (typeof adjustVideoContainerSizes === "function") {
        adjustVideoContainerSizes();
      }
    });

    videoplay(item);
  });

  // Handle chapter info clicks
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

  // Handle video play button clicks
  $(".video-play").click(function () {
    var videoID = $(this).parent().parent().attr("data-video");
    var item = $('.chapter-item[data-id="' + videoID + '"]');
    var videoItem = $(this).siblings(".player-video-embed").children("video");
    var videoLoader = $(this).siblings(".player-loading");

    $(videoLoader).addClass("active");
    $(this).parent().parent().addClass("playing");
    $(item).addClass("started");

    // Pause hero video if it exists
    if ($(".hero-video").length) {
      $(".hero-video")[0].pause();
      $(".hero-play").removeClass("playing");
      $(".hero-play").addClass("paused");
      $(".hero-hide").removeClass("hidden");
    }

    // Play the video
    $(this).siblings(".player-video-embed").children("video")[0].play();

    $(videoItem).on("play", function () {
      setTimeout(function () {
        videoLoader.removeClass("active");
      }, 500);
    });

    // Set cookie if Cookies library is available
    if (typeof Cookies !== "undefined") {
      Cookies.set(videoID, "started", { expires: 365 });
    }
  });
});

/**
 * Play a video by ID
 */
function videoplay(videoID) {
  console.log("videoplay called with ID:", videoID);

  // Pause hero video if it exists
  if (jQuery(".hero-video").length) {
    jQuery(".hero-video")[0].pause();
  }

  // Pause all videos
  jQuery(".player-item video").each(function () {
    jQuery(this).get(0).pause();
  });

  // Find the video in the active season tab panel first
  var activePanel = jQuery(".season-tab_content-panel.active");
  var video = activePanel.find('.player-item[data-video="' + videoID + '"]');
  var currentSeason = activePanel.index() + 1;

  console.log("Current active season:", currentSeason);
  console.log("Video found in active panel:", video.length > 0);

  // If not found in active panel, check if it's in another season
  if (video.length === 0) {
    // Try to find which season contains this video
    var foundInSeason = 0;

    // Check each season panel
    jQuery(".season-tab_content-panel").each(function(index) {
      var seasonPanel = jQuery(this);
      var seasonVideo = seasonPanel.find('.player-item[data-video="' + videoID + '"]');

      if (seasonVideo.length > 0) {
        foundInSeason = index + 1;
        return false; // Break the loop
      }
    });

    console.log("Video found in season:", foundInSeason);

    if (foundInSeason > 0 && foundInSeason !== currentSeason) {
      // Video is in a different season, switch to that season
      console.log("Switching to season", foundInSeason);

      // Find the season button
      var seasonButton = jQuery(`#season-${foundInSeason}, .season-tab_link.is-season-${foundInSeason}`);

      if (seasonButton.length) {
        // Click the season button to switch seasons
        seasonButton.trigger('click');

        // After season switch, try to play the video again
        setTimeout(function() {
          videoplay(videoID);
        }, 500);

        return; // Exit the function, we'll call it again after season switch
      }
    }

    // Try season containers with new format
    video = jQuery("#season-" + currentSeason).find('[data-video="' + videoID + '"]');
    console.log("Checking season-" + currentSeason + ":", video.length > 0);

    // Try old format containers as fallback
    if (video.length === 0) {
      video = jQuery("#player-videos").find('[data-video="' + videoID + '"]');
      console.log("Checking player-videos:", video.length > 0);

      if (video.length === 0) {
        video = jQuery("#player-videos-" + currentSeason).find('[data-video="' + videoID + '"]');
        console.log("Checking player-videos-" + currentSeason + ":", video.length > 0);
      }
    }

    // Last resort - try any container
    if (video.length === 0) {
      video = jQuery('.player-item[data-video="' + videoID + '"]');
      console.log("Checking any container:", video.length > 0);
    }
  }

  // Find the chapter item
  var item = jQuery('.chapter-item[data-id="' + videoID + '"]');
  var chapter = item.length ? item.closest(".chapter") : null;
  var loading = jQuery(".player-loading");
  var videoPlr = video.length ? video.find("video")[0] : null;

  console.log("Final video found:", video.length > 0);
  console.log("Chapter item found:", item.length > 0);

  if (video.length > 0) {
    // Show loading indicator
    if (loading.length) {
      loading.addClass("active");
    }

    // Set timeout to allow loading indicator to show
    setTimeout(function () {
      // Set active classes
      jQuery(".player-item").removeClass("active playing");
      video.addClass("playing active");

      // Play the video if it exists
      if (videoPlr) {
        try {
          videoPlr.play().catch(function (err) {
            console.log("Video play error:", err);

            // If autoplay fails, add a play overlay
            if (typeof DBWayUtils !== 'undefined' && typeof DBWayUtils.addPlayOverlay === 'function') {
              DBWayUtils.addPlayOverlay(videoPlr);
            }
          });
        } catch (e) {
          console.error("Error playing video:", e);
        }
      }

      // Set chapter active if found
      if (item.length > 0) {
        jQuery(".chapter-item").removeClass("active");
        item.addClass("active started");

        if (chapter) {
          jQuery(".chapter").removeClass("active");
          chapter.addClass("active");
        }
      }

      // Hide loading indicator
      setTimeout(function () {
        if (loading.length) {
          loading.removeClass("active");
        }
      }, 500);

      // Adjust video container sizes
      if (typeof adjustVideoContainerSizes === "function") {
        adjustVideoContainerSizes();
      }
    }, 100);

    // Set cookie if Cookies library is available
    if (typeof Cookies !== "undefined") {
      Cookies.set(videoID, "started", { expires: 365 });
    }
  } else {
    console.error("No video found with ID:", videoID);
  }
}

/**
 * Handle video end event
 */
function videoend(videoID) {
  console.log("Video ended:", videoID);

  // Pause all videos
  jQuery(".player-item video").each(function () {
    jQuery(this).get(0).pause();
  });

  // Find the current video and its container
  var video = jQuery('.player-item[data-video="' + videoID + '"]');
  var activePanel = jQuery(".season-tab_content-panel.active");

  // Find the next video within the active season panel
  var nextVideo = video.next(".player-item");
  var nextVideoID = nextVideo.attr("data-video");

  // Find the chapter item
  var item = jQuery('.chapter-item[data-id="' + videoID + '"]');
  var itemNext = item.next(".chapter-item");
  var chapter = item.closest(".chapter");
  var nextChapter = chapter.next(".chapter");
  var loading = jQuery(".player-loading");

  console.log("Next video ID:", nextVideoID);
  console.log("Next chapter item:", itemNext.length > 0);

  if (nextVideoID) {
    // We have a next video in the same season
    jQuery(loading).addClass("active");

    setTimeout(function () {
      jQuery(".player-item").removeClass("active playing");
      nextVideo.addClass("playing active");

      // Play the next video
      try {
        nextVideo.find("video")[0].play().catch(function(err) {
          console.warn("Could not autoplay next video:", err);
        });
      } catch(e) {
        console.error("Error playing next video:", e);
      }

      // Update chapter items
      jQuery(".chapter-item").removeClass("active");

      if (itemNext.length) {
        // Next item is in the same chapter
        itemNext.addClass("active started");
      } else if (nextChapter.length) {
        // Next item is in the next chapter
        nextChapter.addClass("active");
        var firstItem = nextChapter.find(".chapter-item").first();
        if (firstItem.length) {
          firstItem.addClass("active started");
        }
      }

      setTimeout(function () {
        jQuery(loading).removeClass("active");
      }, 500);
    }, 500);
  } else {
    console.log("No next video in current season");

    // Check if we should navigate to the next season
    var currentSeason = activePanel.index() + 1;
    var totalSeasons = jQuery(".season-tab_content-panel").length;

    if (currentSeason < totalSeasons) {
      console.log("Navigating to next season");
      // Trigger next season navigation
      jQuery("#nextBtn, .season-next").trigger("click");
    } else {
      console.log("Last season reached, returning to first chapter");
      // Return to first chapter of current season
      var firstChapter = activePanel.find(".chapter").first();
      if (firstChapter.length) {
        jQuery(".chapter").removeClass("active");
        firstChapter.addClass("active");

        var firstItem = firstChapter.find(".chapter-item").first();
        if (firstItem.length) {
          jQuery(".chapter-item").removeClass("active");
          firstItem.addClass("active");

          var firstVideoId = firstItem.attr("data-id");
          if (firstVideoId) {
            videoplay(firstVideoId);
          }
        }
      }
    }
  }

  // Set cookie if Cookies library is available
  if (typeof Cookies !== "undefined") {
    Cookies.set(videoID, "watched", { expires: 365 });
  }

  // Mark item as watched
  jQuery(item).addClass("watched");
}
/**
 * The DixonBaxi Way - Utility Functions
 *
 * This script provides utility functions used across the site:
 * - Video playback helpers
 * - UI interaction utilities
 * - Animation helpers
 */

(function () {
  /**
   * Plays a video with error handling
   * @param {HTMLVideoElement} video - The video element to play
   * @returns {Promise} - Promise that resolves when video starts playing
   */
  function playVideo(video) {
    if (!video) return Promise.reject(new Error("No video element provided"));

    return video.play().catch((error) => {
      console.warn("Video playback was prevented:", error);

      // Check if it's an autoplay policy error
      if (error.name === "NotAllowedError") {
        // Add a play button overlay if needed
        addPlayOverlay(video);
      }

      return Promise.reject(error);
    });
  }

  /**
   * Adds a play overlay to videos that can't autoplay
   * @param {HTMLVideoElement} video - The video element
   */
  function addPlayOverlay(video) {
    // Check if overlay already exists
    if (video.parentElement.querySelector(".video-play-overlay")) return;

    // Create overlay
    const overlay = document.createElement("div");
    overlay.className = "video-play-overlay";
    overlay.innerHTML = '<div class="play-icon"></div>';
    overlay.style.cssText =
      "position:absolute; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.3); cursor:pointer; z-index:10;";

    // Create play icon
    const playIcon = overlay.querySelector(".play-icon");
    playIcon.style.cssText =
      "width:60px; height:60px; border-radius:50%; background:rgba(255,255,255,0.8); display:flex; align-items:center; justify-content:center;";

    // Add triangle inside play icon
    const triangle = document.createElement("div");
    triangle.style.cssText =
      "width:0; height:0; border-top:10px solid transparent; border-bottom:10px solid transparent; border-left:20px solid #000; margin-left:5px;";
    playIcon.appendChild(triangle);

    // Add click handler
    overlay.addEventListener("click", function () {
      video
        .play()
        .then(() => {
          // Remove overlay when video plays
          overlay.remove();
        })
        .catch((err) => console.error("Video play error:", err));
    });

    // Add to DOM
    video.parentElement.appendChild(overlay);
  }

  /**
   * Pauses all videos except the one provided
   * @param {HTMLVideoElement} exceptVideo - The video to exclude from pausing
   */
  function pauseAllVideosExcept(exceptVideo) {
    document.querySelectorAll("video").forEach((video) => {
      if (video !== exceptVideo) {
        video.pause();
      }
    });
  }

  /**
   * Checks if an element is in the viewport
   * @param {Element} element - The element to check
   * @param {number} offset - Optional offset from viewport edges
   * @returns {boolean} - True if element is in viewport
   */
  function isInViewport(element, offset = 0) {
    if (!element) return false;

    const rect = element.getBoundingClientRect();

    return (
      rect.top >= 0 - offset &&
      rect.left >= 0 - offset &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset
    );
  }

  /**
   * Debounces a function to limit how often it can be called
   * @param {Function} func - The function to debounce
   * @param {number} wait - Time to wait in milliseconds
   * @returns {Function} - Debounced function
   */
  function debounce(func, wait) {
    let timeout;

    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttles a function to limit how often it can be called
   * @param {Function} func - The function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} - Throttled function
   */
  function throttle(func, limit) {
    let inThrottle;

    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  }

  /**
   * Smooth scrolls to an element
   * @param {Element|string} element - Element or selector to scroll to
   * @param {number} offset - Offset from the top in pixels
   * @param {number} duration - Duration of scroll animation in milliseconds
   */
  function scrollToElement(element, offset = 0, duration = 500) {
    // Get element if string was provided
    if (typeof element === "string") {
      element = document.querySelector(element);
    }

    if (!element) return;

    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = ease(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    // Easing function
    function ease(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
  }

  // Export utility functions to global scope
  window.DBWayUtils = {
    playVideo,
    pauseAllVideosExcept,
    isInViewport,
    debounce,
    throttle,
    scrollToElement,
  };
})(); //

function iOS() {
  return (
    ["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
}

if (iOS()) {
  console.log("iOS");
  $("html").addClass("ios");
}

jQuery(document).ready(function ($) {
  $(function () {
    var firstItem = $(".chapter.active").find(".chapter-list .chapter-item").first();
    var image = $(".player-item.active").find("img");
    var imagesrc = $(image).attr("data-src");
    $(image).attr("src", imagesrc);
    $(firstItem).addClass("active");
  });

  $(function () {
    setTimeout(function () {
      $(".hero-hide").addClass("hidden");
    }, 2000);
  });

  $(".chapter-item").each(function () {
    // GET COOKIE
    var item = $(this).attr("data-id");
    var cookie = Cookies.get(item);
    if (cookie) {
      //console.log("Video cookie");
    }
    if (cookie == "started") {
      $(this).addClass("started");
    } else if (cookie == "watched") {
      $(this).addClass("watched");
    }
  });

  $(".chapter-item").click(function () {
    // ADD CLASS
    $(".chapter-item").removeClass("active");
    $(this).addClass("active");
    // STOP VIDEOS
    // $(".player-item video").each(function () {
    // 	$(this).get(0).pause();
    // });
    // GET DATA
    var item = jQuery(this).attr("data-id");
    var video = jQuery("#player-videos").find('[data-video="' + item + '"]');
    var videoPreload = jQuery(video).find("video");
    //var videoLoader = jQuery(video).find(".player-loading");
    var image = jQuery(video).find("img");
    var imagesrc = jQuery(image).attr("data-src");
    // USE DATA
    if (imagesrc) {
      jQuery(image).attr("src", imagesrc);
    }
    if (videoPreload) {
      jQuery(videoPreload).attr("preload", "auto");
    }

    jQuery(image).on("load", function () {
      jQuery(".player-item").removeClass("active");
      jQuery(video).addClass("active");
    });

    videoplay(item);

    // if (jQuery(window).width() > 1439) {
    //   // $(videoLoader).addClass('active');
    //   // setTimeout(function(){
    //   //     $(videoPreload)[0].play();
    //   //     $(videoPreload).on("play", function() {
    //   //         $(videoLoader).removeClass('active');
    //   //         $(video).addClass('playing');
    //   //     });
    //   // }, 1000);
    //   videoplay(item);
    // }
  });

  $(".video-play").click(function () {
    //$('.player-item').removeClass('playing');
    var videoID = $(this).parent().parent().attr("data-video");
    var item = $('.chapter-item[data-id="' + videoID + '"]');
    var videoItem = $(this).siblings(".player-video-embed").children("video");
    var videoLoader = $(this).siblings(".player-loading");
    $(videoLoader).addClass("active");
    $(this).parent().parent().addClass("playing");
    $(item).addClass("started");
    jQuery(".hero-video")[0].pause();
    jQuery(".hero-play").removeClass("playing");
    jQuery(".hero-play").addClass("paused");
    jQuery(".hero-hide").removeClass("hidden");
    $(this).siblings(".player-video-embed").children("video")[0].play();

    $(videoItem).on("play", function () {
      setTimeout(function () {
        videoLoader.removeClass("active");
      }, 500);
    });

    // SET COOKIE
    //console.log("Video started: " + videoID);
    Cookies.set(videoID, "started", { expires: 365 });
  });

  $(".chapter-info").click(function () {
    if ($(this).parent().hasClass("active")) {
      $(this).parent().removeClass("active");
    } else {
      $(".chapter").removeClass("active");
      $(this).parent().addClass("active");
    }
    $(".scrollbar").animate(
      {
        scrollTop: $(".scrollbar").offset().top,
      },
      50
    );
  });

  $(".hero-play").click(function () {
    var video = $(".hero-video");
    if ($(this).hasClass("paused")) {
      $(".hero-cover").removeClass("active");
      $(this).removeClass("paused");
      $(this).addClass("playing");
      $(".hero-hide").addClass("hidden");
      $(".player-item video").each(function () {
        $(this).get(0).pause();
      });
      $(video)[0].play();
    } else if ($(this).hasClass("replay")) {
      $(".hero-cover").removeClass("active");
      $(this).removeClass("replay");
      $(this).addClass("playing");
      $(".hero-hide").addClass("hidden");
      $(video)[0].play();
    } else if ($(this).hasClass("playing")) {
      $(this).removeClass("playing");
      $(this).addClass("paused");
      $(".hero-hide").removeClass("hidden");
      $(video)[0].pause();
    }
  });

  $(".hero-sound").click(function () {
    var video = $(".hero-video");
    if ($(this).hasClass("off")) {
      $(this).removeClass("off");
      $(this).addClass("on");
      $(video).prop("muted", false);
    } else if ($(this).hasClass("on")) {
      $(this).removeClass("on");
      $(this).addClass("off");
      $(video).prop("muted", true);
    }
  });

  $(".hero-scroll").click(function () {
    var video = $(".hero-video");
    var playBtn = $(".hero-play");

    if ($(playBtn).hasClass("playing")) {
      $(playBtn).removeClass("playing");
      $(playBtn).addClass("paused");
      $(".hero-hide").removeClass("hidden");
      $(video)[0].pause();
    }
  });

  $(".hero-video").on("play", function () {
    $(".hero-loading").addClass("notactive");
    var videoDuration = this.duration;
    var videoNearEnd = videoDuration - 0.5;
    var pausing_function = function () {
      if (this.currentTime > videoNearEnd) {
        jQuery(".hero-hide").removeClass("hidden");
      }
    };
    this.addEventListener("timeupdate", pausing_function);
  });

  //SHARE LINK FUNCTIONS
  $(function () {
    var getUrlParameter = function getUrlParameter(sParam) {
      var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split("&"),
        sParameterName,
        i;

      for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split("=");

        if (sParameterName[0] === sParam) {
          return sParameterName[1] === undefined ? true : sParameterName[1];
        }
      }
    };

    //var hash = $(location).prop("hash").substr(1);
    var hash = getUrlParameter("play");

    if (hash) {
      removeLocationHash();

      jQuery(".player-item, .chapter-item, .chapter").removeClass("active");
      var video = jQuery('.player-item[data-video="' + hash + '"]');
      var videoPreload = jQuery(video).find("video")[0];
      var image = jQuery(video).find("img");
      var imagesrc = jQuery(image).attr("data-src");
      var item = jQuery('.chapter-item[data-id="' + hash + '"]');
      var chapter = jQuery(item).parent().parent().parent().parent();
      var season = jQuery(video).closest(".season-tab_panel").attr("data-season");
      var seasonDefault = jQuery(video).closest(".season-tab_panel:has(.active)");
      var loading = jQuery(".player-loading");
      var target = $("#player");
      var removeSeasonActive = $(".season-tab_content-panel").removeClass("active");

      if (videoPreload) {
        //jQuery(".hero-hide").removeClass("hidden");
        jQuery(loading).addClass("active");
        jQuery(".hero-video")[0].pause();
        jQuery(".hero-cover").addClass("active");
        jQuery(".hero-play").removeClass("playing");
        jQuery(".hero-play").addClass("paused");

        $(".season-tab_link").attr("data-tab", "");
        if (season <= 1) {
          $(".season-tab_link.is-season-1").attr("data-tab", "current");
          $(".season-tab_content-panel").eq(0).addClass("active");
          //jQuery(season).find(video).addClass("active");
        } else {
          $(".season-tab_link.is-season-2").attr("data-tab", "current");
          $(".season-tab_content-panel").eq(1).addClass("active");
          //jQuery(season).find(video).addClass("active");
        }

        if (imagesrc) {
          jQuery(image).attr("src", imagesrc);
        }
        if (videoPreload) {
          jQuery(videoPreload).attr("preload", "auto");
        }

        jQuery(image).load(function () {
          setTimeout(function () {
            jQuery(".player-item, .chapter-item, .chapter").removeClass("active");
            let checkActive = jQuery(video).addClass("active");
            let checkChapter = jQuery(chapter).addClass("active");
            let checkItem = jQuery(item).addClass("active");
            console.log(checkActive);
            console.log(checkChapter);
            console.log(checkItem);

            setTimeout(function () {
              jQuery(loading).removeClass("active");
            }, 500);
            //jQuery(".player-item.active .video-play")[0].click();
            //issue on Firefox: user needs to give permission for autoplay video with audio to play

            // jQuery(item)

            if (target.length) {
              var menuItem = $("#tab-anchor");
              var scrollTop = $(window).scrollTop();
              var elementOffset = $(menuItem).offset().top;
              var currentOffset = elementOffset - scrollTop;
              var currentHeight = $(menuItem).parent().height() / 2;
              var currentGap = "";

              if (jQuery(window).width() > 991) {
                var offsetGap = currentOffset + currentHeight;
                var currentGap = offsetGap + 40;
              } else {
                var currentGap = 80;
              }

              $("html, body").animate(
                {
                  scrollTop: target.offset().top - currentGap,
                },
                500,
                "linear"
              );
              return false;
            }
          }, 500);
        });
      } else {
        console.log("No video found");
      }
    }
  });

  $(function () {
    $('a[href*="#"].first-child:not([href="#"]),.nav-menu a[href*="#"]:not([href="#"])').click(function (event) {
      event.preventDefault();
      if (
        location.pathname.replace(/^\//, "") == this.pathname.replace(/^\//, "") &&
        location.hostname == this.hostname
      ) {
        var target = $(this.hash);
        target = target.length ? target : $("[id=" + this.hash.slice(1) + "]");
        if (target.length) {
          var menuItem = $(".nav-menu a:first-child");
          var scrollTop = $(window).scrollTop();
          var elementOffset = $(menuItem).offset().top;
          var currentOffset = elementOffset - scrollTop;
          var currentHeight = $(menuItem).parent().height() / 2;
          var currentGap = "";

          if (jQuery(window).width() > 991) {
            var currentGap = currentOffset + currentHeight;
          } else {
            var currentGap = 75;
          }

          $("html, body").animate(
            {
              scrollTop: target.offset().top - currentGap,
            },
            300
          );
          return false;
        }
      }
    });
  });

  $(function () {
    $(".player-anchor").click(function () {
      var target = $("#player");
      if (target.length) {
        var menuItem = $(".w-nav-brand");
        var scrollTop = $(window).scrollTop();
        var elementOffset = $(menuItem).offset().top;
        var currentOffset = elementOffset - scrollTop;
        var currentHeight = $(menuItem).parent().height() / 2;
        var currentGap = "";

        if (jQuery(window).width() > 991) {
          var offsetGap = currentOffset + currentHeight;
          var currentGap = offsetGap + 0;
        } else {
          var currentGap = 80; // GAP increase mobile
        }

        $("html, body").animate(
          {
            scrollTop: target.offset().top - currentGap,
          },
          300
        );
        return false;
      }
    });
  });

  $(function () {
    var figure = $(".video-hover").hover(hoverVideo, hideVideo);
    function hoverVideo(e) {
      $("video", this)[0].play();
    }
    function hideVideo(e) {
      $("video", this)[0].pause();
    }
  });

  //var ll = new LazyLoad();

  jQuery(".video-option.video-share").click(function () {
    jQuery(this).toggleClass("active");
  });

  jQuery(".video-options.is-hero-share").click(function () {
    jQuery(this).toggleClass("active");
  });

  // jQuery(".video-options").on("mouseleave", function () {
  // 	jQuery(".video-share").removeClass("active");
  // });

  $(".share-linkedin, .share-twitter").click(function (event) {
    setTimeout(function () {
      jQuery(".video-share").removeClass("active");
    }, 1000);
  });
});

function videoend(videoID) {
  var deviceAgent = navigator.userAgent.toLowerCase();
  var wkfs = "false";

  jQuery(".player-item video").each(function () {
    jQuery(this).get(0).pause();
  });
  //closeFullscreen();
  //console.log("Video ended");
  var video = jQuery('.player-item[data-video="' + videoID + '"]');
  var videoPlayer = jQuery(video).find("video");
  var nextVideo = jQuery(video).next(".player-item");
  var nextVideoPlayer = jQuery(nextVideo).find("video");
  var nextVideoID = jQuery(nextVideo).attr("data-video");
  var item = jQuery('.chapter-item[data-id="' + videoID + '"]');
  var itemNext = jQuery(item).next(".chapter-item");
  var itemNextID = jQuery(itemNext).attr("data-id");
  var nextChapter = jQuery(item).parent().parent().parent().parent().next(".chapter");
  var nextChapterItem = jQuery(nextChapter).find(".chapter-list .chapter-item").first();
  var loading = jQuery(".player-loading");
  var firstChapter = jQuery(item).parent().parent().parent().parent().parent().find(".chapter").first();
  var firstChapterItem = jQuery(firstChapter).find(".chapter-list .chapter-item").first();

  if (jQuery("body").hasClass("fsios")) {
    var wkfs = "true";
  }

  if (deviceAgent.match(/(iphone|ipod|ipad)/)) {
  }
  console.log(wkfs);

  if (nextVideoID) {
    jQuery(loading).addClass("active");

    setTimeout(function () {
      jQuery(".player-item").removeClass("active");
      jQuery(nextVideo).addClass("playing active");
      jQuery(nextVideo).find("video")[0].play();

      if (iOS()) {
        console.log("iOS");
        $("html").addClass("ios");
        if (wkfs == "true") {
          jQuery(videoPlayer)[0].webkitExitFullScreen();
          setTimeout(function () {
            try {
              jQuery(nextVideoPlayer)[0].webkitEnterFullscreen();
            } catch (e) {}
          }, 50);
        }
      }

      // if (deviceAgent.match(/(iphone|ipod|ipad)/)) {
      //   if (wkfs == "true") {
      //     jQuery(videoPlayer)[0].webkitExitFullScreen();
      //     setTimeout(function () {
      //       try {
      //         jQuery(nextVideoPlayer)[0].webkitEnterFullscreen();
      //       } catch (e) {}
      //     }, 50);
      //   }
      // }

      jQuery(".chapter-item").removeClass("active");
      Cookies.set(nextVideoID, "started", { expires: 365 });

      if (itemNextID) {
        jQuery(itemNext).addClass("active started");
      } else {
        jQuery(".chapter").removeClass("active");
        jQuery(nextChapter).addClass("active");
        jQuery(nextChapterItem).addClass("active started");
      }
      setTimeout(function () {
        jQuery(loading).removeClass("active");
      }, 500);
    }, 500);
  } else {
    // VIDEO-END
    console.log("No more videos");
    jQuery(".chapter").removeClass("active");
    jQuery(firstChapter).trigger("click");
    jQuery(firstChapterItem).trigger("click");
    $(".scrollbar").animate(
      {
        scrollTop: $(".scrollbar").offset().top,
      },
      50
    );
  }

  // SET COOKIE
  Cookies.set(videoID, "watched", { expires: 365 });

  //USE DATA
  jQuery(item).addClass("watched");
}

function videoprev(videoID) {
  console.log("Previous video requested for:", videoID);

  // Pause all videos
  $(".player-item video").each(function () {
    jQuery(this).get(0).pause();
  });

  // Find the current video and its container
  var video = jQuery('.player-item[data-video="' + videoID + '"]');
  var activePanel = jQuery(".season-tab_content-panel.active");

  // Find the previous video within the active season panel
  var prevVideo = video.prev(".player-item");
  var prevVideoID = prevVideo.attr("data-video");

  // Find the chapter item
  var item = jQuery('.chapter-item[data-id="' + videoID + '"]');
  var itemPrev = item.prev(".chapter-item");
  var itemPrevID = itemPrev.attr("data-id");
  var chapter = item.closest(".chapter");
  var prevChapter = chapter.prev(".chapter");
  var prevChapterItem = prevChapter.length ? prevChapter.find(".chapter-list .chapter-item").last() : null;
  var loading = jQuery(".player-loading");

  console.log("Previous video ID:", prevVideoID);
  console.log("Previous chapter item:", itemPrev.length > 0);

  if (prevVideoID) {
    // We have a previous video in the same season
    jQuery(loading).addClass("active");

    setTimeout(function () {
      jQuery(".player-item").removeClass("active playing");
      prevVideo.addClass("playing active");

      // Play the previous video
      try {
        prevVideo.find("video")[0].play().catch(function(err) {
          console.warn("Could not autoplay previous video:", err);
        });
      } catch(e) {
        console.error("Error playing previous video:", e);
      }

      // Update chapter items
      jQuery(".chapter-item").removeClass("active");

      if (itemPrevID) {
        // Previous item is in the same chapter
        itemPrev.addClass("active started");
      } else if (prevChapter.length && prevChapterItem) {
        // Previous item is in the previous chapter
        jQuery(".chapter").removeClass("active");
        prevChapter.addClass("active");
        prevChapterItem.addClass("active started");

        // Scroll to bottom of chapter list if needed
        if ($(".scrollbar").length) {
          $(".scrollbar").animate(
            {
              scrollTop: $(".scrollbar")[0].scrollHeight
            },
            50
          );
        }
      }

      setTimeout(function () {
        jQuery(loading).removeClass("active");
      }, 500);
    }, 500);
  } else {
    console.log("No previous video in current season");

    // Check if we should navigate to the previous season
    var currentSeason = activePanel.index() + 1;

    if (currentSeason > 1) {
      console.log("Navigating to previous season");
      // Trigger previous season navigation
      jQuery("#prevBtn, .season-prev").trigger("click");

      // After navigation, select the last video of the previous season
      setTimeout(function() {
        var newActivePanel = jQuery(".season-tab_content-panel.active");
        var lastChapter = newActivePanel.find(".chapter").last();

        if (lastChapter.length) {
          jQuery(".chapter").removeClass("active");
          lastChapter.addClass("active");

          var lastItem = lastChapter.find(".chapter-item").last();
          if (lastItem.length) {
            jQuery(".chapter-item").removeClass("active");
            lastItem.addClass("active");

            var lastVideoId = lastItem.attr("data-id");
            if (lastVideoId) {
              videoplay(lastVideoId);
            }
          }
        }
      }, 600);
    } else {
      console.log("First season reached, no previous videos available");
    }
  }
}

function videoplay(videoID) {
  jQuery(".hero-video")[0].pause();
  jQuery(".player-item video").each(function () {
    jQuery(this).get(0).pause();
  });
  var video = jQuery('.player-item[data-video="' + videoID + '"]');
  var findSubs = jQuery(video).find("subtitles-button")[0];
  var videoPlr = jQuery(video).find("video")[0];
  var item = jQuery('.chapter-item[data-id="' + videoID + '"]');
  var chapter = jQuery(item).parent().parent().parent().parent();
  var loading = jQuery(".player-loading");

  if (videoPlr) {
    jQuery(loading).addClass("active");

    setTimeout(function () {
      jQuery(".player-item, .chapter-item, .chapter").removeClass("active");
      jQuery(video).addClass("playing active");
      jQuery(video).find("video")[0].play();
      jQuery(chapter).addClass("active");
      jQuery(item).addClass("active started");
      setTimeout(function () {
        jQuery(loading).removeClass("active");
      }, 500);
    }, 500);

    Cookies.set(videoID, "started", { expires: 365 });
  } else {
    console.log("No video found");
  }
}

function heroend() {
  jQuery(".hero-cover").addClass("active");
  jQuery(".hero-play").removeClass("playing");
  jQuery(".hero-play").addClass("replay");
  jQuery(".hero-hide").removeClass("hidden");
}

function pausehero() {
  jQuery(".hero-video")[0].pause();
  jQuery(".hero-play").removeClass("playing");
  jQuery(".hero-play").addClass("paused");
  jQuery(".hero-hide").removeClass("hidden");
}

function removeLocationHash() {
  var uri = window.location.toString();
  if (uri.indexOf("?") > 0) {
    var clean_uri = uri.substring(0, uri.indexOf("?"));
    window.history.replaceState({}, document.title, clean_uri);
  }
}

$(".share-link-1").click(function (event) {
  event.preventDefault();
  var copytag = $(".is-hero-share .video-option-hover");
  $(copytag).text("Copied!");

  setTimeout(function () {
    $(copytag).text("Share");
    jQuery(".video-share").removeClass("active");
  }, 500);
});

$(".share-link-2").click(function (event) {
  event.preventDefault();
  var copytag = $(".video-share:not(.is-hero-share) .video-option-hover");
  $(copytag).text("Copied!");

  setTimeout(function () {
    $(copytag).text("Share Episode");
    jQuery(".video-share").removeClass("active");
  }, 500);
});

$(".share-link-1").on("click", function () {
  var copylink = $(this).attr("href");
  var $temp_1 = $("<input>");
  $("body").append($temp_1);
  $temp_1.val(copylink).select();
  document.execCommand("copy");
  $temp_1.remove();
});
//
$(".share-link-2").on("click", function () {
  var copylink = $(this).attr("href");
  var $temp_2 = $("<input>");
  $("body").append($temp_2);
  $temp_2.val(copylink).select();
  document.execCommand("copy");
  $temp_2.remove();
});

// function stickyHeader() {
//   var header = document.getElementById("header");
//   var wrapper = document.getElementById("wrapper");
//   var sticky = header.offsetTop;
//   if (window.pageYOffset > sticky) {
//     wrapper.classList.add("sticky");
//   } else {
//     wrapper.classList.remove("sticky");
//   }
// }

// Merged share functionality from share.js:
(function () {
  // Configuration
  const SHARE_CONFIG = {
    defaultTitle: "The DixonBaxi Way",
    defaultDescription: "Explore The DixonBaxi Way - a collection of insights and stories from our studio.",
    defaultImage: "https://assets.website-files.com/634404960e2557442c266cbf/63971e8683cc607bb202bf1b_mute-on.svg",
    shareBaseUrl: window.location.origin + window.location.pathname,
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupShareButtons();
  });

  function setupShareButtons() {
    // Twitter share
    document.querySelectorAll(".twitter-share").forEach((button) => {
      button.addEventListener("click", function (e) {
        e.preventDefault();
        shareToTwitter();
      });
    });

    // Facebook share
    document.querySelectorAll(".facebook-share").forEach((button) => {
      button.addEventListener("click", function (e) {
        e.preventDefault();
        shareToFacebook();
      });
    });

    // LinkedIn share
    document.querySelectorAll(".linkedin-share").forEach((button) => {
      button.addEventListener("click", function (e) {
        e.preventDefault();
        shareToLinkedIn();
      });
    });

    // Copy link
    document.querySelectorAll(".copy-link").forEach((button) => {
      button.addEventListener("click", function (e) {
        e.preventDefault();
        copyShareLink();
      });
    });
  }

  function getShareUrl() {
    let season = 1,
      chapter = 1;
    const hash = window.location.hash;
    const seasonMatch = hash.match(/season-(\d+)/);
    const chapterMatch = hash.match(/chapter-(\d+)/);
    if (seasonMatch && seasonMatch[1]) {
      season = parseInt(seasonMatch[1]);
    } else {
      const activeSeason = document.querySelector(".season-tab_link.w--current");
      if (activeSeason) {
        const index = Array.from(document.querySelectorAll(".season-tab_link")).indexOf(activeSeason);
        if (index !== -1) season = index + 1;
      }
    }
    if (chapterMatch && chapterMatch[1]) {
      chapter = parseInt(chapterMatch[1]);
    } else {
      const activeChapter = document.querySelector(".chapter-tab_link.w--current");
      if (activeChapter) {
        chapter = activeChapter.getAttribute("data-chapter") || 1;
      }
    }
    return `${SHARE_CONFIG.shareBaseUrl}#season-${season}&chapter-${chapter}`;
  }

  function getShareTitle() {
    let title = SHARE_CONFIG.defaultTitle;
    const activeSeason = document.querySelector(".season-tab_link.w--current");
    const activeChapter = document.querySelector(".chapter-tab_link.w--current");
    if (activeSeason && activeChapter) {
      const seasonTitle = activeSeason.textContent.trim();
      const chapterTitle = activeChapter.textContent.trim();
      title = `${seasonTitle}: ${chapterTitle} | ${SHARE_CONFIG.defaultTitle}`;
    }
    return title;
  }

  function getShareDescription() {
    let description = SHARE_CONFIG.defaultDescription;
    const activePlayer = document.querySelector(".player-item.active");
    if (activePlayer) {
      const descElement = activePlayer.querySelector(".player-description");
      if (descElement && descElement.textContent.trim()) {
        description = descElement.textContent.trim();
      }
    }
    return description;
  }

  function shareToTwitter() {
    const url = getShareUrl();
    const text = getShareTitle();
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(
      text
    )}`;
    window.open(twitterUrl, "_blank");
  }

  function shareToFacebook() {
    const url = getShareUrl();
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, "_blank");
  }

  function shareToLinkedIn() {
    const url = getShareUrl();
    const title = getShareTitle();
    const description = getShareDescription();
    const linkedInUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
      url
    )}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`;
    window.open(linkedInUrl, "_blank");
  }

  function copyShareLink() {
    const url = getShareUrl();
    const tempInput = document.createElement("input");
    tempInput.value = url;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    showCopyFeedback();
  }

  function showCopyFeedback() {
    let feedback = document.querySelector(".copy-feedback");
    if (!feedback) {
      feedback = document.createElement("div");
      feedback.className = "copy-feedback";
      feedback.textContent = "Link copied!";
      feedback.style.cssText =
        "position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#333; color:#fff; padding:10px 20px; border-radius:4px; opacity:0; transition:opacity 0.3s ease;";
      document.body.appendChild(feedback);
    }
    feedback.style.opacity = "1";
    setTimeout(() => {
      feedback.style.opacity = "0";
    }, 2000);
  }
})();
