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
            description: 'This will run the full platform app with browser',
            boolean: true,
            default: false
        }).option('network', {
            boolean: true,
            default: false
        }).option('dashboards', {
            description: 'This will run the full dashboards app',
            boolean: true,
            default: false
        }).option('noBrowser', {
            description: 'This will apply the noBrowser attribute to all the services that list it as an option',
            boolean: true,
            default: false
        }).option('minMemo', {
            description: 'This will apply the minMemo - minimum memory footprint - attribute to all the services that list it as an option',
            boolean: true,
            default: false
        })
    }

    function runner(args) {
        if(!args.plaform && !args.network && args.dashboards) {
            conosle.log('At least one of --platform, --dashboards or --network must be supplied')
            return
        }

        if(args.platform) { 
            require('./platform').platformCommand().runner({
                minMemo: args.minMemo,
                noBrowser: args.noBrowser
            })
        }

        if(args.network) {
            require('./network').networkCommand().runner({})
        }

        if(args.dashboards) { 
            require('./dashboards').dashboardsCommand().runner({
                minMemo: args.minMemo
            })
        }

        console.log('[INFO] Multi apps started')
    }
}