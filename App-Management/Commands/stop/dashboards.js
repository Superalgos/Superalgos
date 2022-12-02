const pm2m = require('../../Pm2Management/manager').pm2Manager()
const chalk = require('chalk')

exports.dashboardsCommand = function dashboardsCommand() {
    const thisObject = {
        name: 'dashboards',
        description: chalk.bold('Stops and deletes the dashboards app'),
        options: options,
        runner: runner
    }
    return thisObject

    function options(cmd) {
        return cmd.option('profile', {
            description: 'A custom profile used by the process being stopped',
            string: true
        })
    }

    function runner(args) {
        const name = args.profile !== undefined ? 'sa-' + args.profile + '-dashboards' : 'sa-default-dashboards'

        console.log('[INFO] Dashboards app stoping')

        pm2m.connect()
            .then(() => pm2m.stop(name))
            .then(() => pm2m.kill(name))
            .then(() => pm2m.disconnect())
    }
}