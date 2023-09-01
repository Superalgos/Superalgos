exports.newNetworkModulesAppBootstrapingProcess = function newNetworkModulesAppBootstrapingProcess() {
    /*
    This module is useful for all Apps that needs to operate with the P2P Network. 
    
    This process will:
    
    1. Load App Schemas.
    2. Load User Profiles
    3. Identify all P2P Network Nodes.
    4. Identify the node representing the Identity of the current running App.
    5. Setting up Storage Containers.
    6. Calculate Profiles Rankings.    

    */
    let thisObject = {
        pullUserProfiles: undefined,
        reloadFromStorage: undefined,
        userAppCodeName: undefined,
        p2pNetworkClientIdentity: undefined,
        loadAllUserProfileBalances: undefined, 
        initialize: initialize,
        run: run
    }

    const MINUTES_TO_UPDATE_USER_PROFILES_AND_BALANCES = 10
    let tempBalanceRanking = new Map()
    /** @type {import('node:child_process').ChildProcess} */
    let currentChildProcess = undefined;
    /** @type {import('../../../Local-Storage/SA/Globals/Persistence').NetworkPersistenceModel} */ 
    let userBalancePersistence = undefined

    return thisObject

    async function initialize(
        userAppCodeName,                // This represents the User App that is running. Could be a Network Node App, a Social Trading App, a Task Server App, etc.
        p2pNetworkClientIdentity,       // Here we will set the Network Client Identity after we load all User Profiles and find the one that is running this App. 
        pullUserProfiles,               // This is used to know if we need to git pull all User Profiles to keep this App uptodate with changes made by users of their User Profiles over tiem. Usually this is only needed at Network Nodes.
        loadAllUserProfileBalances      // At some Apps, there is no need to load and keep up to date all User Profile Balances. Only when this is true we will do that, otherwise we will only load the balance of the User Profile running this app. 
    ) {
        userBalancePersistence = await SA.projects.localStorage.globals.persistence.newPersistenceStore(global.env.DATABASE.TYPE, global.env.DATABASE.USERS_TABLE)
        userBalancePersistence.initialize()
        thisObject.pullUserProfiles = pullUserProfiles
        thisObject.userAppCodeName = userAppCodeName
        thisObject.p2pNetworkClientIdentity = p2pNetworkClientIdentity
        thisObject.loadAllUserProfileBalances = loadAllUserProfileBalances
        await run()
        if (thisObject.pullUserProfiles === true) {
            // This wants to be moved to a new process so it can operated on a different thread.
            // then an interval can be used to updated the profile balances from the persisted store

            const path = global.env.BASE_PATH + '/NetworkProfileManager.js'
            const taskArgs = []
            if(process.env.PROFILE_NAME !== undefined) {
                taskArgs.push('PROFILE_NAME=' + process.env.PROFILE_NAME)
            }
            if(global.env.LOG_LEVEL !== undefined) {
                taskArgs.push('logLevel=' + global.env.LOG_LEVEL)
            }
            setInterval(() => {
                if(currentChildProcess !== undefined && currentChildProcess.connected) {
                    currentChildProcess.disconnect();
                }
                currentChildProcess = SA.nodeModules.childProcess.fork(path, taskArgs, { stdio: 'inherit' })
                currentChildProcess.on('message', (message) => {
                    if(message == 'update') {
                        thisObject.pullUserProfiles = false
                        thisObject.reloadFromStorage = true
                        run()
                    }
                })
            }, 60000 * MINUTES_TO_UPDATE_USER_PROFILES_AND_BALANCES)
            SA.logger.info('Updates of all in-memory User Profiles scheduled to run every ' + MINUTES_TO_UPDATE_USER_PROFILES_AND_BALANCES + ' minutes.')
            SA.logger.info('')
        }
    }

    async function run() {
        SA.logger.info(' ')
        SA.logger.info('Updating all in-memory User Profiles by pulling changes from Github. You may see warnings below, indicating that some User Profiles have bad definitions. If your profile does not come with a warning, there is no further action required from you. Profiles with warning are ignored, so, if your profile does have a warning, you need to fix it!')
        SA.logger.info(' ')

        SA.projects.network.globals.memory.arrays.P2P_NETWORK_NODES = []
        if (thisObject.pullUserProfiles === true) {
            await pullProfiles()
        }
        await reloadAll()
        SA.logger.info(' ')
        SA.logger.info('User Profiles on memory updated from disk.')
        SA.logger.info(' ')
    }

    async function pullProfiles() {
        const simpleGit = SA.nodeModules.simpleGit
        options = {
            baseDir: SA.nodeModules.path.join(global.env.PATH_TO_PLUGINS, 'Governance'),
            binary: 'git',
            maxConcurrentProcesses: 6,
        }
        git = simpleGit(options)
        await git.stash()
        await git.pull('upstream', 'develop')
            .then(onProfilesPulled)
            .catch(onProfilesNotPulled)

        function onProfilesPulled() {
            SA.logger.info('User Profiles on disk updated from Github Governance Repository.')
            SA.logger.info(' ')
        }

        function onProfilesNotPulled(err) {
            SA.logger.info('User Profiles on disk NOT updated from Github Governance Repository. Retrying in ' + MINUTES_TO_UPDATE_USER_PROFILES_AND_BALANCES + ' Minutes. -> err.message = ' + err.message)
            SA.logger.info(' ')
        }
    }

    async function reloadAll() {

        await loadUserP2PNetworksPlugins()
        await loadUserProfilesPlugins()

        setReferenceParentForNodeHierearchy(
            SA.projects.network.globals.memory.maps.P2P_NETWORKS_BY_ID
        )

        setReferenceParentForNodeHierearchy(
            SA.projects.network.globals.memory.maps.USER_PROFILES_BY_ID
        )
        await loadTemporaryTokenPower()
        await extractInfoFromUserProfiles()
        await loadUserProfilesBalances().then(() => {
            SA.logger.info('User Profile Balances have been updated by reading blockchain balances.')
            SA.logger.info('')
        }).catch((err) => {
            SA.logger.error('uncaught error from loading user profile balances')
            SA.logger.error(err)
            throw err
        })

        if (thisObject.p2pNetworkClientIdentity.node === undefined) {
            throw ('The Network Client Identity does not match any node at User Profiles Plugins.')
        }

        calculateProfileRankings()

        setupPermissionedNetwork()

        async function loadUserP2PNetworksPlugins() {
            /*
            P2P Networks are plugins of the Network Project.        
            */
            let pluginFileNames = await SA.projects.communityPlugins.utilities.plugins.getPluginFileNames(
                'Network',
                'P2P-Networks'
            )

            SA.logger.debug('AppBootstrappingProcess -> Plugin files: ' + JSON.stringify(pluginFileNames))
            for (let i = 0; i < pluginFileNames.length; i++) {
                let pluginFileName = pluginFileNames[i]

                let pluginFileContent = await SA.projects.communityPlugins.utilities.plugins.getPluginFileContent(
                    'Network',
                    'P2P-Networks',
                    pluginFileName
                )

                let p2pNetworkPlugin = JSON.parse(pluginFileContent)

                let p2pNetwork = SA.projects.communityPlugins.utilities.nodes.fromSavedPluginToInMemoryStructure(
                    p2pNetworkPlugin
                )

                if (p2pNetwork === undefined) {
                    SA.logger.warn('P2P Network Plugin could not be loaded into memory: ' + p2pNetworkPlugin.name)
                    continue
                }

                SA.projects.network.globals.memory.maps.P2P_NETWORKS_BY_ID.set(p2pNetwork.id, p2pNetwork)
            }
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
                /*
                Here we will turn the saved plugin into an in-memory node structure with parent nodes and reference parents.
                */
                let userProfile = SA.projects.communityPlugins.utilities.nodes.fromSavedPluginToInMemoryStructure(
                    userProfilePlugin
                )

                if (userProfile === undefined) {
                    SA.logger.warn('User Profile Plugin could not be loaded into memory: ' + userProfilePlugin.name)
                    continue
                }   

                /* If we have a ranking from earlier loads, temporary restore until blockchain balances will have reloaded */
                let tempBalanceObject = tempBalanceRanking.get(userProfile.id)
                if (tempBalanceObject !== undefined) {
                    if (tempBalanceObject.hasOwnProperty('ranking')) { 
                        userProfile.ranking = tempBalanceObject.ranking
                    }
                    if (tempBalanceObject.hasOwnProperty('balance')) { 
                        userProfile.balance = tempBalanceObject.balance
                    }
                } 
                SA.projects.network.globals.memory.maps.USER_PROFILES_BY_ID.set(userProfile.id, userProfile)
            }
        }

        async function setReferenceParentForNodeHierearchy(nodeHierearchyMap) {
            let mapArray = Array.from(nodeHierearchyMap)
            for (let i = 0; i < mapArray.length; i++) {
                let mapArrayItem = mapArray[i][1]

                SA.projects.communityPlugins.utilities.nodes.fromInMemoryStructureToStructureWithReferenceParents(
                    mapArrayItem
                )
            }
        }

        async function loadTemporaryTokenPower() {
            /* Redistribute Token Power based on balances from earlier loads until blockchain balances will have reloaded */
            let userProfiles = Array.from(SA.projects.network.globals.memory.maps.USER_PROFILES_BY_ID)
            userProfiles = SA.projects.governance.functionLibraries.profileTokenPower.calculateTokenPower(userProfiles)
        }

        async function extractInfoFromUserProfiles() {

            let userProfiles = Array.from(SA.projects.network.globals.memory.maps.USER_PROFILES_BY_ID)
            SA.logger.info('Extracting Info from each User Profile.')
            SA.logger.info('')
            for (let i = 0; i < userProfiles.length; i++) {
                let userProfile = userProfiles[i][1]
                let signatureObject = userProfile.config.signature
                let web3 = new SA.nodeModules.web3()
                userProfile.blockchainAccount = web3.eth.accounts.recover(signatureObject)

                loadSigningAccounts()
                loadStorageContainers()

                function loadSigningAccounts() {
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
                        We will build a map of user profiles by blockchain account that we will need when we receive messages signed
                        by different network clients.
                        */
                        SA.projects.network.globals.memory.maps.USER_PROFILES_BY_BLOKCHAIN_ACCOUNT.set(blockchainAccount, userProfile)

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

                                /*
                                    Uncomment the following and input a username to specifically connect to that users network node.
                                    NOTE: This is for Social-Trading-App Testing.
                                */
                                // if (userProfile.name !== "theblockchainarborist") {
                                //     return
                                // }


                                try {
                                    let p2pNetworkNode = SA.projects.network.modules.p2pNetworkNode.newNetworkModulesP2PNetworkNode()
                                    p2pNetworkNode.initialize(
                                        networkClient,
                                        userProfile,
                                        blockchainAccount
                                    )
                                    SA.projects.network.globals.memory.arrays.P2P_NETWORK_NODES.push(p2pNetworkNode)
                                } catch (err) {
                                    SA.logger.warn('A configured Network Node was ignored because something is wrong with its configuration. -> err = ' + err)
                                    SA.logger.warn('')
                                }

                            }
                        }

                        function setupNetworkClientIdentity() {
                            /*
                            At the governance system, you might declare that you have for instance
                            3 P2P Network Nodes. The way to tell this particular instance which 
                            one of the 3 it is, is by configuring at the Environment.js which one
                            I want it to be by putting there the codeName of the P2P Network node 
                            I want this to be. With that codename we then get from the Secrets file
                            the NodeId of the P2P Network node defined at the User Profile, and once 
                            we match it with a node of the user profiles we are scanning, then we
                            store that node as our P2P Network Client Identity. 
                            */
                            if (SA.secrets.signingAccountSecrets.map.get(thisObject.userAppCodeName) === undefined) {
                                throw ('Bad configuration! Could not find a signing account node or the corresponding signature file in the /My-Secrets folder based on the configured thisObject.userAppCodeName = ' + thisObject.userAppCodeName)
                            }
                            if (
                                networkClient.id === SA.secrets.signingAccountSecrets.map.get(thisObject.userAppCodeName).nodeId
                            ) {
                                thisObject.p2pNetworkClientIdentity.initialize(
                                    networkClient,
                                    userProfile,
                                    blockchainAccount
                                )
                            }
                        }
                    }
                }

                function loadStorageContainers() {
                    /*
                    Identify Storage Containers of each profiles and load them to memory.
                    */
                    let storageContainers

                    storageContainers = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfile.userStorage, 'Github Storage Container')
                    addContainersToMemoryMap()
                    storageContainers = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfile.userStorage, 'Superalgos Storage Container')
                    addContainersToMemoryMap()

                    function addContainersToMemoryMap() {
                        for (let j = 0; j < storageContainers.length; j++) {
                            let storageContainer = storageContainers[j]
                            SA.projects.network.globals.memory.maps.STORAGE_CONTAINERS_BY_ID.set(storageContainer.id, storageContainer)
                        }
                    }
                }
            }
        }

        async function loadUserProfilesBalances() {

            let userProfiles = Array.from(SA.projects.network.globals.memory.maps.USER_PROFILES_BY_ID)
            SA.logger.info('Updating wallet balances for each relevant User Profile.')
            SA.logger.info('')
            for (let i = 0; i < userProfiles.length; i++) {
                let userProfile = userProfiles[i][1]
                /*
                 * Here we will get the blockchain balance for each profile. This will allow us to later calculate each profile's ranking.
                 */
                userProfile.balance = 0
                if(thisObject.reloadFromStorage) {
                    const storedProfile = await userBalancePersistence.findItem({key: 'id', value: userProfile.id})
                    if(storedProfile !== undefined) {
                        userProfile.balance = storedProfile.balance
                        SA.logger.info('User profile ' + userProfile.name + ' balance loaded from storage')
                    }
                    else {
                       SA.logger.warn('User profile ' + userProfile.name + ' has not been loaded into storage yet, if this continues the child process will need debugging')
                    }
                }
                else {
                    const activeChains = ['BSC', 'ETH', 'ZKS']
                    for (const chain of activeChains) {
                        if (
                            thisObject.loadAllUserProfileBalances === true ||
                            thisObject.p2pNetworkClientIdentity.userProfile.id === userProfile.id
                            ) {
                                /*
                                If we are running inside a Task, that means we are in a Network Client, so we only need the Balance of the User Profile
                                running that Task, not of the rest of users. On the other hand, if we are running at a Network Node, we need the Balance of
                                all User Profiles.
                                */
                               userProfile.balance = userProfile.balance + await getProfileBalance(chain, userProfile.blockchainAccount)
                        }
                    }
                }
                if (userProfile.balance > 0) {
                    SA.logger.info('Accumulated Balance of Address: ' + userProfile.blockchainAccount + ', User Profile: ' + userProfile.name + ' is ' + SA.projects.governance.utilities.balances.toSABalanceString(userProfile.balance))
                }
                /* 
                If the Network Bootstrapping process has been launched from the Task Server we can report the status to the Task 
                (so it doesn't look like the Run button does nothing as the profiles are synchronising) 
                */
                if (global.TS !== undefined) {
                    let percentage = (((i + 1) / userProfiles.length) * 100).toFixed(1)
                    TS.projects.foundations.functionLibraries.taskFunctions.taskHearBeat("Synchronising User Profiles, " + percentage + "% (" + (i + 1) + " of " + userProfiles.length + ")", false)
                }

                async function getProfileBalance(chain, walletAddress) {
                    let contractAddress = ''
                    let URI = ''
                    const ABI = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "unpause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "account", "type": "address" }, { "name": "amount", "type": "uint256" }], "name": "mint", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_value", "type": "uint256" }], "name": "burn", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "paused", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_subtractedValue", "type": "uint256" }], "name": "decreaseApproval", "outputs": [{ "name": "success", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "listAddress", "type": "address" }, { "name": "isBlackListed", "type": "bool" }], "name": "blackListAddress", "outputs": [{ "name": "success", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "pause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_addedValue", "type": "uint256" }], "name": "increaseApproval", "outputs": [{ "name": "success", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "name": "_name", "type": "string" }, { "name": "_symbol", "type": "string" }, { "name": "_decimals", "type": "uint256" }, { "name": "_supply", "type": "uint256" }, { "name": "tokenOwner", "type": "address" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Mint", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "burner", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Burn", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Pause", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Unpause", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "previousOwner", "type": "address" }, { "indexed": true, "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "blackListed", "type": "address" }, { "indexed": false, "name": "value", "type": "bool" }], "name": "Blacklist", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }]
                    switch (chain) {
                        case 'BSC':
                            contractAddress = "0xfb981ed9a92377ca4d75d924b9ca06df163924fd"
                            URI = 'https://bsc-dataseed1.binance.org'
                            break
                        case 'ETH':
                            contractAddress = "0xc17272c3e15074c55b810bceba02ba0c4481cd79"
                            URI = 'https://rpc.ankr.com/eth'
                            break
                        case 'ZKS':
                            contractAddress = "0xe3d85Bd3363B6f0F91351591f9a8fD0d0a1145Ed"
                            URI = 'https://mainnet.era.zksync.io'
                            break
                    }

                    const WEB3_WAITING_TIME = 100
                    await SA.projects.foundations.utilities.asyncFunctions.sleep(WEB3_WAITING_TIME)
                    const web3 = new SA.nodeModules.web3(URI)
                    const contractInst = new web3.eth.Contract(ABI, contractAddress)
                    let balance
                    try {
                        balance = await contractInst.methods.balanceOf(walletAddress).call().then(result => web3.utils.fromWei(result, 'ether'))
                        /* SA.logger.info('Wallet Balance of Chain: ' + chain + ', Address: ' + walletAddress + ', User Profile: ' + userProfile.name + ' is ' + SA.projects.governance.utilities.balances.toSABalanceString(balance)) */
                    } catch (err) {
                        SA.logger.info('Failed to obtain ' + chain + ' wallet balance for User Profile: ' + userProfile.name + ', retrying in 5 seconds')
                        await SA.projects.foundations.utilities.asyncFunctions.sleep(5000)
                        try {
                            balance = await contractInst.methods.balanceOf(walletAddress).call().then(result => web3.utils.fromWei(result, 'ether'))
                            SA.logger.info('Retry successful - Wallet Balance of Chain: ' + chain + ', Address: ' + walletAddress + ', User Profile: ' + userProfile.name + ' is ' + SA.projects.governance.utilities.balances.toSABalanceString(balance))
                        } catch (err) {
                            SA.logger.warn('Failed to obtain ' + chain + ' wallet balance for User Profile: ' + userProfile.name + ' after retrying. Proceeding with 0 balance for this user.')
                            balance = 0
                        }
                    }

                    return Number(balance)
                }
            }
            if(!thisObject.reloadFromStorage) {
                // this should trigger persistence on the inital startup of the network, but later reply on the child process
                await userBalancePersistence.saveAll(userProfiles.map(x => ({id: x[1].id, name: x[1].name, balance: x[1].balance})))
            }
            /* Calculate available token power per node (incl. delegated power) and add information to node payloads */
            userProfiles = SA.projects.governance.functionLibraries.profileTokenPower.calculateTokenPower(userProfiles)
            SA.logger.debug('calculated user profile token power for ' + userProfiles.length + ' profiles')
        }
        /**
         * Transfer all profiles to the ranking array.
         */
        function calculateProfileRankings() {
            let userProfiles = Array.from(SA.projects.network.globals.memory.maps.USER_PROFILES_BY_ID)

            userProfiles.sort((p1, p2) => p2[1].balance - p1[1].balance)

            tempBalanceRanking.clear()
            const rankingTable = userProfiles.map((up, index) => {
                // add ranking to existing item
                SA.projects.network.globals.memory.maps.USER_PROFILES_BY_ID.get(up[1].id).ranking = index + 1
                // Build temporary table which will retain rankings during balance reloads. This avoids users to drop to end of queue when connecting during balance loads.
                tempBalanceRanking.set(up[1].id, {ranking: index + 1, balance: up[1].balance})
                // return user friendly item for console table output
                return {
                    userProfile: up[1].name,
                    balance: SA.projects.governance.utilities.balances.toSABalanceString(up[1].balance),
                    ranking: index + 1
                }
            })

            if (thisObject.loadAllUserProfileBalances === true) {
                SA.logger.info('User Profiles ranking table calculated based on latest User Profile Balances: ')
                SA.logger.info('')
                console.table(rankingTable)
                SA.logger.info('')
            }
        }

        function setupPermissionedNetwork() {
            /*
            If we are a P2P Network Node that is part of a Permissioned P2P Network,
            then we will need to build a Map with all User Profiles that have access
            to this network, in order to use it later to enforce these permissions
            at the Network Interfaces.
            */
            if (thisObject.p2pNetworkClientIdentity.node.type !== "P2P Network Node") { return }
            if (thisObject.p2pNetworkClientIdentity.node.p2pNetworkReference.referenceParent.type !== "Permissioned P2P Network") { return }

            let petmissionGrantedArray = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(
                thisObject.p2pNetworkClientIdentity.node.p2pNetworkReference.referenceParent,
                'Permission Granted'
            )

            for (let i = 0; i < petmissionGrantedArray.length; i++) {
                let permissionGranted = petmissionGrantedArray[i]
                if (permissionGranted.referenceParent === undefined) { continue }
                SA.projects.network.globals.memory.maps.PERMISSIONS_GRANTED_BY_USER_PRFILE_ID.set(permissionGranted.referenceParent.id, permissionGranted.referenceParent)
            }
        }
    }
}
