const chalk = require('chalk')

exports.multiCommand = function multiCommand() {
    const thisObject = {
        name: 'multi',
        description: chalk.bold('Stops multiple apps'),
        options: options,
        runner: runner
    }
    return thisObject

    function options(cmd) {
        return cmd.option('platform', {
            description: 'This will stop the platform app',
            boolean: true,
            default: false
        }).option('network', {
            boolean: true,
            default: false
        }).option('dashboards', {
            description: 'This will stop the dashboards app',
            boolean: true,
            default: false
        }).option('socialTrading', {
            description: 'This will stop the social trading app',
            boolean: true,
            default: false
        }).option('profile', {
            description: 'A custom profile used by the process being stopped',
            string: true
        })
    }

    function runner(args) {
        if(!(args.platform || args.network || args.dashboards || args.socialTrading)) {
            conosle.log(`At least one of ${chalk.italic('--platform')}, ${chalk.italic('--network')}, ${chalk.italic('--dashboards')} or ${chalk.italic('--socialTrading')} must be supplied`)
            return
        }

        if(args.platform) { 
            require('./platform').platformCommand().runner({
                profile: args.profile
            })
        }

        if(args.network) {
            require('./network').networkCommand().runner({
                profile: args.profile
            })
        }

        if(args.dashboards) { 
            require('./dashboards').dashboardsCommand().runner({
                profile: args.profile
            })
        }

        console.log('[INFO] Multi apps stopping')
    }
}