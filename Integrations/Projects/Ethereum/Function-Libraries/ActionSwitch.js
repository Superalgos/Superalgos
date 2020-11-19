function newEthereumActionSwitch() {

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
            case 'Create Wallet Account': {
                UI.projects.ethereum.functionLibraries.accounts.createWalletAccount(action.node)
                break
            }
        }
    }
}
