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

const myFormat = printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} | ${level} | ${message} `
    if (Object.keys(metadata).length > 0) {
        msg += JSON.stringify(metadata)
    }
    return msg
});

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
    addColors(customLevels.colors)
    return createLogger({
        levels: customLevels.levels,
        format: combine(
            splat(),
            timestamp(),
            myFormat
        ),
        transports: [
            new transports.DailyRotateFile({
                filename: filePathParts.concat(['error', '%DATE%.log']).join('/'),
                level: 'error',
                datePattern: 'YYYY-MM-DD',
                maxFiles: '14d',
                zippedArchive: true,
            }),
            new transports.DailyRotateFile({
                filename: filePathParts.concat(['combined', '%DATE%.log']).join('/'),
                datePattern: 'YYYY-MM-DD',
                maxFiles: '14d',
                zippedArchive: true,
            }),
            new transports.Console()
        ]
    })
}