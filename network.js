/*
This module represents the Nodejs command that users use to start the Network Node.
*/

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const chalk = require('chalk')

const helpMessage = `
USAGE:
${chalk.red('node network')} ${chalk.italic.red('[options]')}
        
OPTIONS:
${chalk.italic.red('--network-signing-account')} ${chalk.bold.red('text')}
A specific P2P network signing account to start using. This overrides the default "P2P-Network-Node-1"

${chalk.italic.red('--include-local-networks')} ${chalk.bold.red('true/false')}
Do you want to include all local networks nodes?

${chalk.italic.red('--exclude-localhost')} ${chalk.bold.red('true/false')}
Do you want to exclude all localhost and 127.#.#.# nodes?

${chalk.italic.red('--only-me')} ${chalk.bold.red('true/false')}
Do you want to limit the network to only your network nodes?

${chalk.italic.red('--users')} ${chalk.bold.red('text')}
Repeat for each username you want to connect to

EXAMPLES:

############################################################
# To specify a network node on your profile called
# ${chalk.italic.red('Local-Network-Node')}
############################################################
node network --network-signing-account Local-Network-Node

############################################################
# To limit the network connections to only my network nodes, 
# in order for this to work you will need at least 2 network 
# nodes setup
############################################################
node network --onlyMe

############################################################
# To exclude all local networks from the connection pool set
# the ${chalk.italic.red('--include-local-networks')} to ${chalk.bold.red('false')}. This is useful as 
# many users will use localhost or a 192 style address when 
# testing their own network setup and this will create
# multiple connections self referencing connections.
############################################################
node network --include-local-networks false

############################################################
# To create a network pool with a friend or some specfic
# users then add as many ${chalk.italic.red('--users <USER>')} options as you need.
# This will limit the network connection pool to only these
# user networks.
############################################################
node network --users <USER1> --users <USER2>

############################################################
# The options ${chalk.italic.red('--users')} and ${chalk.italic.red('--include-local-networks')} can also
# be combined so you do not create duplicate local network
# connections. Providing these users are not on your local
# network
############################################################
node network --users <USER1> --users <USER2> --include-local-networks false
`
function buildFilters(args) {
    let filters = undefined
    if(args.includeLocalNetworks !== undefined) {
        filters = {
            includeLocalNetworks: args.includeLocalNetworks
        }
    }
    if(args.onlyMe !== undefined) {
        if(filters === undefined) {
            filters = {}
        }
        filters.onlyMe = args.onlyMe
    }
    if(args.users !== undefined) {
        if(filters === undefined) {
            filters = {}
        }
        filters.users = args.users
    }
    if(args.excludeLocalhost !== undefined) {
        if(filters === undefined) {
            filters = {}
        }
        filters.excludeLocalhost = args.excludeLocalhost
    }
    return filters
}

yargs(hideBin(process.argv))
    .version(require('./package.json').version)
    .alias('h', 'help')
    .command('$0', helpMessage, () => {}, (args) => {
        if(args.help) {
            console.log(helpMessage)
        }
        else {
            let APP_ROOT = require('./NetworkRoot.js')
            let APP_ROOT_MODULE = APP_ROOT.newNetworkRoot()
            let debugSettings = args.networkSigningAccount === undefined ? undefined : {P2P_NETWORK_NODE_SIGNING_ACCOUNT: args.networkSigningAccount}
            APP_ROOT_MODULE.run(debugSettings, buildFilters(args))
        }
    })
    .option('include-local-networks', {
        boolean: true,
        demandOption: false,
        describe: `To exclude all local networks from the connection pool set the ${chalk.italic.red('--include-local-networks')} to ${chalk.bold.red('false')}. This is useful as many users will use localhost or a 192 style address when testing their own network setup and this will create multiple connections self referencing connections.`
    })
    .option('exclude-localhost', {
        boolean: true,
        demandOption: false,
        describe: `To exclude all localhosts from the connection pool set the ${chalk.italic.red('--exclude-localhost')} to ${chalk.bold.red('true')}. This is useful as many users will use localhost or a 127 style address when testing their own network setup and this will create multiple connections self referencing connections.`
    })
    .option('only-me', {
        boolean: true,
        demandOption: false,
        describe: `To limit the network connections to only my network nodes, in order for this to work you will need at least 2 network nodes setup`
    })
    .option('users', {
        array: true,
        demandOption: false,
        describe: `To create a network pool with a friend or some specfic users then add as many ${chalk.italic.red('--users <USER>')} options as you need. This will limit the network connection pool to only these user networks.`
    })
    .option('network-signing-account', {
        string: true,
        demandOption: false,
        describe: `To specify a network node on your profile called ${chalk.bold.red('Local-Network-Node')}`
    })
    .help()
    .parse()