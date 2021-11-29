function newFoundationsActionSwitch() {

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
            case 'Debug Task':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.runTask(action.node, true, action.callBackFunction)
                }
                break
            case 'Run Task':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.runTask(action.node, false, action.callBackFunction)
                }
                break
            case 'Stop Task':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.stopTask(action.node, action.callBackFunction)
                }
                break
            case 'Run All Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.runAllTasks(action.node)
                }
                break
            case 'Stop All Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.stopAllTasks(action.node)
                }
                break
            case 'Run All Task Managers':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.runAllTaskManagers(action.node)
                }
                break
            case 'Stop All Task Managers':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.stopAllTaskManagers(action.node)
                }
                break

            case 'Run All Portfolio Task Managers':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.runAllTaskManagers(action.node)
                }
                break
            case 'Stop All Portfolio Task Managers':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.stopAllTaskManagers(action.node)
                }
                break

            case 'Run All Managed Tasks':
                {   /* Portfolio Task References */
                    UI.projects.foundations.functionLibraries.taskFunctions.runAllManagedTasks(action.node);
                }
                break;
            case 'Stop All Managed Tasks':
                {   /* Portfolio Task References */
                    UI.projects.foundations.functionLibraries.taskFunctions.stopAllManagedTasks(action.node);
                }
                break;
            case 'Run All Exchange Data Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.runAllExchangeDataTasks(action.node)
                }
                break
            case 'Stop All Exchange Data Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.stopAllExchangeDataTasks(action.node)
                }
                break
            case 'Run All Exchange Trading Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.runAllExchangeTradingTasks(action.node)
                }
                break
            case 'Stop All Exchange Trading Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.stopAllExchangeTradingTasks(action.node)
                }
                break
            case 'Run All Exchange Portfolio Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.runAllExchangePortfolioTasks(action.node)
                }
                break
            case 'Stop All Exchange Portfolio Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.stopAllExchangePortfolioTasks(action.node)
                }
                break
            case 'Run All Exchange Learning Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.runAllExchangeLearningTasks(action.node)
                }
                break
            case 'Stop All Exchange Learning Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.stopAllExchangeLearningTasks(action.node)
                }
                break
            case 'Run All Project Data Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.runAllProjectDataTasks(action.node)
                }
                break
            case 'Stop All Project Data Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.stopAllProjectDataTasks(action.node)
                }
                break
            case 'Run All Project Trading Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.runAllProjectTradingTasks(action.node)
                }
                break
            case 'Stop All Project Trading Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.stopAllProjectTradingTasks(action.node)
                }
                break
            case 'Run All Project Portfolio Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.runAllProjectPortfolioTasks(action.node)
                }
                break
            case 'Stop All Project Portfolio Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.stopAllProjectPortfolioTasks(action.node)
                }
                break
            case 'Run All Project Learning Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.runAllProjectLearningTasks(action.node)
                }
                break
            case 'Stop All Project Learning Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.stopAllProjectLearningTasks(action.node)
                }
                break
            case 'Run All Market Data Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.runAllMarketDataTasks(action.node)
                }
                break
            case 'Stop All Market Data Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.stopAllMarketDataTasks(action.node)
                }
                break
            case 'Run All Market Trading Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.runAllMarketTradingTasks(action.node)
                }
                break
            case 'Stop All Market Trading Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.stopAllMarketTradingTasks(action.node)
                }
                break
            case 'Run All Market Portfolio Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.runAllMarketPortfolioTasks(action.node)
                }
                break
            case 'Stop All Market Portfolio Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.stopAllMarketPortfolioTasks(action.node)
                }
                break
            case 'Run All Market Learning Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.runAllMarketLearningTasks(action.node)
                }
                break
            case 'Stop All Market Learning Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.stopAllMarketLearningTasks(action.node)
                }
                break
            case 'Run All Data Mine Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.runAllDataMineTasks(action.node)
                }
                break
            case 'Stop All Data Mine Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.stopAllDataMineTasks(action.node)
                }
                break
            case 'Run All Trading Mine Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.runAllTradingMineTasks(action.node)
                }
                break
            case 'Stop All Trading Mine Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.stopAllTradingMineTasks(action.node)
                }
                break
            case 'Run All Portfolio Mine Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.runAllPortfolioMineTasks(action.node)
                }
                break
            case 'Stop All Portfolio Mine Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.stopAllPortfolioMineTasks(action.node)
                }
                break
            case 'Run All Learning Mine Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.runAllLearningMineTasks(action.node)
                }
                break
            case 'Stop All Learning Mine Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.stopAllLearningMineTasks(action.node)
                }
                break
            case 'Add Missing Project Data Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.addMissingProjectDataTasks(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Exchange Data Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.addMissingExchangeDataTasks(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Market Data Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.addMissingMarketDataTasks(action.node)
                }
                break
            case 'Add Missing Data Mine Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.addMissingDataMineTasks(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Project Trading Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.addMissingProjectTradingTasks(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Exchange Trading Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.addMissingExchangeTradingTasks(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Market Trading Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.addMissingMarketTradingTasks(action.node)
                }
                break
            case 'Add Missing Trading Mine Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.addMissingTradingMineTasks(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Project Portfolio Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.addMissingProjectPortfolioTasks(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Exchange Portfolio Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.addMissingExchangePortfolioTasks(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Market Portfolio Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.addMissingMarketPortfolioTasks(action.node)
                }
                break
            case 'Add Missing Portfolio Mine Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.addMissingPortfolioMineTasks(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Project Learning Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.addMissingProjectLearningTasks(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Exchange Learning Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.addMissingExchangeLearningTasks(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Market Learning Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.addMissingMarketLearningTasks(action.node)
                }
                break
            case 'Add Missing Learning Mine Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.addMissingLearningMineTasks(action.node, action.rootNodes)
                }
                break
            case 'Add All Tasks':
                {
                    UI.projects.foundations.functionLibraries.taskFunctions.addAllTasks(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Crypto Exchanges':
                {
                    UI.projects.foundations.functionLibraries.cryptoEcosystemFunctions.addMissingExchanges(action.node)
                }
                break
            case 'Add Missing Assets':
                {
                    UI.projects.foundations.functionLibraries.cryptoEcosystemFunctions.addMissingAssets(action.node)
                }
                break
            case 'Add Missing Markets':
                {
                    UI.projects.foundations.functionLibraries.cryptoEcosystemFunctions.addMissingMarkets(action.node)
                }
                break
            case 'Install Market':
                {
                    UI.projects.foundations.functionLibraries.cryptoEcosystemFunctions.installMarket(action.node, action.rootNodes)
                }
                break
            case 'Uninstall Market':
                {
                    UI.projects.foundations.functionLibraries.cryptoEcosystemFunctions.uninstallMarket(action.node, action.rootNodes)
                }
                break
            case 'Add All Data Products':
                {
                    UI.projects.foundations.functionLibraries.dataStorageFunctions.addAllDataProducts(action.node)
                }
                break
            case 'Add All Data Mine Products':
                {
                    UI.projects.foundations.functionLibraries.dataStorageFunctions.addAllDataMineProducts(action.node, action.rootNodes)
                }
                break
            case 'Add All Learning Mine Products':
                {
                    UI.projects.foundations.functionLibraries.dataStorageFunctions.addAllLearningMineProducts(action.node, action.rootNodes)
                }
                break
            case 'Add All Trading Mine Products':
                {
                    UI.projects.foundations.functionLibraries.dataStorageFunctions.addAllTradingMineProducts(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Trading Session References':
                {
                    UI.projects.foundations.functionLibraries.dataStorageFunctions.addMissingTradingSessionReferences(action.node, action.rootNodes)
                }
                break
            case 'Add All Portfolio Mine Products':
                {
                    UI.projects.foundations.functionLibraries.dataStorageFunctions.addAllPortfolioMineProducts(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Portfolio Session References':
                {
                    UI.projects.foundations.functionLibraries.dataStorageFunctions.addMissingPortfolioSessionReferences(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Learning Session References':
                {
                    UI.projects.foundations.functionLibraries.dataStorageFunctions.addMissingLearningSessionReferences(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Market Data Products':
                {
                    UI.projects.foundations.functionLibraries.dataStorageFunctions.addMissingMarketDataProducts(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Market Trading Products':
                {
                    UI.projects.foundations.functionLibraries.dataStorageFunctions.addMissingMarketTradingProducts(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Market Portfolio Products':
                {
                    UI.projects.foundations.functionLibraries.dataStorageFunctions.addMissingMarketPortfolioProducts(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Market Learning Products':
                {
                    UI.projects.foundations.functionLibraries.dataStorageFunctions.addMissingMarketLearningProducts(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Exchange Learning Products':
                {
                    UI.projects.foundations.functionLibraries.dataStorageFunctions.addMissingExchangeLearningProducts(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Exchange Trading Products':
                {
                    UI.projects.foundations.functionLibraries.dataStorageFunctions.addMissingExchangeTradingProducts(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Exchange Portfolio Products':
                {
                    UI.projects.foundations.functionLibraries.dataStorageFunctions.addMissingExchangePortfolioProducts(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Exchange Data Products':
                {
                    UI.projects.foundations.functionLibraries.dataStorageFunctions.addMissingExchangeDataProducts(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Project Learning Products':
                {
                    UI.projects.foundations.functionLibraries.dataStorageFunctions.addMissingProjectLearningProducts(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Project Trading Products':
                {
                    UI.projects.foundations.functionLibraries.dataStorageFunctions.addMissingProjectTradingProducts(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Project Portfolio Products':
                {
                    UI.projects.foundations.functionLibraries.dataStorageFunctions.addMissingProjectPortfolioProducts(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Project Data Products':
                {
                    UI.projects.foundations.functionLibraries.dataStorageFunctions.addMissingProjectDataProducts(action.node, action.rootNodes)
                }
                break
            case 'Add All Layer Panels':
                {
                    UI.projects.foundations.functionLibraries.chartingSpaceFunctions.addAllLayerPanels(action.node)
                }
                break
            case 'Add All Layer Polygons':
                {
                    UI.projects.foundations.functionLibraries.chartingSpaceFunctions.addAllLayerPolygons(action.node)
                }
                break
            case 'Add All Mine Layers':
                {
                    UI.projects.foundations.functionLibraries.chartingSpaceFunctions.addAllMineLayers(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Time Machines':
                {
                    UI.projects.foundations.functionLibraries.chartingSpaceFunctions.addMissingTimeMachines(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Dashboards':
                {
                    UI.projects.foundations.functionLibraries.chartingSpaceFunctions.addMissingDashboards(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Project Dashboards':
                {
                    UI.projects.foundations.functionLibraries.chartingSpaceFunctions.addMissingProjectDashboards(action.node, action.rootNodes)
                }
                break
            case 'Send Webhook Test Message':
                {
                    UI.projects.foundations.functionLibraries.webhookFunctions.sendTestMessage(action.node, action.callBackFunction)
                }
                break
            case 'Run Super Action':
                {
                    UI.projects.foundations.functionLibraries.superScriptsFunctions.runSuperScript(action.node, action.rootNodes)
                }
                break
            case 'Push Code to Javascript Code':
                {
                    action.node.javascriptCode.code = action.node.code
                }
                break
            case 'Fetch Code to Javascript Code':
                {
                    action.node.code = action.node.javascriptCode.code
                }
                break
            case 'Open Documentation':
                {
                    let docs = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(action.node.payload, 'docs')

                    if (docs === undefined) {
                        let definition = getSchemaDocument(action.node)
                        if (definition !== undefined) {
                            UI.projects.education.spaces.docsSpace.openSpaceAreaAndNavigateTo(action.node.project, 'Node', action.node.type)
                        }
                    } else {
                        UI.projects.education.spaces.docsSpace.openSpaceAreaAndNavigateTo(docs.project, docs.category, docs.type, docs.anchor, docs.nodeId, docs.placeholder)
                    }
                }
                break
            case 'Add Missing Workspace Projects':
                {
                    UI.projects.foundations.functionLibraries.workspaceFunctions.addMissingWorkspaceProjects(action.node, action.rootNodes)
                }
                break
            case 'Add Specified Workspace Project':
            {
                UI.projects.foundations.functionLibraries.workspaceFunctions.addSpecifiedWorkspaceProject(action.node, action.rootNodes)
            }
                break
            case 'Check For Missing References':
                {
                    UI.projects.foundations.functionLibraries.workspaceFunctions.checkForMissingReferences(action.rootNodes)
                }
                break
            case 'Fix Missing References':
                {
                    UI.projects.foundations.functionLibraries.workspaceFunctions.fixMissingReferences(action.rootNodes)
                }
                break    
            case 'Switch To Forward Testing':
                {
                    action.node.type = "Forward Testing Session"
                    UI.projects.foundations.spaces.floatingSpace.uiObjectConstructor.createUiObject(true, action.node.payload)
                }
                break
            case 'Switch To Live Trading':
                {
                    action.node.type = "Live Trading Session"
                    UI.projects.foundations.spaces.floatingSpace.uiObjectConstructor.createUiObject(true, action.node.payload)
                }
                break
            case 'Switch To Paper Trading':
                {
                    action.node.type = "Paper Trading Session"
                    UI.projects.foundations.spaces.floatingSpace.uiObjectConstructor.createUiObject(true, action.node.payload)
                }
                break
            case 'Switch To Live Portfolio':
                {
                    action.node.type = "Live Portfolio Session"
                    UI.projects.foundations.spaces.floatingSpace.uiObjectConstructor.createUiObject(true, action.node.payload)
                }
                break
            case 'Switch To Paper Portfolio':
                {
                    action.node.type = "Paper Portfolio Session"
                    UI.projects.foundations.spaces.floatingSpace.uiObjectConstructor.createUiObject(true, action.node.payload)
                }
                break
            case 'Switch To Backtesting':
                {
                    action.node.type = "Backtesting Session"
                    UI.projects.foundations.spaces.floatingSpace.uiObjectConstructor.createUiObject(true, action.node.payload)
                }
                break
            case 'Save node to be moved':
                {
                    UI.projects.foundations.spaces.floatingSpace.saveFloatingObjectToBeMoved()
                }
                break
            case 'Snap saved node to position':
                {
                    UI.projects.foundations.spaces.floatingSpace.moveFloatingObject(action.node.payload.position)
                }
                break
            case 'Install Product':
                {
                    UI.projects.foundations.functionLibraries.productFunctions.installProduct(action.node, action.rootNodes)
                }
                break                

            default: {
                console.log("[WARN] Action sent to Foundations Action Switch does not belong here. Verify at the App Schema file of the node that triggered this action that the actionProject is pointing to the right project. -> Action = " + action.name + " -> Action Node Name = " + action.node.name)
            }
        }
    }
}
