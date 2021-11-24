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
                /*
                Each User Profile might have Signing Accounts, meaning
                accounts that can sign on behalf of the User Profile.
                */
                if (userProfilePlugin.signingAccounts !== undefined) {

                    let algoTradersPlatform = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfilePlugin.userApps, 'Algo Traders Platform')
                    let socialTradingDesktopApp = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfilePlugin.userApps, 'Social Trading Desktop App')
                    let socialTradingMobileApp = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfilePlugin.userApps, 'Social Trading Mobile App')
                    let socialTradingServerApp = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfilePlugin.userApps, 'Social Trading Server App')
                    let socialTradingBots = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfilePlugin.userBots, 'Social Trading Bot')
                    let socialPersonas = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfilePlugin.socialPersonas, 'Social Persona')
                    let p2pNetworkNodes = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfilePlugin.p2pNetworkNodes, 'P2P Network Node')

                    let networkClientsMap = new Map()

                    addToNetworkClientMap(algoTradersPlatform, 'Algo Traders Platform')
                    addToNetworkClientMap(socialTradingDesktopApp, 'Social Trading Desktop App')
                    addToNetworkClientMap(socialTradingMobileApp, 'Social Trading Mobile App')
                    addToNetworkClientMap(socialTradingServerApp, 'Social Trading Server App')
                    addToNetworkClientMap(socialTradingBots, 'Social Trading Bot')
                    addToNetworkClientMap(socialPersonas, 'Social Persona')
                    addToNetworkClientMap(p2pNetworkNodes, 'P2P Network Node')

                    function addToNetworkClientMap(nodeArray) {
                        for (let i = 0; i < nodeArray.length; i++) {
                            let currentNode = nodeArray[i]
                            networkClientsMap.set(currentNode.id, currentNode)
                        }
                    }

                    for (let j = 0; j < userProfilePlugin.signingAccounts.signingAccounts.length; j++) {
                        let signingAccount = userProfilePlugin.signingAccounts.signingAccounts[j]
                        let config = JSON.parse(signingAccount.config)
                        let signatureObject = config.signature
                        let web3 = new SA.nodeModules.web3()
                        let blockchainAccount = web3.eth.accounts.recover(signatureObject)
                        SA.projects.network.globals.memory.maps.USER_PROFILES_BY_BLOKCHAIN_ACCOUNT.set(blockchainAccount, userProfile)
                        /*
                        If the Signing Account is for a P2P node, we will add the node to the array of available nodes at the p2p network.
                        */
                        if (signingAccount.savedPayload === undefined) { continue }
                        if (signingAccount.savedPayload.referenceParent === undefined) { continue }
                        signingAccount.referenceParent = networkClientsMap.get(signingAccount.savedPayload.referenceParent.id)
                        if (
                            signingAccount.referenceParent !== undefined &&
                            signingAccount.referenceParent.type === "P2P Network Node" &&
                            signingAccount.referenceParent.config !== undefined
                        ) {
                            let config
                            try {
                                config = JSON.parse(signingAccount.referenceParent.config)
                            } catch (err) {
                                console.log('P2P Network Node Config not in JSON format. userProfileHandle = ' + userHandle + ' NodeId = ' + signingAccount.referenceParent.id)
                                continue
                            }
                            if (config.host === undefined) {
                                continue
                            }
                            if (config.webSocketsPort === undefined) {
                                continue
                            }

                            let p2pNetworkNode = SA.projects.network.modules.p2pNetworkNode.newNetworkModulesP2PNetworkNode()
                            p2pNetworkNode.initialize(signingAccount.referenceParent, userProfile, blockchainAccount)
                            SA.projects.network.globals.memory.arrays.P2P_NETWORK_NODES.push(p2pNetworkNode)
                        }
                        /*
                        Now, we will extract the information from the User Profile, specifically of our identity at the p2p network.
                        */
                        if (
                            signingAccount.referenceParent !== undefined &&
                            signingAccount.referenceParent.id === SA.secrets.map.get(nodeCodeName).nodeId
                        ) {
                            p2pNetworkIdentity.node = signingAccount.referenceParent
                            p2pNetworkIdentity.blockchainAccount = blockchainAccount
                            p2pNetworkIdentity.userProfile = userProfile
                        }
                    }
                }
            }
        }
    }
}