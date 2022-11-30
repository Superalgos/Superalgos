const pm2 = require('pm2')

exports.describeCommand = function describeCommand() {
    const thisObject = {
        name: 'describe',
        description: 'Describes a running Superalgos process',
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
        console.log('[INFO] Describin the ' + args.name + ' process')
        pm2.describe(args.name)
    }
}