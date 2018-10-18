import { createLogger, format, transports } from 'winston'

class LoggerService {
  constructor() {
    const winstonTransports = [
      new transports.Console({
        format: format.combine(
          format.colorize(),
          format.timestamp({ format: 'YYYY/MM/DD HH:mm' }),
          format.printf(
            info => `${info.timestamp} - ${info.level}: ${info.message}`
          )
        ),
      }),
    ]

    const logger = createLogger({
      level: 'info',
      transports: winstonTransports,
      exceptionHandlers: winstonTransports,
    })

    return new Proxy(this, {
      get: (target, propKey) => logger[propKey],
    })
  }
}

export const logger = new LoggerService() // Default logger
export { LoggerService }
