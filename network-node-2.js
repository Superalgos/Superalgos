/*
This is to start a new instance of a test node running with Node identity #2 as 
defined at the Environment.js file.
*/

let APP_ROOT = require('./NetworkRoot.js')
let APP_ROOT_MODULE = APP_ROOT.newNetworkRoot()
APP_ROOT_MODULE.run({P2P_NETWORK_NODE_SIGNING_ACCOUNT: 'P2P-Network-Node-2'})