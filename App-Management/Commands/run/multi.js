const chalk = require('chalk')

exports.multiCommand = function multiCommand() {
    const thisObject = {
        name: 'multi',
        description: chalk.bold('Runs multiple apps'),
        options: options,
        runner: runner
    }
    return thisObject

    function options(cmd) {
        return cmd.option('platform', {
            description: 'This will run the platform app',
            boolean: true,
            default: false
        }).option('network', {
            description: 'This will run the network app',
            boolean: true,
            default: false
        }).option('dashboards', {
            description: 'This will run the dashboards app',
            boolean: true,
            default: false
        }).option('socialTrading', {
            description: 'This will run the social trading app',
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
        }).option('profile', {
            description: 'A custom profile to apply to the processes being started',
            string: true
        })
    }

    function runner(args) {
        if(!(args.plaform || args.network || args.dashboards || args.socialTrading)) {
            conosle.log(`At least one of ${chalk.italic('--platform')}, ${chalk.italic('--network')}, ${chalk.italic('--dashboards')} or ${chalk.italic('--socialTrading')} must be supplied`)
            return
        }

        if(args.platform) { 
            require('./platform').platformCommand().runner({
                minMemo: args.minMemo,
                noBrowser: args.noBrowser,
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
                minMemo: args.minMemo,
                profile: args.profile
            })
        }

        if(args.socialTrading) { 
            require('./social-trading').socialTradingCommand().runner({
                profile: args.profile
            })
        }

        console.log('[INFO] Multi apps started')
    }
}