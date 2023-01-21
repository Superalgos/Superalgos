const log = console.log
const chalk = require('chalk')
const {
    getProfileDocument, 
    getProfileDocumentPath,
} = require('../common').commonProfileFunctions()

exports.listCommand = function listCommand() {
    const thisObject = {
        name: 'list',
        description: chalk.bold('Create a new profile'),
        options: options,
        runner: runner
    }
    return thisObject

    function options(cmd) {
        return cmd.option('prefix', {
            description: 'A prefix to limit the profile list results'
        }).option('limit', {
            description: 'A limit on the number of items returned'
        }).option('offset', {
            description: 'An offset of items to skip before returning the list results'
        })
    }

    function runner(args) {
        const documentPath = getProfileDocumentPath()
        let existingProfiles = getProfileDocument(documentPath).map(p => p.name)
        if(args.prefix !== undefined) {
            existingProfiles = existingProfiles.filter(p => p.indexOf(args.prefix) === 0)
        }
        if(args.offset !== undefined && args.offset > 0) {
            existingProfiles = existingProfiles.slice(args.offset)
        }
        if(args.limit !== undefined && args.limit > 0) {
            existingProfiles = existingProfiles.splice(0, args.limit)
        }
        if(existingProfiles.length > 0) {
            log('Available profiles:')
            existingProfiles.forEach(p => log('\t' + p))
            return
        }
        if(args.prefix !== undefined || args.limit !== undefined || args.offset !== undefined) {
            log('No profiles are available matching your filter criteria')
            return
        }
        log('No profiles are available')
    }
}