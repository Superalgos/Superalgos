function newSuperalgosActionSwitch() {

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
            case 'Get Node On Focus': {
                return UI.projects.superalgos.functionLibraries.onFocus.getNodeThatIsOnFocus(action.node)
            }

            case 'Get Node By Shortcut Key': {
                return UI.projects.superalgos.functionLibraries.shortcutKeys.getNodeByShortcutKey(action.node, action.extraParameter)
            }

            case 'Get Node Data Structure': {
                return UI.projects.superalgos.functionLibraries.protocolNode.getProtocolNode(action.node, action.extraParameter, false, true, true, true)
            }

            case 'Create UI Object': {
                UI.projects.superalgos.functionLibraries.uiObjectsFromNodes.createUiObjectFromNode(action.node, undefined, undefined, action.extraParameter)
            }
                break
            case 'Connect Children to Reference Parents': {
                UI.projects.superalgos.functionLibraries.uiObjectsFromNodes.tryToConnectChildrenWithReferenceParents()
            }
                break
            case 'Get Node By Id': {
                return UI.projects.superalgos.functionLibraries.uiObjectsFromNodes.getNodeById(action.relatedNodeId)
            }

            case 'Syncronize Tasks': {
                UI.projects.superalgos.functionLibraries.uiObjectsFromNodes.syncronizeTasksFoundAtWorkspaceWithBackEnd()
            }
                break
            case 'Syncronize Trading Sessions': {
                UI.projects.superalgos.functionLibraries.uiObjectsFromNodes.syncronizeTradingSessionsFoundAtWorkspaceWithBackEnd()
            }
                break
            case 'Syncronize Learning Sessions': {
                UI.projects.superalgos.functionLibraries.uiObjectsFromNodes.syncronizeLearningSessionsFoundAtWorkspaceWithBackEnd()
            }
                break
            case 'Play Tutorials': {
                UI.projects.superalgos.functionLibraries.uiObjectsFromNodes.playTutorials()
            }
                break
            case 'Recreate Workspace': {
                UI.projects.superalgos.functionLibraries.uiObjectsFromNodes.recreateWorkspace(action.node, action.callBackFunction)
            }
                break
            case 'Delete Workspace': {
                return UI.projects.superalgos.functionLibraries.nodeDeleter.deleteWorkspace(action.node, action.rootNodes, action.callBackFunction)
            }
                break
            case 'Copy Node Path':
                {
                    let nodePath = UI.projects.superalgos.functionLibraries.nodePath.getNodePath(action.node)

                    UI.projects.superalgos.utilities.clipboard.copyTextToClipboard(nodePath)

                    UI.projects.superalgos.spaces.cockpitSpace.setStatus(
                        nodePath + ' copied to the Clipboard.'
                        , 50, UI.projects.superalgos.spaces.cockpitSpace.statusTypes.ALL_GOOD)
                }
                break
            case 'Copy Node Value':
                {
                    let value = action.node.payload.uiObject.getValue()

                    UI.projects.superalgos.utilities.clipboard.copyTextToClipboard(value)

                    UI.projects.superalgos.spaces.cockpitSpace.setStatus(
                        value + ' copied to the Clipboard.'
                        , 50, UI.projects.superalgos.spaces.cockpitSpace.statusTypes.ALL_GOOD)
                }
                break
            case 'Copy Node Type':
                {
                    let value = action.node.type

                    UI.projects.superalgos.utilities.clipboard.copyTextToClipboard(value)

                    UI.projects.superalgos.spaces.cockpitSpace.setStatus(
                        value + ' copied to the Clipboard.'
                        , 50, UI.projects.superalgos.spaces.cockpitSpace.statusTypes.ALL_GOOD)
                }
                break
            case 'Add UI Object':
                {
                    UI.projects.superalgos.functionLibraries.uiObjectsFromNodes.addUIObject(action.node, action.relatedNodeType, action.rootNodes)
                }
                break
            case 'Add Missing Children':
                {
                    UI.projects.superalgos.functionLibraries.uiObjectsFromNodes.addMissingChildren(action.node, action.rootNodes)
                }
                break
            case 'Delete UI Object':
                {
                    UI.projects.superalgos.functionLibraries.nodeDeleter.deleteUIObject(action.node, action.rootNodes)
                }
                break
            case 'Edit Code':

                break
            case 'Share':
                {
                    let text = JSON.stringify(UI.projects.superalgos.functionLibraries.protocolNode.getProtocolNode(action.node, true, false, true, true, true))

                    let nodeName = action.node.name
                    if (nodeName === undefined) {
                        nodeName = ''
                    } else {
                        nodeName = '.' + nodeName
                    }
                    let fileName = 'Share - ' + action.node.type + ' - ' + nodeName + '.json'
                    UI.projects.superalgos.utilities.download.downloadText(fileName, text)
                }

                break
            case 'Backup':
                {
                    let text = JSON.stringify(UI.projects.superalgos.functionLibraries.protocolNode.getProtocolNode(action.node, false, false, true, true, true))

                    let nodeName = action.node.name
                    if (nodeName === undefined) {
                        nodeName = ''
                    } else {
                        nodeName = ' ' + nodeName
                    }
                    let fileName = 'Backup - ' + action.node.type + ' - ' + nodeName + '.json'
                    UI.projects.superalgos.utilities.download.downloadText(fileName, text)
                }

                break
            case 'Clone':
                {
                    let text = JSON.stringify(UI.projects.superalgos.functionLibraries.nodeCloning.getNodeClone(action.node))

                    let nodeName = action.node.name
                    if (nodeName === undefined) {
                        nodeName = ''
                    } else {
                        nodeName = ' ' + nodeName
                    }
                    let fileName = 'Clone - ' + action.node.type + ' - ' + nodeName + '.json'
                    UI.projects.superalgos.utilities.download.downloadText(fileName, text)
                }

                break
            case 'Debug Task':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.runTask(action.node, true, action.callBackFunction)
                }
                break
            case 'Run Task':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.runTask(action.node, false, action.callBackFunction)
                }
                break
            case 'Stop Task':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.stopTask(action.node, action.callBackFunction)
                }
                break
            case 'Run All Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.runAllTasks(action.node)
                }
                break
            case 'Stop All Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.stopAllTasks(action.node)
                }
                break
            case 'Run All Task Managers':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.runAllTaskManagers(action.node)
                }
                break
            case 'Stop All Task Managers':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.stopAllTaskManagers(action.node)
                }
                break
            case 'Run All Exchange Data Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.runAllExchangeDataTasks(action.node)
                }
                break
            case 'Stop All Exchange Data Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.stopAllExchangeDataTasks(action.node)
                }
                break
            case 'Run All Exchange Trading Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.runAllExchangeTradingTasks(action.node)
                }
                break
            case 'Stop All Exchange Trading Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.stopAllExchangeTradingTasks(action.node)
                }
                break
            case 'Run All Exchange Learning Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.runAllExchangeLearningTasks(action.node)
                }
                break
            case 'Stop All Exchange Learning Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.stopAllExchangeLearningTasks(action.node)
                }
                break
            case 'Run All Project Data Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.runAllProjectDataTasks(action.node)
                }
                break
            case 'Stop All Project Data Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.stopAllProjectDataTasks(action.node)
                }
                break
            case 'Run All Project Trading Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.runAllProjectTradingTasks(action.node)
                }
                break
            case 'Stop All Project Trading Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.stopAllProjectTradingTasks(action.node)
                }
                break
            case 'Run All Project Learning Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.runAllProjectLearningTasks(action.node)
                }
                break
            case 'Stop All Project Learning Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.stopAllProjectLearningTasks(action.node)
                }
                break
            case 'Run All Market Data Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.runAllMarketDataTasks(action.node)
                }
                break
            case 'Stop All Market Data Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.stopAllMarketDataTasks(action.node)
                }
                break
            case 'Run All Market Trading Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.runAllMarketTradingTasks(action.node)
                }
                break
            case 'Stop All Market Trading Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.stopAllMarketTradingTasks(action.node)
                }
                break
            case 'Run All Market Learning Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.runAllMarketLearningTasks(action.node)
                }
                break
            case 'Stop All Market Learning Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.stopAllMarketLearningTasks(action.node)
                }
                break
            case 'Run All Data Mine Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.runAllDataMineTasks(action.node)
                }
                break
            case 'Stop All Data Mine Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.stopAllDataMineTasks(action.node)
                }
                break
            case 'Run All Trading Mine Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.runAllTradingMineTasks(action.node)
                }
                break
            case 'Stop All Trading Mine Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.stopAllTradingMineTasks(action.node)
                }
                break
            case 'Run All Learning Mine Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.runAllLearningMineTasks(action.node)
                }
                break
            case 'Stop All Learning Mine Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.stopAllLearningMineTasks(action.node)
                }
                break
            case 'Add Missing Project Data Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.addMissingProjectDataTasks(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Exchange Data Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.addMissingExchangeDataTasks(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Market Data Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.addMissingMarketDataTasks(action.node)
                }
                break
            case 'Add Missing Data Mine Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.addMissingDataMineTasks(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Project Trading Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.addMissingProjectTradingTasks(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Exchange Trading Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.addMissingExchangeTradingTasks(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Market Trading Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.addMissingMarketTradingTasks(action.node)
                }
                break
            case 'Add Missing Trading Mine Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.addMissingTradingMineTasks(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Project Learning Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.addMissingProjectLearningTasks(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Exchange Learning Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.addMissingExchangeLearningTasks(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Market Learning Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.addMissingMarketLearningTasks(action.node)
                }
                break
            case 'Add Missing Learning Mine Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.addMissingLearningMineTasks(action.node, action.rootNodes)
                }
                break
            case 'Add All Tasks':
                {
                    UI.projects.superalgos.functionLibraries.taskFunctions.addAllTasks(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Crypto Exchanges':
                {
                    UI.projects.superalgos.functionLibraries.cryptoEcosystemFunctions.addMissingExchanges(action.node)
                }
                break
            case 'Add Missing Assets':
                {
                    UI.projects.superalgos.functionLibraries.cryptoEcosystemFunctions.addMissingAssets(action.node)
                }
                break
            case 'Add Missing Markets':
                {
                    UI.projects.superalgos.functionLibraries.cryptoEcosystemFunctions.addMissingMarkets(action.node)
                }
                break
            case 'Install Market':
                {
                    UI.projects.superalgos.functionLibraries.cryptoEcosystemFunctions.installMarket(action.node, action.rootNodes)
                }
                break
            case 'Uninstall Market':
                {
                    UI.projects.superalgos.functionLibraries.cryptoEcosystemFunctions.uninstallMarket(action.node, action.rootNodes)
                }
                break
            case 'Add All Output Datasets':
                {
                    UI.projects.superalgos.functionLibraries.mineFunctions.addAllOutputDatasets(action.node)
                }
                break
            case 'Add All Data Products':
                {
                    UI.projects.superalgos.functionLibraries.dataStorageFunctions.addAllDataProducts(action.node)
                }
                break
            case 'Add All Data Mine Products':
                {
                    UI.projects.superalgos.functionLibraries.dataStorageFunctions.addAllDataMineProducts(action.node, action.rootNodes)
                }
                break
            case 'Add All Learning Mine Products':
                {
                    UI.projects.superalgos.functionLibraries.dataStorageFunctions.addAllLearningMineProducts(action.node, action.rootNodes)
                }
                break
            case 'Add All Trading Mine Products':
                {
                    UI.projects.superalgos.functionLibraries.dataStorageFunctions.addAllTradingMineProducts(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Trading Session References':
                {
                    UI.projects.superalgos.functionLibraries.dataStorageFunctions.addMissingTradingSessionReferences(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Learning Session References':
                {
                    UI.projects.superalgos.functionLibraries.dataStorageFunctions.addMissingLearningSessionReferences(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Market Data Products':
                {
                    UI.projects.superalgos.functionLibraries.dataStorageFunctions.addMissingMarketDataProducts(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Market Trading Products':
                {
                    UI.projects.superalgos.functionLibraries.dataStorageFunctions.addMissingMarketTradingProducts(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Market Learning Products':
                {
                    UI.projects.superalgos.functionLibraries.dataStorageFunctions.addMissingMarketLearningProducts(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Exchange Learning Products':
                {
                    UI.projects.superalgos.functionLibraries.dataStorageFunctions.addMissingExchangeLearningProducts(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Exchange Trading Products':
                {
                    UI.projects.superalgos.functionLibraries.dataStorageFunctions.addMissingExchangeTradingProducts(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Exchange Data Products':
                {
                    UI.projects.superalgos.functionLibraries.dataStorageFunctions.addMissingExchangeDataProducts(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Project Learning Products':
                {
                    UI.projects.superalgos.functionLibraries.dataStorageFunctions.addMissingProjectLearningProducts(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Project Trading Products':
                {
                    UI.projects.superalgos.functionLibraries.dataStorageFunctions.addMissingProjectTradingProducts(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Project Data Products':
                {
                    UI.projects.superalgos.functionLibraries.dataStorageFunctions.addMissingProjectDataProducts(action.node, action.rootNodes)
                }
                break
            case 'Add All Data Dependencies':
                {
                    UI.projects.superalgos.functionLibraries.mineFunctions.addAllDataDependencies(action.node)
                }
                break
            case 'Add All Data Mine Dependencies':
                {
                    UI.projects.superalgos.functionLibraries.mineFunctions.addAllDataMineDataDependencies(action.node, action.rootNodes)
                }
                break
            case 'Add All Layer Panels':
                {
                    UI.projects.superalgos.functionLibraries.chartingSpaceFunctions.addAllLayerPanels(action.node)
                }
                break
            case 'Add All Layer Polygons':
                {
                    UI.projects.superalgos.functionLibraries.chartingSpaceFunctions.addAllLayerPolygons(action.node)
                }
                break
            case 'Add All Mine Layers':
                {
                    UI.projects.superalgos.functionLibraries.chartingSpaceFunctions.addAllMineLayers(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Time Machines':
                {
                    UI.projects.superalgos.functionLibraries.chartingSpaceFunctions.addMissingTimeMachines(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Dashboards':
                {
                    UI.projects.superalgos.functionLibraries.chartingSpaceFunctions.addMissingDashboards(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Project Dashboards':
                {
                    UI.projects.superalgos.functionLibraries.chartingSpaceFunctions.addMissingProjectDashboards(action.node, action.rootNodes)
                }
                break
            case 'Play Tutorial':
                {
                    UI.projects.superalgos.spaces.tutorialSpace.playTutorial(action.node)
                }
                break
            case 'Play Tutorial Topic':
                {
                    UI.projects.superalgos.spaces.tutorialSpace.playTutorialTopic(action.node)
                }
                break
            case 'Play Tutorial Step':
                {
                    UI.projects.superalgos.spaces.tutorialSpace.playTutorialStep(action.node)
                }
                break
            case 'Resume Tutorial':
                {
                    UI.projects.superalgos.spaces.tutorialSpace.resumeTutorial(action.node)
                }
                break
            case 'Resume Tutorial Topic':
                {
                    UI.projects.superalgos.spaces.tutorialSpace.resumeTutorialTopic(action.node)
                }
                break
            case 'Resume Tutorial Step':
                {
                    UI.projects.superalgos.spaces.tutorialSpace.resumeTutorialStep(action.node)
                }
                break
            case 'Reset Tutorial Progress':
                {
                    UI.projects.superalgos.spaces.tutorialSpace.resetTutorialProgress(action.node)
                }
                break
            case 'Send Webhook Test Message':
                {
                    UI.projects.superalgos.functionLibraries.webhookFunctions.sendTestMessage(action.node, action.callBackFunction)
                }
                break
            case 'Run Trading Session':
                {
                    UI.projects.superalgos.functionLibraries.tradingSessionFunctions.runSession(action.node, false, action.callBackFunction)
                }
                break
            case 'Resume Trading Session':
                {
                    UI.projects.superalgos.functionLibraries.tradingSessionFunctions.runSession(action.node, true, action.callBackFunction)
                }
                break
            case 'Stop Trading Session':
                {
                    UI.projects.superalgos.functionLibraries.tradingSessionFunctions.stopSession(action.node, action.callBackFunction)
                }
                break
            case 'Run Learning Session':
                {
                    UI.projects.superalgos.functionLibraries.learningSessionFunctions.runSession(action.node, false, action.callBackFunction)
                }
                break
            case 'Resume Learning Session':
                {
                    UI.projects.superalgos.functionLibraries.learningSessionFunctions.runSession(action.node, true, action.callBackFunction)
                }
                break
            case 'Stop Learning Session':
                {
                    UI.projects.superalgos.functionLibraries.learningSessionFunctions.stopSession(action.node, action.callBackFunction)
                }
                break
            case 'Run Super Action':
                {
                    UI.projects.superalgos.functionLibraries.superScriptsFunctions.runSuperScript(action.node, action.rootNodes)
                }
                break
            case 'Parent Attach': {
                UI.projects.superalgos.functionLibraries.chainAttachDetach.chainAttachNode(action.node, action.relatedNode, action.rootNodes)
            }
                break
            case 'Reference Attach': {
                UI.projects.superalgos.functionLibraries.attachDetach.referenceAttachNode(action.node, action.relatedNode, action.rootNodes)
            }
                break
            case 'Parent Detach':
                {
                    UI.projects.superalgos.functionLibraries.chainAttachDetach.chainDetachNode(action.node, action.rootNodes)
                }
                break
            case 'Reference Detach':
                {
                    UI.projects.superalgos.functionLibraries.attachDetach.referenceDetachNode(action.node)
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
                    let definition = getSchemaDocument(action.node)
                    if (definition !== undefined) {
                        UI.projects.superalgos.spaces.docsSpace.openSpaceAreaAndNavigateTo(action.node.project, 'Node', action.node.type)
                    }
                }
                break
            case 'Add Missing Plugin Projects':
                {
                    UI.projects.superalgos.functionLibraries.pluginsFunctions.pluginMissingProjects(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Data Mines':
                {
                    UI.projects.superalgos.functionLibraries.pluginsFunctions.pluginMissingDataMines(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Trading Mines':
                {
                    UI.projects.superalgos.functionLibraries.pluginsFunctions.pluginMissingTradingMines(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Trading Systems':
                {
                    UI.projects.superalgos.functionLibraries.pluginsFunctions.pluginMissingTradingSystems(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Trading Engines':
                {
                    UI.projects.superalgos.functionLibraries.pluginsFunctions.pluginMissingTradingEngines(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Learning Mines':
                {
                    UI.projects.superalgos.functionLibraries.pluginsFunctions.pluginMissingLearningMines(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Learning Systems':
                {
                    UI.projects.superalgos.functionLibraries.pluginsFunctions.pluginMissingLearningSystems(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Learning Engines':
                {
                    UI.projects.superalgos.functionLibraries.pluginsFunctions.pluginMissingLearningEngines(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Tutorials':
                {
                    UI.projects.superalgos.functionLibraries.pluginsFunctions.pluginMissingTutorials(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Workspace Projects':
                {
                    UI.projects.superalgos.functionLibraries.workspaceFunctions.addMissingWorkspaceProjects(action.node, action.rootNodes)
                }
                break
            case 'Switch To Forward Testing':
                {
                    action.node.type = "Forward Testing Session"
                    UI.projects.superalgos.spaces.floatingSpace.uiObjectConstructor.createUiObject(true, action.node.payload)
                }
                break
            case 'Switch To Live Trading':
                {
                    action.node.type = "Live Trading Session"
                    UI.projects.superalgos.spaces.floatingSpace.uiObjectConstructor.createUiObject(true, action.node.payload)
                }
                break
            case 'Switch To Paper Trading':
                {
                    action.node.type = "Paper Trading Session"
                    UI.projects.superalgos.spaces.floatingSpace.uiObjectConstructor.createUiObject(true, action.node.payload)
                }
                break
            case 'Switch To Backtesting':
                {
                    action.node.type = "Backtesting Session"
                    UI.projects.superalgos.spaces.floatingSpace.uiObjectConstructor.createUiObject(true, action.node.payload)
                }
                break
        }
    }
}
