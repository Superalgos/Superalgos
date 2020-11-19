function newEthereumBlockchainSpace() {
    const MODULE_NAME = 'Blockchain Space'

    let thisObject = {
        container: undefined,
        physics: physics,
        draw: draw,
        getContainer: getContainer,
        finalize: finalize,
        initialize: initialize
    }

    thisObject.container = newContainer()
    thisObject.container.initialize(MODULE_NAME)

    let lastTryToReconnectDatetime

    return thisObject

    function finalize() {

        thisObject.container.finalize()
        thisObject.container = undefined
        clientMap = undefined
    }

    function initialize() {

    }

    function physics() {
        networkClientStatusPhysics()
    }

    async function networkClientStatusPhysics() {

        /* We will query the node only every 3 seconds */
        if (lastTryToReconnectDatetime === undefined) {
            checkStatus()
            lastTryToReconnectDatetime = (new Date()).valueOf()
        } else {
            let now = (new Date()).valueOf()
            if (now - lastTryToReconnectDatetime > 3000) {
                checkStatus()
                lastTryToReconnectDatetime = now
            }
        }

        async function checkStatus() {
            try {
                if (UI.projects.superalgos.spaces.designSpace.workspace === undefined) { return }

                let blockchain = UI.projects.superalgos.spaces.designSpace.workspace.getHierarchyHeadsByType('Ethereum Blockchain')
                if (blockchain === undefined) { return }
                for (let i = 0; i < blockchain.blockchainNetworks.length; i++) {
                    let blockchainNetwork = blockchain.blockchainNetworks[i]
                    for (let j = 0; j < blockchainNetwork.networkClients.length; j++) {
                        let networkClient = blockchainNetwork.networkClients[j]

                        let route = UI.projects.ethereum.utilities.routeToClient.buildRouteToClient(networkClient)

                        if (route === undefined) { continue } // something went wrong building the route.

                        route.params.method = 'getNetworkClientStatus'

                        httpRequest(JSON.stringify(route.params), route.url, onResponse)

                        function onResponse(err, data) {
                            /* Lets check the result of the call through the http interface */
                            if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                                networkClient.payload.uiObject.setErrorMessage('Call via HTTP Interface failed.')
                                return
                            }

                            let status = JSON.parse(data)

                            /* Lets check the result of the method call */
                            if (status.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                                networkClient.payload.uiObject.setErrorMessage('Call to WEB3 Server failed. ' + status.error)
                                return
                            }

                            showStatus(status)
                        }

                        async function showStatus(status) {
                            const ANNIMATION_CYCLES_TO_LAST = 300

                            networkClient.payload.uiObject.resetErrorMessage()

                            if (status.isSyncing === false && status.chainId === 0) {
                                networkClient.payload.uiObject.setStatus('Client is looking for peers...', ANNIMATION_CYCLES_TO_LAST)
                                return
                            }

                            if (status.chainId > 0) {
                                let networkName = UI.projects.ethereum.globals.chainIds.chainNameById(status.chainId)
                                networkClient.payload.uiObject.setStatus('Connected to ' + networkName + ' via the ' + route.params.interface + ' interface, through ' + networkClient.payload.referenceParent.name + ' Network Node.', ANNIMATION_CYCLES_TO_LAST)

                                networkClient.payload.uiObject.valueAtAngle = false
                                networkClient.payload.uiObject.setValue(
                                    'Current Block Number ' + splitLargeNumber(status.currentBlockNumber)
                                    , 200)
                                networkClient.payload.uiObject.setPercentage('100.00', ANNIMATION_CYCLES_TO_LAST)
                                return
                            }

                            /* If it is not syncing, then we have the current block and the highets block too */
                            let percentage = (status.isSyncing.currentBlock * 100 / status.isSyncing.highestBlock).toFixed(4)
                            let extraStatus = ''
                            if (status.isSyncing.highestBlock - status.isSyncing.currentBlock < 300) {
                                extraStatus = 'Block Download Phase Finished. Downloading Trie Data Structure.'
                            } else {
                                extraStatus = 'Block Download Phase.'
                                networkClient.payload.uiObject.setPercentage(percentage, ANNIMATION_CYCLES_TO_LAST)
                            }

                            networkClient.payload.uiObject.valueAtAngle = false
                            networkClient.payload.uiObject.setValue(
                                'Block ' + splitLargeNumber(status.isSyncing.currentBlock) +
                                ' from ' + splitLargeNumber(status.isSyncing.highestBlock) +
                                '. State ' + splitLargeNumber(status.isSyncing.pulledStates) +
                                ' from ' + splitLargeNumber(status.isSyncing.knownStates)
                                , 200)

                            if (status.isSyncing.currentBlock !== status.isSyncing.highestBlock) {
                                networkClient.payload.uiObject.setStatus('Connected via http. Client is Syncing... ' + extraStatus, ANNIMATION_CYCLES_TO_LAST)
                            }

                            function splitLargeNumber(number) {
                                let label = number.toString()
                                let result = label
                                switch (label.length) {
                                    case 4: {
                                        return label[0] + ',' + label[1] + label[2] + label[3]
                                    }
                                    case 5: {
                                        return label[0] + label[1] + ',' + label[2] + label[3] + label[4]
                                    }
                                    case 6: {
                                        return label[0] + label[1] + label[2] + ',' + label[3] + label[4] + label[5]
                                    }
                                    case 7: {
                                        return label[0] + ',' + label[1] + label[2] + label[3] + ',' + label[4] + label[5] + label[6]
                                    }
                                    case 8: {
                                        return label[0] + label[1] + ',' + label[2] + label[3] + label[4] + ',' + label[5] + label[6] + label[7]
                                    }
                                    case 9: {
                                        return label[0] + label[1] + label[2] + ',' + label[3] + label[4] + label[5] + ',' + label[6] + label[7] + label[8]
                                    }
                                    case 10: {
                                        return label[0] + ',' + label[1] + label[2] + label[3] + ',' + label[4] + label[5] + label[6] + ',' + label[7] + label[8] + label[9]
                                    }
                                }
                                return result
                            }
                        }
                    }
                }
            } catch (err) {
                console.log('[ERROR] checkStatus -> err = ' + err.stack)
            }
        }
    }

    function getContainer(point) {

        if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            thisObject.container.space = MODULE_NAME
            return thisObject.container
        } else {
            return undefined
        }
    }

    function draw() {

    }
}
