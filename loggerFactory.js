const { createLogger, format, transports, addColors } = require('winston');
const { combine, splat, timestamp, printf } = format;
require('winston-daily-rotate-file');

const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'white',
        debug: 'green',
    }
};

const consoleFormat = (type) => printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} | ${type} | ${level} | ${message} `
    if (Object.keys(metadata).length > 0) {
        msg += JSON.stringify(metadata)
    }
    return msg
});

const fileFormat = printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} | ${level} | ${message} `
    if (Object.keys(metadata).length > 0) {
        msg += JSON.stringify(metadata)
    }
    return msg
});

const getLogLevel = () => {
    if (global.env.LOG_LEVEL !== undefined && customLevels.levels[global.env.LOG_LEVEL] !== undefined) {
        return global.env.LOG_LEVEL
    }
    return 'info'
}

/**
 * 
 * @param {string} logFileDirectory 
 * @param {string} type
 * @returns {{
 *   info: (message: string) => void,
 *   debug: (message: string) => void,
 *   warn: (message: string) => void
 *   error: (message: string, stack: any) => void
 * }}
 */
exports.loggerFactory = function loggerFactory(logFileDirectory, type) {
    const consoleLogLevel = getLogLevel()
    const filePathParts = logFileDirectory.split('/')
    addColors(customLevels.colors)
    return createLogger({
        levels: customLevels.levels,
        format: combine(
            splat(),
            timestamp(),
            consoleFormat(type)
        ),
        transports: [
            new transports.DailyRotateFile({
                filename: filePathParts.concat(['error', '%DATE%.log']).join('/'),
                format: fileFormat,
                level: 'error',
                datePattern: 'YYYY-MM-DD',
                maxFiles: '14d',
                zippedArchive: true,
                handleExceptions: true
            }),
            new transports.DailyRotateFile({
                filename: filePathParts.concat(['combined', '%DATE%.log']).join('/'),
                format: fileFormat,
                datePattern: 'YYYY-MM-DD',
                maxFiles: '14d',
                zippedArchive: true,
                level: consoleLogLevel == 'debug' ? 'debug' : 'info'
            }),
            new transports.Console({
                level: consoleLogLevel, 
                handleExceptions: true
            })
        ],
        exitOnError: false
    })
}