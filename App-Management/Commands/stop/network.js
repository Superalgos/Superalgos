const pm2m = require('../../Pm2Management/manager').pm2Manager()
const chalk = require('chalk')

exports.networkCommand = function networkCommand() {
    const thisObject = {
        name: 'network',
        description: chalk.bold('Stops and deletes the network app'),
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
        const name = args.profile !== undefined ? 'sa-' + args.profile + '-network' : 'sa-default-network'
        
        console.log('[INFO] Network app stopping')

        pm2m.connect()
            .then(() => pm2m.stop(name))
            .then(() => pm2m.kill(name))
            .then(() => pm2m.disconnect())
    }
}