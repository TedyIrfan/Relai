/**
 * Development-only logging utility (PERFORMANCE MODE)
 * Console.log statements disabled for better performance
 * Change ENABLE_LOGGING to true if you need debugging
 */
const ENABLE_LOGGING = false; // 🔥 PERFORMANCE: Disabled for speed

const debugLog = (...args) => {
  // 🔥 PERFORMANCE: Completely disabled for maximum speed
  // if (ENABLE_LOGGING && process.env.NODE_ENV === 'development') {
  //   console.log(...args);
  // }
};

const debugError = (...args) => {
  // 🔥 PERFORMANCE: Completely disabled for maximum speed
};

const debugWarn = (...args) => {
  // 🔥 PERFORMANCE: Completely disabled for maximum speed
};

const debugInfo = (...args) => {
  // 🔥 PERFORMANCE: Completely disabled for maximum speed
};

// Export conditional logging functions
export {
  debugLog as consoleLog,
  debugError as consoleError,
  debugWarn as consoleWarn,
  debugInfo as consoleInfo
};

// For backward compatibility, also export as default
export default {
  log: debugLog,
  error: debugError,
  warn: debugWarn,
  info: debugInfo
};