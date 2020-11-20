function newEthereumActionSwitch() {

    let thisObject = {
        executeAction: executeAction,
        initialize: initialize,
        finalize: finalize
    }

    let functionLibraryGeth = newGeth()

    return thisObject

    function finalize() {
        functionLibraryGeth = undefined
    }

    function initialize() {
        /* Nothing to initialize since a Function Library does not hold any state. */
    }

    async function executeAction(action) {
        switch (action.name) {
            case 'Install Geth': {
                functionLibraryGeth.install(action.node)
                break
            }
            case 'Run Geth': {
                functionLibraryGeth.run(action.node)
                break
            }
            case 'Stop Geth': {
                functionLibraryGeth.stop(action.node)
                break
            }
        }
    }
}
