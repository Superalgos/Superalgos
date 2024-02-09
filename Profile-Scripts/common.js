const os = require('os')
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

exports.commonProfileFunctions = function commonProfileFunctions() {
    const thisObject = {
        addCustomEnvOptions: addCustomEnvOptions,
        addNameOption: addNameOption,
        getProfileDocumentPath: getProfileDocumentPath,
        getProfileDocument: getProfileDocument,
        storeProfiles: storeProfiles,
        validateAvailablePorts: validateAvailablePorts
    }

    const defaultPorts = [
        18041,
        18042,
        18043,
        16041,
        34248,
        33248,
        31248
    ]

    return thisObject

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
        return cmd.option('hostPlatform', {
            description: 'The host address for the platform client',
            string: true
        }).option('hostDesktop', {
            description: 'The host address for the desktop client',
            string: true
        }).option('portWssPlatform', {
            description: 'An available port for the Platform websocket server to listen on',
            number: true
        }).option('portWssNetwork', {
            description: 'An available port for the Network websocket server to listen on',
            number: true
        }).option('portWssDashboard', {
            description: 'An available port for the Dashboard websocket server to listen on',
            number: true
        }).option('portWssDesktop', {
            description: 'An available port for the Desktop websocket server to listen on',
            number: true
        }).option('portHttpPlatform', {
            description: 'An available port for the Platform HTTP server to listen on',
            number: true
        }).option('portHttpDesktop', {
            description: 'An available port for the Desktop HTTP server to listen on',
            number: true
        }).option('portHttpNetwork', {
            description: 'An available port for the Network HTTP server to listen on',
            number: true
        }).option('storeData', {
            description: 'A different location for data storage',
            string: true
        }).option('storeLogs', {
            description: 'A different location for log file storage',
            string: true
        }).option('storeWorkspaces', {
            description: 'A different location for Workspace storage',
            string: true
        }).option('p2pNetworkNodeSigningAccount', {
            description: 'A network node signing account to use',
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
