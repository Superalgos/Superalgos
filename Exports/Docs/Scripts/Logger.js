exports.logger = {
    info: function info(message) {
        log('[INFO] ' + message)
    },
    warn: function warn(message) {
        log('[WARN] ' + message)
    }
}

function log(message) {
    console.log((new Date()).toISOString(), message)
}