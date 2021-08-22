function newGovernanceUserProfileSpace() {
    const MODULE_NAME = 'User Profile Space'

    let thisObject = {
        githubStars: undefined,
        githubWatchers: undefined,
        githubForks: undefined,
        container: undefined,
        physics: physics,
        draw: draw,
        getContainer: getContainer,
        reset: reset,
        finalize: finalize,
        initialize: initialize
    }

    let waitingForResponses = 0
    let timer = 0
    const BSC_SCAN_RATE_LIMIT_DELAY = 7000
    let reputationByAddress = new Map()

    return thisObject

    function initialize() {
        /*
        Here we will get a list of all github usernames who have a star or fork and are watching the
        Superalgos Repository. This will later be used to know which user profiles are participating
        at the Github Program. 
        */
        thisObject.githubStars = new Map()
        thisObject.githubWatchers = new Map()
        thisObject.githubForks = new Map()

        thisObject.container = newContainer()
        thisObject.container.initialize(MODULE_NAME)
        thisObject.container.isDraggeable = false
        /*
        If the workspace is not related to governance, then we exit the Intialize Function
        */
        let resultsArary = UI.projects.foundations.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('User Profile')
        if (resultsArary.length === 0) { return }

        /*
        Here we will setup the Reputation for each profile. 
        */
        timer = timer + BSC_SCAN_RATE_LIMIT_DELAY
        waitingForResponses++
        getTreasuryAccountTransactions()

        function getTreasuryAccountTransactions() {
            const url = "https://api.bscscan.com/api?module=account&action=tokentx&address=" + UI.projects.governance.globals.saToken.SA_TOKEN_BSC_TREASURY_ACCOUNT_ADDRESS + "&startblock=0"

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (data) {

                let tokenTransfers = data.result
                for (let i = 0; i < tokenTransfers.length; i++) {
                    let transfer = tokenTransfers[i]

                    if (transfer.contractAddress !== UI.projects.governance.globals.saToken.SA_TOKEN_BSC_CONTRACT_ADDRESS) { continue }
                    if (transfer.from !== UI.projects.governance.globals.saToken.SA_TOKEN_BSC_TREASURY_ACCOUNT_ADDRESS) { continue }

                    let currentReputation = Number(transfer.value) / UI.projects.governance.globals.saToken.SA_TOKEN_BSC_DECIMAL_FACTOR
                    let previousReputation = reputationByAddress.get(transfer.to)
                    let newReputation = previousReputation | 0 + currentReputation
                    reputationByAddress.set(transfer.to, newReputation)
                }
                if (tokenTransfers.length > 9000) {
                    console.log('[WARN] The total amount of BSC SA Token transfers is above 9000. After 10k this method will need pagination or otherwise users will not get their reputation calculated correctly.')
                } else {
                    console.log('[INFO] ' + tokenTransfers.length + ' reputation trasactions found at the blockchain. ')
                }
                waitingForResponses--
            }).catch(function (err) {
                const message = err.message + ' - ' + 'Can not access BSC SCAN servers.'
                console.log(message)
                waitingForResponses--
            });
        }

        /* Find the Github Username and Token in order to activate the Github Program */

        let apisNode = UI.projects.foundations.spaces.designSpace.workspace.getHierarchyHeadByNodeType('APIs')
        if (apisNode === undefined) {
            console.log('[WARN] Github Program Disabled because the Github Credentials are not present at this workspace. APIs node not found.')
            return
        }
        if (apisNode.githubAPI === undefined) {
            console.log('[WARN] Github Program Disabled because the Github Credentials are not present at this workspace. Github API node not found.')
            return
        }

        let config = JSON.parse(apisNode.githubAPI.config)
        if (config.username === undefined || config.username === "") {
            console.log('[WARN] Github Program Disabled because the Github Credentials are not present at this workspace. Github Username not configured.')
            return
        }
        if (config.token === undefined || config.token === "") {
            console.log('[WARN] Github Program Disabled because the Github Credentials are not present at this workspace. Github Token not configured.')
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
                    console.log('[ERROR] Call via HTTP Interface failed. err.stack = ' + err.stack)
                    console.log('[ERROR] params = ' + JSON.stringify(params))
                    return
                }

                let response = JSON.parse(data)

                /* Lets check the result of the method call */
                if (response.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    console.log('[ERROR] Call to Client Github Server failed. err.stack = ' + err.stack)
                    console.log('[ERROR] params = ' + JSON.stringify(params))
                    console.log('[ERROR] response = ' + JSON.stringify(response))
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
                    console.log('[ERROR] Call via HTTP Interface failed. err.stack = ' + err.stack)
                    console.log('[ERROR] params = ' + JSON.stringify(params))
                    return
                }

                let response = JSON.parse(data)

                /* Lets check the result of the method call */
                if (response.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    console.log('[ERROR] Call to Client Github Server failed. err.stack = ' + err.stack)
                    console.log('[ERROR] params = ' + JSON.stringify(params))
                    console.log('[ERROR] response = ' + JSON.stringify(response))
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
                    console.log('[ERROR] Call via HTTP Interface failed. err.stack = ' + err.stack)
                    console.log('[ERROR] params = ' + JSON.stringify(params))
                    return
                }

                let response = JSON.parse(data)

                /* Lets check the result of the method call */
                if (response.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    console.log('[ERROR] Call to Client Github Server failed. err.stack = ' + err.stack)
                    console.log('[ERROR] params = ' + JSON.stringify(params))
                    console.log('[ERROR] response = ' + JSON.stringify(response))
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

    function finalize() {
        thisObject.githubStars = undefined
        thisObject.githubWatchers = undefined
        thisObject.githubForks = undefined

        thisObject.container.finalize()
        thisObject.container = undefined
    }

    function reset() {
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
        if (UI.projects.foundations.spaces.designSpace.workspace === undefined) { return }
        /*
        Here we will run the distribution process, that in turn will run all the programs.
        */
        UI.projects.governance.functionLibraries.distributionProcess.calculate()
        /*
        Load the user profiles with Token Power.
        */
        let userProfiles = UI.projects.foundations.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('User Profile')
        if (waitingForResponses !== 0) { return }
        /*
        We will get all the user Profiles tokens from the blockchain, making a call
        every 5 seconds so as not to exceed the rate limit.
        */
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]
            if (userProfile.payload === undefined) { continue }

            if (userProfile.payload.blockchainTokens === undefined) {
                getBlockchainAccount(userProfile)
            }
        }


        function getBlockchainAccount(userProfile) {
            let signature = UI.projects.foundations.utilities.nodeConfig.loadConfigProperty(userProfile.payload, 'signature')
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
                    userProfile.payload.uiObject.setErrorMessage('Call via HTTP Interface failed.')
                    return
                }

                let response = JSON.parse(data)

                /* Lets check the result of the method call */
                if (response.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    userProfile.payload.uiObject.setErrorMessage('Call to WEB3 Server failed. ' + response.error)
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
                    waitingForResponses++
                    userProfile.payload.blockchainTokens = 0 // We need to set this value here so that the next call to BSCSCAN is not done more than once.
                    setTimeout(getBlockchainTokens, timer, userProfile, blockchainAccount)
                    timer = timer + BSC_SCAN_RATE_LIMIT_DELAY
                }
            }
        }

        function getBlockchainTokens(userProfile, blockchainAccount) {
            console.log('blockchainAccount ', blockchainAccount)
            const url = "https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=" + UI.projects.governance.globals.saToken.SA_TOKEN_BSC_CONTRACT_ADDRESS + "&address=" + blockchainAccount + "&tag=latest&apikey=YourApiKeyToken"

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (data) {
                console.log(data)
                userProfile.payload.uiObject.setInfoMessage(data)
                userProfile.payload.blockchainTokens = Number(data.result) / 1000000000000000000
                userProfile.payload.reputation = Math.min(reputationByAddress.get(blockchainAccount.toLowerCase()) | 0, userProfile.payload.blockchainTokens)
                waitingForResponses--
            }).catch(function (err) {
                const message = err.message + ' - ' + 'Can not access BSC SCAN servers.'
                console.log(message)
                userProfile.payload.uiObject.setErrorMessage(message, 1000)
                waitingForResponses--
            });
        }
    }

    function draw() {

    }
}
