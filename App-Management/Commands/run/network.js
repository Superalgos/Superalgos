const path = require('path')
const chalk = require('chalk')
const { pm2m, getProfile } = global.SAM

exports.networkCommand = function networkCommand() {
    const thisObject = {
        name: 'network',
        description: chalk.bold('Runs the network app'),
        options: options,
        runner: runner
    }
    return thisObject

    function options(cmd) {
        return cmd.option('profile', {
            description: 'A custom profile to apply to the process being started',
            string: true
        })
    }

    function runner(args) {
        const name = args.profile !== undefined ? 'sa-' + args.profile + '-network' : 'sa-default-network'
        const startProcess = {
            script: 'network.js',
            name,
            cwd: SAM.cmd,
            log_file: path.join(SAM.cwd, 'My-Log-Files', 'pm2', 'network-console.log')
        }
        
        if(args.profile !== undefined) {
            startProcess.env = { 
                'PROFILE_NAME': args.profile 
            }
            const profile = getProfile(args.profile)
            if(profile !== undefined && profile.storeLogs !== undefined) {
                startProcess.log_file = path.join(profile.storeLogs, 'pm2', 'network-console.log')
            }
            console.log('[INFO] Network using profile: ' + args.profile)
        }
        
        console.log('[INFO] Network app starting')
        console.log('[INFO] Network app pm2 logs location: ' + startProcess.log_file)

        pm2m.connect()
            .then(() => pm2m.start(startProcess))
            .then(() => pm2m.disconnect())
    }
}