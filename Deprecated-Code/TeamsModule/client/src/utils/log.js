import minilog from 'minilog'

if (process.env.NODE_ENV === 'development') minilog.enable()

const log = minilog('frontend')

export default log
