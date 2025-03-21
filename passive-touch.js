/**
 * The DixonBaxi Way - Passive Touch Events
 * 
 * This script makes touchstart events passive by default to improve scrolling performance
 * and eliminate Chrome warnings about passive event listeners.
 */

(function() {
  // Store the original addEventListener method
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  
  // Override the addEventListener method
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    // For touchstart events, make them passive by default unless explicitly set to non-passive
    if (type === 'touchstart') {
      // If options is a boolean (useCapture), convert to an object
      if (typeof options === 'boolean') {
        options = { 
          capture: options,
          passive: true 
        };
      } 
      // If options is an object without passive property, add passive: true
      else if (options === undefined) {
        options = { passive: true };
      }
      // If options is an object and passive is not explicitly set to false, make it true
      else if (typeof options === 'object' && options.passive !== false) {
        options.passive = true;
      }
    }
    
    // Call the original method with the modified options
    return originalAddEventListener.call(this, type, listener, options);
  };
  
  console.log("Passive touch events enabled for better performance");
})();