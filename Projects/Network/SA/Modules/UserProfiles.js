exports.newNetworkModulesUserProfiles = function newNetworkModulesUserProfiles() {
    /*
    This module is useful for all Apps that needs to operate with all User Profiles loaded in
    memory maps. 
    
    User Profiles are plugins of the Governance System. Besides the info they carry, we also 
    need to read the blockchain for each one in order to calculate their ranking.
    */
    let thisObject = {
        /* Framework Functions */
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    async function initialize(nodeCodeName, p2pNetworkIdentity) {

        await loadAppSchemas()
        await loadProfiles()

        async function loadAppSchemas() {

            let promise = new Promise((resolve, reject) => {

                let project = 'Governance'
                let filePath = global.env.PATH_TO_PROJECTS + '/' + project + '/Schemas/'
                let folder = 'App-Schema'

                SA.projects.foundations.utilities.filesAndDirectories.getAllFilesInDirectoryAndSubdirectories(filePath + folder, onFilesReady)

                function onFilesReady(files) {

                    for (let k = 0; k < files.length; k++) {
                        let name = files[k]
                        let nameSplitted = name.split(folder)
                        let fileName = nameSplitted[1]
                        for (let i = 0; i < 10; i++) {
                            fileName = fileName.replace('\\', '/')
                        }
                        let fileToRead = filePath + folder + fileName

                        let fileContent = SA.nodeModules.fs.readFileSync(fileToRead)
                        let schemaDocument
                        try {
                            schemaDocument = JSON.parse(fileContent)
                            SA.projects.foundations.globals.schemas.APP_SCHEMA_MAP.set(project + '-' + schemaDocument.type, schemaDocument)
                        } catch (err) {
                            console.log('[WARN] loadAppSchemas -> Error Parsing JSON File: ' + fileToRead + '. Error = ' + err.stack)
                            return
                        }
                    }
                    resolve()
                }
            }
            )
            return promise
        }

        async function loadProfiles() {

            let pluginFileNames = await SA.projects.communityPlugins.utilities.plugins.getPluginFileNames(
                'Governance',
                'User-Profiles'
            )

            for (let i = 0; i < pluginFileNames.length; i++) {
                let pluginFileName = pluginFileNames[i]

                let pluginFileContent = await SA.projects.communityPlugins.utilities.plugins.getPluginFileContent(
                    'Governance',
                    'User-Profiles',
                    pluginFileName
                )

                let userProfilePlugin = JSON.parse(pluginFileContent)
                let config = JSON.parse(userProfilePlugin.config)
                let signatureObject = config.signature
                let web3 = new SA.nodeModules.web3()
                let blockchainAccount = web3.eth.accounts.recover(signatureObject)
                let ranking = 0 // TODO: read the blockchain balance and transactions from the Treasury Account to calculate the profile ranking.
                let userProfileId = userProfilePlugin.id
                let userHandle = config.signature.message

                let userProfile = SA.projects.socialTrading.modules.socialGraphUserProfile.newSocialTradingModulesSocialGraphUserProfile()
                userProfile.initialize(
                    userProfileId,
                    userHandle,
                    blockchainAccount,
                    ranking
                )

                SA.projects.network.globals.memory.maps.USER_PROFILES_BY_ID.set(userProfileId, userProfile)
                SA.projects.network.globals.memory.maps.USER_PROFILES_BY_HANDLE.set(userHandle, userProfile)
                SA.projects.network.globals.memory.maps.USER_PROFILES_BY_BLOKCHAIN_ACCOUNT.set(blockchainAccount, userProfile)

                let algoTradersPlatform = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfilePlugin.userApps, 'Algo Traders Platform')
                let socialTradingDesktopApp = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfilePlugin.userApps, 'Social Trading Desktop App')
                let socialTradingMobileApp = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfilePlugin.userApps, 'Social Trading Mobile App')
                let socialTradingServerApp = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfilePlugin.userApps, 'Social Trading Server App')
                let taskServerApp = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfilePlugin.userApps, 'Task Server App')
                let socialTradingBots = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfilePlugin.userBots, 'Social Trading Bot')
                let socialPersonas = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfilePlugin.socialPersonas, 'Social Persona')
                let p2pNetworkNodes = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfilePlugin.p2pNetworkNodes, 'P2P Network Node')

                checkNwetworkClients(algoTradersPlatform)
                checkNwetworkClients(socialTradingDesktopApp)
                checkNwetworkClients(socialTradingMobileApp)
                checkNwetworkClients(socialTradingServerApp)
                checkNwetworkClients(taskServerApp)
                checkNwetworkClients(socialTradingBots)
                checkNwetworkClients(socialPersonas)
                checkNwetworkClients(p2pNetworkNodes)

                function checkNwetworkClients(netwokClients) {

                    for (let j = 0; j < netwokClients.length; j++) {
                        let networkClient = netwokClients[j]
                        let signingAccount = networkClient.signingAccount
                        if (signingAccount === undefined) { continue }
                        let config = JSON.parse(signingAccount.config)
                        let signatureObject = config.signature
                        let web3 = new SA.nodeModules.web3()
                        let blockchainAccount = web3.eth.accounts.recover(signatureObject)
                        SA.projects.network.globals.memory.maps.USER_PROFILES_BY_BLOKCHAIN_ACCOUNT.set(blockchainAccount, userProfile)
                        /*
                        If the Signing Account is for a P2P node, we will add the node to the array of available nodes at the p2p network.
                        */
                        if (
                            networkClient.type === "P2P Network Node" &&
                            networkClient.config !== undefined
                        ) {
                            let config
                            try {
                                config = JSON.parse(networkClient.config)
                            } catch (err) {
                                console.log('P2P Network Node Config not in JSON format. userProfileHandle = ' + userHandle + ' NodeId = ' + networkClient.id)
                                continue
                            }
                            if (config.host === undefined) {
                                continue
                            }
                            if (config.webSocketsPort === undefined) {
                                continue
                            }

                            let p2pNetworkNode = SA.projects.network.modules.p2pNetworkNode.newNetworkModulesP2PNetworkNode()
                            p2pNetworkNode.initialize(networkClient, userProfile, blockchainAccount)
                            SA.projects.network.globals.memory.arrays.P2P_NETWORK_NODES.push(p2pNetworkNode)
                        }
                        /*
                        Now, we will extract the information from the User Profile, specifically of our identity at the p2p network.
                        */
                        if (
                            networkClient.id === SA.secrets.map.get(nodeCodeName).nodeId
                        ) {
                            p2pNetworkIdentity.node = networkClient
                            p2pNetworkIdentity.blockchainAccount = blockchainAccount
                            p2pNetworkIdentity.userProfile = userProfile
                        }
                    }
                }

            }
        }
    }
}