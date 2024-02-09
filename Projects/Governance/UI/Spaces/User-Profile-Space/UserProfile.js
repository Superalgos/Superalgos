function newGovernanceUserProfileSpace() {
    const MODULE_NAME = 'User Profile Space'

    let thisObject = {
        githubStars: undefined,
        githubWatchers: undefined,
        githubForks: undefined,
        container: undefined,
        waitingForResponses: undefined,
        reputationByAddress: undefined,
        physics: physics,
        draw: draw,
        getContainer: getContainer,
        getRewardedTimeRange: getRewardedTimeRange,
        reset: reset,
        finalize: finalize,
        initialize: initialize
    }

    //const BSC_SCAN_RATE_LIMIT_DELAY = 6000 * 6
    const SATokenList = UI.projects.governance.globals.saToken.SA_TOKEN_LIST
    let loadInProgress

    return thisObject

    function initialize() {
        /*
        If the workspace is not related to governance, then we exit the Initialize Function
        */
        let governanceProject = UI.projects.workspaces.spaces.designSpace.workspace.getProjectHeadByNodeType('Governance Project')
        if (governanceProject === undefined) { return }
        /*
        Here we will run the distribution process, that in turn will run all the programs.
        */
        UI.projects.governance.functionLibraries.distributionProcess.initialize()
        /*
        Here we will get a list of all github usernames who have a star or fork and are watching the
        Superalgos Repository. This will later be used to know which user profiles are participating
        at the Github Program. 
        */
        thisObject.githubStars = new Map()
        thisObject.githubWatchers = new Map()
        thisObject.githubForks = new Map()

        /* Bitcoin Factory Computing Program Test Cases per User */
        thisObject.executedTestCases = new Map()

        thisObject.container = newContainer()
        thisObject.container.initialize(MODULE_NAME)
        thisObject.container.isDraggeable = false

        /* Set the number of blockchains for which reputation transactions need to be loaded */
        thisObject.waitingForResponses = SATokenList.length
        thisObject.reputationByAddress = new Map()

        /*
        We are going to collapse all User rootNodes to save processing resources at the UI
        */
        let rootNodes = UI.projects.workspaces.spaces.designSpace.workspace.workspaceNode.rootNodes

        for (let i = 0; i < rootNodes.length; i++) {
            let rootNode = rootNodes[i]
            if (rootNode.payload === undefined) { continue }
            if (rootNode.payload.floatingObject.isCollapsed !== true) {
                rootNode.payload.floatingObject.collapseToggle()
            }
        }
        let userProfiles = UI.projects.workspaces.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('User Profile')

        /* Sort user profiles alphabetically so they become easier to find in the Governance Workspace */
        userProfiles.sort((a, b) => {
            let na = a.name.toLowerCase()
            let nb = b.name.toLowerCase()

            if (na < nb) { return -1 }
            if (na > nb) { return 1  }
            return 0
        })

        // Initialise the isLoading parameter for each User Profile
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.payload.isLoading === undefined) {
                userProfile.payload.isLoading = true
            }
        }
        /*
        let pools = UI.projects.workspaces.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('Pools')
        let assets = UI.projects.workspaces.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('Assets')
        let features = UI.projects.workspaces.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('Features')
        let positions = UI.projects.workspaces.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('Positions')
        */
        const SPACE_WIDTH = UI.projects.foundations.spaces.floatingSpace.container.frame.width
        const SPACE_HEIGHT = UI.projects.foundations.spaces.floatingSpace.container.frame.height

        arrangeNodes(userProfiles, SPACE_HEIGHT * 0.280, 4800, 6)
        /*
        arrangeNodes(pools, SPACE_HEIGHT * 0.570, 0, 1)
        arrangeNodes(features, SPACE_HEIGHT * 0.620, 0, 1)
        arrangeNodes(positions, SPACE_HEIGHT * 0.660, 0, 1)
        arrangeNodes(assets, SPACE_HEIGHT * 0.735, 3800, 4)
        */

        function arrangeNodes(nodes, yLevel, yStep, rows) {
            /*
            Here we will change the Y position of all profiles so that they are all at the same level.
            */
            const X_STEP = SPACE_WIDTH / (nodes.length + 1 + 1 * rows) * rows

            let xOffset = X_STEP
            let yOffset = 0

            let xStepCount = 0
            for (let i = 0; i < nodes.length; i++) {
                nodes[i].payload.floatingObject.container.frame.position.x = xOffset
                xStepCount++
                if (xStepCount === rows) {
                    xOffset = xOffset + X_STEP
                    xStepCount = 0
                }
            }
            for (let i = 0; i < nodes.length; i++) {
                nodes[i].payload.floatingObject.container.frame.position.y = yLevel + yOffset
                switch (true) {
                    case (yOffset === 0): {
                        yOffset = yStep
                        break
                    }
                    case (yOffset === yStep): {
                        yOffset = yStep * 2
                        break
                    }
                    case (yOffset === yStep * 2): {
                        yOffset = yStep * 3
                        break
                    }
                    case (yOffset === yStep * 3): {
                        yOffset = yStep * 4
                        break
                    }
                    case (yOffset === yStep * 4): {
                        yOffset = yStep * 5
                        break
                    }
                    case (yOffset === yStep * 5): {
                        yOffset = 0
                        break
                    }
                }
            }
        }
        /*
        Here we will setup the Reputation for each profile. 
        */
        getTreasuryAccountTransactions()

        function getTreasuryAccountTransactions() {
            UI.projects.foundations.spaces.cockpitSpace.setStatus('Loading reputation transactions from blockchain...', 1500, UI.projects.foundations.spaces.cockpitSpace.statusTypes.ALL_GOOD)
            for (const token of SATokenList) {
                let url = ''
                switch(token["chain"]) {
                    case 'BSC':
                        url = "https://api.bscscan.com/api?module=account&action=tokentx&address=" + token["treasuryAccountAddress"] + "&startblock=0"
                        break
                    case 'ETH':
                        url = "https://api.etherscan.io/api?module=account&action=tokentx&address=" + token["treasuryAccountAddress"] + "&startblock=0"
                        break
                    case 'ZKS':
                        url = "https://block-explorer-api.mainnet.zksync.io/address/" + token["treasuryAccountAddress"] + "/transfers?limit=50"
                        break
                    /*
                    THE FOLLOWING CHAINS ARE FOR TESTING PURPOSES ONLY - CODE MUST NOT BE ACTIVE IN LIVE USAGE
                    case 'ZKT':
                        url = "https://block-explorer-api.testnets.zksync.dev/address/" + token["treasuryAccountAddress"] + "/transfers?limit=50"
                        break               
                    case 'GOERLI':
                        url = "https://api-goerli.etherscan.io/api?module=account&action=tokentx&address=" + token["treasuryAccountAddress"] + "&startblock=0"
                        break      
                    */
                    default:
                        console.log((new Date()).toISOString(), '[WARN] Reputation history cannot be obtained for chain ' + token["chain"] + ' - no data source configured')
                        thisObject.waitingForResponses--
                        continue
                }
                fetchTransactionHistory(url, token)
            }
            
            function fetchTransactionHistory(url, token) {
                fetch(url).then(function (response) {
                    return response.json();
                }).then(function (data) {

                    if (token["chain"] === 'BSC' || token["chain"] === 'ETH') {
                        /* Handle output of Etherscan forks */
                        let tokenTransfers = data.result
                        for (let i = 0; i < tokenTransfers.length; i++) {
                            let transfer = tokenTransfers[i]
    
                            if (transfer.contractAddress !== token["contractAddress"]) { continue }
                            if (transfer.from !== token["treasuryAccountAddress"]) { continue }
    
                            let currentReputation = Number(transfer.value) / token["decimalFactor"]
                            addToReputation(transfer.to, currentReputation)
                        }
                        //console.log((new Date()).toISOString(), '[INFO] tokenTransfers = ' + JSON.stringify(tokenTransfers))
                        if (tokenTransfers.length > 9000) {
                            console.log((new Date()).toISOString(), '[WARN] The total amount of ' + token["chain"] + 'Token transfers is above 9000. After 10k this method will need pagination or otherwise users will not get their reputation calculated correctly.')
                        } else {
                            console.log((new Date()).toISOString(), '[INFO] ' + tokenTransfers.length + ' reputation transactions found on the ' + token["chain"] + ' blockchain. ')
                        }
                        thisObject.waitingForResponses--
                    
                    } else if (token["chain"] === 'ZKS' || token["chain"] === 'ZKT') {
                        /* Handle output of zkSync block explorer */
                        let tokenTransfers = data.items
                        for (let i = 0; i < tokenTransfers.length; i++) {
                            let transfer = tokenTransfers[i]

                            if (transfer.tokenAddress !== token["contractAddress"]) { continue }
                            if (transfer.from.toLowerCase() !== token["treasuryAccountAddress"].toLowerCase()) { continue }
                            if (transfer.type !== 'transfer') { continue }
                            if (transfer.from === transfer.to) { continue }

                            let currentReputation = Number(transfer.amount) / token["decimalFactor"]
                            addToReputation(transfer.to, currentReputation)
                        }
                        /* Check for further result pages and paginate if needed */
                        if (data.links.next !== undefined && data.links.next !== '') {
                            /* console.log((new Date()).toISOString(), '[DEBUG] Further reputation result page available on ' + token["chain"] + ', paginating...') */
                            let newurl = ''
                            switch(token["chain"]) {
                                case 'ZKS':
                                    newurl = "https://block-explorer-api.mainnet.zksync.io/" + data.links.next
                                    break
                                case 'ZKT':
                                    newurl = "https://block-explorer-api.testnets.zksync.dev/" + data.links.next
                                    break
                            }
                            fetchTransactionHistory(newurl, token)
                        } else {
                            console.log((new Date()).toISOString(), '[INFO] ' + data.meta.totalItems + ' reputation transactions found on the ' + token["chain"] + ' blockchain. ')
                            thisObject.waitingForResponses--
                        }
                    }
                }).catch(function (err) {
                    const message = err.message + ' - ' + 'Can not access ' + token["chain"] + 'SCAN servers.'
                    console.log(message)
                    thisObject.waitingForResponses--
                });
            }

            function addToReputation(walletAddress, reputation) {
                let previousReputation = thisObject.reputationByAddress.get(walletAddress.toLowerCase())
                if (previousReputation === undefined) { previousReputation = 0 }
                let newReputation = previousReputation + reputation
                thisObject.reputationByAddress.set(walletAddress.toLowerCase(), newReputation)
            }
        }
        /* 
        Obtain executed Bitcoin Factory test cases 
        */
        getExecutedTestCases()
        function getExecutedTestCases() {
            const [firstTimestamp, lastTimestamp] = getRewardedTimeRange()
            let request = {
                url: 'GOV',
                params: {
                    method: "getRewardsFile",
                    firstTimestamp: firstTimestamp,
                    lastTimestamp: lastTimestamp
                }
            }
            //UI.projects.foundations.spaces.cockpitSpace.setStatus('Parsing Bitcoin Factory Governance Rewards Data', 1500, UI.projects.foundations.spaces.cockpitSpace.statusTypes.ALL_GOOD)
            httpRequest(JSON.stringify(request.params), request.url, onResponse)

            function onResponse(err, data) {
                if (err.result === GLOBAL.DEFAULT_FAIL_RESPONSE) {
                    console.log((new Date()).toISOString(), '[WARN] Error fetching executed test cases from Bitcoin Factory Server')
                    return
                } else {
                    let response = JSON.parse(data)
                    if (response.result === 'Not Ok') {
                        console.log((new Date()).toISOString(), '[WARN] Error fetching executed test cases from Bitcoin Factory Server - ./Bitcoin-Factory/Reports/Testnet*.csv')
                        return
                    }

                    let executedTests = response.executedTests

                    for (let user in executedTests) {
                        if (executedTests.hasOwnProperty(user)) {
                            thisObject.executedTestCases.set(user, executedTests[user])
                        }
                    }
                }
            }
        }
        /* 
        Find the Github Username and Token in order to activate the Github Program 
        */
        let apisNode = UI.projects.workspaces.spaces.designSpace.workspace.getHierarchyHeadByNodeType('APIs')
        if (apisNode === undefined) {
            console.log((new Date()).toISOString(), '[WARN] Github Program Disabled because the Github Credentials are not present at this workspace. APIs node not found.')
            return
        }
        if (apisNode.githubAPI === undefined) {
            console.log((new Date()).toISOString(), '[WARN] Github Program Disabled because the Github Credentials are not present at this workspace. Github API node not found.')
            return
        }

        let config = JSON.parse(apisNode.githubAPI.config)
        if (config.username === undefined || config.username === "") {
            console.log((new Date()).toISOString(), '[WARN] Github Program Disabled because the Github Credentials are not present at this workspace. Github Username not configured.')
            return
        }
        if (config.token === undefined || config.token === "") {
            console.log((new Date()).toISOString(), '[WARN] Github Program Disabled because the Github Credentials are not present at this workspace. Github Token not configured.')
            return
        }
        /*
        Here we will help setup the Github Programs...
        */
        requestStars()

        function requestStars() {

            let params = {
                method: 'getGithubStars',
                repository: 'Superalgos',
                username: config.username,
                token: config.token
            }

            let url = 'GOV' // We will access the default Client GOV endpoint.

            httpRequest(JSON.stringify(params), url, onResponse)

            function onResponse(err, data) {

                /* Lets check the result of the call through the http interface */
                if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    console.log((new Date()).toISOString(), '[ERROR] Call via HTTP Interface failed. err.stack = ' + err.stack)
                    console.log((new Date()).toISOString(), '[ERROR] params = ' + JSON.stringify(params))
                    return
                }

                let response = JSON.parse(data)

                /* Lets check the result of the method call */
                if (response.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    console.log((new Date()).toISOString(), '[ERROR] Call to Client Github Server failed. err.stack = ' + err.stack)
                    console.log((new Date()).toISOString(), '[ERROR] params = ' + JSON.stringify(params))
                    console.log((new Date()).toISOString(), '[ERROR] response = ' + JSON.stringify(response))
                    return
                }

                /* Successful Call */

                let githubStarsArray = response.githubListArray

                for (let i = 0; i < githubStarsArray.length; i++) {
                    let githubUsername = githubStarsArray[i]
                    thisObject.githubStars.set(githubUsername, 1)
                }

                requestWatchers()
            }
        }

        function requestWatchers() {

            let params = {
                method: 'getGithubWatchers',
                repository: 'Superalgos',
                username: config.username,
                token: config.token
            }

            let url = 'GOV' // We will access the default Client GOV endpoint.

            httpRequest(JSON.stringify(params), url, onResponse)

            function onResponse(err, data) {

                /* Lets check the result of the call through the http interface */
                if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    console.log((new Date()).toISOString(), '[ERROR] Call via HTTP Interface failed. err.stack = ' + err.stack)
                    console.log((new Date()).toISOString(), '[ERROR] params = ' + JSON.stringify(params))
                    return
                }

                let response = JSON.parse(data)

                /* Lets check the result of the method call */
                if (response.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    console.log((new Date()).toISOString(), '[ERROR] Call to Client Github Server failed. err.stack = ' + err.stack)
                    console.log((new Date()).toISOString(), '[ERROR] params = ' + JSON.stringify(params))
                    console.log((new Date()).toISOString(), '[ERROR] response = ' + JSON.stringify(response))
                    return
                }

                /* Successful Call */

                let githubWatchersArray = response.githubListArray

                for (let i = 0; i < githubWatchersArray.length; i++) {
                    let githubUsername = githubWatchersArray[i]
                    thisObject.githubWatchers.set(githubUsername, 1)
                }

                requestForks()
            }
        }

        function requestForks() {

            let params = {
                method: 'getGithubForks',
                repository: 'Superalgos',
                username: config.username,
                token: config.token
            }

            let url = 'GOV' // We will access the default Client GOV endpoint.

            httpRequest(JSON.stringify(params), url, onResponse)

            function onResponse(err, data) {

                /* Lets check the result of the call through the http interface */
                if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    console.log((new Date()).toISOString(), '[ERROR] Call via HTTP Interface failed. err.stack = ' + err.stack)
                    console.log((new Date()).toISOString(), '[ERROR] params = ' + JSON.stringify(params))
                    return
                }

                let response = JSON.parse(data)

                /* Lets check the result of the method call */
                if (response.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    console.log((new Date()).toISOString(), '[ERROR] Call to Client Github Server failed. err.stack = ' + err.stack)
                    console.log((new Date()).toISOString(), '[ERROR] params = ' + JSON.stringify(params))
                    console.log((new Date()).toISOString(), '[ERROR] response = ' + JSON.stringify(response))
                    return
                }

                /* Successful Call */

                let githubForksArray = response.githubListArray

                for (let i = 0; i < githubForksArray.length; i++) {
                    let githubUsername = githubForksArray[i]
                    thisObject.githubForks.set(githubUsername, 1)
                }
            }
        }
    }

    function getRewardedTimeRange() {
        /* Obtains timestamps from first and last day of previous month */
        let date = new Date()
        let firstOfMonth = Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1)
        let endOfMonth = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 0, 23, 59, 59, 999)
        let fom = new Date(firstOfMonth)
        let eom = new Date(endOfMonth)
        fomTimestamp = fom.getTime()
        eomTimestamp = eom.getTime()

        return [fomTimestamp, eomTimestamp]
    }


    function finalize() {

        UI.projects.governance.functionLibraries.distributionProcess.finalize()

        thisObject.githubStars = undefined
        thisObject.githubWatchers = undefined
        thisObject.githubForks = undefined
        thisObject.executedTestCases = undefined
        thisObject.waitingForResponses = undefined
        thisObject.reputationByAddress = undefined

        if (thisObject.container !== undefined) {
            thisObject.container.finalize()
            thisObject.container = undefined
        }
    }

    function reset() {
        /* Do not re-initialize while the load of balances is in progress */
        if (loadInProgress) {
            setTimeout(reset, 100)
            return
        }
        finalize()
        initialize()
    }

    function getContainer(point) {

        return undefined // since this space does not draw anything we return here

        if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            thisObject.container.space = MODULE_NAME
            return thisObject.container
        } else {
            return undefined
        }
    }

    function physics() {

        if (UI.projects.workspaces.spaces.designSpace.workspace === undefined) { return }
        /*
        If the workspace is not related to governance, then we exit the Initialize Function
        */
        let governanceProject = UI.projects.workspaces.spaces.designSpace.workspace.getProjectHeadByNodeType('Governance Project')
        if (governanceProject === undefined) { return }
        /*
        Load the user profiles with Token Power.
        */
        let userProfiles = UI.projects.workspaces.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('User Profile')
        /*
        Check for information which needs to be present before drawing the workspace to prevent hangups.
        */
        if (thisObject.waitingForResponses !== 0) { return } 
        /*
        We will get all the user Profiles tokens from the blockchain, making a call
        every 5 seconds so as not to exceed the rate limit.
        */
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]
            if (userProfile.payload === undefined) { continue }

            if (userProfile.payload.bloackchainBalancesLoading === true) {
                userProfile.payload.isLoading = true
                return
            }

            if (userProfile.payload.blockchainTokens === undefined) {
                userProfile.payload.bloackchainBalancesLoading = true
                userProfile.payload.isLoading = true
                UI.projects.foundations.spaces.cockpitSpace.setStatus('Loading blockchain balances for User Profile # ' + (i + 1) + ' / ' + userProfiles.length, 1500, UI.projects.foundations.spaces.cockpitSpace.statusTypes.ALL_GOOD)

                getBlockchainAccount(userProfile)
                return
            }
        }

        function getBlockchainAccount(userProfile) {
            let signature = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(userProfile.payload, 'signature')
            if (signature === undefined || signature === "") { return }

            let request = {
                url: 'WEB3',
                params: {
                    method: "recoverAddress",
                    signature: JSON.stringify(signature)
                }
            }

            httpRequest(JSON.stringify(request.params), request.url, onResponse)

            function onResponse(err, data) {

                /* Lets check the result of the call through the http interface */
                if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    userProfile.payload.uiObject.setErrorMessage(
                        'Call via HTTP Interface failed.',
                        UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                    )
                    return
                }

                let response = JSON.parse(data)

                /* Lets check the result of the method call */
                if (response.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    userProfile.payload.uiObject.setErrorMessage(
                        'Call to WEB3 Server failed. ' + response.error,
                        UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                    )
                    console.log('Call to WEB3 Server failed. ' + response.error)
                    return
                }

                let blockchainAccount = response.address
                userProfile.payload.blockchainAccount = blockchainAccount
                if (
                    blockchainAccount !== undefined &&
                    blockchainAccount !== "" &&
                    userProfile.payload.blockchainTokens === undefined
                ) {
                    /* Obtain balance for each asset/liquidity pool configured in SaToken.js */
                    let initValues = {}
                    let liquidityProgramList = UI.projects.governance.globals.saToken.SA_TOKEN_LIQUIDITY_POOL_LIST
                    for (let liqProgram of liquidityProgramList) {
                        let assetExchange = liqProgram['pairedAsset'] + "-" + liqProgram['exchange']
                        initValues[assetExchange] = 0
                    }
                    userProfile.payload.liquidityTokens = initValues                    
                    
                    for (let liqProgram of liquidityProgramList) {
                        getLiquidityTokenBalance(userProfile, blockchainAccount, liqProgram['chain'], liqProgram['pairedAsset'], liqProgram['exchange'], liqProgram['contractAddress'])
                    }

                    /* 
                    Now we get the SA Tokens Balance.
                    */
                    getBlockchainTokens(userProfile, blockchainAccount)
                }
            }
        }

        function getBlockchainTokens(userProfile, blockchainAccount) {
            loadInProgress = true
            console.log((new Date()).toISOString(), '[INFO] Loading Blockchain Balance for User Profile: ', userProfile.name, 'blockchainAccount: ', blockchainAccount)
            let blockchainTokenTotal = 0
            let receivedResults = 0
            let queryError = false

            for (const token of SATokenList) {
                let request = {
                    url: 'WEB3',
                    params: {
                        method: "getUserWalletBalance",
                        chain: token["chain"],
                        walletAddress: blockchainAccount,
                        contractAddress: token["contractAddress"]
                    }
                }
    
                httpRequest(JSON.stringify(request.params), request.url, onResponse)
    
                function onResponse(err, data) {
                    receivedResults++

                    if (err.result === GLOBAL.DEFAULT_FAIL_RESPONSE) {
                        console.log((new Date()).toISOString(), '[WARN] Error fetching blockchain tokens of user profile ' + userProfile.name + ' on chain ' + token["chain"])
                        queryError = true

                    } else {
                        let commandResponse = JSON.parse(data)
                        if (commandResponse.result !== "Ok") {
                            console.log((new Date()).toISOString(), '[WARN] Web3 Error fetching blockchain tokens of user profile ' + userProfile.name + ' on chain ' + token["chain"])
                            queryError = true
                            return
                        }
                        blockchainTokenTotal = blockchainTokenTotal + Number(commandResponse.balance)
                        /* console.log((new Date()).toISOString(), '[DEBUG] Blockchain tokens of user profile ' + userProfile.name + ' on chain ' + token["chain"] + ': ' + commandResponse.balance) */
                    }
                    if (receivedResults === SATokenList.length) {
                        if (queryError === false) {
                            userProfile.payload.blockchainTokens = blockchainTokenTotal
                            userProfile.payload.uiObject.setInfoMessage('Blockchain Balance Successfully Loaded.', UI.projects.governance.globals.designer.SET_INFO_COUNTER_FACTOR)
                            console.log((new Date()).toISOString(), '[INFO] Total SA Balance of ' + userProfile.name + ' on all chains is ', userProfile.payload.blockchainTokens)
                            userProfile.payload.reputation = Math.min(thisObject.reputationByAddress.get(blockchainAccount.toLowerCase()) | 0, userProfile.payload.blockchainTokens)
                            console.log((new Date()).toISOString(), '[INFO] Reputation of ' + userProfile.name + ' is ', userProfile.payload.reputation)
                        } else {
                            userProfile.payload.blockchainTokens = undefined
                            console.log((new Date()).toISOString(), '[WARN] SA Balance of ' + userProfile.name + ' has not been loaded successfully')
                        }
                        userProfile.payload.bloackchainBalancesLoading = false
                        userProfile.payload.isLoading = false
                        loadInProgress = false
                    }
                }
            }


        }

        function getLiquidityTokenBalance(userProfile, blockchainAccount, chain, asset, exchange, marketContract) {
            let assetExchange = asset + "-" + exchange
            let request = {
                url: 'WEB3',
                params: {
                    method: "getUserWalletBalance",
                    chain: chain,
                    walletAddress: blockchainAccount,
                    contractAddress: marketContract
                }
            }

            httpRequest(JSON.stringify(request.params), request.url, onResponse)

            function onResponse(err, data) {
                if (err.result === GLOBAL.DEFAULT_FAIL_RESPONSE) {
                    console.log((new Date()).toISOString(), '[WARN] Error fetching ' + exchange + ' liquidity tokens for asset ' + asset + ' of user profile ' + userProfile.name)
                    userProfile.payload.blockchainTokens = undefined
                } else {
                    let commandResponse = JSON.parse(data)
                    if (commandResponse.result !== "Ok") {
                        console.log((new Date()).toISOString(), '[WARN] Web3 Error fetching ' + exchange + ' liquidity tokens for asset ' + asset + ' of user profile ' + userProfile.name)
                        return
                    }
                    console.log((new Date()).toISOString(), '[INFO]', exchange, 'Liquidity of', userProfile.name, 'for asset', asset, 'is ', Number(commandResponse.balance))
                    userProfile.payload.liquidityTokens[assetExchange] = Number(commandResponse.balance)
                    userProfile.payload.uiObject.setInfoMessage('Balance Successfully Loaded for asset ' + asset,
                        UI.projects.governance.globals.designer.SET_INFO_COUNTER_FACTOR
                    )
                }
            }
        }

    }

    function draw() {

    }
}
