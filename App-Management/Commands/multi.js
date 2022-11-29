const pm2 = require('pm2')
const path = require('path')

exports.multiCommand = function multiCommand() {
    const thisObject = {
        name: 'multi',
        description: 'Runs multiple apps',
        options: options,
        runner: runner
    }
    return thisObject

    function options(cmd) {
        return cmd.option('platform', {
            description: 'This will run the full platform app with browser\nonly one of --platform, --platform-noBrowser, --platform-minMemo or --platform-minMemo-noBrowser can be specified',
            boolean: true,
            default: false
        }).option('platform-noBrowser', {
            description: 'This will run the full platform app without the browser\nonly one of --platform, --platform-noBrowser, --platform-minMemo or --platform-minMemo-noBrowser can be specified',
            boolean: true,
            default: false
        }).option('platform-minMemo', {
            description: 'This will run the full platform app with browser and the minimum memory footprint\nonly one of --platform, --platform-noBrowser, --platform-minMemo or --platform-minMemo-noBrowser can be specified',
            boolean: true,
            default: false
        }).option('platform-minMemo-noBrowser', {
            description: 'This will run the full platform app without the browser and the minimum memory footprint\nonly one of --platform, --platform-noBrowser, --platform-minMemo or --platform-minMemo-noBrowser can be specified',
            boolean: true,
            default: false
        }).option('network', {
            boolean: true,
            default: false
        }).option('dashboards', {
            description: 'This will run the full dashboards app\nonly one of --dashboards or --dashboards-minMemo can be specified',
            boolean: true,
            default: false
        }).option('dashboards-minMemo', {
            description: 'This will run the full dashboards app with the minimum memory footprint\nonly one of --dashboards or --dashboards-minMemo can be specified',
            boolean: true,
            default: false
        })
    }

    function runner(args) {
        const arguments = []
        let errors = []
        if([args.platform, args['platform-noBrowser'], args['platform-minMemo'], args['platform-minMemo-noBrowser']].filter(x => x).length > 1) {
            errors.push('Only one of --platform, --platform-noBrowser, --platform-minMemo or --platform-minMemo-noBrowser can be specified')
        }
        if([args.dashboards, args['dashboards-minMemo']].filter(x => x).length > 1) {
            errors.push('Only one of --dashboards or --dashboards-minMemo can be specified')
        }
        if(errors.length > 0) {
            conosle.log(errors.join('\n'))
            return
        }

        if(args.platform) { arguments.push('platform') } 
        else if(args['platform-noBrowser']) { arguments.push('platform noBrowser') }
        else if (args['platform-minMemo']){ arguments.push('platform minMemo') }
        else if(args['platform-minMemo-noBrowser']) { arguments.push('platform minMemo noBrowser') }

        if(args.network) { arguments.push('network')}

        if(args.dashboards) { arguments.push('dashboards') }
        else if(args['dashboards-minMemo']) { arguments.push('dashboards minMemo') }

        console.log('[INFO] Multi app starting with the following options: ', JSON.stringify(arguments))
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