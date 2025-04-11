/**
 * Simple logging utility for consistent log formatting
 */

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

/**
 * Log a message with the specified level and optional data
 */
export function log(level: LogLevel, message: string, data?: any): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...(data ? { data } : {})
  };

  switch (level) {
    case LogLevel.ERROR:
      console.error(JSON.stringify(logEntry, null, 2));
      break;
    case LogLevel.WARN:
      console.warn(JSON.stringify(logEntry, null, 2));
      break;
    case LogLevel.INFO:
      console.info(JSON.stringify(logEntry, null, 2));
      break;
    case LogLevel.DEBUG:
      console.debug(JSON.stringify(logEntry, null, 2));
      break;
    default:
      console.log(JSON.stringify(logEntry, null, 2));
  }
}

// Convenience log methods
export const logDebug = (message: string, data?: any) => log(LogLevel.DEBUG, message, data);
export const logInfo = (message: string, data?: any) => log(LogLevel.INFO, message, data);
export const logWarn = (message: string, data?: any) => log(LogLevel.WARN, message, data);
export const logError = (message: string, data?: any) => log(LogLevel.ERROR, message, data);