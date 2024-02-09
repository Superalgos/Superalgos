const log = console.log
const chalk = require('chalk')
const {
    addNameOption, 
    addCustomEnvOptions, 
    getProfileDocument, 
    getProfileDocumentPath,
    storeProfiles,
    validateAvailablePorts
} = require('../common').commonProfileFunctions()

exports.createCommand = function createCommand() {
    const thisObject = {
        name: 'create',
        description: chalk.bold('Create a new profile'),
        options: options,
        runner: runner
    }
    return thisObject

    function options(cmd) {
        return addCustomEnvOptions(addNameOption(cmd, 'A name for the profile'))
    }

    function runner(args) {
        const documentPath = getProfileDocumentPath()
        const existingProfiles = getProfileDocument(documentPath)
        const match = existingProfiles.find(p => p.name === args.name)
        if(match === undefined) {
            const profile = {
                name: args.name,
                hostPlatform: args.hostPlatform,
                hostDesktop: args.hostDesktop,
                portWssPlatform: args.portWssPlatform,
                portWssDesktop: args.portWssDesktop,
                portWssNetwork: args.portWssNetwork,
                portWssDashboard: args.portWssDashboard,
                portHttpPlatform: args.portHttpPlatform,
                portHttpNetwork: args.portHttpNetwork,
                portHttpDesktop: args.portHttpDesktop,
                storeData: args.storeData,
                storeLogs: args.storeLogs,
                storeWorkspaces: args.storeWorkspaces,
                p2pNetworkNodeSigningAccount: args.p2pNetworkNodeSigningAccount,
            }

            if(!validateAvailablePorts(profile, existingProfiles)) {return }

            existingProfiles.push(profile)
            storeProfiles(documentPath, existingProfiles)
            log('\nNew profile added!\n')
            return
        }
        log('The profile ' + args.name + 'aready exists')
        log('If you want to view it please use the `describe` command.')
        log('If you want to update it please use the `update` command')
    }
}