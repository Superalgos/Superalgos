const log = console.log
const Table = require('cli-table3')
const chalk = require('chalk')
const {
    addNameOption, 
    getProfileDocument, 
    getProfileDocumentPath,
} = require('../common').commonProfileFunctions()

exports.describeCommand = function describeCommand() {
    const thisObject = {
        name: 'describe',
        description: chalk.bold('Create a new profile'),
        options: options,
        runner: runner
    }
    return thisObject

    function options(cmd) {
        return addNameOption(cmd, 'The profile name you want to describe')
    }

    function runner(args) {
        const documentPath = getProfileDocumentPath()
        const existingProfiles = getProfileDocument(documentPath)
        const match = existingProfiles.find(p => p.name === args.name)
        if(match === undefined) {
            log('Profile ' + args.name + ' not found')
            log('If you want to view a list of available profiles use the `list` command.')
            return
        }
        log('Profile details')
        const table = new Table({
            head: ['Attribute', 'Value'],
            colWidths: [30, 60]
        })
        table.push(['Name', match.name])
        table.push(['Platform host address', logValueOrEmptyString(match.hostPlatform)])
        table.push(['Platform HTTP port', logValueOrEmptyString(match.portHttpPlatform)])
        table.push(['Platform WebSocket port', logValueOrEmptyString(match.portWssPlatform)])
        table.push(['Desktop host address', logValueOrEmptyString(match.hostDesktop)])
        table.push(['Desktop HTTP port', logValueOrEmptyString(match.portHttpDesktop)])
        table.push(['Desktop WebSocket port', logValueOrEmptyString(match.portWssDesktop)])
        table.push(['Network HTTP port', logValueOrEmptyString(match.portHttpNetwork)])
        table.push(['Network WebSocket port', logValueOrEmptyString(match.portWssNetwork)])
        table.push(['Dashboard WebSocket port', logValueOrEmptyString(match.portWssDashboard)])
        table.push(['Log file storage', logValueOrEmptyString(match.storeLogs)])
        table.push(['Data file storage', logValueOrEmptyString(match.storeData)])
        table.push(['Workspaces file storage', logValueOrEmptyString(match.storeWorkspaces)])
        table.push(['P2P network node signing account', logValueOrEmptyString(match.p2pNetworkNodeSigningAccount)])
        log(table.toString())

        /**
         * @param {string|number?} value 
         */
        function logValueOrEmptyString(value) {
            return value !== undefined ? value : ''
        }
    }
}