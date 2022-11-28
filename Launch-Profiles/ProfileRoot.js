const os = require('os')
const yargs = require('yargs/yargs')
const {hideBin} = require('yargs/helpers')
const Table = require('cli-table3');
const fs = require('fs');
const log = console.log

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
 * @returns {string}
 */
function getProfileDocumentPath() {
    let dir = os.homedir()
    if(!dir.endsWith('/')) {
        dir += '/'
    }
    return dir + '.superalgos/profiles'
}

/**
 * 
 * @param {string} documentPath
 * @returns {Profile[]}
 */
function getProfileDocument(documentPath) {
    if(!fs.existsSync(documentPath)) {
        let parts = documentPath.split('/')
        const dir = parts.splice(0, parts.length - 1).join('/')
        fs.mkdirSync(dir)
        storeProfiles(documentPath, [])
    }
    return JSON.parse(fs.readFileSync(documentPath, {encoding: 'utf8'}))
}

/**
 * @param {string} documentPath
 * @param {Profile[]} profiles 
 */
function storeProfiles(documentPath, profiles) {
    fs.writeFileSync(documentPath, JSON.stringify(profiles), {encoding: 'utf8'})
}

/**
 * @param {string} profileName
 * @returns {Profile}
 */
exports.getProfile = function getProfile(profileName) {
    const documentPath = getProfileDocumentPath()
    const existingProfiles = getProfileDocument(documentPath)
    return existingProfiles.find(p => p.name === profileName)
}

exports.runProfiles = function runProfiles() {
    const defaultPorts = [
        18041,
        18042,
        18043,
        16041,
        34248,
        33248,
        31248
    ]

    yargs(hideBin(process.argv))
        .command('create', 'Create a new profile', addCreateOptions, createProfile)
        .command('update', 'Update a profile', addUpdateOptions, updateProfile)
        .command('describe', 'Describe a profile', addDescribeOptions, describeProfile)
        .command('list', 'List the available profiles', addListOptions, listProfiles)
        .command('delete', 'Delete a profile', addDeleteOptions, deleteProfile)
        .parse()

    /**
     * Creates a new profile if it does not exist, if the name is in use then 
     * an error is output to the console.
     * 
     * @param {Profile} args 
     */
    function createProfile(args) {
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

    /**
     * Checks if the profile exists and either updates it or returns a 
     * outputs a list of potential matches.
     * 
     * @param {Profile} args
     */
    function updateProfile(args) {
        const documentPath = getProfileDocumentPath()
        const existingProfiles = getProfileDocument(documentPath)
        const matchIndex = existingProfiles.findIndex(p => p.name === args.name)
        if(matchIndex == -1) {
            log('The profile ' + args.name + 'does not exist')
            log('If you want to create it please use the `create` command.')
            log('If you want to view the available profiles use the `list` command')
            return
        }

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

    /**
     * Deletes the given profile if it exists.
     * 
     * @param {{
     *   name: string
     * }} args 
     */
    function deleteProfile(args) {
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

    /**
     * Lists all the available profile names, with the options of limiting 
     * the results using any of the following: name 'prefix', total 'limit' per 
     * search, 'offset' to skip the amount from a previous limit search. All 
     * results are output to the console.
     * 
     * @param {{
     *   prefix: string,
     *   limit: number,
     *   offset: number,
     * }} args 
     */
    function listProfiles(args) {
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

    /**
     * Describes the given profile if it exists.
     * 
     * @param {{
     *   name: string
     * }} args 
     */
    function describeProfile(args) {
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
            colWidths: [50, 100]
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
        log(table.toString())

        /**
         * @param {string|number?} value 
         */
        function logValueOrEmptyString(value) {
            return value !== undefined ? value : ''
        }
    }

    /**
     * Adds all the options to the create command
     * 
     * @param {*} cmd 
     */
    function addCreateOptions(cmd) {
        addCustomEnvOptions(addNameOption(cmd, 'A name for the profile'))
    }

    /**
     * Adds all the options to the list commad
     * 
     * @param {*} cmd 
     */
    function addListOptions(cmd) {
        cmd.option('prefix', {
            description: 'A prefix to limit the profile list results'
        }).option('limit', {
            description: 'A limit on the number of items returned'
        }).option('offset', {
            description: 'An offset of items to skip before returning the list results'
        })
    }

    /**
     * Adds all the options to the delete commad
     * 
     * @param {*} cmd 
     */
    function addDeleteOptions(cmd) {
        addNameOption(cmd, 'The profile name you want to delete')
    }

    /**
     * Adds all the options to the update commad
     * 
     * @param {*} cmd 
     */
    function addUpdateOptions(cmd) {
        addCustomEnvOptions(addNameOption(cmd, 'The profile name you want to update'))
    }

    /**
     * Adds all the options to the describe command
     * 
     * @param {*} cmd 
     */
    function addDescribeOptions(cmd) {
        addNameOption(cmd, 'The profile name you want to describe')
    }

    /**
     * Adds the name option to the argv builder
     * 
     * @param {*} cmd 
     * @param {string} description
     * @returns {*}
     */
    function addNameOption(cmd, description) {
        return cmd.option('name', {
            description,
            demandOption: true,
            string: true
        })
    }

    /**
     * Adds all the custom variables to the argv builder
     * 
     * @param {*} cmd 
     * @returns {*} 
     */
    function addCustomEnvOptions(cmd) {
        return cmd.option('host-platform', {
            alias: 'hostPlatform',
            description: 'The host address for the platform client',
            string: true
        }).option('host-desktop', {
            alias: 'hostDesktop',
            description: 'The host address for the desktop client',
            string: true
        }).option('port-wss-platform', {
            alias: 'portWssPlatform',
            description: 'An available port for the Platform websocket server to listen on',
            number: true
        }).option('port-wss-network', {
            alias: 'portWssNetwork',
            description: 'An available port for the Network websocket server to listen on',
            number: true
        }).option('port-wss-dashboard', {
            alias: 'portWssDashboard',
            description: 'An available port for the Dashboard websocket server to listen on',
            number: true
        }).option('port-wss-desktop', {
            alias: 'portWssDesktop',
            description: 'An available port for the Desktop websocket server to listen on',
            number: true
        }).option('port-http-platform', {
            alias: 'portHttpPlatform',
            description: 'An available port for the Platform HTTP server to listen on',
            number: true
        }).option('port-http-desktop', {
            alias: 'portHttpDesktop',
            description: 'An available port for the Desktop HTTP server to listen on',
            number: true
        }).option('port-http-network', {
            alias: 'portHttpNetwork',
            description: 'An available port for the Network HTTP server to listen on',
            number: true
        }).option('store-data', {
            alias: 'storeData',
            description: 'A different location for data storage',
            string: true
        }).option('store-logs', {
            alias: 'storeLogs',
            description: 'A different location for log file storage',
            string: true
        }).option('store-workspaces', {
            alias: 'storeWorkspaces',
            description: 'A different location for Workspace storage',
            string: true
        })
    }

    /**
     * Checks available ports agains all profiles and default values
     * 
     * @param {Profile} profile 
     * @param {Profile[]} existingProfiles 
     * @returns {boolean}
     */
    function validateAvailablePorts(profile, existingProfiles) {
        const keys = Object.keys(profile)
        const existingPorts = existingProfiles.reduce((all, p) => all.concat(getPortsFromProfile(p)), []).concat(defaultPorts)
        const portKeys = keys.filter(k => /^port.*/.test(k))
        let match = false
        for(let i = 0; i < portKeys.length; i++) {
            if(existingPorts.indexOf(profile[portKeys[i]]) > -1) {
                match = true
                log(profile[portKeys[i]] + ' is already in use')
            }
        }
        return !match

        /**
         * 
         * @param {Profile} profile 
         * @returns {number[]}
         */
        function getPortsFromProfile(profile) {
            const keys = Object.keys(profile)
            const portKeys = keys.filter(k => /^port.*/.test(k))
            return portKeys.map(k => profile[k]).filter(v => v !== undefined)
        }
    }
}