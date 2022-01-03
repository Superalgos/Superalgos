exports.newNetworkModulesAppBootstrapingProcess = function newNetworkModulesAppBootstrapingProcess() {
    /*
    This module is useful for all Apps that needs to operate with the P2P Network. 
    
    This process will:
    
    1. Load Appp Schemas.
    2. Load User Profiles
    3. Identify all P2P Network Nodes.
    4. Identify the node representing the Identity of the current running App.
    5. Setting up the User Social Profiles.
    6. Setting up Storage Containers.
    7. TODO: Calculate Profiles Rankings.    

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
        await loadUserProfilesPlugins()

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

        async function loadUserProfilesPlugins() {
            /*
            User Profiles are plugins of the Governance System. Besides the info they carry, we also 
            need to get the blockchain account for each one in order to later calculate their ranking.
            */
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
                /*
                Store in memory all User Social Profiles
                */
                SA.projects.network.globals.memory.maps.USER_SOCIAL_PROFILES_BY_USER_PROFILE_ID.set(userProfileId, userSocialProfile)
                SA.projects.network.globals.memory.maps.USER_SOCIAL_PROFILES_BY_USER_PROFILE_HANDLE.set(userHandle, userSocialProfile)
                SA.projects.network.globals.memory.maps.USER_SOCIAL_PROFILES_BY_BLOKCHAIN_ACCOUNT.set(blockchainAccount, userSocialProfile)
                SA.projects.network.globals.memory.maps.USER_PROFILES_BY_ID.set(userProfileId, userProfile)

                loadSigningAccounts()
                loadStorageContainers()

                function loadSigningAccounts(){
                    /*
                    For each User Profile Plugin, we will check all the Signing Accounts
                    and load them in memory to easily find them when needed.

                    Some of these Signing Accounts will belong to P2P Network Nodes, so 
                    we will also load them to have them accesible.

                    One of these Signing Account will be our own identity as a Network Client.
                    */
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
    
                        loadP2PNetworkNodes()
                        setupNetworkClientIdentity()
    
                        function loadP2PNetworkNodes() {
                            /*
                            If the Signing Account is for a P2P node, we will add the node to the array of available nodes at the p2p network.
                            */
                            if (
                                networkClient.type === "P2P Network Node" &&
                                networkClient.config !== undefined
                            ) {
                                if (networkClient.config.host === undefined) {
                                    return
                                }
                                if (networkClient.config.webSocketsPort === undefined) {
                                    return
                                }
    
                                let p2pNetworkNode = SA.projects.network.modules.p2pNetworkNode.newNetworkModulesP2PNetworkNode()
                                p2pNetworkNode.initialize(networkClient, userSocialProfile, blockchainAccount)
                                SA.projects.network.globals.memory.arrays.P2P_NETWORK_NODES.push(p2pNetworkNode)
                            }
                        }                    
    
                        function setupNetworkClientIdentity() {
                            /*
                            At the governance system, you might declare that you have for instance
                            3 P2P Network Nodes. They way to tell this particular instance which 
                            one of the 3 it is, is by configuring at the Environment.js which one
                            I want it to be by putting there the codeName of the P2P Network node 
                            I want this to be. With that codename we then get from the Secrets file
                            the NodeId of the P2P Network node defined at the User Profile, and once 
                            we match it with a node of the user profiles we are scanning, then we
                            store that node as our P2P Network Client Identity. 
                            */
                            if (
                                networkClient.id === SA.secrets.signingAccountSecrets.map.get(userAppCodeName).nodeId
                            ) {
                                p2pNetworkClientIdentity.node = networkClient
                                p2pNetworkClientIdentity.blockchainAccount = blockchainAccount
                                p2pNetworkClientIdentity.userSocialProfile = userSocialProfile
                            }
                        }
                    }
                }
            
                function loadStorageContainers() {
                    /*
                    Identify Storage Containers of each profiles and load them to memory.
                    */
                    let storageContainers = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfile.userStorage, 'Storage Container')

                    for (let j = 0; j < storageContainers.length; j++) {
                        let storageContainer = storageContainers[j]
                        SA.projects.network.globals.memory.maps.STORAGE_CONTAINERS_BY_ID.set(storageContainer.id, storageContainer)
                    }
                }
            }
        }
    }
}