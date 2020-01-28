const winston = require('winston')
const util = require('util')

const options = {
    file: {
        level: 'info',
        filename: '../logs/app.log',
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
        timestamp: true
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
        timestamp: true
    }
}

exports.logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.splat(),
        winston.format.timestamp({ format: 'YY/MM/DD HH:mm' }),
        winston.format.printf(
            info => `${info.timestamp} - ${info.level}: ${JSON.parse(JSON.stringify(util.inspect(info.message)))}`
        )
    ),
    transports: [
        new winston.transports.File(options.file),
        new winston.transports.Console(options.console)
    ],
    exitOnError: false // do not exit on handled exceptions
})