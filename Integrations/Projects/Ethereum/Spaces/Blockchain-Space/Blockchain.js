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

    let clientMap = new Map()
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

        /* We will query the node only every 3 seconds */
        if (lastTryToReconnectDatetime === undefined) {
            connectingPhysics()
            lastTryToReconnectDatetime = (new Date()).valueOf()
        } else {
            let now = (new Date()).valueOf()
            if (now - lastTryToReconnectDatetime > 3000) {
                connectingPhysics()
                lastTryToReconnectDatetime = now
            }
        }
    }

    async function connectingPhysics() {
        try {
            if (UI.projects.superalgos.spaces.designSpace.workspace === undefined) { return }

            let blockchain = UI.projects.superalgos.spaces.designSpace.workspace.getHierarchyHeadsByType('Ethereum Blockchain')
            if (blockchain === undefined) { return }
            for (let i = 0; i < blockchain.blockchainNetworks.length; i++) {
                let blockchainNetwork = blockchain.blockchainNetworks[i]
                for (let j = 0; j < blockchainNetwork.networkClients.length; j++) {
                    let networkClient = blockchainNetwork.networkClients[j]
                    /*
                    We will check now if this network client is already at the networkClientsMap,
                    if not, we will add it and stablish the connection to the ethereum node.
                    */
                    let client = clientMap.get(networkClient.id)

                    if (client === undefined) {
                        client = {}
                        let config = JSON.parse(networkClient.config)
                        if (config.host === undefined) {
                            networkClient.payload.uiObject.setErrorMessage('Property host not defined at node config.')
                            continue
                        }
                        if (config.httpPort === undefined && config.webSocketsPort === undefined) {
                            networkClient.payload.uiObject.setErrorMessage('Property httpPort or webSocketsPort must be defined at node config.')
                            continue
                        }

                        /* Web Sockets would be the default protocol */
                        let providerURL
                        let provider
                        if (config.webSocketsPort !== undefined) {
                            providerURL = 'ws://' + config.host + ':' + config.webSocketsPort + ''
                            provider = new Web3.providers.WebsocketProvider(providerURL, {
                                headers: {
                                    Origin: "http://localhost"
                                }
                            });
                        } else {
                            providerURL = 'http://' + config.host + ':' + config.httpPort + ''
                            provider = new Web3.providers.HttpProvider(providerURL, {
                                headers: {
                                    Origin: "http://localhost"
                                }
                            });
                        }

                        try {
                            client.web3 = new window.Web3('ws://localhost:8546'); // new window.Web3(provider);

                            /* This is a way we found to wait for the connection to be stablished */
                            
                            await waitForConnectionToBeStablished()

                            async function waitForConnectionToBeStablished() {
                                let accounts = await web3.eth.getAccounts()
                                 if (client.web3.currentProvider.connected === false) {
                                    networkClient.payload.uiObject.setErrorMessage('Can not connect to this client.')                                    
                                } else {
                                    clientMap.set(networkClient.id, client)
                                    setStatus()
                                }
                            }
/*
                            if (client.web3.currentProvider.connected === false) {
                                networkClient.payload.uiObject.setErrorMessage('Can not connect to this client.')
                                continue
                            } 
/*
                            let isListening = await client.web3.eth.net.isListening()
                            if (isListening === true) {
                                clientMap.set(networkClient.id, client)
                                setStatus()
                            } else {
                                networkClient.payload.uiObject.setStatus('Not connected to Ethereum Client.')
                            }
*/
                        } catch (err) {
                            networkClient.payload.uiObject.setErrorMessage('Error connecting to this client: ' + err.message)
                        }

                    } else {
                        setStatus()
                    }
                    async function setStatus() {

                        networkClient.payload.uiObject.resetErrorMessage()
                        try {
                            client.isSyncing = await client.web3.eth.isSyncing()
                            client.chainId = await client.web3.eth.getChainId()
                        } catch {
                            networkClient.payload.uiObject.resetStatus()
                            networkClient.payload.uiObject.setErrorMessage('Connection to client lost.')
                            clientMap.delete(networkClient.id)
                            return
                        }

                        client.networkName = UI.projects.ethereum.globals.chainIds.chainNameById(client.chainId)

                        if (client.isSyncing === false) {
                            networkClient.payload.uiObject.setStatus('Client is looking for peers...')
                            return
                        }
                        /* If it is not syncing, then we have the current block and the highets block too */
                        let percentage = (client.isSyncing.currentBlock * 100 / client.isSyncing.highestBlock).toFixed(4)
                        let extraStatus = ''
                        if (client.isSyncing.highestBlock - client.isSyncing.currentBlock < 300) {
                            extraStatus = 'Block Download Finished. Downloading Trie Data Structure.'
                        } else {
                            extraStatus = 'Block Download Phase.'
                            networkClient.payload.uiObject.setPercentage(percentage)
                        }

                        networkClient.payload.uiObject.valueAtAngle = false
                        networkClient.payload.uiObject.setValue('Block ' + client.isSyncing.currentBlock + ' from ' + client.isSyncing.highestBlock + '. State ' + client.isSyncing.pulledStates + ' from ' + client.isSyncing.knownStates)

                        if (client.isSyncing.currentBlock !== client.isSyncing.highestBlock) {
                            networkClient.payload.uiObject.setStatus('Connected via http. Client is Syncing... ' + extraStatus)
                        } else {
                            networkClient.payload.uiObject.setStatus('Connected to ' + client.networkName + ' via http. ')
                        }
                    }
                }
            }
        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] physics -> err = ' + err.stack) }
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
