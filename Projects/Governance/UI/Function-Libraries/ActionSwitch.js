function newGovernanceActionSwitch() {

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
            case 'Install Assets': {
                {
                    UI.projects.governance.functionLibraries.assets.installAssets(action.node, action.rootNodes)
                    break
                }
            }
        }
    }
}
