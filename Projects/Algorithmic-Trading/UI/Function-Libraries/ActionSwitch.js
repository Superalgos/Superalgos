function newAlgorithmicTradingActionSwitch() {

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
            case 'Run Trading Session':
                {
                    UI.projects.algorithmicTrading.functionLibraries.tradingSessionFunctions.runSession(action.node, false, action.callBackFunction)
                }
                break
            case 'Resume Trading Session':
                {
                    UI.projects.algorithmicTrading.functionLibraries.tradingSessionFunctions.runSession(action.node, true, action.callBackFunction)
                }
                break
            case 'Stop Trading Session':
                {
                    UI.projects.algorithmicTrading.functionLibraries.tradingSessionFunctions.stopSession(action.node, action.callBackFunction)
                }
                break
            default: {
                console.log("[WARN] Action sent to Algorithmic-Trading Action Switch does not belong here. Verify at the App Schema file of the node that triggered this action that the actionProject is pointing to the right project. -> Action = " + action.name + " -> Action Node Name = " + action.node.name)
            }
        }
    }
}
