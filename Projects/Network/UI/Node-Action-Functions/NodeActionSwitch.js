function newNetworkNodeActionSwitch() {

    let thisObject = {
        executeAction: executeAction,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    function initialize() {
        /* Nothing to initialize since a Function Library does not hold any state. */
    }

    async function executeAction(action) {
        switch (action.name) {
            case 'Add Specified P2P Network':
                {
                    UI.projects.network.nodeActionFunctions.pluginsFunctions.addSpecifiedP2PNetwork(action.node, action.rootNodes)
                }
                break
            default: {
                console.log("[WARN] Action sent to Network Action Switch does not belong here. Verify at the App Schema file of the node that triggered this action that the actionProject is pointing to the right project. -> Action = " + action.name + " -> Action Node Name = " + action.node.name)
            }
        }
    }
}
