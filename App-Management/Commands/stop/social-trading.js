const chalk = require('chalk')
const { pm2m } = global.SAM

exports.socialTradingCommand = function socialTradingCommand() {
    const thisObject = {
        name: 'socialTrading',
        description: chalk.bold('Stops and deletes the social trading app'),
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
        const name = args.profile !== undefined ? 'sa-' + args.profile + '-socialTrading' : 'sa-default-socialTrading'
        
        console.log('[INFO] Social Trading app stopping')

        pm2m.connect()
            .then(() => pm2m.stop(name))
            .then(() => pm2m.kill(name))
            .then(() => pm2m.disconnect())
    }
}