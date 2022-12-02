const chalk = require('chalk')

exports.stopCommands = function stopCommands() {
    const thisObject = {
        name: 'stop',
        description: chalk.bold('Use this command to stop and delete apps running with the pm2 process managment'),
        options: options,
        runner: runner
    }

    return thisObject
    
    function options(cmd) {
        const commands = [
            require('./platform').platformCommand(),
            require('./dashboards').dashboardsCommand(),
            require('./network').networkCommand(),
            require('./multi').multiCommand(),
        ]
        return commands.reduce((builder, c) => 
            builder.command(c.name, c.description, c.options, c.runner).help(),
            cmd)
    }

    function runner() {
        console.log(`You need to add additional commands, please run ${chalk.italic('superalgos stop --help')}`)
    }
}