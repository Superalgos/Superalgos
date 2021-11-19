function newPortfolioManagementActionSwitch() {

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
            case 'Run Portfolio Session':
                {
                    UI.projects.portfolioManagement.functionLibraries.portfolioSessionFunctions.runSession(action.node, false, action.callBackFunction)
                }
                break
            case 'Resume Portfolio Session':
                {
                    UI.projects.portfolioManagement.functionLibraries.portfolioSessionFunctions.runSession(action.node, true, action.callBackFunction)
                }
                break
            case 'Stop Portfolio Session':
                {
                    UI.projects.portfolioManagement.functionLibraries.portfolioSessionFunctions.stopSession(action.node, action.callBackFunction)
                }
                break
            case 'Run Managed Sessions':
                {
                    UI.projects.portfolioManagement.functionLibraries.portfolioSessionFunctions.runManagedSessions(action.node);
                }
                break;
            case 'Stop Managed Sessions':
                {
                    UI.projects.portfolioManagement.functionLibraries.portfolioSessionFunctions.stopManagedSessions(action.node);
                }
                break;
            default: {
                console.log("[WARN] Action sent to Portfolio-Management Action Switch does not belong here. Verify at the App Schema file of the node that triggered this action that the actionProject is pointing to the right project. -> Action = " + action.name + " -> Action Node Name = " + action.node.name)
            }
        }
    }
}
