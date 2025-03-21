/**
 * Main initialization on DOM content loaded
 * Sets up season tabs and handles responsive video container sizing
 */
console.log("loading scripts...");

window.addEventListener("DOMContentLoaded", () => {
  // Season Defaults
  $(".season-tab_link").eq(0).addClass("is-season-1");
  $(".season-tab_link").eq(1).addClass("is-season-2");
  $(".season-tab_link").eq(2).addClass("is-season-3");

  // Handle responsive video container sizing
  jQuery(function () {
    adjustVideoContainerSizes();
  });

  // Re-adjust sizes on window resize
  jQuery(window).on("resize", function () {
    adjustVideoContainerSizes();
  });
});

/**
 * Adjusts video container sizes based on viewport width
 */
function adjustVideoContainerSizes() {
  if (jQuery(window).width() >= 1440) {
    // Large screens - fixed height
    let maxHeight = 593.25;
    jQuery(".player-content").each(function () {
      jQuery(this).css("height", maxHeight + "px");
      jQuery(".player-menu_list").css("height", maxHeight + "px");
    });
  } else if (jQuery(window).width() >= 992 && jQuery(window).width() <= 1439) {
    // Medium screens - dynamic height based on video
    let videoHeight = jQuery(".player-item.active .player-content").find("video").height();

    // If video height is 0, use a default height
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
}

//This function loads all scripts needed for this page to work after they have been nested into the page.
window.fsAttributes = window.fsAttributes || [];
window.fsAttributes.push([
  "cmsnest",
  (nestInstances) => {
    /**
     * Sequential script loader
     * Loads scripts in order to ensure dependencies are met
     */
    (function () {
      // Get the base URL for the scripts (current script's directory)
      let scripts = document.getElementsByTagName("script");
      let currentScript = scripts[scripts.length - 1];
      let baseUrl = currentScript.src.substring(0, currentScript.src.lastIndexOf("/") + 1);

      let scriptFiles = [baseUrl + "tabs.js", baseUrl + "functions.js", baseUrl + "controls-new.js"];

      /**
       * Recursively loads scripts in sequence
       * Each script waits for the previous one to load before executing
       */
      const loadScripts = function () {
        if (scriptFiles.length > 0) {
          let nextLib = scriptFiles.shift();
          let headTag = document.getElementsByTagName("head")[0];
          let scriptTag = document.createElement("script");

          scriptTag.src = nextLib;
          scriptTag.onload = function (e) {
            // Load the next script after this one is loaded
            loadScripts();

            // If this is the tabs script, initialize tabs immediately
            if (e.target.src.indexOf("tabs.js") > -1) {
              // Force adjustVideoContainerSizes to run after tabs are loaded
              setTimeout(function () {
                adjustVideoContainerSizes();
              }, 300);
            }
          };

          // Handle script load errors
          scriptTag.onerror = function (e) {
            // If tabs script fails to load, include its functionality inline
            if (e.target.src.indexOf("tabs.js") > -1) {
              initializeTabsFunctionality();
            }

            // Continue loading other scripts even if one fails
            loadScripts();
          };

          headTag.appendChild(scriptTag);
        }
      };

      /**
       * Fallback tabs functionality if the tabs script fails to load
       */
      function initializeTabsFunctionality() {
        jQuery(function ($) {
          // Tab Buttons
          $(".season-tab_link").on("click", function () {
            $(".season-tab_link").attr("data-tab", "");
            $(this).attr("data-tab", "current");
          });

          // Tab Functions
          $(".season-tab_link").on("click", function () {
            // Get the season number from the class (is-season-X)
            let seasonClass = $(this)
              .attr("class")
              .match(/is-season-(\d+)/);
            if (seasonClass && seasonClass[1]) {
              let seasonNumber = seasonClass[1];

              // Remove active class from all panels
              $(".season-tab_content-panel").removeClass("active");

              // Add active class to the corresponding panel using data attribute
              $(`.season-tab_content-panel[data-season-${seasonNumber}]`).addClass("active");

              // Player Item
              $(".player-item").removeClass("active");
              // Chapter
              $(".chapter").removeClass("active");
              $(".chapter-item").removeClass("active");
              // Update footer
              updateTab();
            }
          });

          // Update Tab function
          function updateTab() {
            // Get current active tab
            let tab = $(".season-tab_content-panel"),
              current = tab.filter(".active");
            let getIndex = current.index();

            if (current) {
              if (getIndex === 0) {
                $("#heroBtn").text("Play Season 1");
              } else if (getIndex === 1) {
                $("#heroBtn").text("Play Season 2");
              } else if (getIndex === 2) {
                $("#heroBtn").text("Play Season 3");
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

          // Initialize Season 3 as the active tab by default
          if (!$(".season-tab_content-panel").hasClass("active")) {
            $(".season-tab_content-panel[data-season-3]").addClass("active");
            $(".season-tab_link.is-season-3").attr("data-tab", "current");
          }
          updateTab();

          // CHANGE HERO VIDEO SOURCE
          $(".season-tab_link").on("click", function (event) {
            let change = $(this).attr("data-source");
            if (change && $(".hero-video").length) {
              $(".hero-video")[0].pause();
              $(".hero-video").attr("src", change);
              $(".hero-video")[0].load();
              $(".hero-video")[0].play();
            }
          });

          // Force adjustVideoContainerSizes to run
          setTimeout(function () {
            adjustVideoContainerSizes();
          }, 300);
        });
      }

      // Start loading scripts
      loadScripts();
    })();

    $(".nested-collections-data").remove(); //Nested data gets removed from the DOM once it has been loaded.
  },
]);

/**
 * Browser and device detection
 * Adds appropriate classes to the HTML element for CSS targeting
 */
jQuery(document).ready(function ($) {
  // Detect iOS devices
  function detectIOS() {
    const deviceAgent = navigator.userAgent.toLowerCase();
    return deviceAgent.match(/(iphone|ipod|ipad)/) || (navigator.userAgent.includes("Mac") && "ontouchend" in document); // iPad on iOS 13+
  }

  // Detect mobile devices
  function detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Add device classes
  if (detectIOS()) {
    $("html").addClass("ios");
  }

  if (detectMobile()) {
    $("html").addClass("mobile");
  }

  // Add browser classes
  const ua = navigator.userAgent;

  if (ua.search("MSIE") >= 0 || ua.search("Trident") >= 0) {
    $("html").addClass("ie");
  } else if (ua.search("Chrome") >= 0 && ua.search("Edge") < 0) {
    $("html").addClass("chrome");
  } else if (ua.search("Firefox") >= 0) {
    $("html").addClass("firefox");
  } else if (ua.search("Safari") >= 0 && ua.search("Chrome") < 0) {
    $("html").addClass("safari");
  } else if (ua.search("Opera") >= 0 || ua.search("OPR") >= 0) {
    $("html").addClass("opera");
  } else if (ua.search("Edge") >= 0) {
    $("html").addClass("edge");
  }
});

// Note: The Javascript is optional. Read the documentation below how to use the CSS Only version.

function initCSSMarquee() {
  const pixelsPerSecond = 75; // Set the marquee speed (pixels per second)
  const marquees = document.querySelectorAll("[data-css-marquee]");

  // Duplicate each [data-css-marquee-list] element inside its container
  marquees.forEach((marquee) => {
    marquee.querySelectorAll("[data-css-marquee-list]").forEach((list) => {
      const duplicate = list.cloneNode(true);
      marquee.appendChild(duplicate);
    });
  });

  // Create an IntersectionObserver to check if the marquee container is in view
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target
          .querySelectorAll("[data-css-marquee-list]")
          .forEach((list) => (list.style.animationPlayState = entry.isIntersecting ? "running" : "paused"));
      });
    },
    { threshold: 0 }
  );

  // Calculate the width and set the animation duration accordingly
  marquees.forEach((marquee) => {
    marquee.querySelectorAll("[data-css-marquee-list]").forEach((list) => {
      list.style.animationDuration = list.offsetWidth / pixelsPerSecond + "s";
      list.style.animationPlayState = "paused";
    });
    observer.observe(marquee);
  });
}

// Initialize CSS Marquee
document.addEventListener("DOMContentLoaded", function () {
  initCSSMarquee();
});
