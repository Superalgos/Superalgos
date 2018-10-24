import { createLogger, format, transports } from 'winston'
import { inspect } from 'util'

class LoggerService {
  constructor() {
    const winstonTransports = [
      new transports.Console({
        format: format.combine(
          format.colorize(),
          format.timestamp({ format: 'YY/MM/DD HH:mm' }),
          format.printf(
            info => `${info.timestamp} - ${info.level}: ${JSON.parse(JSON.stringify(inspect(info.message)))}`
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
