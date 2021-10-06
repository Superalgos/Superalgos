function newDataMiningActionSwitch() {

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
            case 'Add All Output Datasets':
                {
                    UI.projects.dataMining.functionLibraries.mineFunctions.addAllOutputDatasets(action.node)
                }
                break
            case 'Add All Data Dependencies':
                {
                    UI.projects.dataMining.functionLibraries.mineFunctions.addAllDataDependencies(action.node)
                }
                break
            case 'Add All Data Mine Dependencies':
                {
                    UI.projects.dataMining.functionLibraries.mineFunctions.addAllDataMineDataDependencies(action.node, action.rootNodes)
                }
                break
        }
    }
}
