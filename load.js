/**
 * Main initialization on DOM content loaded
 * Sets up season tabs and handles responsive video container sizing
 *
 * Development Mode:
 * To enable development mode, add the devMode attribute to the script tag:
 * <script devMode="true" src="https://danwebflow.github.io/dbway-dev/load.js"></script>
 */
// Initialize scripts

// Check for development mode attribute in the script tag
(function () {
  // Find the script tag that loaded this file
  let scripts = document.getElementsByTagName("script");
  let currentScript = null;

  // Loop through all scripts to find the one with our src or devMode attribute
  for (let i = 0; i < scripts.length; i++) {
    if (scripts[i].src && scripts[i].src.includes("dbway-dev/load.js")) {
      currentScript = scripts[i];
      break;
    }
  }

  // If we couldn't find it, use the last script as a fallback
  if (!currentScript && scripts.length > 0) {
    currentScript = scripts[scripts.length - 1];
  }

  // Check if the devMode attribute is set to "true"
  if (currentScript && currentScript.getAttribute("devMode") === "true") {
    window.dbwayDevMode = true;

    // Create a visual indicator for development mode
    window.addEventListener("DOMContentLoaded", function () {
      const devIndicator = document.createElement("div");
      devIndicator.style.position = "fixed";
      devIndicator.style.bottom = "10px";
      devIndicator.style.right = "10px";
      devIndicator.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
      devIndicator.style.color = "white";
      devIndicator.style.padding = "5px 10px";
      devIndicator.style.borderRadius = "3px";
      devIndicator.style.fontFamily = "monospace";
      devIndicator.style.fontSize = "12px";
      devIndicator.style.zIndex = "9999";
      devIndicator.textContent = "DBWay Dev Mode";

      document.body.appendChild(devIndicator);
    });
  }
})();

window.addEventListener("DOMContentLoaded", () => {
  // Season Defaults - add both classes and data attributes
  $(".season-tab_link").eq(0).addClass("is-season-1").attr("data-season", "1");
  $(".season-tab_link").eq(1).addClass("is-season-2").attr("data-season", "2");
  $(".season-tab_link").eq(2).addClass("is-season-3").attr("data-season", "3");

  // Also add data attributes to panels if they don't have them
  $(".season-tab_content-panel").eq(0).attr("data-season", "1");
  $(".season-tab_content-panel").eq(1).attr("data-season", "2");
  $(".season-tab_content-panel").eq(2).attr("data-season", "3");

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
     * DBWay Development Mode Configuration
     * Enable by adding devMode="true" attribute to the script tag:
     * <script devMode="true" src="https://danwebflow.github.io/dbway-dev/load.js"></script>
     */
    const useLocalDevelopment = window.dbwayDevMode || false;

    /**
     * Local development server configuration
     * Change these settings to match your local environment
     */
    const localDevConfig = {
      port: 5500, // Default port for Live Server VSCode extension
      host: "localhost",
      protocol: "http",
    };

    /**
     * Checks if the local development server is running
     * @returns {Promise<boolean>} True if the server is running, false otherwise
     */
    async function isLocalServerRunning() {
      if (!useLocalDevelopment) {
        return false;
      }

      // Create a reliable way to test if the local server is running
      const testUrl = `${localDevConfig.protocol}://${localDevConfig.host}:${localDevConfig.port}/load.js`;

      return new Promise((resolve) => {
        // Use an image object for reliable cross-origin detection
        const img = new Image();

        // Set a short timeout
        const timeout = setTimeout(() => {
          resolve(false);
        }, 1000);

        // If the image loads, the server is running
        img.onload = () => {
          clearTimeout(timeout);
          resolve(true);
        };

        // If there's an error loading the image, the server is not running
        img.onerror = () => {
          // This could mean the server is running but the file doesn't exist
          // Let's try to fetch with XHR as a backup method
          const xhr = new XMLHttpRequest();
          xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
              clearTimeout(timeout);
              if (xhr.status >= 200 && xhr.status < 400) {
                resolve(true);
              } else {
                resolve(false);
              }
            }
          };

          try {
            xhr.open("HEAD", testUrl, true);
            xhr.timeout = 800; // Shorter timeout for the backup method
            xhr.send();
          } catch (e) {
            clearTimeout(timeout);
            resolve(false);
          }
        };

        // Set the source to trigger the load/error
        img.src = testUrl;
      });
    }

    /**
     * Sequential script loader
     * Loads scripts in order to ensure dependencies are met
     */
    (async function () {
      // Determine which base URL to use
      let baseUrl;
      let isLocalMode = false;

      try {
        // Check if local server is running
        isLocalMode = await isLocalServerRunning();

        if (isLocalMode) {
          baseUrl = `${localDevConfig.protocol}://${localDevConfig.host}:${localDevConfig.port}/`;
        } else {
          // Get the base URL for the scripts (current script's directory)
          let scripts = document.getElementsByTagName("script");
          let currentScript = scripts[scripts.length - 1];
          baseUrl = currentScript.src.substring(0, currentScript.src.lastIndexOf("/") + 1);
        }
      } catch (error) {
        // Fallback to current script's directory if there's an error
        let scripts = document.getElementsByTagName("script");
        let currentScript = scripts[scripts.length - 1];
        baseUrl = currentScript.src.substring(0, currentScript.src.lastIndexOf("/") + 1);
      }

      // Define script files to load
      let scriptFiles = ["tabs.js", "functions.js", "controls.js"];

      // Add cache-busting for local development
      if (isLocalMode) {
        const timestamp = new Date().getTime();
        scriptFiles = scriptFiles.map((file) => baseUrl + file + "?t=" + timestamp);
      } else {
        scriptFiles = scriptFiles.map((file) => baseUrl + file);
      }

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
            // If we're in local mode and a script fails to load, try the remote version
            if (isLocalMode && nextLib.includes(localDevConfig.host)) {
              // Get the filename from the URL
              const filename = nextLib.split("/").pop().split("?")[0];

              // Get the remote script URL
              let scripts = document.getElementsByTagName("script");
              let currentScript = scripts[scripts.length - 1];
              let remoteBaseUrl = currentScript.src.substring(0, currentScript.src.lastIndexOf("/") + 1);

              // Create a new script tag for the remote version
              let fallbackScript = document.createElement("script");
              fallbackScript.src = remoteBaseUrl + filename;

              fallbackScript.onload = function () {
                loadScripts();
              };

              fallbackScript.onerror = function () {
                // If tabs script fails to load, include its functionality inline
                if (filename === "tabs.js") {
                  initializeTabsFunctionality();
                }

                loadScripts();
              };

              headTag.appendChild(fallbackScript);
              return;
            }

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

          // Update Tab function
          function updateTab() {
            // Get current active tab
            let tab = $(".season-tab_content-panel"),
              current = tab.filter(".active");
            let getIndex = current.index();

            if (current) {
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

          // Initialize first tab
          if (!$(".season-tab_content-panel").hasClass("active")) {
            $(".season-tab_content-panel").first().addClass("active");
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

  // Add hover pause functionality for marquee items
  const marqueeItems = document.querySelectorAll(".marquee-css__item");
  marqueeItems.forEach((item) => {
    // Pause animation on hover
    item.addEventListener("mouseenter", function () {
      const parentMarquee = this.closest("[data-css-marquee]");
      if (parentMarquee) {
        parentMarquee.querySelectorAll("[data-css-marquee-list]").forEach((list) => {
          list.style.animationPlayState = "paused";
        });
      }
    });

    // Resume animation when hover ends
    item.addEventListener("mouseleave", function () {
      const parentMarquee = this.closest("[data-css-marquee]");
      if (parentMarquee) {
        // Check if the marquee is in view before resuming
        const isInView = Array.from(observer.takeRecords()).find(
          (record) => record.target === parentMarquee
        )?.isIntersecting;

        // Only resume if the marquee is in view
        if (isInView !== false) {
          parentMarquee.querySelectorAll("[data-css-marquee-list]").forEach((list) => {
            list.style.animationPlayState = "running";
          });
        }
      }
    });
  });
}

// Initialize CSS Marquee
document.addEventListener("DOMContentLoaded", function () {
  initCSSMarquee();
});
