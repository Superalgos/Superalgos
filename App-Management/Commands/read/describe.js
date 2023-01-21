const chalk = require('chalk')
const { pm2m } = global.SAM

exports.describeCommand = function describeCommand() {
    const thisObject = {
        name: 'describe',
        description: chalk.bold('Describes a running Superalgos process'),
        options: options,
        runner: runner
    }
    return thisObject

    function options(cmd) {
        return cmd.option('name', {
            string: true,
            demandOption: true
        })
    }

    function runner(args) {
        console.log('[INFO] Describing the ' + args.name + ' process')
        pm2m.connect()
            .then(() => pm2m.describe(args.name))
            .then((list) => console.log(list))
            .then(() => pm2m.disconnect())
    }
}