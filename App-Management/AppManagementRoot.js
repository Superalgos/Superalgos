const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

exports.runRoot = function runRoot() {

    const welcomeMessage = `
***** Welcome to Superalgos Ecosystem App Managment *****

USAGE:    node manageApps [command] [options]

PRIMARY COMMAND LIST:
- run
- read
- restart

For more details of each command and their options run with the --help argument
`
/*


COMMAND:
    commandName:    Required. Declare the command to be used to manage the declared app/s.

LIST OF COMMANDS: 
    run - use this command to run apps using pm2 process managment

    Example: node manageApps run platform

SINGLE APP:
    appName:    Required. Use it to declare which app you want to launch within the manager.
    appFlags:   Optional. Use it to launch app with app specific flags such as minMemo or noBrowser.

    Example: node manageApps run platform --minMemo --noBrowser
    Example: node manageApps run network
    Example: node manageApps run dashboards --minMemo

MULTI APP:
    Multiple apps can be run at the same time using the following syntax:
    node manageApps run multi --platform --network --dashboards --minMemo --noBrowser

FURTHER PROCESS MANAGMENT:
    PM2 offers further commands to manage apps once they are running.

    Useful commands to know:
    pm2 list - list all running processes managed by pm2.
    pm2 logs - list all logs for processes managed by pm2. Can specify process to see process specific logs.
    pm2 kill - kill all processes and the pm2 dameon.

    Addtional commands and documentation can be found at the pm2 project page:
    https://pm2.keymetrics.io/docs/usage/quick-start/
*/

    const commands = [
        require('./Commands/create/index').runCommands(),
        require('./Commands/read/index').readCommands(),
        require('./Commands/restart/index').restartCommands(),
    ]

    let builder = yargs(hideBin(process.argv))
        .version(require('../package.json').version)
        .alias('h', 'help')
        .option('info', {
            description: 'displays the welcome message',
            default: true,
            boolean: true
        })
        .help()
        
    builder = commands.reduce((args, c) => args.command(c.name, c.description, c.options, c.runner).help(), builder)
    const argv = builder.parse()
}

/*
following commands would need to be applied in the code to allow the 
pm2 process to be restarted after an application update

const { spawn } = require('node:child_process');

const subprocess = spawn('node', ['manageApps', 'restart', name], {
  detached: true,
  stdio: 'ignore',
});

subprocess.unref();
*/