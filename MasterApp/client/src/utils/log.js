import debug from 'debug'

const BASE = 'superalgos'
const COLOURS = {
  info: 'blue',
  warn: 'orange',
  error: 'red'
}

class Log {
  generateMessage (level, message, source) {
    // Set the prefix which will cause debug to enable the message
    const namespace = `${BASE}:${level}`
    const createDebug = debug(namespace)

    // Set the colour of the message based on the level
    createDebug.color = COLOURS[level]

    if (source) {
      createDebug(source, message)
    } else {
      createDebug(message)
    }
  }

  info (message, source) {
    return this.generateMessage('info', message, source)
  }

  warn (message, source) {
    return this.generateMessage('warn', message, source)
  }

  error (message, source) {
    return this.generateMessage('error', message, source)
  }
}

export default new Log()
