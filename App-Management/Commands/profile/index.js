const chalk = require('chalk')
const { stdBoxedMessage } = global.SAM

/** 
 * @typedef {{
 *   name: string,
 *   hostPlatform: string,
 *   hostDesktop: string,
 *   portWssPlatform: number,
 *   portWssDesktop: number,
 *   portWssNetwork: number,
 *   portWssDashboard: number,
 *   portHttpPlatform: number,
 *   portHttpNetwork: number,
 *   portHttpDesktop: number,
 *   storeData: string,
 *   storeLogs: string,
 *   storeWorkspaces: string,
 * }} Profile
 */

/**
 * @param {string} profileName
 * @returns {Profile}
 */
 exports.getProfile = function getProfile(profileName) {
    const documentPath = getProfileDocumentPath()
    const existingProfiles = getProfileDocument(documentPath)
    return existingProfiles.find(p => p.name === profileName)
}

exports.profileCommands = function profileCommands() {
    const thisObject = {
        name: 'profile',
        description: chalk.bold('Use this command to manage your Superalgos profiles'),
        options: options,
        runner: runner
    }

    const message = `
USAGE:
    ${chalk.red('superalgos profile')} ${chalk.italic.red('[command] [options]')}
        
COMMANDS:
    - ${chalk.red('create')}
      - OPTIONS:
        ${chalk.italic.red('--hostPlatform')}
        ${chalk.italic.red('--hostDesktop')}
        ${chalk.italic.red('--portWssPlatform')}
        ${chalk.italic.red('--portWssDesktop')}
        ${chalk.italic.red('--portWssDashboard')}
        ${chalk.italic.red('--portWssNetwork')}
        ${chalk.italic.red('--portHttpPlatform')}
        ${chalk.italic.red('--portHttpDesktop')}
        ${chalk.italic.red('--portHttpNetwork')}
        ${chalk.italic.red('--storeData')}
        ${chalk.italic.red('--storeLogs')}
        ${chalk.italic.red('--storeWorkspaces')}
    - ${chalk.red('delete')}
      - OPTIONS:
        ${chalk.italic.red('--name')}
    - ${chalk.red('describe')}
      - OPTIONS:
        ${chalk.italic.red('--name')}
    - ${chalk.red('list')}
      - OPTIONS:
        ${chalk.italic.red('--prefix')}
        ${chalk.italic.red('--limit')}
        ${chalk.italic.red('--offset')}
    - ${chalk.red('update')}
      - OPTIONS:
        ${chalk.italic.red('--name')}
        ${chalk.italic.red('--hostPlatform')}
        ${chalk.italic.red('--hostDesktop')}
        ${chalk.italic.red('--portWssPlatform')}
        ${chalk.italic.red('--portWssDesktop')}
        ${chalk.italic.red('--portWssDashboard')}
        ${chalk.italic.red('--portWssNetwork')}
        ${chalk.italic.red('--portHttpPlatform')}
        ${chalk.italic.red('--portHttpDesktop')}
        ${chalk.italic.red('--portHttpNetwork')}
        ${chalk.italic.red('--storeData')}
        ${chalk.italic.red('--storeLogs')}
        ${chalk.italic.red('--storeWorkspaces')}
`

    return thisObject
    
    function options(cmd) {
        const commands = [
            require('./create/create').createCommand(),
            require('./delete/delete').deleteCommand(),
            require('./describe/describe').describeCommand(),
            require('./list/list').listCommand(),
            require('./update/update').updateCommand()
        ]
        return commands.reduce((builder, c) => 
            builder.command(c.name, c.description, c.options, c.runner).help(),
            cmd)
    }

    function runner() {
        console.log(stdBoxedMessage(message))
    }
}