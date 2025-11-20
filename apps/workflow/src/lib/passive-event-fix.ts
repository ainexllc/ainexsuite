/**
 * Passive Event Listener Fix
 *
 * This utility suppresses passive event listener warnings from third-party libraries
 * like Firebase's Google OAuth iframe. These warnings are harmless but clutter the console.
 *
 * The warnings appear because Firebase's iframe.js adds event listeners for touch/wheel
 * events without the { passive: true } option, which can theoretically block scrolling.
 * However, this is a known issue in Firebase SDK and doesn't affect functionality.
 */

if (typeof window !== 'undefined') {
  // Store original addEventListener
  const originalAddEventListener = EventTarget.prototype.addEventListener;

  // Override addEventListener to make touch/wheel events passive by default
  EventTarget.prototype.addEventListener = function (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) {
    // List of event types that should be passive by default
    const passiveEvents = ['touchstart', 'touchmove', 'touchend', 'wheel', 'mousewheel'];

    // Check if this is a scroll-blocking event
    if (passiveEvents.includes(type)) {
      // Convert options to object if it's a boolean
      const optionsObj: AddEventListenerOptions =
        typeof options === 'boolean'
          ? { capture: options, passive: true }
          : { ...options, passive: true };

      // Call original with passive option
      return originalAddEventListener.call(this, type, listener, optionsObj);
    }

    // For other events, use original behavior
    return originalAddEventListener.call(this, type, listener, options);
  };
}

export {};
