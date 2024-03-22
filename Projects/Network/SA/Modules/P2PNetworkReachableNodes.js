exports.newNetworkModulesP2PNetworkReachableNodes = function newNetworkModulesP2PNetworkReachableNodes() {
    /*
    This module represents the P2P Network nodes that are reachable
    and that we can potentially connect to.  
    
    When we are running with the role of a Network Peer,
    the list of available nodes will exclude ourselves.
    */
    let thisObject = {
        networkType: undefined,
        networkCodeName: undefined,
        p2pNodesToConnect: undefined,
        /* Framework Functions */
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.p2pNodesToConnect = undefined
    }

    async function initialize(
        callerRole,
        networkCodeName,
        networkType,
        p2pNetworkClientIdentity,
        p2pNetworkClientNode,
        userProfileCodeName,
        userProfileBalance
    ) {
        thisObject.networkCodeName = networkCodeName
        thisObject.networkType = networkType

        switch (callerRole) {
            case 'Network Client': {
                thisObject.p2pNodesToConnect = []
                
                let connectOnlyRequestedToP2pNode = false
                let connectOnlyToP2pNode

                /*
                We will check the p2pNetworkClient node located at this task for a specified network node to connect this task to.
                If a specific network node is requested then it will be the only available network node to that task.
                */
                if (p2pNetworkClientNode !== undefined) {
                    if (p2pNetworkClientNode.p2pNetworkNodeReference !== undefined) {
                        if (p2pNetworkClientNode.p2pNetworkNodeReference.referenceParent !== undefined) {
                            if (p2pNetworkClientNode.p2pNetworkNodeReference.referenceParent.id !== undefined) {
                                connectOnlyToP2pNode = p2pNetworkClientNode.p2pNetworkNodeReference.referenceParent
                                connectOnlyRequestedToP2pNode = true
                            }
                        }
                    }
                }
                else {
                    SA.logger.error('The P2P Network Client node is required at each task. Please add the node and try again.')
                }

                for (let i = 0; i < SA.projects.network.globals.memory.arrays.P2P_NETWORK_NODES.length; i++) {
                    let p2pNetworkNode = SA.projects.network.globals.memory.arrays.P2P_NETWORK_NODES[i]

                    // If we have a defined network node profile to connect to we will only check that profile.
                    if (connectOnlyRequestedToP2pNode) {
                        if (p2pNetworkNode.node.id !== connectOnlyToP2pNode.id) { continue }
                    }

                    if (p2pNetworkNode.node.p2pNetworkReference.referenceParent === undefined) { continue }
                    if (p2pNetworkNode.node.p2pNetworkReference.referenceParent.config === undefined) { continue }
                    if (p2pNetworkNode.node.p2pNetworkReference.referenceParent.config.codeName !== thisObject.networkCodeName) { continue }
                    if (p2pNetworkNode.node.p2pNetworkReference.referenceParent.type !== thisObject.networkType) { continue }
                    /*
                    Here we check that the network services defined at the Network Client definitions at the UI are present at the candidate Network Node. If not we skip this node. 
                    */
                    if (p2pNetworkNode.node.networkServices.socialGraph === undefined && p2pNetworkClientNode.networkServices.socialGraph !== undefined) { continue }
                    if (p2pNetworkNode.node.networkServices.machineLearning === undefined && p2pNetworkClientNode.networkServices.machineLearning !== undefined) { continue }
                    if (p2pNetworkNode.node.networkServices.tradingSignals === undefined && p2pNetworkClientNode.networkServices.tradingSignals !== undefined) { continue }
                    if (p2pNetworkNode.node.networkServices.onlineWorkspaces === undefined && p2pNetworkClientNode.networkServices.onlineWorkspaces !== undefined) { continue }
                    /*
                    Here we check that the network interfaces defined at the Network Client definitions at the UI are present at the candidate Network Node. If not we skip this node. 
                    */
                    if (p2pNetworkNode.node.networkInterfaces === undefined) { continue }
                    if (p2pNetworkNode.node.networkInterfaces.websocketsNetworkInterface === undefined && p2pNetworkClientNode.networkInterfaces.websocketsNetworkInterface !== undefined) { continue }
                    if (p2pNetworkNode.node.networkInterfaces.webrtcNetworkInterface === undefined && p2pNetworkClientNode.networkInterfaces.webrtcNetworkInterface !== undefined) { continue }
                    if (p2pNetworkNode.node.networkInterfaces.httpNetworkInterface === undefined && p2pNetworkClientNode.networkInterfaces.httpNetworkInterface !== undefined) { continue }
                    /*
                    Check that we have enough User Profile Balance to connect to this Network Node.
                    */
                    let clientMinimunBalance = p2pNetworkNode.node.config.clientMinimunBalance | 0
                    if (userProfileBalance < clientMinimunBalance) {
                        SA.logger.info('')
                        SA.logger.info('Network Client User Profile ' + userProfileCodeName + ' has a Balance of ' + SA.projects.governance.utilities.balances.toSABalanceString(userProfileBalance) + ' while the Minimum Balance Required to connect to the Network Node "' + p2pNetworkNode.userProfile.config.codeName + '/' + p2pNetworkNode.node.config.codeName + '" is ' + SA.projects.governance.utilities.balances.toSABalanceString(clientMinimunBalance) + '. If you want to be able to connect to this Network Node you will need to earn or buy more SA tokens and try again.')
                        SA.logger.info('')
                        continue
                    }
                    /* Check if we have enough Token Power allocated to the Task Server app to connect to this Network Node. */
                    let nodeMinimumTokenAllocation = p2pNetworkNode.node.config.clientMinTokenAllocation | 0
                    if (nodeMinimumTokenAllocation > 0) {
                        let clientTokenAllocation = SA.projects.governance.utilities.tokenpower.getTaskServerAppTokenPower(p2pNetworkClientIdentity.userProfile, p2pNetworkClientIdentity.blockchainAccount)
                        if (clientTokenAllocation === undefined || clientTokenAllocation < nodeMinimumTokenAllocation) {
                            SA.logger.info('Network Node ' + p2pNetworkNode.node.name + ' requires an allocation of min. ' + SA.projects.governance.utilities.balances.toSABalanceString(nodeMinimumTokenAllocation) + ' Token Power to the referenced Task Server App. Your current allocation is ' + SA.projects.governance.utilities.balances.toSABalanceString(clientTokenAllocation) + '.')
                            SA.logger.info('For enabling access to this node for the task you just started, allocate Token Power to "' + p2pNetworkClientIdentity.node.name + '" and contribute your updated profile.')
                            SA.logger.info('')
                            continue
                        }
                    }

                    checkForPermissions(p2pNetworkNode)
                }

                SA.logger.info('These are the P2P Network Nodes we can connect to: all nodes that do not have the network services and network interfaces defined required by the Network Client were filtered out. Network nodes that require a higher minimum User Profile Balance than the one you have also were filtered out.')
                SA.logger.info('')
                for (let i = 0; i < thisObject.p2pNodesToConnect.length; i++) {
                    SA.logger.info(i + ' - ' + thisObject.p2pNodesToConnect[i].userProfile.config.codeName + ' - ' + thisObject.p2pNodesToConnect[i].node.config.codeName)
                }
                SA.logger.info('')
                break
            }
            case 'Network Peer': {
                thisObject.p2pNodesToConnect = []

                let thisP2PNodeId = SA.secrets.signingAccountSecrets.map.get(global.env.P2P_NETWORK_NODE_SIGNING_ACCOUNT).nodeId
                let nodes = SA.projects.network.utilities.appClientNetworkNodePicker.filteredNetworkNodes(
                    SA.projects.network.globals.memory.arrays.P2P_NETWORK_NODES,
                    SA.networkFilters
                )
                for (let i = 0; i < nodes.length; i++) {
                    let p2pNetworkNode = nodes[i]

                    if (p2pNetworkNode.node.p2pNetworkReference.referenceParent === undefined) { continue }
                    if (p2pNetworkNode.node.p2pNetworkReference.referenceParent.config === undefined) { continue }
                    if (p2pNetworkNode.node.p2pNetworkReference.referenceParent.config.codeName !== thisObject.networkCodeName) { continue }
                    if (p2pNetworkNode.node.p2pNetworkReference.referenceParent.type !== thisObject.networkType) { continue }

                    if (thisP2PNodeId !== p2pNetworkNode.node.id) {
                        checkForPermissions(p2pNetworkNode)
                    }
                }
                break
            }
        }

        function checkForPermissions(p2pNetworkNode) {

            if (p2pNetworkNode.node.p2pNetworkReference.referenceParent.type === "Permissioned P2P Network") {
                let petmissionGrantedArray = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(
                    p2pNetworkNode.node.p2pNetworkReference.referenceParent,
                    'Permission Granted'
                )

                for (let i = 0; i < petmissionGrantedArray.length; i++) {
                    let permissionGranted = petmissionGrantedArray[i]
                    if (permissionGranted.referenceParent === undefined) { continue }
                    if (permissionGranted.referenceParent.id === p2pNetworkClientIdentity.userProfile.id) {
                        thisObject.p2pNodesToConnect.push(p2pNetworkNode)
                    }
                }
            } else {
                thisObject.p2pNodesToConnect.push(p2pNetworkNode)
            }
        }
    }
}