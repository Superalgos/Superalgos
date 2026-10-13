// DashboardsAppBootstrappingProcess.js

exports.newDashboardsAppBootstrappingProcess = function newDashboardsAppBootstrappingProcess() {
    let thisObject = {
        initialize: initialize,
        run: run,
        userProfilesById: undefined
    }

    const profileTokenPower = SA.projects.governance.functionLibraries.profileTokenPower

    return thisObject


    async function initialize() {
        //SA.logger.info('[BootstrappingProcess] Initialized.')
    }

    async function run() {
        //SA.logger.info(' ')
        //SA.logger.info('Starting Bootstrapping Process for Dashboards App...')
        //SA.logger.info(' ')
        
        try {
            thisObject.userProfilesById = await loadUserProfiles()
            //SA.logger.info('User profiles loaded successfully.')
            //SA.logger.info(' ')
        
            // Cargar los Pools
            //const pools = await loadPools()
        
            // Convertimos el Map a un Array de [id, profile] para pasarlo a las funciones
            let userProfilesArray = Array.from(thisObject.userProfilesById.entries());
            SA.logger.debug(`[BootstrappingProcess] userProfilesArray length: ${userProfilesArray.length}`);
        
            // Calcular Token Power
            profileTokenPower.calculateTokenPower(userProfilesArray)
            // SA.logger.info(`calculateTokenPower completado para ${userProfilesArray.length} perfiles.`);
    
            // Procesar las delegaciones salientes
            profileTokenPower.outboundDelegatedPower(userProfilesArray)
        
            // Calcular Delegated Power
            profileTokenPower.calculateDelegatedPower(userProfilesArray)
        
            // Actualizamos el Map con los perfiles actualizados
            for (let [id, profile] of userProfilesArray) {
                thisObject.userProfilesById.set(id, profile)
                SA.logger.debug(`[BootstrappingProcess] Updated userProfile in Map: ${profile.name}, TokenPower: ${profile.payload.tokenPower}`)
            }
        
            SA.logger.info('Bootstrapping Process Completed Successfully.')
            SA.logger.info(' ')
        } catch (err) {
            SA.logger.error('Dashboards App Bootstrapping Process -> Error = ' + err.stack)
            throw err
        }
    }
    

    async function loadUserProfiles() {
        //SA.logger.info(' ')
        //SA.logger.info('Loading user profiles into memory for Dashboards...')
        //SA.logger.info(' ')
    
        let userProfilesById = new Map()
    
        await loadUserProfilesPlugins(userProfilesById)
    
        setReferenceParentForNodeHierarchy(userProfilesById)
    
        // Cargar balances de los perfiles de usuario
        await loadUserProfilesBalances(userProfilesById)
    
        // Inicializar tokenPowerSwitch para cada perfil si es necesario
        for (let userProfile of userProfilesById.values()) {
            if (userProfile.tokenPowerSwitch === undefined) {
                userProfile.tokenPowerSwitch = true // O el valor que corresponda
            }
        }
    
        // SA.logger.info(' ')
        // SA.logger.info('User profiles loaded into memory for Dashboards.')
        // SA.logger.info(`Total profiles loaded: ${userProfilesById.size}`)
        // SA.logger.info(' ')
    
        return userProfilesById
    }
    
    /*
    async function loadPools() {
        // SA.logger.info(' ')
        // SA.logger.info('Loading Pools into memory for Dashboards...')
        // SA.logger.info(' ')
    
        let pools = []
    
        let pluginFileNames = await SA.projects.communityPlugins.utilities.plugins.getPluginFileNames(
            'Governance',
            'Pools'
        )
    
        // SA.logger.info(`Found ${pluginFileNames.length} pool plugins.`)
    
        for (let i = 0; i < pluginFileNames.length; i++) {
            let pluginFileName = pluginFileNames[i]
            // SA.logger.debug(`Loading pool plugin: ${pluginFileName}`)
    
            let pluginFileContent = await SA.projects.communityPlugins.utilities.plugins.getPluginFileContent(
                'Governance',
                'Pools',
                pluginFileName
            )
    
            let poolPlugin = JSON.parse(pluginFileContent)
    
            // Parsear config
            try {
                poolPlugin.config = JSON.parse(poolPlugin.config)
            } catch (e) {
                SA.logger.warn(`Failed to parse config for pool plugin ${poolPlugin.name}: ${e.message}`)
                poolPlugin.config = {}
            }
    
            let pool = SA.projects.communityPlugins.utilities.nodes.fromSavedPluginToInMemoryStructure(
                poolPlugin
            )
    
            if (pool === undefined) {
                SA.logger.warn('Pool plugin could not be loaded into memory: ' + poolPlugin.name)
                continue
            }
    
            // Asegurar que el pool tenga las propiedades necesarias
            pool.payload = pool.payload || {}
            pool.config = pool.config || {}
            pool.type = 'Pool'
            pool.project = 'Governance'
    
            // Asignar codeName
            pool.config.codeName = pool.config.codeName || poolPlugin.config.codeName || poolPlugin.name || 'Unnamed Pool'
    
            // Recursivamente asignar tokens a los pools hijos
            assignTokensToPools(pool)
    
            // Log para verificar
            // SA.logger.info(`Loaded pool: ${pool.name}, CodeName: ${pool.config.codeName}, Tokens: ${pool.payload.tokens}`)
    
            pools.push(pool)
    
            SA.logger.debug(`Loaded pool: ${pool.name}`)
        }
    
        // SA.logger.info(' ')
        // SA.logger.info('Pools loaded into memory for Dashboards.')
        // SA.logger.info(`Total pools loaded: ${pools.length}`)
        // SA.logger.info(' ')
    
        return pools
    }
    */  
    
    async function loadUserProfilesPlugins(userProfilesById) {
        let pluginFileNames = await SA.projects.communityPlugins.utilities.plugins.getPluginFileNames(
            'Governance',
            'User-Profiles'
        )
    
        // SA.logger.info(`Found ${pluginFileNames.length} user profile plugins.`)
    
        for (let i = 0; i < pluginFileNames.length; i++) {
            let pluginFileName = pluginFileNames[i]
            SA.logger.debug(`Loading user profile plugin: ${pluginFileName}`)
    
            let pluginFileContent = await SA.projects.communityPlugins.utilities.plugins.getPluginFileContent(
                'Governance',
                'User-Profiles',
                pluginFileName
            )
    
            let userProfilePlugin = JSON.parse(pluginFileContent)
    
            let userProfile = SA.projects.communityPlugins.utilities.nodes.fromSavedPluginToInMemoryStructure(
                userProfilePlugin
            )
    
            if (userProfile === undefined) {
                SA.logger.warn('User profile plugin could not be loaded into memory: ' + userProfilePlugin.name)
                continue
            }
    
            // Asegurar que userProfile tenga las propiedades necesarias
            userProfile.payload = userProfile.payload || {}
            userProfile.type = 'User Profile'
    
            // Inicializar tokensMined
            if (!userProfile.tokensMined) {
                userProfile.tokensMined = {
                    payload: {
                        tokensMined: {
                            awarded: 0,
                            bonus: 0,
                            total: 0
                        }
                    }
                }
                SA.logger.debug(`[loadUserProfilesPlugins] Initialized tokensMined for userProfile: ${userProfile.name}`)
            } else {
                userProfile.tokensMined.payload = userProfile.tokensMined.payload || {}
                userProfile.tokensMined.payload.tokensMined = userProfile.tokensMined.payload.tokensMined || {
                    awarded: 0,
                    bonus: 0,
                    total: 0
                }
                SA.logger.debug(`[loadUserProfilesPlugins] Verified tokensMined for userProfile: ${userProfile.name}`)
            }
    
            // Obtener la dirección de la billetera
            let signatureObject = userProfile.config.signature
            let web3 = new SA.nodeModules.web3()
            try {
                userProfile.blockchainAccount = web3.eth.accounts.recover(signatureObject)
            } catch (e) {
                SA.logger.warn(`Failed to recover blockchainAccount for userProfile: ${userProfile.name}, Error: ${e.message}`)
                userProfile.blockchainAccount = null
            }
    
            userProfilesById.set(userProfile.id, userProfile)
    
            SA.logger.debug(`Loaded user profile: ${userProfile.name} (ID: ${userProfile.id})`)
        }
    }
    

    function setReferenceParentForNodeHierarchy(nodeHierarchyMap) {
        let mapArray = Array.from(nodeHierarchyMap.values())
        for (let i = 0; i < mapArray.length; i++) {
            let node = mapArray[i]
            SA.projects.communityPlugins.utilities.nodes.fromInMemoryStructureToStructureWithReferenceParents(
                node
            )
        }
    }

    async function loadUserProfilesBalances(userProfilesById) {
        let userProfilesArray = Array.from(userProfilesById.values());
    
        SA.logger.info('Updating wallet balances for each User Profile.')
        SA.logger.info('')
    
        for (let i = 0; i < userProfilesArray.length; i++) {
            let userProfile = userProfilesArray[i]
            userProfile.balance = 0
            userProfile.balancesByChain = {}
    
            // Calculate the progress percentage
            //let progressPercentage = ((i + 1) / totalProfiles * 100).toFixed(2)
    
            // Display the progress
            //SA.logger.info(`Processing User Profiles: ${progressPercentage}% (${i + 1}/${totalProfiles})`)
    
            // Aquí puedes agregar las cadenas que necesites
            const activeChains = ['BSC', 'ETH', 'ZKS']
    
            for (const chain of activeChains) {
                let balance = await getProfileBalance(chain, userProfile.blockchainAccount, userProfile)
                userProfile.balance += balance
                userProfile.balancesByChain[chain] = balance
            }
    
            // **Agregar log para balance**
            SA.logger.info(`User profile ${userProfile.name} balance: ${userProfile.balance}`)
        }
    }    

    async function getProfileBalance(chain, walletAddress, userProfile) {
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
            default:
                SA.logger.warn(`Unsupported chain: ${chain} for userProfile: ${userProfile.name}`)
                return 0
        }
    
        const WEB3_WAITING_TIME = 100
        await SA.projects.foundations.utilities.asyncFunctions.sleep(WEB3_WAITING_TIME)
        const web3 = new SA.nodeModules.web3(URI)
        const contractInst = new web3.eth.Contract(ABI, contractAddress)
        let balance = 0
    
        try {
            balance = await contractInst.methods.balanceOf(walletAddress).call()
            balance = parseFloat(web3.utils.fromWei(balance, 'ether'))
        } catch (err) {
            SA.logger.warn(`Failed to obtain ${chain} wallet balance for User Profile: ${userProfile.name}, Error: ${err.message}`)
        }
    
        return balance
    }
}
