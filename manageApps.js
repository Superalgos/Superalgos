const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const helpMessage = `
***** Welcome to Superalgos Ecosystem App Managment *****

USAGE:    node manageApps [command] [app or app arrays]

COMMAND:
\tcommandName:    Required. Declare the command to be used to manage the declared app/s.

LIST OF COMMANDS: 
\trun - use this command to run apps using pm2 process managment

\tExample: node manageApps run platform

APP:
\tappName:    Required. Use it to declare which app you want to launch within the manager.
\tappFlags:   Optional. Use it to launch app with app specific flags such as minMemo or noBrowser.

\tExample: node manageApps run [platform,minMemo,noBrowser] [network] [dashboards,minMemo]

APP ARRAYS:
\tMultiple apps can be run at the same time using the following syntax:
\t[appName1, appFlags1] [appName2, appFlags2]

FURTHER PROCESS MANAGMENT:
\tPM2 offers further commands to manage apps once they are running.

\tUseful commands to know:
\tpm2 list - list all running processes managed by pm2.
\tpm2 logs - list all logs for processes managed by pm2. Can specify process to see process specific logs.
\tpm2 kill - kill all processes and the pm2 dameon.

\tAddtional commands and documentation can be found at the pm2 project page:
\thttps://pm2.keymetrics.io/docs/usage/quick-start/

`

const commands = [
    require('./App-Management/Commands/platform').platformCommand(),
    require('./App-Management/Commands/dashboards').dashboardsCommand(),
    require('./App-Management/Commands/network').networkCommand(),
]


yargs(hideBin(process.argv))
    .command('run', 'use this command to run apps using pm2 process managment', runOptions, runApps)
    .help()
    .parse()

function runOptions(cmd) {
    return commands.reduce((builder, c) => builder.command(c.name, c.description, c.options, c.runner), cmd).help()
}

function runApps() {
    console.log('You need to add additional commands, please run `manageApps run --help`')
}
