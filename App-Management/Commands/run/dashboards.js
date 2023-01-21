const path = require('path')
const chalk = require('chalk')
const { cwd, pm2m, getProfile } = global.SAM

exports.dashboardsCommand = function dashboardsCommand() {
    const thisObject = {
        name: 'dashboards',
        description: chalk.bold('Runs the dashboards app'),
        options: options,
        runner: runner
    }
    return thisObject

    function options(cmd) {
        return cmd.option('minMemo', {
            boolean: true,
            default: false
        }).option('profile', {
            description: 'A custom profile to apply to the process being started',
            string: true
        })
    }

    function runner(args) {
        const arguments = []
        if(args.minMemo) { arguments.push('minMemo')}

        const name = args.profile !== undefined ? 'sa-' + args.profile + '-dashboards' : 'sa-default-dashboards'
        const startProcess = {
            script: 'dashboards.js',
            name,
            cwd,
            log_file: path.join(cwd, 'My-Log-Files', 'pm2', 'dashboards-console.log')
        }

        if(args.profile !== undefined) {
            startProcess.env = { 
                'PROFILE_NAME': args.profile 
            }
            const profile = getProfile(args.profile)
            if(profile !== undefined && profile.storeLogs !== undefined) {
                startProcess.log_file = path.join(profile.storeLogs, 'pm2', 'dashboards-console.log')
            }
            console.log('[INFO] Dashboards using profile: ' + args.profile)
        }

        console.log('[INFO] Dashboards app starting with the following options: ', JSON.stringify(arguments))
        console.log('[INFO] Dashboards app pm2 logs location: ' + startProcess.log_file)

        pm2m.connect()
            .then(() => pm2m.start(startProcess))
            .then(() => pm2m.disconnect())
    }
}