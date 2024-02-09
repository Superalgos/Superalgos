const chalk = require('chalk')
const { stdBoxedMessage } = global.SAM

exports.readCommands = function readCommands() {
    const thisObject = {
        name: 'read',
        description: chalk.bold('Use this command to read apps that are using the pm2 process manager'),
        options: options,
        runner: runner
    }

    const message = `
USAGE:
    ${chalk.red('superalgos read')} ${chalk.italic.red('[command] [options]')}
        
COMMANDS:
    - ${chalk.red('all')}
    - ${chalk.red('describe')}
      - OPTIONS:
        ${chalk.italic.red('--name')}
        `

    return thisObject
    
    function options(cmd) {
        const commands = [
            require('./all').allCommand(),
            require('./describe').describeCommand()
        ]
        return commands.reduce((builder, c) => 
            builder.command(c.name, c.description, c.options, c.runner).help(),
            cmd)
    }

    function runner() {
        console.log(stdBoxedMessage(message))
    }
}