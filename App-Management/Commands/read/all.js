const pm2 = require('pm2')

exports.allCommand = function allCommand() {
    const thisObject = {
        name: 'all',
        description: 'Reads the all the Superalgos processes returning them as a name list',
        options: options,
        runner: runner
    }
    return thisObject

    function options(cmd) {
        return cmd
    }

    function runner() {
        console.log('[INFO] Listing running processes')
        pm2.list()
    }
}