exports.newNetworkModulesSocketInterfaces = function newNetworkModulesSocketInterfaces() {
    /*
    Here is the common logic for different types of Sockets Interfaces, like
    Web Sockets and Web RTC.
    */
    let thisObject = {
        networkClients: undefined,
        networkPeers: undefined,
        callersMap: undefined,
        userProfilesMap: undefined,
        followerMap: undefined,
        senderMap: undefined,
        onMessage: onMessage,
        onConnectionClosed: onConnectionClosed,
        addFollower: addFollower,
        removeFollower: removeFollower,
        broadcastMessageToClients: broadcastMessageToClients,
        broadcastSignalsToFollowers: broadcastSignalsToFollowers,
        initialize: initialize,
        finalize: finalize
    }
    let intervalId
    let web3

    return thisObject

    function initialize() {
        web3 = new SA.nodeModules.web3()
        thisObject.networkClients = []
        thisObject.networkPeers = []
        thisObject.callersMap = new Map()
        thisObject.userProfilesMap = new Map()
        thisObject.followerMap = new Map()
        thisObject.senderMap = new Map()
        
        /* Testing deactivation of idle connection handling - should be redundant now as we have heartbeats on connection level 
        intervalId = setInterval(cleanIdleConnections, 60 * 1000) // runs every minute
        */
        tokenPowerIntervalId = setInterval(refreshTokenPower, 60 * 10 * 1000) // runs every ten minutes

        /*
        function cleanIdleConnections() {
            let now = (new Date()).valueOf()
            for (let i = 0; i < thisObject.networkClients.length; i++) {
                let caller = thisObject.networkClients[i]
                let diff = Math.trunc((now - caller.timestamp) / 60 / 1000)
                if (diff > 30) {
                    caller.socket.close()
                    SA.logger.info('Socket Interfaces -> cleanIdleConnections -> Client Idle by more than ' + diff + ' minutes -> caller.userProfile.name = ' + caller.userProfile.name)
                }
            }
        }
        */

        function refreshTokenPower() {
            /* Periodically refreshes the Token Power allocated to Followed Bot References from User Profiles */
            let followerList = Array.from(thisObject.followerMap.keys())
            if (followerList.length === 0) { return }
            let currentTokenPower = getFollowerTokenPower(followerList)
            if (currentTokenPower === undefined) {
                SA.logger.warn('Failed updating follower token powers from user profiles.')
                return
            }
            for (let i = 0; i < followerList.length; i++) {
                let followerDetails = thisObject.followerMap.get(followerList[i])
                followerDetails.tokenPower = currentTokenPower.get(followerList[i]) || 0
                thisObject.followerMap.set(followerList[i], followerDetails)
            }
            sortFollowers()

            function sortFollowers() {
                if (thisObject.senderMap === undefined || thisObject.senderMap.size === 0) { return }
                for (let [sendingBotId, senderDetails] of thisObject.senderMap) {
                    let tempFollowerList = senderDetails.followerList
                    if (tempFollowerList.length < 2) {
                        followerStats(sendingBotId)
                        continue 
                    }
                    let sortArray= []
                    for (let i = 0; i < tempFollowerList.length; i++) {
                        let sortObject = {}
                        sortObject.referenceBotId = tempFollowerList[i]
                        sortObject.tokenPower = currentTokenPower.get(tempFollowerList[i])
                        sortArray.push(sortObject)
                    }
                    sortArray.sort((a, b) => {
                        return b.tokenPower - a.tokenPower
                    })
                    senderDetails.followerList = sortArray.map(a => a.referenceBotId)
                    thisObject.senderMap.set(sendingBotId, senderDetails)
                    followerStats(sendingBotId)
                }
            }
        }
    }

    function followerStats(sendingBotId) {
        if (sendingBotId === undefined) { return }
        let senderDetails = thisObject.senderMap.get(sendingBotId)
        let senderUserProfile = SA.projects.network.globals.memory.maps.USER_PROFILES_BY_ID.get(senderDetails.senderUserProfileId)
        
        let sendingBot
        let sendingBots = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(senderUserProfile.userBots, 'Social Trading Bot')
        if (sendingBots !== undefined) {
            for (let i = 0; i < sendingBots.length; i++) {
                if (sendingBots[i].id === sendingBotId) {
                    sendingBot = sendingBots[i]
                }
            }
        }

        let followerList = senderDetails.followerList
        if (followerList === undefined || followerList.length === 0) { return }

        SA.logger.info('')
        SA.logger.info('Current Followers for Bot \'' + sendingBot.name + '\' of Broadcaster ' + senderUserProfile.name)
        let rankingTable = []
        for (let i = 0; i < followerList.length; i++) {
            let rankingObj = {}
            let followerDetails = thisObject.followerMap.get(followerList[i])
            if (followerDetails === undefined) {
                SA.logger.warn('Follower details could not be obtained for follower ' + followerList[i])
                continue
            }
            rankingObj.rank = i + 1
            rankingObj.userProfile = SA.projects.network.globals.memory.maps.USER_PROFILES_BY_ID.get(followerDetails.userProfileId).name
            rankingObj.tokenPower = SA.projects.governance.utilities.balances.toTokenPowerString(followerDetails.tokenPower)
            rankingTable.push(rankingObj)
        }
        console.table(rankingTable)
    }

    function finalize() {
        clearInterval(intervalId)
        clearInterval(tokenPowerIntervalId)
        thisObject.networkClients = undefined
        thisObject.networkPeers = undefined
        thisObject.callersMap = undefined
        thisObject.userProfilesMap = undefined
        thisObject.followerMap = undefined
        thisObject.senderMap = undefined
        web3 = undefined
    }

    async function onMessage(message, caller, calledTimestamp) {
        try {
            let socketMessage
            try {
                socketMessage = JSON.parse(message)
            } catch (err) {
                let response = {
                    result: 'Error',
                    message: 'socketMessage Not Correct JSON Format.'
                }
                caller.socket.send(JSON.stringify(response))
                caller.socket.close()
                return
            }
            /*
            We will run some validations.
            */
            if (socketMessage.messageType === undefined) {
                let response = {
                    result: 'Error',
                    message: 'messageType Not Provided.'
                }
                caller.socket.send(JSON.stringify(response))
                caller.socket.close()
                return
            }

            switch (socketMessage.messageType) {
                case "Handshake": {
                    handshakeProducedure(caller, calledTimestamp, socketMessage)
                    break
                }
                case "Request": {

                    if (caller.userProfile === undefined) {
                        let response = {
                            result: 'Error',
                            message: 'Handshake Not Done Yet.',
                            messageId: socketMessage.messageId
                        }
                        caller.socket.send(JSON.stringify(response))
                        caller.socket.close()
                        return
                    }

                    let payload
                    try {
                        payload = JSON.parse(socketMessage.payload)
                    } catch (err) {
                        let response = {
                            result: 'Error',
                            message: 'Payload Not Correct JSON Format.',
                            messageId: socketMessage.messageId
                        }
                        caller.socket.send(JSON.stringify(response))
                        caller.socket.close()
                    }

                    if (payload.networkService === undefined) {
                        let response = {
                            result: 'Error',
                            message: 'Network Service Undefined.',
                            messageId: socketMessage.messageId
                        }
                        caller.socket.send(JSON.stringify(response))
                        caller.socket.close()
                        return
                    }
                    /*
                    Record some activity from this caller
                    */
                    caller.timestamp = (new Date()).valueOf()
                    let response
                    let boradcastTo

                    switch (caller.role) {
                        case 'Network Client': {
                            switch (payload.networkService) {
                                case 'Social Graph': {
                                    if (NT.networkApp.socialGraphNetworkService !== undefined) {
                                        response = await NT.networkApp.socialGraphNetworkService.clientInterface.messageReceived(
                                            payload,
                                            caller.userProfile,
                                            thisObject.networkClients,
                                            thisObject.networkPeers
                                        )
                                        boradcastTo = response.boradcastTo
                                        response.boradcastTo = undefined
                                        response.messageId = socketMessage.messageId
                                        caller.socket.send(JSON.stringify(response))
                                    } else {
                                        let response = {
                                            result: 'Error',
                                            message: 'Social Graph Network Service Not Running.'
                                        }
                                        response.messageId = socketMessage.messageId
                                        caller.socket.send(JSON.stringify(response))
                                        caller.socket.close()
                                        return
                                    }
                                    break
                                }
                                case 'Machine Learning': {
                                    if (NT.networkApp.machineLearningNetworkService !== undefined) {
                                        response = await NT.networkApp.machineLearningNetworkService.clientInterface.messageReceived(
                                            payload,
                                            caller.userProfile,
                                            thisObject.networkClients
                                        )
                                        boradcastTo = response.boradcastTo
                                        response.boradcastTo = undefined
                                        response.messageId = socketMessage.messageId
                                        caller.socket.send(JSON.stringify(response))
                                    } else {
                                        let response = {
                                            result: 'Error',
                                            message: 'Bitcoin Factory Network Service Not Running.'
                                        }
                                        response.messageId = socketMessage.messageId
                                        caller.socket.send(JSON.stringify(response))
                                        caller.socket.close()
                                        return
                                    }
                                    break
                                }
                                case 'Trading Signals': {
                                    if (NT.networkApp.tradingSignalsNetworkService !== undefined) {
                                        SA.logger.debug('Network Websocket Client -> Trading Signals -> Message Received')
                                        response = await NT.networkApp.tradingSignalsNetworkService.clientInterface.messageReceived(
                                            payload,
                                            caller
                                        )
                                        response.boradcastTo = undefined
                                        response.messageId = socketMessage.messageId
                                        caller.socket.send(JSON.stringify(response))
                                    } else {
                                        response = {
                                            result: 'Error',
                                            message: 'Trading Signals Network Service not running.'
                                        }
                                        response.messageId = socketMessage.messageId
                                        caller.socket.send(JSON.stringify(response))
                                        caller.socket.close()                                   
                                        return
                                    }
                                    break
                                }
                                default: {
                                    let response = {
                                        result: 'Error',
                                        message: 'Network Service Not Supported.'
                                    }
                                    response.messageId = socketMessage.messageId
                                    caller.socket.send(JSON.stringify(response))
                                    caller.socket.close()
                                    return
                                }
                            }
                            break
                        }
                        case 'Network Peer': {
                            switch (socketMessage.networkService) {
                                case 'Social Graph': {
                                    if (NT.networkApp.socialGraphNetworkService !== undefined) {
                                        response = await NT.networkApp.socialGraphNetworkService.peerInterface.messageReceived(
                                            payload,
                                            thisObject.networkClients
                                        )
                                        boradcastTo = response.boradcastTo
                                        response.boradcastTo = undefined
                                        response.messageId = socketMessage.messageId
                                        caller.socket.send(JSON.stringify(response))
                                    } else {
                                        let response = {
                                            result: 'Error',
                                            message: 'Social Graph Network Service Not Running.'
                                        }
                                        response.messageId = socketMessage.messageId
                                        caller.socket.send(JSON.stringify(response))
                                        caller.socket.close()
                                        return
                                    }
                                    break
                                }
                                case 'Trading Signals': {
                                    break
                                }
                                default: {
                                    let response = {
                                        result: 'Error',
                                        message: 'Network Service Not Supported.'
                                    }
                                    response.messageId = socketMessage.messageId
                                    caller.socket.send(JSON.stringify(response))
                                    caller.socket.close()
                                    return
                                }
                            }
                            break
                        }
                    }
                    /*
                    boradcastTo represents the clients we need to bloadcast this message to.
                    If it is an empty array, we wont broadcast to clients, but we will broadcast
                    to other peers. If it is undefined that means that it is not a type of 
                    message that should be broadcasted at all.
                    We need boradcastTo to be at least an empty 
                    */
                    if (
                        response.result === 'Ok' &&
                        boradcastTo !== undefined
                    ) {
                        // add filter to only broadcast events from social graph if network node for now
                        if (socketMessage.networkService === 'Social Graph') {
                            broadcastToPeers(socketMessage, caller)
                        }
                        broadcastToClients(socketMessage, boradcastTo)
                    }
                    break
                }
                default: {
                    let response = {
                        result: 'Error',
                        message: 'messageType Not Supported.'
                    }
                    caller.socket.send(JSON.stringify(response))
                    caller.socket.close()
                    break
                }
            }
        } catch (err) {
            SA.logger.error('Socket Interfaces -> setUpWebSocketServer -> err.stack = ' + err.stack)
        }
    }

    function onConnectionClosed(socketId) {
        let caller = thisObject.callersMap.get(socketId)
        removeCaller(caller)
    }

    function handshakeProducedure(caller, calledTimestamp, socketMessage) {
        /*
        The handshake procedure have 2 steps, we need to know
        now which one we are at. 
        */
        if (socketMessage.step === undefined) {
            let response = {
                result: 'Error',
                message: 'step Not Provided.'
            }
            caller.socket.send(JSON.stringify(response))
            caller.socket.close()
            return
        }
        if (socketMessage.step !== 'One' && socketMessage.step !== 'Two') {
            let response = {
                result: 'Error',
                message: 'step Not Supported.'
            }
            caller.socket.send(JSON.stringify(response))
            caller.socket.close()
            return
        }
        switch (socketMessage.step) {
            case 'One': {
                handshakeStepOne()
                break
            }
            case 'Two': {
                handshakeStepTwo()
                break
            }
        }
        function handshakeStepOne() {
            /*
            The caller needs to identify itself as either a Network Client or Peer.
            */
            if (socketMessage.callerRole === undefined) {
                let response = {
                    result: 'Error',
                    message: 'callerRole Not Provided.'
                }
                caller.socket.send(JSON.stringify(response))
                caller.socket.close()
                return
            }

            if (socketMessage.callerRole !== 'Network Client' && socketMessage.callerRole !== 'Network Peer') {
                let response = {
                    result: 'Error',
                    message: 'callerRole Not Supported.'
                }
                caller.socket.send(JSON.stringify(response))
                caller.socket.close()
                return
            }

            caller.role = socketMessage.callerRole
            /*
            We will check that we have not exeeded the max amount of callers.
            */
            switch (caller.role) {
                case 'Network Client': {
                    if (thisObject.networkClients.length >= global.env.P2P_NETWORK_NODE_MAX_INCOMING_CLIENTS) {
                        let response = {
                            result: 'Error',
                            message: 'P2P_NETWORK_NODE_MAX_INCOMING_CLIENTS reached.'
                        }
                        caller.socket.send(JSON.stringify(response))
                        caller.socket.close()
                        return
                    }
                    break
                }
                case 'Network Peer': {
                    if (thisObject.networkPeers.length >= global.env.P2P_NETWORK_NODE_MAX_INCOMING_PEERS) {
                        let response = {
                            result: 'Error',
                            message: 'P2P_NETWORK_NODE_MAX_INCOMING_PEERS reached.'
                        }
                        caller.socket.send(JSON.stringify(response))
                        caller.socket.close()
                        return
                    }
                    break
                }
            }
            /*
            The caller needs to provide it's User Profile Handle.
            */
            if (socketMessage.callerProfileHandle === undefined) {
                let response = {
                    result: 'Error',
                    message: 'callerProfileHandle Not Provided.'
                }
                caller.socket.send(JSON.stringify(response))
                caller.socket.close()
                return
            }
            caller.userProfileHandle = socketMessage.callerProfileHandle
            /*
            The caller needs to provide a callerTimestamp.
            */
            if (socketMessage.callerTimestamp === undefined) {
                let response = {
                    result: 'Error',
                    message: 'callerTimestamp Not Provided.'
                }
                caller.socket.send(JSON.stringify(response))
                caller.socket.close()
                return
            }
            /*
            The callerTimestamp can not be more that 1 minute old.
            */
            if (calledTimestamp - socketMessage.callerTimestamp > 60000) {
                let response = {
                    result: 'Error',
                    message: 'callerTimestamp Too Old.'
                }
                caller.socket.send(JSON.stringify(response))
                caller.socket.close()
                return
            }
            /*
            We will sign for the caller it's handle to prove our
            Network Node identity.
            */
            let signedMessage = {
                callerProfileHandle: socketMessage.callerProfileHandle,
                calledProfileHandle: SA.secrets.signingAccountSecrets.map.get(global.env.P2P_NETWORK_NODE_SIGNING_ACCOUNT).userProfileHandle,
                callerTimestamp: socketMessage.callerTimestamp,
                calledTimestamp: calledTimestamp
            }
            let signature = web3.eth.accounts.sign(JSON.stringify(signedMessage), SA.secrets.signingAccountSecrets.map.get(global.env.P2P_NETWORK_NODE_SIGNING_ACCOUNT).privateKey)

            let response = {
                result: 'Ok',
                message: 'Handshake Step One Complete',
                signature: JSON.stringify(signature)
            }
            caller.socket.send(JSON.stringify(response))
        }

        function handshakeStepTwo() {
            /*
            We will check that the caller role has been defined at Step One.
            */
            if (caller.role === undefined) {
                let response = {
                    result: 'Error',
                    message: 'Handshake Step One Not Completed.'
                }
                caller.socket.send(JSON.stringify(response))
                caller.socket.close()
                return
            }
            /*
            We will check the signature at the message. 
            */
            if (socketMessage.signature === undefined) {
                let response = {
                    result: 'Error',
                    message: 'signature Not Provided.'
                }
                caller.socket.send(JSON.stringify(response))
                caller.socket.close()
                return
            }

            let signature = JSON.parse(socketMessage.signature)
            caller.userAppBlockchainAccount = web3.eth.accounts.recover(signature)

            if (caller.userAppBlockchainAccount === undefined) {
                let response = {
                    result: 'Error',
                    message: 'Bad Signature.'
                }
                caller.socket.send(JSON.stringify(response))
                caller.socket.close()
                return
            }
            /*
            The signature gives us the blockchain account, and the account the user profile.
            */
            let userProfileByBlockchainAccount = SA.projects.network.globals.memory.maps.USER_PROFILES_BY_BLOKCHAIN_ACCOUNT.get(caller.userAppBlockchainAccount)

            if (userProfileByBlockchainAccount === undefined) {
                let response = {
                    result: 'Error',
                    message: 'userProfile Not Found. This means that the signing account used to sign the message sent to the Network Node is not the same that the one the Network Node knows. The reason could be that 1) you did not generate the Signing Accounts, 2) You did not save your User Profile Plugin, 3) Your User Profile was not merged at the Governance Repo (it takes a few minutes to merge when the merging bot is running, check the repo) 4) The Network Node did not git pull your User Profile yet. 5) The Task you are running is not referencing the Task App at your own profile. Check carefuly those points to figure out which one is causing this problem for you.'
                }
                caller.socket.send(JSON.stringify(response))
                caller.socket.close()
                SA.logger.info('Socket Interfaces -> handshakeStepTwo -> userAppBlockchainAccount not associated with userProfile -> userAppBlockchainAccount = ' + caller.userAppBlockchainAccount)
                return
            }
            /*
            We will verify that the caller's User Profile has the minimun SA Balance required to connect to this Network Node
            */
            switch (caller.role) {
                case 'Network Client': {
                    let clientMinimunBalance = NT.networkApp.p2pNetworkNode.node.config.clientMinimunBalance || 0
                    if (userProfileByBlockchainAccount.balance < clientMinimunBalance) {
                        let response = {
                            result: 'Error',
                            message: 'Network Client User Profile ' + userProfileByBlockchainAccount.config.codeName + ' has a Balance of ' + SA.projects.governance.utilities.balances.toSABalanceString(userProfileByBlockchainAccount.balance) + ' while the Minimun Balance Required to connect to this Network Node "' + NT.networkApp.p2pNetworkNode.userProfile.config.codeName + '/' + NT.networkApp.p2pNetworkNode.node.config.codeName + '" is ' + SA.projects.governance.utilities.balances.toSABalanceString(clientMinimunBalance)
                        }
                        caller.socket.send(JSON.stringify(response))
                        caller.socket.close()
                        return
                    }
                    break
                }
                case 'Network Peer': {
                    let clientMinimunBalance = NT.networkApp.p2pNetworkNode.node.config.peerMinimunBalance || 0
                    if (userProfileByBlockchainAccount.balance < clientMinimunBalance) {
                        let response = {
                            result: 'Error',
                            message: 'Network Peer User Profile ' + userProfileByBlockchainAccount.config.codeName + ' has a Balance of ' + SA.projects.governance.utilities.balances.toSABalanceString(userProfileByBlockchainAccount.balance) + ' while the Minimun Balance Required to connect to this Network Node "' + NT.networkApp.p2pNetworkNode.userProfile.config.codeName + '/' + NT.networkApp.p2pNetworkNode.node.config.codeName + '" is ' + SA.projects.governance.utilities.balances.toSABalanceString(clientMinimunBalance)
                        }
                        caller.socket.send(JSON.stringify(response))
                        caller.socket.close()
                        return
                    }
                    break
                }
            }
            /*
            We verify if the caller has allocated the min Token Power to the Task Server App as required by the Network Node Configuration 
            */
            let nodeMinimumTokenAllocation
            let callerType
            switch (caller.role) {
                case 'Network Client': {
                    nodeMinimumTokenAllocation = NT.networkApp.p2pNetworkNode.node.config.clientMinTokenAllocation || 0
                    callerType = 'Client'
                    break
                }
                case 'Network Peer': {
                    nodeMinimumTokenAllocation = NT.networkApp.p2pNetworkNode.node.config.peerMinTokenAllocation || 0
                    callerType = 'Peer'
                    break
                }
            }
            if (nodeMinimumTokenAllocation !== undefined && nodeMinimumTokenAllocation > 0) {
                let clientTokenAllocation = SA.projects.governance.utilities.tokenpower.getTaskServerAppTokenPower(userProfileByBlockchainAccount, caller.userAppBlockchainAccount)
                if (clientTokenAllocation === undefined) {
                    SA.logger.warn('Unable to determine Token Power Allocation of Task Server App for User ' + userProfileByBlockchainAccount.config.codeName)
                    let response = {
                        result: 'Error',
                        message: 'Unable to determine Token Power Allocation of Task Server App for User ' + userProfileByBlockchainAccount.config.codeName 
                    }
                    caller.socket.send(JSON.stringify(response))
                    caller.socket.close()
                    return
                }
                else if (clientTokenAllocation < nodeMinimumTokenAllocation) {
                    SA.logger.info(callerType + ' ' + userProfileByBlockchainAccount.config.codeName + ' was prevented from connecting to this node as the Token Power allocation of ' + SA.projects.governance.utilities.balances.toTokenPowerString(clientTokenAllocation) + ' is lower than the configured node requirement of ' + SA.projects.governance.utilities.balances.toTokenPowerString(nodeMinimumTokenAllocation))
                    let response = {
                        result: 'Error',
                        message: 'Network ' + callerType + ' User Profile ' + userProfileByBlockchainAccount.config.codeName + ' has allocated Token Power of ' + SA.projects.governance.utilities.balances.toTokenPowerString(clientTokenAllocation) + ' to the Connection Task Server while the Minimum Allocation Required to connect to this Network Node "' + NT.networkApp.p2pNetworkNode.userProfile.config.codeName + '/' + NT.networkApp.p2pNetworkNode.node.config.codeName + '" is ' + SA.projects.governance.utilities.balances.toTokenPowerString(nodeMinimumTokenAllocation)
                    }
                    caller.socket.send(JSON.stringify(response))
                    caller.socket.close()
                    return
                }
            }

            /*
            Parse the signed Message
            */
            let signedMessage = JSON.parse(signature.message)
            /*
            We will verify that the signature belongs to the signature.message.
            To do this we will hash the signature.message and see if we get 
            the same hash of the signature.
            */
            let hash = web3.eth.accounts.hashMessage(signature.message)
            if (hash !== signature.messageHash) {
                let response = {
                    result: 'Error',
                    message: 'signature.message Hashed Does Not Match signature.messageHash.'
                }
                caller.socket.send(JSON.stringify(response))
                caller.socket.close()
                return
            }
            /*
            The user profile based on the blockchain account, based on the signature,
            it is our witness user profile, to validate the caller.
            */
            if (signedMessage.callerProfileHandle !== userProfileByBlockchainAccount.config.signature.message) {
                let response = {
                    result: 'Error',
                    message: 'callerProfileHandle Does Not Match userProfileByBlockchainAccount.'
                }
                caller.socket.send(JSON.stringify(response))
                caller.socket.close()
                return
            }
            /*
            We will check that the signature includes this Network Node handle, to avoid
            man in the middle attacks.
            */
            if (signedMessage.calledProfileHandle !== SA.secrets.signingAccountSecrets.map.get(global.env.P2P_NETWORK_NODE_SIGNING_ACCOUNT).userProfileHandle) {
                let response = {
                    result: 'Error',
                    message: 'calledProfileHandle Does Not Match This Network Node Handle.'
                }
                caller.socket.send(JSON.stringify(response))
                caller.socket.close()
                return
            }
            /*
            We will check that the timestamp in the signature is the one we sent to the caller.
            */
            if (signedMessage.calledTimestamp !== calledTimestamp) {
                let response = {
                    result: 'Error',
                    message: 'calledTimestamp Does Not Match calledTimestamp On Record.'
                }
                caller.socket.send(JSON.stringify(response))
                caller.socket.close()
                return
            }
            /*
            We will remember the user profile behind this caller.
            */
            caller.userProfile = userProfileByBlockchainAccount
            /*
            We will check that if we are a node of a Permissioned Network, that whoever
            is connecting to us, has the permission to do so.
            */
            if (NT.networkApp.p2pNetworkNode.node.p2pNetworkReference.referenceParent.type === "Permissioned P2P Network") {
                let userProfileWithPermission = SA.projects.network.globals.memory.maps.PERMISSIONS_GRANTED_BY_USER_PRFILE_ID.get(caller.userProfile.id)
                if (userProfileWithPermission === undefined) {
                    let response = {
                        result: 'Error',
                        message: 'User Profile Does Not Have Permission to This Permissioned P2P Network.'
                    }
                    caller.socket.send(JSON.stringify(response))
                    caller.socket.close()
                    return
                }
            }
            /*
            We will remember the caller itself.
            */
            addCaller(caller)
            /*
            All validations have been completed, the Handshake Procedure finished well.
            */
            let response = {
                result: 'Ok',
                message: 'Handshake Successful.'
            }
            caller.socket.send(JSON.stringify(response))
        }
    }

    function addCaller(caller) {

        thisObject.callersMap.set(caller.socket.id, caller)

        switch (caller.role) {
            case 'Network Client': {
                addToArray(thisObject.networkClients, caller)
                addToUserProfilesMap(caller.userProfile)
                break
            }
            case 'Network Peer': {
                addToArray(thisObject.networkPeers, caller)
                break
            }
        }

        function addToArray(callersArray, caller) {
            /*
            We will add the caller to the existing array, first the ones with highest ranking.
            */
            for (let i = 0; i < callersArray.length; i++) {
                let callerInArray = callersArray[i]
                if (caller.userProfile.ranking < callerInArray.userProfile.ranking) {
                    callersArray.splice(i, 0, caller)
                    return
                }
            }
            callersArray.push(caller)
        }

        function addToUserProfilesMap(userProfile) {
            /*
            We will increase the counter of how many connections belog to this user profile.
            */
            let count = thisObject.userProfilesMap.get(userProfile.id) || 0
            count++
            thisObject.userProfilesMap.set(userProfile.id, count)
        }
    }

    function removeCaller(caller) {
        if (caller === undefined) { return }

        thisObject.callersMap.delete(caller.socket.id)
        checkFollowerSubscriptions(caller)

        switch (caller.role) {
            case 'Network Client': {
                removeFromArray(thisObject.networkClients, caller)
                removeFromUserProfilesMap(caller.userProfile)
                break
            }
            case 'Network Peer': {
                removeFromArray(thisObject.networkPeers, caller)
                break
            }
        }

        function checkFollowerSubscriptions(caller) {
            if (caller.followingBots === undefined) { return }
            for (let i = 0; i < caller.followingBots.length; i++) { 
                removeFollower(caller, caller.followingBots[i])
                caller.followingBots[i]
            }
        }

        function removeFromArray(callersArray, caller) {
            for (let i = 0; i < callersArray.length; i++) {
                let callerInArray = callersArray[i]
                if (caller.socket.id === callerInArray.socket.id) {
                    callersArray.splice(i, 1)
                    return
                }
            }
        }

        function removeFromUserProfilesMap(userProfile) {
            /*
            We will decrease the counter of how many connections belog to this user profile.
            */
            let count = thisObject.userProfilesMap.get(userProfile.id) || 0
            count--
            if (count > 0) {
                thisObject.userProfilesMap.set(userProfile.id, count)
            } else {
                thisObject.userProfilesMap.delete(userProfile.id)
            }
        }
    }

    function broadcastToPeers(socketMessage, caller) {
        /*
        The Boradcast to network peers is not done via 
        the network peers incomming connections, but
        on the outgoing connections only.
        */
        let callerIdToAVoid
        if (caller.role === 'Network Peer') {
            callerIdToAVoid = caller.socket.id
        }
        for (let i = 0; i < NT.networkApp.p2pNetworkNodesConnectedTo.peers.length; i++) {
            let peer = NT.networkApp.p2pNetworkNodesConnectedTo.peers[i]
            if (peer.p2pNetworkNode.node.id === callerIdToAVoid) { continue }
            peer.webSocketsClient.socketNetworkClients.sendMessage(socketMessage.payload)
                .catch(onError)

            function onError() {
                SA.logger.error('Socket Interfaces -> broadcastToPeers -> Sending Message Failed.')
            }
        }
    }

    function broadcastToClients(socketMessage, boradcastTo) {
        try {
            for (let i = 0; i < boradcastTo.length; i++) {
                let networkClient = boradcastTo[i]
                networkClient.socket.send(JSON.stringify(socketMessage))
            }
            return true
        } catch (err) {
            SA.logger.error('Socket Interfaces -> broadcastToClients -> err.stack = ' + err.stack)
        }
    }

    function addFollower(caller, followerReference, listeningBot, sendingBot, senderUserProfile) {
        if (caller === undefined) { return false }
        if (followerReference === undefined ) { return false }
        if (listeningBot === undefined) { return false }
        if (sendingBot === undefined) { return false }
        if (senderUserProfile === undefined) { return false }
        
        try {
            /* Update Map of Senders - Add new Followers */
            let followerList = []
            let senderDetails = {}
            if (thisObject.senderMap.has(sendingBot.id)) {
                senderDetails = thisObject.senderMap.get(sendingBot.id)
                followerList = senderDetails.followerList
            }
            /* Add new follower in sequence of subscribers according to Token Power */
            if (!followerList.includes(followerReference.id)) {
                if (followerList.length > 0) {
                    let currentTokenPower = getFollowerTokenPower(followerList)
                    for (let i = 0; i < followerList.length; i++) {
                        if (followerReference.tokenPower > currentTokenPower.get(followerList[i])) {
                            followerList.splice(i, 0, followerReference.id)
                            break
                        }
                    }
                } 
                if (!followerList.includes(followerReference.id)) {
                    followerList.push(followerReference.id)
                }
            }
            senderDetails = {
                followerList: followerList,
                senderUserProfileId: senderUserProfile.id
            }
            thisObject.senderMap.set(sendingBot.id, senderDetails)

            /* Update Map of Receivers */
            let followerConnections = []
            let followerDetails = {}
            if (thisObject.followerMap.has(followerReference.id)) {
                followerConnections = thisObject.followerMap.get(followerReference.id).followerConnections
            }
            if (!followerConnections.includes(caller.socket.id)) {
                followerConnections.push(caller.socket.id)
            }
            followerDetails = {
                tokenPower: followerReference.tokenPower || 0,
                sendingBot: sendingBot.id,
                listeningBot: listeningBot.id,
                userProfileId: caller.userProfile?.id,
                followerConnections: followerConnections
            }
            thisObject.followerMap.set(followerReference.id, followerDetails)

            /* Establish reference between caller and subscription */
            let followingBots = []
            let callerDetails = thisObject.callersMap.get(caller.socket.id)
            if (callerDetails.followingBots !== undefined) {
                followingBots = callerDetails.followingBots
            }
            if (!followingBots.includes(followerReference.id)) {
                followingBots.push(followerReference.id)
            }
            callerDetails.followingBots = followingBots
            thisObject.callersMap.set(caller.socket.id, callerDetails)
            return true
        } catch (err) {
            return false
        }
    }

    function removeFollower(caller, followedBotReferenceId) {
        try {
            let followerConnections = []
            let followerDetails = thisObject.followerMap.get(followedBotReferenceId)
            if (followerDetails.followerConnections !== undefined) {
                followerConnections = followerDetails.followerConnections
            }
            let idx = followerConnections.indexOf(caller.socket.id)
            if (idx >  -1) {
                followerConnections.splice(idx, 1)
            }
            /* Check if any further connections are behind this subscription. If not, remove entirely, otherwise just the single connection. */
            if (followerConnections.length === 0) {
                thisObject.followerMap.delete(followedBotReferenceId)
                
                /* Also remove the listener from the sender map */
                let followerList = []
                let senderDetails = thisObject.senderMap.get(followerDetails.sendingBot)
                if (senderDetails?.followerList !== undefined) {
                    followerList = senderDetails.followerList
                }
                let idx = followerList.indexOf(followedBotReferenceId)
                if (idx > -1) {
                    followerList.splice(idx, 1)
                }
                /* Check if this sender has any further followers. If not, remove entirely, otherwise just the single follower. */
                if (followerList.length === 0) {
                    thisObject.senderMap.delete(followerDetails.sendingBot)
                } else {
                    senderDetails.followerList = followerList
                    thisObject.senderMap.set(followerDetails.sendingBot, senderDetails)
                }
            } else {
                followerDetails.followerConnections = followerConnections
                thisObject.followerMap.set(followedBotReferenceId, followerDetails)
            }
            /* This function may be called both from dropping connections and from unfollow requests from connections remaining open.
            We therefore check if the caller record still exists (connection open), and if so, remove the subscription from it. */
            let callerDetails = thisObject.callersMap.get(caller.socket.id)
            if (callerDetails === undefined) { return true }
            if (callerDetails.followingBots !== undefined) {
                let followingBots = callerDetails.followingBots
                let idx = followingBots.indexOf(followedBotReferenceId)
                if (idx > -1) {
                    followingBots.splice(idx, 1)
                }
                callerDetails.followingBots = followingBots
                thisObject.callersMap.set(caller.socket.id, callerDetails)
            }
            return true
        } catch(err) {
            return false
        }
    }

    function getFollowerTokenPower(followedBotReferenceList) {
        /* This function takes an array of Follow Bot Reference IDs and returns a Map with Bot ID and Token Power. 
        To achieve this, it crawls through the Social Trading Bot nodes of all active followers.
        The function will return 0 power for inactive or unknown followers. */
        if (followedBotReferenceList === undefined) { return }
        let resultMap = new Map()
        try {
            for (let i = 0; i < followedBotReferenceList.length; i++) {
                let followedBotReferenceId = followedBotReferenceList[i]
                let followerDetails = thisObject.followerMap.get(followedBotReferenceId)
                if (followerDetails === undefined || followerDetails?.listeningBot === undefined || followerDetails?.userProfileId === undefined) {
                    resultMap.set(followedBotReferenceId, 0)
                    continue
                }
                let userProfile = SA.projects.network.globals.memory.maps.USER_PROFILES_BY_ID.get(followerDetails.userProfileId)
                if (userProfile?.userBots === undefined) {
                    resultMap.set(followedBotReferenceId, 0)
                    continue
                }
                let followedBotReference
                let followedBotReferences = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfile.userBots, 'Followed Bot Reference')
                if (followedBotReferences !== undefined) {
                    for (let j = 0; j < followedBotReferences.length; j++) {
                        if (followedBotReferences[j].id === followedBotReferenceId) {
                            followedBotReference = followedBotReferences[j]
                        }
                    }
                }
                if (followedBotReference?.payload?.tokenPower === undefined) {
                    resultMap.set(followedBotReferenceId, 0)
                } else {
                    resultMap.set(followedBotReferenceId, followedBotReference.payload.tokenPower)
                }
            }
            return resultMap
        } catch(err) {
            return
        }
    }

    async function broadcastMessageToClients(socketMessage, sendingBot) {
        /*
        This function broadcasts messages to all clients connected to the node, regardless if they are actively following.
        The function is no longer used for distributing trading signals, but may be helpful for distributing other message types.
        */
        try {
            let accumulatedDelay = 0
            let positionInQueue = 0
            let queueSize = thisObject.networkClients.length

            /* Obtain Signal Identifier */
            let signalId = getSignalId(socketMessage)
          
            /* Send signals to all connected network clients */
            for (let i = 0; i < thisObject.networkClients.length; i++) {
                let networkClient = thisObject.networkClients[i]
                positionInQueue++
                socketMessage.rankingStats = {
                    accumulatedDelay:accumulatedDelay,
                    positionInQueue: positionInQueue,
                    queueSize: queueSize
                }
                /*
                Here we are ready to send the signal...
                */
                networkClient.socket.send(JSON.stringify(socketMessage))
                SA.logger.info('Signal ' + signalId + '- sent to User ' + networkClient.userProfile.name + ', position ' + positionInQueue + ', delayed ' + accumulatedDelay/1000 + ' seconds')
            }
            return true
        } catch (err) {
            SA.logger.error('Socket Interfaces -> broadcastMessageToClients -> err.stack = ' + err.stack)
        }
    }

    async function broadcastSignalsToFollowers(socketMessage, sendingBot) {
        /*
        This function broadcasts signals only to subscribed followers.
        */
        try {
            let lastUserProfileId
            let accumulatedDelay = 0
            let positionInFollowerQueue = 0
            let followerList = []
            let followerMinTokenPower = sendingBot.config.followerMinTokenPower || 0
            /* Get list of users following this bot */
            if (thisObject.senderMap.get(sendingBot.id)?.followerList !== undefined) {
                followerList = thisObject.senderMap.get(sendingBot.id).followerList
            }
            const MAX_DELAY_FOR_ZERO_RANKING = 60000 // miliseconds
            const COUNT_FOLLOWERS_CONNECTED = followerList.length
            let DELAY_BETWEEN_USER_PROFILES = 1000 // milliseconds
            if (COUNT_FOLLOWERS_CONNECTED >= 60) {
                DELAY_BETWEEN_USER_PROFILES = MAX_DELAY_FOR_ZERO_RANKING / (COUNT_FOLLOWERS_CONNECTED - 1)
            }

            /* Obtain Signal Identifier */
            let signalId = getSignalId(socketMessage)

            for (let i = 0; i < followerList.length; i++) {
                let followerDetails = thisObject.followerMap.get(followerList[i])
                if (followerDetails === undefined) { continue }
                if (followerDetails.followerConnections === undefined) { continue }
                let followerConnections = followerDetails.followerConnections
                let followerUserHandle = SA.projects.network.globals.memory.maps.USER_PROFILES_BY_ID.get(followerDetails.userProfileId).name || ''
                /* Double-check for sufficient token power allocation before sending signal */
                let tokenPower = parseFloat(followerDetails.tokenPower.toFixed(0)) || 0
                if (tokenPower < followerMinTokenPower) {
                    SA.logger.warn('Skipping signal transmission to follower ' + followerUserHandle + ' as token power ' + SA.projects.governance.utilities.balances.toTokenPowerString(tokenPower) + ' is below sender requirement of ' + SA.projects.governance.utilities.balances.toTokenPowerString(followerMinTokenPower) )
                    for (let j = 0; j < followerConnections.length; j++) {
                        let callerDetails = thisObject.callersMap.get(followerConnections[j]) 
                        removeFollower(callerDetails, followerList[i])
                    }
                    continue
                }

                /*
                It is possible that many connections belong to the same user profile. When that happens, they are all together 
                in succession because the networkClients array is ordered by the amount of tokens, which in general 
                are different from one user to the other.

                Everytime we detect that a new user user profile in the sequence of network clients we need to notify, 
                we will apply the calculated delay.
                */
                if (
                    lastUserProfileId !== undefined &&
                    lastUserProfileId !== followerDetails.userProfileId &&
                    DELAY_BETWEEN_USER_PROFILES <= MAX_DELAY_FOR_ZERO_RANKING
                ) {
                    accumulatedDelay = accumulatedDelay + DELAY_BETWEEN_USER_PROFILES
                    await SA.projects.foundations.utilities.asyncFunctions.sleep(DELAY_BETWEEN_USER_PROFILES)
                }
                lastUserProfileId = followerDetails.userProfileId
                positionInFollowerQueue++

                /* Send one message for each active connection of the current follower */
                for (let j = 0; j < followerConnections.length; j++) {
                    socketMessage.rankingStats = {
                        accumulatedDelay: accumulatedDelay,
                        positionInQueue: positionInFollowerQueue,
                        queueSize: COUNT_FOLLOWERS_CONNECTED
                    }
                    let receiver = thisObject.callersMap.get(followerConnections[j])
                    if (receiver === undefined) { continue }
                    receiver.socket.send(JSON.stringify(socketMessage))
                    SA.logger.info('Signal ' + signalId + '- sent to Follower ' + receiver.userProfile?.name + ', position ' + positionInFollowerQueue + ', delayed ' + accumulatedDelay/1000 + ' seconds')
                }

            }
            return true
        } catch (err) {
            SA.logger.error('Socket Interfaces -> broadcastSignalsToFollowers -> err.stack = ' + err.stack)
        }
    }

    function getSignalId(socketMessage) {
        let signalId
        try {
            let messagePayload = JSON.parse(socketMessage.payload)
            messagePayload = JSON.parse(messagePayload.signalMessage)
            signalId = messagePayload.signalId
            signalId = signalId.split(/[-]+/).shift()
        } catch(err) {
            signalId = '<unknown>'
        }
        return signalId
    }
}