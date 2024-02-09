const path = require("path")

let basePath
if (process.env.PACKAGED_PATH) {
    basePath = process.env.PACKAGED_PATH
} else {
    basePath = __dirname
}

const projectPluginMap = require(path.join(basePath, './Plugins/project-plugin-map.json'))

exports.newEnvironment = function () {

    let thisObject = {
        DEMO_MODE: false,
        DEMO_MODE_HOST: "super-super-uzzdd68dwm9w-22a320db4ede63aa.elb.us-east-2.amazonaws.com",
        BASE_PATH: basePath,
        WEB_SERVER_URL: 'localhost',
        PLATFORM_WEB_SOCKETS_INTERFACE_PORT: 18041,
        NETWORK_WEB_SOCKETS_INTERFACE_PORT: 18042,
        DASHBOARDS_WEB_SOCKETS_INTERFACE_PORT: 18043,
        SOCIALTRADING_WEB_SOCKETS_INTERFACE_PORT: 16041,
        SOCIALTRADING_WEB_SOCKETS_INTERFACE_HOST: 'localhost',
        PLATFORM_HTTP_INTERFACE_PORT: 34248,
        SOCIALTRADING_HTTP_INTERFACE_PORT: 33248,
        NETWORK_HTTP_INTERFACE_PORT: 31248,
        PATH_TO_DATA_STORAGE: path.join(basePath, './Platform/My-Data-Storage'),
        PATH_TO_PROJECTS: path.join(basePath, './Projects'),
        PATH_TO_PLUGINS: path.join(basePath, './Plugins'),
        PROJECT_PLUGIN_MAP: projectPluginMap,
        PATH_TO_LOG_FILES: path.join(basePath, './Platform/My-Log-Files'),
        PATH_TO_PROJECTS_REQUIRED: path.join(basePath, './Projects'),
        PATH_TO_PROJECT_SCHEMA: path.join(basePath, './Projects/ProjectsSchema.json'),
        PATH_TO_PLATFORM: path.join(basePath, './Platform'),
        PATH_TO_SOCIALTRADING: './Social-Trading',
        PATH_TO_DEFAULT_WORKSPACE: path.join(basePath, './Plugins/Foundations/Workspaces'),
        PATH_TO_MY_WORKSPACES: path.join(basePath, './Platform/My-Workspaces'),
        PATH_TO_SECRETS: path.join(basePath, './My-Secrets'),
        PATH_TO_FONTS: path.join(basePath, './Platform/WebServer/Fonts'),
        PATH_TO_BITCOIN_FACTORY: path.join(basePath, './Bitcoin-Factory'),
        SOCIALTRADING_APP_UI_TYPE: 'vueDev',
        SOCIALTRADING_APP_SIGNING_ACCOUNT: 'Social-Trading-Desktop-App-1',
        SOCIALTRADING_APP_MAX_OUTGOING_PEERS: 5,
        SOCIALTRADING_APP_MAX_OUTGOING_START_PEERS: 1,
        SOCIALTRADING_TARGET_NETWORK_TYPE: 'P2P Network',
        SOCIALTRADING_TARGET_NETWORK_CODENAME: 'Testnet',
        SOCIALTRADING_DEFAULT_SOCIAL_PERSONA: 'Social-Persona-1',
        SOCIALTRADING_DEFAULT_SOCIAL_TRADING_BOT: 'Social-Trading-Bot-2',
        TASK_SERVER_APP_MAX_OUTGOING_PEERS: 1,
        TASK_SERVER_APP_MAX_OUTGOING_START_PEERS: 1,
        MOBILE_APP_SIGNING_ACCOUNT: 'Social-Trading-Mobile-App-1',
        SERVER_APP_SIGNING_ACCOUNT: 'Social-Trading-Server-App-1',
        PLATFORM_APP_SIGNING_ACCOUNT: 'Algo-Traders-Platform-1',
        P2P_NETWORK_NODE_SIGNING_ACCOUNT: 'P2P-Network-Node-1',
        P2P_NETWORK_NODE_MAX_INCOMING_CLIENTS: 1000,
        P2P_NETWORK_NODE_MAX_INCOMING_PEERS: 2,
        P2P_NETWORK_NODE_MAX_OUTGOING_PEERS: 2,
        NPM_NEEDED_VERSION: '5.0.0',
        NODE_NEEDED_VERSION: '16.0.0',
        GIT_NEEDED_VERSION: '2.0.0',
        EXTERNAL_SCRIPTS: [
            'https://code.jquery.com/jquery-3.6.0.js',
            'https://code.jquery.com/ui/1.13.0/jquery-ui.js'
        ],
        DATABASE: {
            TYPE: 'file',
            USERS_TABLE: path.join(basePath, './Platform/My-Data-Storage/Network/userProfileBalances.json')
        },
    }

    setProfileOverrideValues()

    if (process.env.DATA_PATH) {
        thisObject.PATH_TO_DATA_STORAGE = path.join(process.env.DATA_PATH, '/Superalgos_Data/My-Data-Storage')
        thisObject.PATH_TO_LOG_FILES = path.join(process.env.DATA_PATH, '/Superalgos_Data/My-Log-Files')
        thisObject.PATH_TO_MY_WORKSPACES = path.join(process.env.DATA_PATH, '/Superalgos_Data/My-Workspaces')
    }

    setLogLevelIfAvailable()

    // Validating all variables have values
    for (const envVariable in thisObject) {
        if (thisObject[envVariable] === undefined) {
            throw new Error(`Environment variable ${envVariable} is not defined`)
        }
    }
    
    return thisObject

    function setProfileOverrideValues() {
        if(process.env.PROFILE_NAME === undefined) { return }
        const { getProfile } = require('./Profile-Scripts/index')
        const profile = getProfile(process.env.PROFILE_NAME)
        if(profile === undefined) {
            console.log('The given profile name does not exist, using default values')
            return
        }

        if(profile.hostPlatform !== undefined) { thisObject.WEB_SERVER_URL = profile.hostPlatform }
        if(profile.portWssPlatform !== undefined) { thisObject.PLATFORM_WEB_SOCKETS_INTERFACE_PORT = profile.portWssPlatform }
        if(profile.portWssNetwork !== undefined) { thisObject.NETWORK_WEB_SOCKETS_INTERFACE_PORT = profile.portWssNetwork }
        if(profile.portWssDashboard !== undefined) { thisObject.DASHBOARDS_WEB_SOCKETS_INTERFACE_PORT = profile.portWssDashboard }
        if(profile.portWssDesktop !== undefined) { thisObject.SOCIALTRADING_WEB_SOCKETS_INTERFACE_PORT = profile.portWssDesktop }
        if(profile.hostDesktop !== undefined) { thisObject.SOCIALTRADING_WEB_SOCKETS_INTERFACE_HOST = profile.hostDesktop }
        if(profile.portHttpPlatform !== undefined) { thisObject.PLATFORM_HTTP_INTERFACE_PORT = profile.portHttpPlatform }
        if(profile.portHttpDesktop !== undefined) { thisObject.SOCIALTRADING_HTTP_INTERFACE_PORT = profile.portHttpDesktop }
        if(profile.portHttpNetwork !== undefined) { thisObject.NETWORK_HTTP_INTERFACE_PORT = profile.portHttpNetwork }
        if(profile.storeData !== undefined) { thisObject.PATH_TO_DATA_STORAGE = profile.storeData }
        if(profile.storeLogs !== undefined) { thisObject.PATH_TO_LOG_FILES = profile.storeLogs }
        if(profile.storeWorkspaces !== undefined) { thisObject.PATH_TO_MY_WORKSPACES = profile.storeWorkspaces }
        if(profile.logLevel !== undefined) { thisObject.LOG_LEVEL = profile.logLevel }
        if(profile.p2pNetworkNodeSigningAccount !== undefined) { thisObject.P2P_NETWORK_NODE_SIGNING_ACCOUNT = profile.p2pNetworkNodeSigningAccount }
        if(profile.database !== undefined) {
            if(profile.database.type !== undefined) { 
                thisObject.DATABASE.TYPE = profile.database.type 
                if(profile.database.type == 'database') {
                    thisObject.DATABASE.database = profile.database.database
                    thisObject.DATABASE.host = profile.database.host
                    thisObject.DATABASE.password = profile.database.password
                    thisObject.DATABASE.port = profile.database.port
                    thisObject.DATABASE.user = profile.database.user
                }
            }
            if(profile.database.users_table !== undefined) { thisObject.DATABASE.USERS_TABLE = profile.database.users_table }
        }
    }

    function setLogLevelIfAvailable() {
        if(process.env.LOG_LEVEL){
            thisObject.LOG_LEVEL = process.env.LOG_LEVEL
        }

        const allArgs = process.argv.join(' ')
        if(allArgs.indexOf('logLevel') > -1) {
            const regexMatch = /(-?-?logLevel\s?=?\s?[A-Za-z]{4,5}\b)/g
            const allMatches = [...allArgs.matchAll(regexMatch)].reduce((a, m) => { 
                a.push(m[1]) 
                return a 
            }, [])
            if(allMatches.length == 0) {
                console.log('The logLevel argument has not been supplied correctly it must match one of the following patterns with <VALUE> as any one of [error, warn, info, debug]')
                console.log('\tlogLevel=<VALUE>')
                console.log('\t-logLevel=<VALUE>')
                console.log('\t--logLevel=<VALUE>')
                console.log('\tlogLevel = <VALUE>')
                console.log('\t-logLevel = <VALUE>')
                console.log('\t--logLevel = <VALUE>')
                console.log('\tlogLevel <VALUE>')
                console.log('\t-logLevel <VALUE>')
                console.log('\t--logLevel <VALUE>')
                console.log('')
                return
            }
            const first = allMatches[0]
            const level = first.indexOf('=') > -1 ? first.split('=')[1].trim() : first.split(' ')[1].trim()
            thisObject.LOG_LEVEL = level.toLowerCase()
        }
    }
}
