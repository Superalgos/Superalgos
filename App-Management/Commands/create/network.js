const pm2m = require('../../Pm2Management/manager').pm2Manager()
const path = require('path')

exports.networkCommand = function networkCommand() {
    const thisObject = {
        name: 'network',
        description: 'Runs the network app',
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
            cwd: path.join(__dirname),
            log_file: path.join(__dirname, 'My-Log-Files', 'pm2', 'network-console.log')
        }
        
        if(args.profile !== undefined) {
            startProcess.env = { 
                'PROFILE_NAME': args.profile 
            }
        }
        
        console.log('[INFO] Network app starting')

        // pm2m.connect()
        //     .then(() => pm2m.start(startProcess))
        //     .then(() => pm2m.disconnect())
    }
}