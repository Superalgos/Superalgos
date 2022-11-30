exports.readCommands = function readCommands() {
    const thisObject = {
        name: 'read',
        description: 'Use this command to read apps that are using the pm2 process manager',
        options: options,
        runner: runner
    }

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
        console.log('You need to add additional commands, please run `manageApps read --help`')
    }
}