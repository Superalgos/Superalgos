function newGovernanceReportsCommmandInterface() {
    let thisObject = {
        command: undefined,
        detectCommands: detectCommands,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function initialize() {

    }

    function finalize() {

    }

    function detectCommands() {
        if (detectGovCommands() === true) { return }

        /* If we can not detect any gov or docs commands, then we assume the users is typing a filter */
    }

    function detectGovCommands() {
        if (checkPRsCommand() === undefined) { return true }
        if (checkUserUpdateCommand() === undefined) { return true }
        if (checkPayCommand() === undefined) { return true }

        function checkPRsCommand() {

            let command = UI.projects.governance.spaces.reportsSpace.commandInterface.command.toLowerCase()
            if (command === 'gov.help gov.prs') {
                UI.projects.education.spaces.docsSpace.navigateTo('Governance', 'Topic', 'Gov PRs Command')
                return
            }
            if (command.indexOf('gov.prs') !== 0) { return 'Not PRs Commands' }

            /* Set up the commit message */
            let message = command.trim().substring(command.indexOf(' ') + 1, command.length)
            if (message.toLowerCase() === 'gov.prs') {
                message = 'Automated PR merging process.'
            }

            /* Closing the Governance Tab */
            UI.projects.governance.spaces.reportsSpace.sidePanelTab.close()
            UI.projects.education.spaces.docsSpace.sidePanelTab.open()

            /* Find the Username and Password */
            let apisNode = UI.projects.workspaces.spaces.designSpace.workspace.getHierarchyHeadByNodeType('APIs')
            if (apisNode === undefined) {
                UI.projects.education.spaces.docsSpace.navigateTo('Governance', 'Topic', 'Gov Error - Github Credentials Missing', 'Anchor Github Credentials Missing')
                return
            }
            if (apisNode.githubAPI === undefined) {
                UI.projects.education.spaces.docsSpace.navigateTo('Governance', 'Topic', 'Gov Error - Github Credentials Missing', 'Anchor Github Credentials Missing')
                return
            }

            let config = JSON.parse(apisNode.githubAPI.config)
            if (config.username === undefined || config.username === "") {
                UI.projects.education.spaces.docsSpace.navigateTo('Governance', 'Topic', 'Gov Error - Github Credentials Missing', 'Anchor Github Credentials Missing')
                return
            }
            if (config.token === undefined || config.token === "") {
                UI.projects.education.spaces.docsSpace.navigateTo('Governance', 'Topic', 'Gov Error - Github Credentials Missing', 'Anchor Github Credentials Missing')
                return
            }

            UI.projects.education.spaces.docsSpace.navigateTo('Governance', 'Topic', 'Gov Message - Processing Pull Requests')

            message = message.replaceAll('#', '_HASHTAG_')
            message = message.replaceAll('/', '_SLASH_')

            /* Lets execute this command against the Client */

            let params = {
                method: 'mergePullRequests',
                commitMessage: message,
                username: config.username,
                token: config.token
            }

            let url = 'GOV' // We will access the default Client GOV endpoint.

            httpRequest(JSON.stringify(params), url, onResponse)

            function onResponse(err, data) {

                /* Lets check the result of the call through the http interface */
                if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    console.log((new Date()).toISOString(), '[ERROR] Call via HTTP Interface failed.' + err.stack)
                    console.log((new Date()).toISOString(), '[ERROR] Params = ' + JSON.stringify(params))
                    return
                }

                let response = JSON.parse(data)

                /* Lets check the result of the method call */
                if (response.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    console.log((new Date()).toISOString(), '[ERROR] Call to Client Github Server failed.' + err.stack)
                    console.log((new Date()).toISOString(), '[ERROR] Params = ' + JSON.stringify(params))
                }

                /* Successful Call */

                if (response.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    UI.projects.education.spaces.docsSpace.navigateTo('Governance', 'Topic', 'Gov Message - Pull Requests Processed')
                } else {
                    UI.projects.education.spaces.docsSpace.navigateTo(
                        response.docs.project,
                        response.docs.category,
                        response.docs.type,
                        response.docs.anchor,
                        undefined,
                        response.docs.placeholder
                    )
                }
            }
        }

        function checkUserUpdateCommand() {

            let command = UI.projects.governance.spaces.reportsSpace.commandInterface.command.toLowerCase()

            if (command === 'gov.help gov.userprofile') {
                UI.projects.education.spaces.docsSpace.navigateTo('Governance', 'Topic', 'Gov Contribute User Profile Command')
                return
            }
            if (command.indexOf('gov.userprofile') !== 0 ) { return 'Not User Contribute Commands' }

            /* Set up the commit message */
            let message = command.trim().substring(command.indexOf(' ') + 1, command.length)
            if (message.toLowerCase() === 'gov.userprofile') {
                message = 'Automated Userprofile contribute process.'
            }

            UI.projects.governance.spaces.reportsSpace.sidePanelTab.close()
            UI.projects.education.spaces.docsSpace.sidePanelTab.open()

            /* Find the Username and Password */
            let apisNode = UI.projects.workspaces.spaces.designSpace.workspace.getHierarchyHeadByNodeType('APIs')
            if (apisNode === undefined) {
                UI.projects.education.spaces.docsSpace.navigateTo('Governance', 'Topic', 'Gov Error - Github Credentials Missing', 'Anchor Github Credentials Missing')
                return
            }
            if (apisNode.githubAPI === undefined) {
                UI.projects.education.spaces.docsSpace.navigateTo('Governance', 'Topic', 'Gov Error - Github Credentials Missing', 'Anchor Github Credentials Missing')
                return
            }

            let config = JSON.parse(apisNode.githubAPI.config)
            if (config.username === undefined || config.username === "") {
                UI.projects.education.spaces.docsSpace.navigateTo('Governance', 'Topic', 'Gov Error - Github Credentials Missing', 'Anchor Github Credentials Missing')
                return
            }
            if (config.token === undefined || config.token === "") {
                UI.projects.education.spaces.docsSpace.navigateTo('Governance', 'Topic', 'Gov Error - Github Credentials Missing', 'Anchor Github Credentials Missing')
                return
            }

            message = message.replaceAll('#', '_HASHTAG_')
            message = message.replaceAll('/', '_SLASH_')

            let params = {
                method: 'UserProfile',
                commitMessage: message,
                username: config.username,
                token: config.token,
                currentBranch: UI.projects.education.spaces.docsSpace.currentBranch,
                contributionsBranch: UI.projects.education.spaces.docsSpace.contributionsBranch
            }

            let url = 'GOV' // We will access the default Client GOV endpoint.

            httpRequest(JSON.stringify(params), url, onResponse)
            UI.projects.education.spaces.docsSpace.navigateTo('Governance', 'Topic', 'Gov Message - Starting Automated User Profile Contribution')

            function onResponse(err, data) {
                /* Lets check the result of the call through the http interface */
                data = JSON.parse(data)
                if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result && data.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    UI.projects.education.spaces.docsSpace.navigateTo('Governance', 'Topic', 'Gov Message - Automated User Profile Contribute Done')
                } else {
                    if (data.docs === undefined) {return}
                    UI.projects.education.spaces.docsSpace.navigateTo(
                        data.docs.project,
                        data.docs.category,
                        data.docs.type,
                        data.docs.anchor,
                        undefined,
                        data.docs.placeholder
                    )
                }
            }
        }

        function checkPayCommand() {

            let command = UI.projects.governance.spaces.reportsSpace.commandInterface.command.toLowerCase()
            if (command === 'gov.help gov.pay') {
                UI.projects.education.spaces.docsSpace.navigateTo('Governance', 'Topic', 'Gov Pay Command')
                return
            }
            if (command.indexOf('gov.pay') !== 0) { return 'Not Pay Commands' }

            const commandParams = command.split(' ')
            let blacklistArray = []
            let whitelistArray = []
            /* If present, process parameters to the payments command */
            if (commandParams.length > 1) {
                for (let x = 1; x < commandParams.length; x++) {
                    let paramCommand = commandParams[x].split(':')
                    if (paramCommand[0] === 'blacklist') {
                        blacklistArray = paramCommand[1].split(',')
                    } else if (paramCommand[0] === 'whitelist') {
                        whitelistArray = paramCommand[1].split(',')
                    } else {
                        console.log("Invalid command parameters, not starting distribution")
                        return
                    }
                }
            }
            
            UI.projects.education.spaces.docsSpace.navigateTo('Governance', 'Topic', 'Gov Message - Paying to Contributors')

            /*
            Let's create a list of payments to be made.
            */
            let paymentsArray = []
            let paymentsBlacklist = []
            let paymentsWhitelist = []
            /*
            Here we get from the workspace all User Profiles.
            */
            let userProfiles = UI.projects.workspaces.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('User Profile')
            /*
            Transform the result array into table records.
            */
            let contractAddressDict = {}
            let treasuryAccountDict = {}
            let contractABIDict = {}
            let decimalFactorDict = {}

            for (let j = 0; j < userProfiles.length; j++) {
                let userProfile = userProfiles[j]

                if (userProfile.payload === undefined) { continue }
                if (userProfile.tokensMined === undefined) { continue }
                if (userProfile.tokensMined.payload === undefined) { continue }
                if (userProfile.tokensMined.payload.tokensMined === undefined) { continue }

                let payoutChainDetails = getUserPayoutChainDetails(userProfile)
                if (payoutChainDetails === undefined) {
                    console.log((new Date()).toISOString(), '[ERROR] Unable to determine payout chain for user ' + userProfile.name)
                    continue
                } else {
                    contractAddressDict[payoutChainDetails['chain']] = payoutChainDetails['contractAddress']
                    treasuryAccountDict[payoutChainDetails['chain']] = payoutChainDetails['treasuryAccountAddress']
                    contractABIDict[payoutChainDetails['chain']] = payoutChainDetails['ABI']
                    decimalFactorDict[payoutChainDetails['chain']] = payoutChainDetails['decimalFactor']
                }

                let payment = {
                    "userProfile": userProfile.name,
                    "chain": payoutChainDetails['chain'],
                    "to": userProfile.payload.blockchainAccount,
                    "amount": (userProfile.tokensMined.payload.tokensMined.total | 0) * payoutChainDetails['decimalFactor']
                }

                /* Check if user was present in distribution blacklist or whitelist */
                for (let a = blacklistArray.length - 1; a >= 0; --a) {
                    if (userProfile.name.toLowerCase() === blacklistArray[a].toLowerCase()) {
                        paymentsBlacklist.push(userProfile.name)
                        blacklistArray.splice(a, 1)
                    }
                }
                for (let b = whitelistArray.length - 1; b >= 0; --b) {
                    if (userProfile.name.toLowerCase() === whitelistArray[b].toLowerCase()) {
                        paymentsWhitelist.push(userProfile.name)
                        whitelistArray.splice(b, 1)
                    }                    
                }

                /* Add payment for this user to the list of payments */
                paymentsArray.push(payment)
            }

            /* Validating blacklist / whitelist for plausibility */
            if (blacklistArray.length > 0) {
                console.log("Aborting distribution - Blacklist contained unknown user names: " + blacklistArray)
                return
            }
            if (whitelistArray.length > 0) {
                console.log("Aborting distribution - Blacklist contained unknown user names: " + whitelistArray)
                return
            }
            if (paymentsBlacklist.length > 0 && paymentsWhitelist.length > 0) {
                console.log("Aborting distribution - Blacklist and Whitelist must not be entered simultaneously")
                return
            }

            /* Let's get the Mnemonic */
            let web3API = UI.projects.workspaces.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('APIs')[0].web3API
            let mnemonic = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(web3API.payload, 'mnemonic')

            /* Lets execute this command against the Client */

            let params = {
                method: 'payContributors',
                contractAddressDict: contractAddressDict,
                treasuryAccountDict: treasuryAccountDict,
                contractABIDict: contractABIDict,
                decimalFactorDict: decimalFactorDict,
                paymentsArray: paymentsArray,
                paymentsBlacklist: paymentsBlacklist,
                paymentsWhitelist: paymentsWhitelist,
                mnemonic: mnemonic
            }

            let url = 'GOV' // We will access the default Client GOV endpoint.

            httpRequest(JSON.stringify(params), url, onResponse)

            function onResponse(err, data) {

                /* Lets check the result of the call through the http interface */
                if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    console.log((new Date()).toISOString(), '[ERROR] Call via HTTP Interface failed.' + err.stack)
                    console.log((new Date()).toISOString(), '[ERROR] Params = ' + JSON.stringify(params))
                    return
                }

                let response = JSON.parse(data)

                /* Lets check the result of the method call */
                if (response.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    console.log((new Date()).toISOString(), '[ERROR] Call to Client Github Server failed.' + err.stack)
                    console.log((new Date()).toISOString(), '[ERROR] Params = ' + JSON.stringify(params))
                }

                /* Successful Call */

                if (response.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    UI.projects.education.spaces.docsSpace.navigateTo('Governance', 'Topic', 'Gov Message - Contribution Payments Processed')
                } else {
                    UI.projects.education.spaces.docsSpace.navigateTo(
                        response.docs.project,
                        response.docs.category,
                        response.docs.type,
                        response.docs.anchor,
                        undefined,
                        response.docs.placeholder
                    )
                }
            }

            function getUserPayoutChainDetails(userProfile) {
                let payoutChainDetails = undefined
                if (userProfile === undefined) {
                    return payoutChainDetails
                }

                /* This function will return details for the user-chosen governance reward payout chain in the future. As of now, it always returns the default fallback. */
//                if (payoutChainDetails === undefined) {
                payoutChainDetails = UI.projects.governance.utilities.chains.getDefaultPayoutChainDetails()
//                }
                return payoutChainDetails
            }
        }
    }
}