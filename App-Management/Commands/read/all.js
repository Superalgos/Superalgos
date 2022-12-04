const chalk = require('chalk')
const { pm2m } = global.SAM

exports.allCommand = function allCommand() {
    const thisObject = {
        name: 'all',
        description: chalk.bold('Reads the all the Superalgos processes returning them as a name list'),
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
            .then((list) => console.log(list.filter( x => /^sa/.test(x.name))))
            .then(() => pm2m.disconnect())
    }
}