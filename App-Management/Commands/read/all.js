const pm2m = require('../../Pm2Management/manager').pm2Manager()

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
        pm2m.connect()
            .then(() => pm2m.list())
            .then((list) => console.log(list))
            .then(() => pm2m.disconnect())
    }
}