type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private level: LogLevel = 'info';

  setLevel(level: LogLevel) {
    this.level = level;
  }

  private log(level: LogLevel, message: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    switch (level) {
      case 'debug':
        console.debug(logMessage, ...args);
        break;
      case 'info':
        console.info(logMessage, ...args);
        break;
      case 'warn':
        console.warn(logMessage, ...args);
        break;
      case 'error':
        console.error(logMessage, ...args);
        break;
    }

    // Emit custom event for log monitoring
    window.dispatchEvent(new CustomEvent('botLog', {
      detail: {
        level,
        message: logMessage,
        timestamp,
        args
      }
    }));
  }

  debug(message: string, ...args: any[]) {
    if (this.level === 'debug') {
      this.log('debug', message, ...args);
    }
  }

  info(message: string, ...args: any[]) {
    if (this.level !== 'error') {
      this.log('info', message, ...args);
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.level !== 'error') {
      this.log('warn', message, ...args);
    }
  }

  error(message: string, ...args: any[]) {
    this.log('error', message, ...args);
  }
}

export const logger = new Logger();