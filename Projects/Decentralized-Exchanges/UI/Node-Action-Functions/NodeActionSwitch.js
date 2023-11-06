function newDecentralizedExchangesNodeActionSwitch() {

    let thisObject = {
        executeAction: executeAction,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {}

    function initialize() {}

    async function executeAction(action) {
        switch (action.name) {
            case 'Create New Wallet':
                UI.projects.decentralizedExchanges.nodeActionFunctions.decentralizedExchangesFunctions.createNewWallet(action.node)
                    .then(action.callBackFunction)
                    .catch(action.callBackFunction)
                break
            case 'Import Wallet from Mnemonic':
                UI.projects.decentralizedExchanges.nodeActionFunctions.decentralizedExchangesFunctions.importWalletFromMnemonic(action.node)
                    .then(action.callBackFunction)
                    .catch(action.callBackFunction)
                break
            case 'Import Wallet from Private Key':
                UI.projects.decentralizedExchanges.nodeActionFunctions.decentralizedExchangesFunctions.importWalletFromPrivateKey(action.node)
                    .then(action.callBackFunction)
                    .catch(action.callBackFunction)
                break
            case 'Add Missing Tokens': {
                let newUiObjects = await UI.projects.decentralizedExchanges.nodeActionFunctions.decentralizedExchangesFunctions.addMissingTokens(action.node)

                if (action.isInternal === false && newUiObjects !== undefined && newUiObjects.length > 0) {
                    let historyObject = {
                        action: action,
                        newUiObjects: newUiObjects,
                        nodeClones: []
                    }
                    UI.projects.workspaces.spaces.designSpace.workspace.undoStack.push(historyObject)
                    UI.projects.workspaces.spaces.designSpace.workspace.redoStack = []
                    UI.projects.workspaces.spaces.designSpace.workspace.buildSystemMenu()
                }
                break
            }
            case 'Add Missing Pairs': {
                let newPairObjects = await UI.projects.decentralizedExchanges.nodeActionFunctions.decentralizedExchangesFunctions.addMissingPairs(action.node)

                if (action.isInternal === false && newPairObjects !== undefined && newPairObjects.length > 0) {
                    let historyObject = {
                        action: action,
                        newUiObjects: newPairObjects,
                        nodeClones: []
                    }
                    UI.projects.workspaces.spaces.designSpace.workspace.undoStack.push(historyObject)
                    UI.projects.workspaces.spaces.designSpace.workspace.redoStack = []
                    UI.projects.workspaces.spaces.designSpace.workspace.buildSystemMenu()
                }
                break
            }
            case 'Install Pair': {
                /* inefficient brute-force method */
                let nodeClones = []
                for (let rootNode of action.rootNodes) {
                    if (rootNode.type === 'LAN Network' || rootNode.type === 'Charting Space') {
                        let nodeClone = UI.projects.visualScripting.nodeActionFunctions.nodeCloning.getNodeClone(rootNode, false)
                        nodeClones.push(nodeClone)
                    }
                }
                let historyObject = {
                    action: action,
                    nodeClones: nodeClones
                }

                await UI.projects.decentralizedExchanges.nodeActionFunctions.decentralizedExchangesFunctions.installSwapPair(action.node, action.rootNodes)

                if (action.isInternal === false) {
                    UI.projects.workspaces.spaces.designSpace.workspace.undoStack.push(historyObject)
                    UI.projects.workspaces.spaces.designSpace.workspace.redoStack = []
                    UI.projects.workspaces.spaces.designSpace.workspace.buildSystemMenu()
                }
                break
            }
            case 'Uninstall Pair': {
                let nodeClones = []
                for (let rootNode of action.rootNodes) {
                    if (rootNode.type === 'LAN Network' || rootNode.type === 'Charting Space') {
                        let nodeClone = UI.projects.visualScripting.nodeActionFunctions.nodeCloning.getNodeClone(rootNode, false)
                        nodeClones.push(nodeClone)
                    }
                }
                let historyObject = {
                    action: action,
                    nodeClones: nodeClones
                }

                await UI.projects.decentralizedExchanges.nodeActionFunctions.decentralizedExchangesFunctions.uninstallSwapPair(action.node, action.rootNodes)

                if (action.isInternal === false) {
                    UI.projects.workspaces.spaces.designSpace.workspace.undoStack.push(historyObject)
                    UI.projects.workspaces.spaces.designSpace.workspace.redoStack = []
                    UI.projects.workspaces.spaces.designSpace.workspace.buildSystemMenu()
                }
                break
            }
            default:
                console.log("[WARN] Action sent to Decentralized Exchanges Action Switch does not belong here. Verify at the App Schema file of the node that triggered this action that the actionProject is pointing to the right project. -> Action = " + action.name + " -> Action Node Name = " + action.node.name)
        }
    }
}
