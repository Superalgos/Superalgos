const log = console.log
const chalk = require('chalk')
const {
    addNameOption,
    getProfileDocument, 
    getProfileDocumentPath,
    storeProfiles,
} = require('../common').commonProfileFunctions()

exports.deleteCommand = function deleteCommand() {
    const thisObject = {
        name: 'delete',
        description: chalk.bold('Delete a profile'),
        options: options,
        runner: runner
    }
    return thisObject

    function options(cmd) {
        return addNameOption(cmd, 'The profile name you want to delete')
    }

    function runner(args) {
        const documentPath = getProfileDocumentPath()
        const existingProfiles = getProfileDocument(documentPath)
        const matchIndex = existingProfiles.findIndex(p => p.name === args.name)
        if(matchIndex > -1) {
            existingProfiles.splice(matchIndex, 1)
            storeProfiles(documentPath, existingProfiles)
            log('Profile ' + args.name + ' successfully deleted')
            return
        }
        log('Profile ' + args.name + ' not found')
        log('If you want to view a list of available profiles use the `list` command.')
    }
}