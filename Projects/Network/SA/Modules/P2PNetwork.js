exports.newNetworkModulesP2PNetwork = function newNetworkModulesP2PNetwork() {
    /*
    This module represents the P2P Network and it is needed to enable the connection
    of this current node to other peers.
    */
    let thisObject = {
        p2pNodesToConnect: undefined,
        /* Framework Functions */
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.p2pNodesToConnect = undefined
    }

    async function initialize(callerRole) {

        switch (callerRole) {
            case 'Network Client': {
                thisObject.p2pNodesToConnect = []

                for (let i = 0; i < SA.projects.network.globals.memory.arrays.P2P_NETWORK_NODES.length; i++) {
                    let p2pNetworkNode = SA.projects.network.globals.memory.arrays.P2P_NETWORK_NODES[i]
                    thisObject.p2pNodesToConnect.push(p2pNetworkNode)
                }
                break
            }
            case 'Network Peer': {
                thisObject.p2pNodesToConnect = []

                let thisP2PNodeId = SA.secrets.map.get(global.env.P2P_NETWORK_NODE_SIGNING_ACCOUNT).nodeId
                for (let i = 0; i < SA.projects.network.globals.memory.arrays.P2P_NETWORK_NODES.length; i++) {
                    let p2pNetworkNode = SA.projects.network.globals.memory.arrays.P2P_NETWORK_NODES[i]
                    if (thisP2PNodeId !== p2pNetworkNode.node.id) {
                        thisObject.p2pNodesToConnect.push(p2pNetworkNode)
                    }
                }
                break
            }
        }
    }
}