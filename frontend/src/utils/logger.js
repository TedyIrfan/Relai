/**
 * Development-only logging utility
 * Console.log statements will only work in development mode
 * Production mode will have clean console output for better performance
 */

const debugLog = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};

const debugError = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(...args);
  }
};

const debugWarn = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(...args);
  }
};

const debugInfo = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.info(...args);
  }
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