exports.newNetworkProfileManagerApp = function newNetworkProfileManagerApp() {

    let thisObject = {
        p2pNetworkNode: undefined,
        run: run
    }

    NT.networkApp = thisObject

    return thisObject

    async function run() {

        await setupNetwork()

        SA.logger.info('Network Profile Manager App .................................................. Running')
        SA.logger.info(' ')

        async function setupNetwork() {
            /*
            We set up ourselves as a Network Node and store there
            an object representing ourselves (this instance). The properties of this object
            are going to be set afterwards at the bootstrapping process.
            */
            thisObject.p2pNetworkNode = SA.projects.network.modules.p2pNetworkNode.newNetworkModulesP2PNetworkNode()
            /*
            We will read all user profiles plugins and get from there our network identity.
            This is what we call the bootstrap process.
            */
            let appBootstrapingProcess = SA.projects.network.modules.profileManagerAppBootstrapingProcess.newNetworkModulesProfileManagerAppBootstrapingProcess()
            await appBootstrapingProcess.initialize(global.env.P2P_NETWORK_NODE_SIGNING_ACCOUNT, thisObject.p2pNetworkNode, true, true)
        }
    }
}
