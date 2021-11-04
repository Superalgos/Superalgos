exports.newNetworkModulesP2PNetwork = function newNetworkModulesP2PNetwork() {
    /*
    This module represents the P2P Network and it is needed to enable the connection
    of this current node to other peers.
    */
    let thisObject = {
        joinTheNetworkAsPeer: joinTheNetworkAsPeer,
        /* Framework Functions */
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    async function initialize() {
        p2pNodesToConnect = []
        /*
        We will setup here the maps and arryas we will need to operate within the P2P Network.
        */
        let thisP2PNodeId = SA.secrets.map.get(global.env.P2P_NETWORK_NODE_SIGNING_ACCOUNT).signingAccountChildId
        for (let i = 0; i < SA.projects.network.globals.memory.arrays.P2P_NETWORK_NODES.length; i++) {
            let p2pNetworkNode = SA.projects.network.globals.memory.arrays.P2P_NETWORK_NODES[i]
            if (thisP2PNodeId !== p2pNetworkNode.node.id) {
                p2pNodesToConnect.push(p2pNetworkNode)
            }
        }
    }

    function joinTheNetworkAsPeer() {
        /*
        To join the network we will need to thorugh the list of Network Nodes and pick one to connect to. 
        */
    }
}