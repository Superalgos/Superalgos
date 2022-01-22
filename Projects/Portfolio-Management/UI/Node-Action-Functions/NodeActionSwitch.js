function newPortfolioManagementNodeActionSwitch() {

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
                    UI.projects.portfolioManagement.nodeActionFunctions.portfolioSessionFunctions.runSession(action.node, false, action.callBackFunction)
                }
                break
            case 'Resume Portfolio Session':
                {
                    UI.projects.portfolioManagement.nodeActionFunctions.portfolioSessionFunctions.runSession(action.node, true, action.callBackFunction)
                }
                break
            case 'Stop Portfolio Session':
                {
                    UI.projects.portfolioManagement.nodeActionFunctions.portfolioSessionFunctions.stopSession(action.node, action.callBackFunction)
                }
                break
            case 'Run Managed Sessions':
                {
                    UI.projects.portfolioManagement.nodeActionFunctions.portfolioSessionFunctions.runManagedSessions(action.node);
                }
                break;
            case 'Stop Managed Sessions':
                {
                    UI.projects.portfolioManagement.nodeActionFunctions.portfolioSessionFunctions.stopManagedSessions(action.node);
                }
                break;
            case 'Add Missing Project Portfolio Tasks':
                {
                    UI.projects.foundations.nodeActionFunctions.taskFunctions.addMissingProjectPortfolioTasks(action.node, action.rootNodes)
                }
                break;
            case 'Add Missing Exchange Portfolio Tasks':
                {
                    UI.projects.foundations.nodeActionFunctions.taskFunctions.addMissingExchangePortfolioTasks(action.node, action.rootNodes)
                }
                break;
            case 'Add Missing Market Portfolio Tasks':
                {
                    UI.projects.foundations.nodeActionFunctions.taskFunctions.addMissingMarketPortfolioTasks(action.node)
                }
                break;
            case 'Add Missing Portfolio Mine Tasks':
                {
                    UI.projects.foundations.nodeActionFunctions.taskFunctions.addMissingPortfolioMineTasks(action.node, action.rootNodes)
                }
                break;
            case 'Add All Tasks':
                {
                    UI.projects.foundations.nodeActionFunctions.taskFunctions.addAllTasks(action.node, action.rootNodes)
                }
                break;
            case 'Debug Task':
                {
                    UI.projects.foundations.nodeActionFunctions.taskFunctions.runTask(action.node, true, action.callBackFunction)
                }
                break;
            case 'Run Task':
                {
                    UI.projects.foundations.nodeActionFunctions.taskFunctions.runTask(action.node, false, action.callBackFunction)
                }
                break;
            case 'Stop Task':
                {
                    UI.projects.foundations.nodeActionFunctions.taskFunctions.stopTask(action.node, action.callBackFunction)
                }
                break;
            case 'Run All Tasks':
                {
                    UI.projects.foundations.nodeActionFunctions.taskFunctions.runAllTasks(action.node)
                }
                break;
            case 'Stop All Tasks':
                {
                    UI.projects.foundations.nodeActionFunctions.taskFunctions.stopAllTasks(action.node)
                }
                break;
            case 'Run All Task Managers':
                {
                    UI.projects.foundations.nodeActionFunctions.taskFunctions.runAllTaskManagers(action.node)
                }
                break;
            case 'Stop All Task Managers':
                {
                    UI.projects.foundations.nodeActionFunctions.taskFunctions.stopAllTaskManagers(action.node)
                }
                break;
            case 'Run All Portfolio Mine Tasks':
                {
                    UI.projects.foundations.nodeActionFunctions.taskFunctions.runAllPortfolioMineTasks(action.node)
                }
                break;
            case 'Stop All Portfolio Mine Tasks':
                {
                    UI.projects.foundations.nodeActionFunctions.taskFunctions.stopAllPortfolioMineTasks(action.node)
                }
                break;
            case 'Add All Portfolio Mine Products':
                {
                    UI.projects.foundations.nodeActionFunctions.dataStorageFunctions.addAllPortfolioMineProducts(action.node, action.rootNodes)
                }
                break;
            case 'Run All Exchange Portfolio Tasks':
                {
                    UI.projects.foundations.nodeActionFunctions.taskFunctions.runAllExchangePortfolioTasks(action.node)
                }
                break;
            case 'Stop All Exchange Portfolio Tasks':
                {
                    UI.projects.foundations.nodeActionFunctions.taskFunctions.stopAllExchangePortfolioTasks(action.node)
                }
                break;
            case 'Run All Project Portfolio Tasks':
                {
                    UI.projects.foundations.nodeActionFunctions.taskFunctions.runAllProjectPortfolioTasks(action.node)
                }
                break;
            case 'Stop All Project Portfolio Tasks':
                {
                    UI.projects.foundations.nodeActionFunctions.taskFunctions.stopAllProjectPortfolioTasks(action.node)
                }
                break;
            case 'Run All Market Portfolio Tasks':
                {
                    UI.projects.foundations.nodeActionFunctions.taskFunctions.runAllMarketPortfolioTasks(action.node)
                }
                break;
            case 'Stop All Market Portfolio Tasks':
                {
                    UI.projects.foundations.nodeActionFunctions.taskFunctions.stopAllMarketPortfolioTasks(action.node)
                }
                break;
            case 'Add Missing Portfolio Session References':
                {
                    UI.projects.foundations.nodeActionFunctions.dataStorageFunctions.addMissingPortfolioSessionReferences(action.node, action.rootNodes)
                }
                break;
            case 'Add Missing Market Portfolio Products':
                {
                    UI.projects.foundations.nodeActionFunctions.dataStorageFunctions.addMissingMarketPortfolioProducts(action.node, action.rootNodes)
                }
                break;
            case 'Add Missing Exchange Portfolio Products':
                {
                    UI.projects.foundations.nodeActionFunctions.dataStorageFunctions.addMissingExchangePortfolioProducts(action.node, action.rootNodes)
                }
                break;
            case 'Add Missing Project Portfolio Products':
                {
                    UI.projects.foundations.nodeActionFunctions.dataStorageFunctions.addMissingProjectPortfolioProducts(action.node, action.rootNodes)
                }
                break;
            case 'Switch To Backtesting Portfolio':
                {
                    action.node.type = "Backtesting Portfolio Session"
                    UI.projects.foundations.spaces.floatingSpace.uiObjectConstructor.createUiObject(true, action.node.payload)
                }
                break;
            case 'Switch To Live Portfolio':
                {
                    action.node.type = "Live Portfolio Session"
                    UI.projects.foundations.spaces.floatingSpace.uiObjectConstructor.createUiObject(true, action.node.payload)
                }
                break;
            case 'Switch To Paper Portfolio':
                {
                    action.node.type = "Paper Portfolio Session"
                    UI.projects.foundations.spaces.floatingSpace.uiObjectConstructor.createUiObject(true, action.node.payload)
                }
                break;
            case 'Add All Data Products':
                {
                    UI.projects.foundations.nodeActionFunctions.dataStorageFunctions.addAllDataProducts(action.node)
                }
                break;
            case 'Add All Data Mine Products':
                {
                    UI.projects.foundations.nodeActionFunctions.dataStorageFunctions.addAllDataMineProducts(action.node, action.rootNodes)
                }
                break;
            case 'Add Missing Trading Session References':
                {
                    UI.projects.foundations.nodeActionFunctions.dataStorageFunctions.addMissingTradingSessionReferences(action.node, action.rootNodes)
                }
                break;
            default: {
                console.log("[WARN] Action sent to Portfolio-Management Action Switch does not belong here. Verify at the App Schema file of the node that triggered this action that the actionProject is pointing to the right project. -> Action = " + action.name + " -> Action Node Name = " + action.node.name)
            }
        }
    }
}