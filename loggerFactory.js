const winston = require('winston');
require('winston-daily-rotate-file');

/**
 * 
 * @param {string} logFileDirectory 
 * @returns {{
 *   info: (message: string) => void,
 *   debug: (message: string) => void,
 *   warn: (message: string) => void
 *   error: (message: string, stack: any) => void
 * }}
 */
exports.loggerFactory = function loggerFactory(logFileDirectory) {
    const filePathParts = logFileDirectory.split('/')
    return winston.createLogger({
        level: 'info',
        format: winston.format.simple(),
        transports: [
            new winston.transports.DailyRotateFile({
                filename: filePathParts.concat(['error-%DATE%.log']).join('/'),
                level: 'error',
                datePattern: 'YYYY-MM-DD',
                maxFiles: '14d',
                zippedArchive: true,
            }),
            new winston.transports.DailyRotateFile({
                filename: filePathParts.concat(['combined-%DATE%.log']).join('/'),
                datePattern: 'YYYY-MM-DD',
                maxFiles: '14d',
                zippedArchive: true,
            }),
            new winston.transports.Console()
        ]
    })
}