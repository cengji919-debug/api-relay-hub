type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: Record<string, unknown>;
}

function formatLog(entry: LogEntry): string {
  const time = new Date(entry.timestamp).toISOString();
  const ctx = entry.context ? `[${entry.context}]` : '';
  const data = entry.data ? ` ${JSON.stringify(entry.data)}` : '';
  return `${time} [${entry.level.toUpperCase()}] ${ctx} ${entry.message}${data}`;
}

export function log(level: LogLevel, message: string, context?: string, data?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
    data,
  };

  switch (level) {
    case 'debug':
      console.debug(formatLog(entry));
      break;
    case 'info':
      console.info(formatLog(entry));
      break;
    case 'warn':
      console.warn(formatLog(entry));
      break;
    case 'error':
      console.error(formatLog(entry));
      break;
  }
}

export const logger = {
  debug: (message: string, context?: string, data?: Record<string, unknown>) => log('debug', message, context, data),
  info: (message: string, context?: string, data?: Record<string, unknown>) => log('info', message, context, data),
  warn: (message: string, context?: string, data?: Record<string, unknown>) => log('warn', message, context, data),
  error: (message: string, context?: string, data?: Record<string, unknown>) => log('error', message, context, data),
};
