const pm2 = require('pm2')
const path = require('path')

exports.listCommand = function listCommand() {
    const thisObject = {
        name: 'network',
        description: 'Runs the network app',
        options: options,
        runner: runner
    }
    return thisObject

    function options(cmd) {
        return cmd
    }

    function runner() {
        console.log('[INFO] Listing running processes')
        // pm2.start({
        //     script: 'network.js',
        //     name: 'network',
        //     cwd: path.join(__dirname),
        //     log_file: path.join(__dirname, 'Network', 'My-Log-Files', 'network-console.log')
        // }, function (err) {
        //     if (err) {
        //         console.error(err)
        //         return pm2.disconnect()
        //     }
        //     console.log('[INFO] Network app now running under PM2 dameon')
        // })
    }
}