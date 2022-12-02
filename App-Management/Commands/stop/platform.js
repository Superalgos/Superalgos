const pm2m = require('../../Pm2Management/manager').pm2Manager()
const chalk = require('chalk')

exports.platformCommand = function platformCommand() {
    const thisObject = {
        name: 'platform',
        description: chalk.bold('Stops and deletes the platform app'),
        options: options,
        runner: runner
    }
    return thisObject

    function options(cmd) {
        return cmd.option('profile', {
            description: 'A custom profile used by the process being stopped',
            string: true
        })
    }

    function runner(args) {
        const name = args.profile !== undefined ? 'sa-' + args.profile + '-platform' : 'sa-default-platform'
        
        console.log('[INFO] Platform app stopping')

        pm2m.connect()
            .then(() => pm2m.stop(name))
            .then(() => pm2m.kill(name))
            .then(() => pm2m.disconnect())
    }
}