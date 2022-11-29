const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

/*
***** Welcome to Superalgos Ecosystem App Managment *****

USAGE:    node manageApps [command] [app or app arrays]

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
    node manageApps run multi --platform--minMemo--noBrowser --network --dashboards-minMemo

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
    require('./App-Management/Commands/platform').platformCommand(),
    require('./App-Management/Commands/dashboards').dashboardsCommand(),
    require('./App-Management/Commands/network').networkCommand(),
    require('./App-Management/Commands/multi').multiCommand(),
]

yargs(hideBin(process.argv))
    .command('run', 'use this command to run apps using pm2 process managment', runOptions, runApps)
    .alias('h','help')
    .help()
    .parse()

function runOptions(cmd) {
    return commands.reduce((builder, c) => builder.command(c.name, c.description, c.options, c.runner).help(), cmd)
}

function runApps() {
    console.log('You need to add additional commands, please run `manageApps run --help`')
}
