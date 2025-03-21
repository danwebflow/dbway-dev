/**
 * This script adds the navigation.js file to the page
 * Run this once to add the navigation script to the page
 */
(function() {
  // Check if the script is already added
  const scripts = document.querySelectorAll('script');
  let navigationScriptExists = false;
  
  for (let i = 0; i < scripts.length; i++) {
    const src = scripts[i].src || '';
    if (src.includes('navigation.js')) {
      navigationScriptExists = true;
      break;
    }
  }
  
  // If the script doesn't exist, add it
  if (!navigationScriptExists) {
    const script = document.createElement('script');
    script.src = '/navigation.js';
    script.type = 'text/javascript';
    document.head.appendChild(script);
    console.log('Navigation script added to the page');
  } else {
    console.log('Navigation script already exists');
  }
})();