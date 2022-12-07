const chalk = require('chalk')
const { stdBoxedMessage } = global.SAM

exports.runCommands = function runCommands() {
    const thisObject = {
        name: 'run',
        description: chalk.bold('Use this command to run apps using pm2 process managment'),
        options: options,
        runner: runner
    }

    const message = `
USAGE:
    ${chalk.red('superalgos run')} ${chalk.italic.red('[command] [options]')}
        
COMMANDS:
    - ${chalk.red('platform')}
      - OPTIONS:
        ${chalk.italic.red('--minMemo')}
        ${chalk.italic.red('--noBrowser')}
        ${chalk.italic.red('--profile')}
    - ${chalk.red('dashboards')}
      - OPTIONS:
        ${chalk.italic.red('--minMemo')}
        ${chalk.italic.red('--profile')}
    - ${chalk.red('network')}
      - OPTIONS:
        ${chalk.italic.red('--profile')}
    - ${chalk.red('socialTrading')}
      - OPTIONS:
        ${chalk.italic.red('--profile')}
    - ${chalk.red('multi')}
      - OPTIONS:
        ${chalk.italic.red('--platform')}
        ${chalk.italic.red('--dashboards')}
        ${chalk.italic.red('--network')}
        ${chalk.italic.red('--socialTrading')}
        ${chalk.italic.red('--minMemo')}
        ${chalk.italic.red('--noBrowser')}
        ${chalk.italic.red('--profile')}
        `

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
        console.log(stdBoxedMessage(message))
    }
}