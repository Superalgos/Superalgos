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
            case 'Get Node On Focus': {
                return UI.projects.foundations.functionLibraries.onFocus.getNodeThatIsOnFocus(action.node)
            }

            case 'Get Node By Shortcut Key': {
                return UI.projects.foundations.functionLibraries.shortcutKeys.getNodeByShortcutKey(action.node, action.extraParameter)
            }

            case 'Get Node Data Structure': {
                return UI.projects.foundations.functionLibraries.protocolNode.getProtocolNode(action.node, action.extraParameter, false, true, true, true)
            }

            case 'Create UI Object': {
                UI.projects.foundations.functionLibraries.uiObjectsFromNodes.createUiObjectFromNode(action.node, undefined, undefined, action.extraParameter)
            }
                break
            case 'Connect Children to Reference Parents': {
                UI.projects.foundations.functionLibraries.uiObjectsFromNodes.tryToConnectChildrenWithReferenceParents()
            }
                break
            case 'Get Node By Id': {
                return UI.projects.foundations.functionLibraries.uiObjectsFromNodes.getNodeById(action.relatedNodeId)
            }

            case 'Syncronize Tasks': {
                UI.projects.foundations.functionLibraries.uiObjectsFromNodes.syncronizeTasksFoundAtWorkspaceWithBackEnd()
            }
                break
            case 'Syncronize Trading Sessions': {
                UI.projects.foundations.functionLibraries.uiObjectsFromNodes.syncronizeTradingSessionsFoundAtWorkspaceWithBackEnd()
            }
                break
            case 'Syncronize Learning Sessions': {
                UI.projects.foundations.functionLibraries.uiObjectsFromNodes.syncronizeLearningSessionsFoundAtWorkspaceWithBackEnd()
            }
                break
            case 'Play Tutorials': {
                UI.projects.foundations.functionLibraries.uiObjectsFromNodes.playTutorials()
            }
                break
            case 'Recreate Workspace': {
                UI.projects.foundations.functionLibraries.uiObjectsFromNodes.recreateWorkspace(action.node, action.callBackFunction)
            }
                break
            case 'Delete Workspace': {
                return UI.projects.foundations.functionLibraries.nodeDeleter.deleteWorkspace(action.node, action.rootNodes, action.callBackFunction)
            }
                break
            case 'Copy Node Path':
                {
                    let nodePath = UI.projects.foundations.functionLibraries.nodePath.getNodePath(action.node)

                    UI.projects.foundations.utilities.clipboard.copyTextToClipboard(nodePath)

                    UI.projects.foundations.spaces.cockpitSpace.setStatus(
                        nodePath + ' copied to the Clipboard.'
                        , 50, UI.projects.foundations.spaces.cockpitSpace.statusTypes.ALL_GOOD)
                }
                break
            case 'Copy Node Value':
                {
                    let value = action.node.payload.uiObject.getValue()

                    UI.projects.foundations.utilities.clipboard.copyTextToClipboard(value)

                    UI.projects.foundations.spaces.cockpitSpace.setStatus(
                        value + ' copied to the Clipboard.'
                        , 50, UI.projects.foundations.spaces.cockpitSpace.statusTypes.ALL_GOOD)
                }
                break
            case 'Copy Node Type':
                {
                    let value = action.node.type

                    UI.projects.foundations.utilities.clipboard.copyTextToClipboard(value)

                    UI.projects.foundations.spaces.cockpitSpace.setStatus(
                        value + ' copied to the Clipboard.'
                        , 50, UI.projects.foundations.spaces.cockpitSpace.statusTypes.ALL_GOOD)
                }
                break
            case 'Add UI Object':
                {
                    UI.projects.foundations.functionLibraries.uiObjectsFromNodes.addUIObject(action.node, action.relatedNodeType, action.rootNodes)
                }
                break
            case 'Add Missing Children':
                {
                    UI.projects.foundations.functionLibraries.uiObjectsFromNodes.addMissingChildren(action.node, action.rootNodes)
                }
                break
            case 'Delete UI Object':
                {
                    UI.projects.foundations.functionLibraries.nodeDeleter.deleteUIObject(action.node, action.rootNodes)
                }
                break
            case 'Install as Plugin':
                {
                    UI.projects.foundations.functionLibraries.pluginsFunctions.installAsPlugin(action.node, action.rootNodes)
                }
                break
            case 'Edit Code':

                break
            case 'Share':
                {
                    let text = JSON.stringify(
                        UI.projects.foundations.functionLibraries.protocolNode.getProtocolNode(action.node, true, false, true, true, true),
                        undefined,
                        4
                    )

                    let nodeName = action.node.name
                    if (nodeName === undefined) {
                        nodeName = ''
                    } else {
                        nodeName = '.' + nodeName
                    }
                    let fileName = 'Share - ' + action.node.type + ' - ' + nodeName + '.json'
                    UI.projects.foundations.utilities.download.downloadText(fileName, text)
                }

                break
            case 'Backup':
                {
                    let text = JSON.stringify(
                        UI.projects.foundations.functionLibraries.protocolNode.getProtocolNode(action.node, false, false, true, true, true),
                        undefined,
                        4)

                    let nodeName = action.node.name
                    if (nodeName === undefined) {
                        nodeName = ''
                    } else {
                        nodeName = ' ' + nodeName
                    }
                    let fileName = 'Backup - ' + action.node.type + ' - ' + nodeName + '.json'
                    UI.projects.foundations.utilities.download.downloadText(fileName, text)
                }

                break
            case 'Clone':
                {
                    let text = JSON.stringify(
                        UI.projects.foundations.functionLibraries.nodeCloning.getNodeClone(action.node),
                        undefined,
                        4
                    )

                    let nodeName = action.node.name
                    if (nodeName === undefined) {
                        nodeName = ''
                    } else {
                        nodeName = ' ' + nodeName
                    }
                    let fileName = 'Clone - ' + action.node.type + ' - ' + nodeName + '.json'
                    UI.projects.foundations.utilities.download.downloadText(fileName, text)
                }

                break
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
            case 'Add All Output Datasets':
                {
                    UI.projects.foundations.functionLibraries.mineFunctions.addAllOutputDatasets(action.node)
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
            case 'Add Missing Project Data Products':
                {
                    UI.projects.foundations.functionLibraries.dataStorageFunctions.addMissingProjectDataProducts(action.node, action.rootNodes)
                }
                break
            case 'Add All Data Dependencies':
                {
                    UI.projects.foundations.functionLibraries.mineFunctions.addAllDataDependencies(action.node)
                }
                break
            case 'Add All Data Mine Dependencies':
                {
                    UI.projects.foundations.functionLibraries.mineFunctions.addAllDataMineDataDependencies(action.node, action.rootNodes)
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
            case 'Play Tutorial':
                {
                    UI.projects.education.spaces.tutorialSpace.playTutorial(action.node)
                }
                break
            case 'Play Tutorial Topic':
                {
                    UI.projects.education.spaces.tutorialSpace.playTutorialTopic(action.node)
                }
                break
            case 'Play Tutorial Step':
                {
                    UI.projects.education.spaces.tutorialSpace.playTutorialStep(action.node)
                }
                break
            case 'Resume Tutorial':
                {
                    UI.projects.education.spaces.tutorialSpace.resumeTutorial(action.node)
                }
                break
            case 'Resume Tutorial Topic':
                {
                    UI.projects.education.spaces.tutorialSpace.resumeTutorialTopic(action.node)
                }
                break
            case 'Resume Tutorial Step':
                {
                    UI.projects.education.spaces.tutorialSpace.resumeTutorialStep(action.node)
                }
                break
            case 'Reset Tutorial Progress':
                {
                    UI.projects.education.spaces.tutorialSpace.resetTutorialProgress(action.node)
                }
                break
            case 'Send Webhook Test Message':
                {
                    UI.projects.foundations.functionLibraries.webhookFunctions.sendTestMessage(action.node, action.callBackFunction)
                }
                break
            case 'Run Trading Session':
                {
                    UI.projects.foundations.functionLibraries.tradingSessionFunctions.runSession(action.node, false, action.callBackFunction)
                }
                break
            case 'Resume Trading Session':
                {
                    UI.projects.foundations.functionLibraries.tradingSessionFunctions.runSession(action.node, true, action.callBackFunction)
                }
                break
            case 'Stop Trading Session':
                {
                    UI.projects.foundations.functionLibraries.tradingSessionFunctions.stopSession(action.node, action.callBackFunction)
                }
                break
            case 'Run Learning Session':
                {
                    UI.projects.foundations.functionLibraries.learningSessionFunctions.runSession(action.node, false, action.callBackFunction)
                }
                break
            case 'Resume Learning Session':
                {
                    UI.projects.foundations.functionLibraries.learningSessionFunctions.runSession(action.node, true, action.callBackFunction)
                }
                break
            case 'Stop Learning Session':
                {
                    UI.projects.foundations.functionLibraries.learningSessionFunctions.stopSession(action.node, action.callBackFunction)
                }
                break
            case 'Run Super Action':
                {
                    UI.projects.foundations.functionLibraries.superScriptsFunctions.runSuperScript(action.node, action.rootNodes)
                }
                break
            case 'Parent Attach': {
                UI.projects.foundations.functionLibraries.chainAttachDetach.chainAttachNode(action.node, action.relatedNode, action.rootNodes)
            }
                break
            case 'Reference Attach': {
                UI.projects.foundations.functionLibraries.attachDetach.referenceAttachNode(action.node, action.relatedNode, action.rootNodes)
            }
                break
            case 'Parent Detach':
                {
                    UI.projects.foundations.functionLibraries.chainAttachDetach.chainDetachNode(action.node, action.rootNodes)
                }
                break
            case 'Reference Detach':
                {
                    UI.projects.foundations.functionLibraries.attachDetach.referenceDetachNode(action.node)
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
                    let docs = UI.projects.foundations.utilities.nodeConfig.loadConfigProperty(action.node.payload, 'docs')

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
            case 'Add Missing Plugin Projects':
                {
                    UI.projects.foundations.functionLibraries.pluginsFunctions.addMissingPluginProjects(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Types':
                {
                    UI.projects.foundations.functionLibraries.pluginsFunctions.addMissingPluginTypes(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Data Mines':
                {
                    UI.projects.foundations.functionLibraries.pluginsFunctions.addMissingPluginDataMines(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Trading Mines':
                {
                    UI.projects.foundations.functionLibraries.pluginsFunctions.addMissingPluginTradingMines(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Trading Systems':
                {
                    UI.projects.foundations.functionLibraries.pluginsFunctions.addMissingPluginTradingSystems(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Trading Engines':
                {
                    UI.projects.foundations.functionLibraries.pluginsFunctions.addMissingPluginTradingEngines(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Learning Mines':
                {
                    UI.projects.foundations.functionLibraries.pluginsFunctions.addMissingPluginLearningMines(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Learning Systems':
                {
                    UI.projects.foundations.functionLibraries.pluginsFunctions.addMissingPluginLearningSystems(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Learning Engines':
                {
                    UI.projects.foundations.functionLibraries.pluginsFunctions.addMissingPluginLearningEngines(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin Tutorials':
                {
                    UI.projects.foundations.functionLibraries.pluginsFunctions.addMissingPluginTutorials(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Plugin API Maps':
                {
                    UI.projects.foundations.functionLibraries.pluginsFunctions.addMissingPluginApiMaps(action.node, action.rootNodes)
                }
                break
            case 'Enable Saving With Workspace':
                {
                    UI.projects.foundations.functionLibraries.pluginsFunctions.enableSavingWithWorkspace(action.node, action.rootNodes)
                }
                break
            case 'Disable Saving With Workspace':
                {
                    UI.projects.foundations.functionLibraries.pluginsFunctions.disableSavingWithWorkspace(action.node, action.rootNodes)
                }
                break
            case 'Save Plugin':
                {
                    UI.projects.foundations.functionLibraries.pluginsFunctions.savePlugin(action.node, action.rootNodes)
                }
                break
            case 'Add Missing Workspace Projects':
                {
                    UI.projects.foundations.functionLibraries.workspaceFunctions.addMissingWorkspaceProjects(action.node, action.rootNodes)
                }
                break
            case 'Check For Missing References':
                {
                    UI.projects.foundations.functionLibraries.workspaceFunctions.checkForMissingReferences(action.rootNodes)
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
            case 'Switch To Backtesting':
                {
                    action.node.type = "Backtesting Session"
                    UI.projects.foundations.spaces.floatingSpace.uiObjectConstructor.createUiObject(true, action.node.payload)
                }
                break
            case 'Send Telegram Test Message':
                {
                    UI.projects.foundations.functionLibraries.socialBotsFunctions.sendTelegramTestMessage(action.node, action.callBackFunction)
                }
                break
            case 'Send Discord Test Message':
                {
                    UI.projects.foundations.functionLibraries.socialBotsFunctions.sendDiscordTestMessage(action.node, action.callBackFunction)
                }
                break
            case 'Send Slack Test Message':
                {
                    UI.projects.foundations.functionLibraries.socialBotsFunctions.sendSlackTestMessage(action.node, action.callBackFunction)
                }
                break
            case 'Send Twitter Test Message':
                {
                    UI.projects.foundations.functionLibraries.socialBotsFunctions.sendTwitterTestMessage(action.node, action.callBackFunction)
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
        }
    }
}
