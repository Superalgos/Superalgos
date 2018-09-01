import minilog from 'minilog'

minilog.enable()

const log = minilog('frontend')

let consoleLog = global.console.log

global.console.log = function () {
  consoleLog.apply(global.console, arguments)
}

export default log
