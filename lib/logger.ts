// lib/logger.ts

// Log levels
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

const LOG_LEVEL = process.env.LOG_LEVEL ? Number(process.env.LOG_LEVEL) : (process.env.NODE_ENV === 'development' ? LogLevel.INFO : LogLevel.WARN);

// Deduplication state
const recentMessages = new Map<string, number>();
const DEDUP_WINDOW_MS = 5000; // 5 seconds

function shouldLog(message: string, level: LogLevel): boolean {
  if (level > LOG_LEVEL) return false;
  const now = Date.now();
  const last = recentMessages.get(message);
  if (last && now - last < DEDUP_WINDOW_MS) return false;
  recentMessages.set(message, now);
  return true;
}

export function log(level: LogLevel, prefix: string, message: string, ...args: any[]) {
  if (!shouldLog(prefix + message, level)) return;
  const levelStr = LogLevel[level];
  const out = `[${levelStr}]${prefix ? ' ' + prefix : ''} ${message}`;
  if (level === LogLevel.ERROR) {
    // eslint-disable-next-line no-console
    console.error(out, ...args);
  } else if (level === LogLevel.WARN) {
    // eslint-disable-next-line no-console
    console.warn(out, ...args);
  } else {
    // eslint-disable-next-line no-console
    console.log(out, ...args);
  }
}

export function error(prefix: string, message: string, ...args: any[]) {
  log(LogLevel.ERROR, prefix, message, ...args);
}
export function warn(prefix: string, message: string, ...args: any[]) {
  log(LogLevel.WARN, prefix, message, ...args);
}
export function info(prefix: string, message: string, ...args: any[]) {
  log(LogLevel.INFO, prefix, message, ...args);
}
export function debug(prefix: string, message: string, ...args: any[]) {
  log(LogLevel.DEBUG, prefix, message, ...args);
} 