const pino = require('pino');
const path = require('path');
const fs = require('fs');

class LoggerSingleton {

  constructor() {

    if (LoggerSingleton.instance) {
      return LoggerSingleton.instance;
    }

    const logsDir = path.join(__dirname, '../logs');

    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-');

    const logFile =
        path.join(logsDir, `automation_${timestamp}.log`);

    this.logger = pino(
        {
          level: 'debug'
        },
        // file stream
        pino.destination(logFile)
    );

    LoggerSingleton.instance = this;
  }

  getLogger() {
    return this.logger;
  }
}

module.exports =
    new LoggerSingleton().getLogger();