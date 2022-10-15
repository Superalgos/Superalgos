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
        let thisP2pNetworkClient = TS.projects.foundations.globals.taskConstants.TASK_NODE.p2pNetworkClient

        switch (callerRole) {
            case 'Network Client': {
                thisObject.p2pNodesToConnect = []
                
                let connectOnlyRequestedUserProfile = false
                let connectOnlyProfile

                /*
                // We will check the p2pNetworkClient node located at this task for a specified network node to connect this task to.
                // If a specific network node is requested then it will be the only available network node to that task.
                */
                if (thisP2pNetworkClient !== undefined) {
                    if (thisP2pNetworkClient.config !== undefined) {
                        if (thisP2pNetworkClient.config.onlyConnectToNetworkNodeFromUserProfile !== undefined) {
                            connectOnlyProfile = thisP2pNetworkClient.config.onlyConnectToNetworkNodeFromUserProfile
                            connectOnlyRequestedUserProfile = true
                        }
                    }
                } else {
                    console.log('[ERROR] The P2P Network Client node is required at each task. Please add the node and try again.')
                }


                for (let i = 0; i < SA.projects.network.globals.memory.arrays.P2P_NETWORK_NODES.length; i++) {
                    let p2pNetworkNode = SA.projects.network.globals.memory.arrays.P2P_NETWORK_NODES[i]

                    // If we have a defined network node profile to connect to we will only check that profile.
                    if (connectOnlyRequestedUserProfile) {
                        if (p2pNetworkNode.userProfile.name !== connectOnlyProfile) { continue }
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
                        console.log('')
                        console.log((new Date()).toISOString(), '[INFO] Network Client User Profile ' + userProfileCodeName + ' has a Balance of ' + SA.projects.governance.utilities.balances.toSABalanceString(userProfileBalance) + ' while the Minimun Balance Required to connect to the Network Node "' + p2pNetworkNode.userProfile.config.codeName + '/' + p2pNetworkNode.node.config.codeName + '" is ' + SA.projects.governance.utilities.balances.toSABalanceString(clientMinimunBalance) + '. If you want to be able to connect to this Network Node you will need to earn or buy more SA tokens and try again.')
                        console.log('')
                        continue
                    }

                    checkForPermissions(p2pNetworkNode)
                }

                console.log((new Date()).toISOString(), '[INFO] These are the P2P Network Nodes we can connect to: all nodes that do not have the network services and network interfaces defined required by the Network Client were filtered out. Network nodes that requires a minimun User Profile Balance than the one you have also been filtered out.')
                console.log('')
                for (let i = 0; i < thisObject.p2pNodesToConnect.length; i++) {
                    console.log(i + ' - ' + thisObject.p2pNodesToConnect[i].userProfile.config.codeName + ' - ' + thisObject.p2pNodesToConnect[i].node.config.codeName)
                }
                console.log('')
                break
            }
            case 'Network Peer': {
                thisObject.p2pNodesToConnect = []

                let thisP2PNodeId = SA.secrets.signingAccountSecrets.map.get(global.env.P2P_NETWORK_NODE_SIGNING_ACCOUNT).nodeId
                for (let i = 0; i < SA.projects.network.globals.memory.arrays.P2P_NETWORK_NODES.length; i++) {
                    let p2pNetworkNode = SA.projects.network.globals.memory.arrays.P2P_NETWORK_NODES[i]

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