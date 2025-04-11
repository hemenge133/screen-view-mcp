/**\n * Simple logging utility for consistent log formatting\n */\n\n// Log levels\nexport enum LogLevel {\n  DEBUG = 'DEBUG',\n  INFO = 'INFO',\n  WARN = 'WARN',\n  ERROR = 'ERROR'\n}\n\n/**\n * Log a message with the specified level and optional data\n */\nexport function log(level: LogLevel, message: string, data?: any): void {\n  const timestamp = new Date().toISOString();\n  const logEntry = {\n    timestamp,\n    level,\n    message,\n    ...(data ? { data } : {})\n  };\n\n  switch (level) {\n    case LogLevel.ERROR:\n      console.error(JSON.stringify(logEntry, null, 2));\n      break;\n    case LogLevel.WARN:\n      console.warn(JSON.stringify(logEntry, null, 2));\n      break;\n    case LogLevel.INFO:\n      console.info(JSON.stringify(logEntry, null, 2));\n      break;\n    case LogLevel.DEBUG:\n      console.debug(JSON.stringify(logEntry, null, 2));\n      break;\n    default:\n      console.log(JSON.stringify(logEntry, null, 2));\n  }\n}\n\n// Convenience log methods\nexport const logDebug = (message: string, data?: any) => log(LogLevel.DEBUG, message, data);\nexport const logInfo = (message: string, data?: any) => log(LogLevel.INFO, message, data);\nexport const logWarn = (message: string, data?: any) => log(LogLevel.WARN, message, data);\nexport const logError = (message: string, data?: any) => log(LogLevel.ERROR, message, data);\n