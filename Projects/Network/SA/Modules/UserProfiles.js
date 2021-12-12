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

    async function initialize(userAppCodeName, p2pNetworkClientIdentity) {

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
                /*
                Setting up the User Social Profile
                */
                let userSocialProfile = SA.projects.socialTrading.modules.socialGraphUserProfile.newSocialTradingModulesSocialGraphUserProfile()
                userSocialProfile.initialize(
                    userProfileId,
                    userHandle,
                    blockchainAccount,
                    ranking
                )
                /*
                Here we will turn the saved plugin into an in-memory node structure with parent nodes and reference parents.
                */
                let userProfile = SA.projects.communityPlugins.utilities.nodes.fromSavedPluginToInMemoryStructure(
                    userProfilePlugin
                )

                SA.projects.network.globals.memory.maps.USER_SOCIAL_PROFILES_BY_USER_PROFILE_ID.set(userProfileId, userSocialProfile)
                SA.projects.network.globals.memory.maps.USER_SOCIAL_PROFILES_BY_USER_PROFILE_HANDLE.set(userHandle, userSocialProfile)
                SA.projects.network.globals.memory.maps.USER_SOCIAL_PROFILES_BY_BLOKCHAIN_ACCOUNT.set(blockchainAccount, userSocialProfile)
                SA.projects.network.globals.memory.maps.USER_PROFILES_BY_ID.set(userProfileId, userProfile)

                let signingAccounts = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfile, 'Signing Account')

                for (let j = 0; j < signingAccounts.length; j++) {
                    
                    let signingAccount = signingAccounts[j]
                    let networkClient = signingAccount.parentNode
                    let config = signingAccount.config
                    let signatureObject = config.signature
                    let web3 = new SA.nodeModules.web3()
                    let blockchainAccount = web3.eth.accounts.recover(signatureObject)
                    /*
                    We will build a map of user profiles by blockchain account that we will when we receive messages signed
                    by different network clients.
                    */
                    SA.projects.network.globals.memory.maps.USER_SOCIAL_PROFILES_BY_BLOKCHAIN_ACCOUNT.set(blockchainAccount, userSocialProfile)
                    /*
                    If the Signing Account is for a P2P node, we will add the node to the array of available nodes at the p2p network.
                    */
                    if (
                        networkClient.type === "P2P Network Node" &&
                        networkClient.config !== undefined
                    ) {
                        if (networkClient.config.host === undefined) {
                            continue
                        }
                        if (networkClient.config.webSocketsPort === undefined) {
                            continue
                        }

                        let p2pNetworkNode = SA.projects.network.modules.p2pNetworkNode.newNetworkModulesP2PNetworkNode()
                        p2pNetworkNode.initialize(networkClient, userSocialProfile, blockchainAccount)
                        SA.projects.network.globals.memory.arrays.P2P_NETWORK_NODES.push(p2pNetworkNode)
                    }
                    /*
                    Now, we will extract the information from the User Profile, specifically the user app that it is being used.
                    */
                    if (
                        networkClient.id === SA.secrets.map.get(userAppCodeName).nodeId
                    ) {
                        p2pNetworkClientIdentity.node = networkClient
                        p2pNetworkClientIdentity.blockchainAccount = blockchainAccount
                        p2pNetworkClientIdentity.userSocialProfile = userSocialProfile
                    }
                }
            }

        }
    }
}