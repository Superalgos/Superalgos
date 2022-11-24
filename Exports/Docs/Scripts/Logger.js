exports.logger = {
    debug: function debug(message) {
        // log('[DEBUG] ' + message)
    },
    info: function info(message) {
        log('[INFO]  ' + message)
    },
    warn: function warn(message) {
        log('[WARN]  ' + message)
    },
    error: function error(err) {
        console.error((new Date()).toISOString(), err)
    }
}

function log(message) {
    console.log((new Date()).toISOString(), message)
}