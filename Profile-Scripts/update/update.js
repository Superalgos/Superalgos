const log = console.log
const chalk = require('chalk')
const {
    addNameOption, 
    addCustomEnvOptions, 
    getProfileDocument, 
    getProfileDocumentPath,
    storeProfiles,
} = require('../common').commonProfileFunctions()

exports.updateCommand = function updateCommand() {
    const thisObject = {
        name: 'update',
        description: chalk.bold('Update a profile'),
        options: options,
        runner: runner
    }
    return thisObject

    function options(cmd) {
        return addCustomEnvOptions(addNameOption(cmd, 'The profile name you want to update'))
    }

    function runner(args) {
        const documentPath = getProfileDocumentPath()
        const existingProfiles = getProfileDocument(documentPath)
        const matchIndex = existingProfiles.findIndex(p => p.name === args.name)
        if(matchIndex == -1) {
            log('The profile ' + args.name + 'does not exist')
            log('If you want to create it please use the `create` command.')
            log('If you want to view the available profiles use the `list` command')
            return
        }

        // TODO: validate if new ports being used

        const match = existingProfiles[i]
        updateAttributeIfValid('hostPlatform')
        updateAttributeIfValid('hostDesktop')
        updateAttributeIfValid('portWssPlatform')
        updateAttributeIfValid('portWssDesktop')
        updateAttributeIfValid('portWssNetwork')
        updateAttributeIfValid('portWssDashboard')
        updateAttributeIfValid('ortHttpPlatform')
        updateAttributeIfValid('portHttpNetwork')
        updateAttributeIfValid('portHttpDesktop')
        updateAttributeIfValid('storeData')
        updateAttributeIfValid('storeLogs')
        updateAttributeIfValid('storeWorkspaces')
        updateAttributeIfValid('p2pNetworkNodeSigningAccount')
        existingProfiles.splice(matchIndex, 1, match)
        existingProfiles.push(match)
        storeProfiles(documentPath, existingProfiles)
        log('\Profile updated!\n')

        function updateAttributeIfValid(attribute) {
            if(args[attribute] !== undefined) {
                match[attribute] = args[attribute]
            }
        }
    }
}