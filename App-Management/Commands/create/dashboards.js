const pm2 = require('pm2')
const path = require('path')

exports.dashboardsCommand = function dashboardsCommand() {
    const thisObject = {
        name: 'dashboards',
        description: 'Runs the dashboards app',
        options: options,
        runner: runner
    }
    return thisObject

    function options(cmd) {
        return cmd.option('minMemo', {
            boolean: true,
            default: false
        })
    }

    function runner(args) {
        const arguments = []
        if(args.minMemo) { arguments.push('minMemo')}

        console.log('[INFO] Dashboards app starting with the following options: ', JSON.stringify(arguments))
        // pm2.start({
        //     script: 'dashboards.js',
        //     name: 'dashboards',
        //     args: arguments,
        //     cwd: path.join(__dirname),
        //     log_file: path.join(__dirname, 'Dashboards', 'My-Log-Files', 'dashboards-console.log')
        // }, function (err, apps) {
        //     if (err) {
        //         console.error(err)
        //         return pm2.disconnect()
        //     }
        //     console.log('[INFO] Dashboards app now running under PM2 dameon')
        // })
    }
}