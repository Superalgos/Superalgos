function newFoundationsFunctionLibraryProductFunctions() {
    let thisObject = {
        installProduct: installProduct,

    }

    return thisObject

    /**
     *
     * This function will install the product in :
     * Available Trading Mines as process dependency for the trading bot
     * Previously installed Markets
     * Data Tasks for all markets
     * Charting Space for all dashboards
     */

    function installProduct(
        node,
        rootNodes
    ) {

        let product = node
        let productIndicatorBot = product.payload.parentNode
        let productDataMineParent = productIndicatorBot.payload.parentNode
        let dataMineProduct
        let dataProduct

        node.payload.uiObject.setInfoMessage('This product is being installed. This might take a couple of seconds. Please hold on while we connect all the dots for you. ')

        setTimeout(startInstalling, 500)

        function startInstalling() {

            for (let i = 0; i < rootNodes.length; i++) {
                let rootNode = rootNodes[i]
                if (rootNode.type === 'Trading Mine') {
                    installInTradingMine(rootNode)
                }
            }

            for (let i = 0; i < rootNodes.length; i++) {
                let rootNode = rootNodes[i]
                if (rootNode.type === 'Portfolio Mine') {
                    installInPortfolioMine(rootNode)
                }
            }

            for (let i = 0; i < rootNodes.length; i++) {
                let rootNode = rootNodes[i]
                if (rootNode.type === 'LAN Network') {
                    installInNetworkNodes(rootNode)
                }
            }

            for (let i = 0; i < rootNodes.length; i++) {
                let rootNode = rootNodes[i]
                if (rootNode.type === 'Charting Space') {
                    installInChartingSpace(rootNode)
                }
            }

            node.payload.uiObject.setInfoMessage('Product installation is complete.')

            function installInNetworkNodes(lanNetwork) {

                for (let j = 0; j < lanNetwork.lanNetworkNodes.length; j++) {
                    let lanNetworkNode = lanNetwork.lanNetworkNodes[j]
                    installInDataMinesData(lanNetworkNode)
                    installInDataTasks(lanNetworkNode)
                }


                /**
                 *
                 * We will add data mine tasks of the product only to existing Market Data Tasks
                 * If no Market Data Tasks are available, product task will not be installed into this branch
                 * Market Data can be installed by using Install Market script.
                 */
                function installInDataTasks(lanNetworkNode) {
                    let dataTasks = UI.projects.visualScripting.utilities.branches.findInBranch(lanNetworkNode, 'Data Tasks', product, true)

                    // Install in each existing Project Data Task
                    for (let j = 0; j < dataTasks.projectDataTasks.length; j++) {
                        let projectDataTask = dataTasks.projectDataTasks[j]

                        // Install in each existing Exchange
                        for (let k = 0; k < projectDataTask.exchangeDataTasks.length; k++) {
                            let exchangeDataTask = projectDataTask.exchangeDataTasks[k]

                            // Install in each existing Market Data
                            for (let l = 0; l < exchangeDataTask.marketDataTasks.length; l++) {
                                let marketDataTask = exchangeDataTask.marketDataTasks[l]

                                // If Data Mine is not installed we are going to create it, otherwise we use the existing one
                                let dataMineDependency = UI.projects.visualScripting.utilities.nodeChildren.findOrCreateChildWithReference(marketDataTask, 'Data Mine Tasks', productDataMineParent)

                                if (dataMineDependency.taskManagers.length > 0) {
                                    //We will add the task and indicator bot into first task manager we find
                                    let task = ceateTaskIfNotPresent(dataMineDependency.taskManagers[0])
                                    let indicatorBot = createIndicatorBotIfNotPresent(task)

                                    createIndicatorProcessInstanceIfNotPresent(indicatorBot)
                                } else {
                                    //Let's create a new task manager as none exists
                                    let newTaskManager = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(dataMineDependency, 'Task Manager')
                                    newTaskManager.name = productDataMineParent.name

                                    let task = ceateTaskIfNotPresent(newTaskManager)
                                    let indicatorBot = createIndicatorBotIfNotPresent(task)

                                    createIndicatorProcessInstanceIfNotPresent(indicatorBot)

                                }

                            }
                        }
                    }


                    function ceateTaskIfNotPresent(taskManager) {
                        let task = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(taskManager, undefined, productIndicatorBot.name, false, true, false, false)
                        if (task === undefined) {
                            let newTask = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(taskManager, 'Task')
                            newTask.name = productIndicatorBot.name

                            return newTask
                        }
                        return task;
                    }

                    function createIndicatorBotIfNotPresent(task) {
                        let botInstance = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(task, 'Indicator Bot Instance', undefined, false, true, false, false)
                        if (botInstance === undefined) {
                            let newBotInstance = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(task, 'Indicator Bot Instance')
                            newBotInstance.name = productIndicatorBot.name

                            return newBotInstance
                        }
                        return botInstance
                    }

                    function createIndicatorProcessInstanceIfNotPresent(indicatorBot) {
                        for (let m = 0; m < productIndicatorBot.processes.length; m++) {
                            let processDefinition = productIndicatorBot.processes[m]
                            UI.projects.visualScripting.utilities.nodeChildren.findOrCreateChildWithReference(indicatorBot, 'Indicator Process Instance', processDefinition)
                        }
                    }

                }

                /**
                 *
                 * We will add Data Product to Market Data Products only if there is at least one Exchange and Market installed
                 * We will not create the entire hierarchy for the Exchange as this is a job for Install Market script
                 *
                 */
                function installInDataMinesData(lanNetworkNode) {

                    let dataMinesData = UI.projects.visualScripting.utilities.branches.findInBranch(lanNetworkNode, 'Data Mines Data', product, true)


                    for (let j = 0; j < dataMinesData.projectDataProducts.length; j++) {
                        let projectDataProduct = dataMinesData.projectDataProducts[j]

                        for (let k = 0; k < projectDataProduct.exchangeDataProducts.length; k++) {
                            let exchangeDataProduct = projectDataProduct.exchangeDataProducts[k]

                            for (let l = 0; l < exchangeDataProduct.marketDataProducts.length; l++) {
                                let marketDataProduct = exchangeDataProduct.marketDataProducts[l]

                                dataMineProduct = UI.projects.visualScripting.utilities.nodeChildren.findOrCreateChildWithReference(marketDataProduct, 'Data Mine Products', productDataMineParent)
                                let botProductDependencies = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(dataMineProduct, undefined, productIndicatorBot.name, false, true, false, false)

                                /**
                                 * If Bot Product Dependency exists add Data Product
                                 * Otherwise create the Bot Product Dependency  and addData Product to newly created Bot Product Dependency
                                 */
                                if (botProductDependencies !== undefined) {
                                    createDataProductIfNotPresent(botProductDependencies)
                                } else {
                                    let newBotProductDependencies = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(dataMineProduct, 'Bot Products')
                                    newBotProductDependencies.name = productIndicatorBot.name
                                    createDataProductIfNotPresent(newBotProductDependencies)
                                }

                                function createDataProductIfNotPresent(botProductDependencies) {
                                    dataProduct = UI.projects.visualScripting.utilities.nodeChildren.findOrCreateChildWithReference(botProductDependencies, 'Data Product', product)
                                }
                            }

                        }
                    }

                }

            }

            function installInTradingMine(tradingMine) {
                let savePluginFile = false
                for (let j = 0; j < tradingMine.tradingBots.length; j++) {
                    let tradingBotNode = tradingMine.tradingBots[j]

                    for (let k = 0; k < tradingBotNode.processes.length; k++) {
                        let process = tradingBotNode.processes[k]

                        /**
                         * In case the data mine is not referenced at all, we must add it
                         */

                        let dataMineDependency = UI.projects.visualScripting.utilities.nodeChildren.findOrCreateChildWithReference(process.processDependencies, 'Data Mine Data Dependencies', productDataMineParent)

                        let botDataDependencies = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(dataMineDependency, undefined, productIndicatorBot.name, false, true, false, false)

                        /**
                         * If Bot Data Dependency exists add Data Dependencies
                         * Otherwise create the Bot Data Dependency and add Data Dependencies to newly created Bot Data
                         */
                        if (botDataDependencies !== undefined) {
                            addAllDataDependenciesIfNotExists(botDataDependencies)
                        } else {
                            let newBotDataDependencies = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(dataMineDependency, 'Bot Data Dependencies')
                            newBotDataDependencies.name = productIndicatorBot.name
                            addAllDataDependenciesIfNotExists(newBotDataDependencies)
                        }


                        function addAllDataDependenciesIfNotExists(botDataDependencies) {
                            for (let l = 0; l < product.datasets.length; l++) {
                                let dataset = product.datasets[l]

                                // Explicit check is needed so we know if we have to save the plugin or not
                                if (UI.projects.visualScripting.utilities.nodeChildren.isMissingChildrenById(botDataDependencies, dataset, true) === true) {
                                    savePluginFile = true
                                    let dataDependency = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(botDataDependencies, 'Data Dependency')
                                    UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(dataDependency, dataset)
                                }
                            }
                        }
                    }
                }
                /**
                 * There is no reason to save the plugin if no modifications have been made to the hierarchy
                 * We will save the plugin only if we get to the point were we have to add the data dependencies
                 *
                 */
                if (savePluginFile) {
                    for (let i = 0; i < rootNodes.length; i++) {
                        let rootNode = rootNodes[i]
                        if (rootNode.type === 'Plugins') {
                            let tradingMinePlugin = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(rootNode, 'Plugin Trading Mines', undefined, false, true, false, false)

                            for (let j = 0; j < tradingMinePlugin.pluginFiles.length; j++) {
                                let pluginFile = tradingMinePlugin.pluginFiles[j]

                                UI.projects.communityPlugins.functionLibraries.pluginsFunctions.savePluginFile(pluginFile)
                            }
                        }
                    }

                }

            }

            function installInPortfolioMine(portfolioMine) {
                let savePluginFile = false
                for (let j = 0; j < portfolioMine.portfolioBots.length; j++) {
                    let portfolioBotNode = portfolioMine.portfolioBots[j]

                    for (let k = 0; k < portfolioBotNode.processes.length; k++) {
                        let process = portfolioBotNode.processes[k]

                        /**
                         * In case the data mine is not referenced at all, we must add it
                         */

                        let dataMineDependency = UI.projects.visualScripting.utilities.nodeChildren.findOrCreateChildWithReference(process.processDependencies, 'Data Mine Data Dependencies', productDataMineParent)

                        let botDataDependencies = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(dataMineDependency, undefined, productIndicatorBot.name, false, true, false, false)

                        /**
                         * If Bot Data Dependency exists add Data Dependencies
                         * Otherwise create the Bot Data Dependency and add Data Dependencies to newly created Bot Data
                         */
                        if (botDataDependencies !== undefined) {
                            addAllDataDependenciesIfNotExists(botDataDependencies)
                        } else {
                            let newBotDataDependencies = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(dataMineDependency, 'Bot Data Dependencies')
                            newBotDataDependencies.name = productIndicatorBot.name
                            addAllDataDependenciesIfNotExists(newBotDataDependencies)
                        }


                        function addAllDataDependenciesIfNotExists(botDataDependencies) {
                            for (let l = 0; l < product.datasets.length; l++) {
                                let dataset = product.datasets[l]

                                // Explicit check is needed so we know if we have to save the plugin or not
                                if (UI.projects.visualScripting.utilities.nodeChildren.isMissingChildrenById(botDataDependencies, dataset, true) === true) {
                                    savePluginFile = true
                                    let dataDependency = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(botDataDependencies, 'Data Dependency')
                                    UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(dataDependency, dataset)
                                }
                            }
                        }
                    }
                }
                /**
                 * There is no reason to save the plugin if no modifications have been made to the hierarchy
                 * We will save the plugin only if we get to the point were we have to add the data dependencies
                 *
                 */
                if (savePluginFile) {
                    for (let i = 0; i < rootNodes.length; i++) {
                        let rootNode = rootNodes[i]
                        if (rootNode.type === 'Plugins') {
                            let portfolioMinePlugin = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(rootNode, 'Plugin Portfolio Mines', undefined, false, true, false, false)

                            for (let j = 0; j < portfolioMinePlugin.pluginFiles.length; j++) {
                                let pluginFile = portfolioMinePlugin.pluginFiles[j]

                                UI.projects.communityPlugins.functionLibraries.pluginsFunctions.savePluginFile(pluginFile)
                            }
                        }
                    }

                }

            }

            /**
             * This function will install the product into existing Charting Space
             * It is mandatory to have at least a dashboard which contains at least one time machine
             *
             */
            function installInChartingSpace(chartingSpace) {

                for (let j = 0; j < chartingSpace.projectDashboards.length; j++) {
                    let projectDashboard = chartingSpace.projectDashboards[j]

                    for (let k = 0; k < projectDashboard.dashboards.length; k++) {
                        let dashboard = projectDashboard.dashboards[k]

                        for (let l = 0; l < dashboard.timeMachines.length; l++) {
                            let timeMachine = dashboard.timeMachines[l]

                            if (timeMachine.timelineCharts.length > 0) {
                                let existingTimelineChartUpdated = false
                                /**
                                 * We first search the existing timeline charts for a Layer Manager children that references our product data mine parent, to reuse it
                                 * If none found we will create a new timeline chart with all branches
                                 */
                                for (let m = 0; m < timeMachine.timelineCharts.length; m++) {
                                    let currentTimelineChart = timeMachine.timelineCharts[m]

                                    let referencedLayerManager = UI.projects.visualScripting.utilities.nodeChildren.findChildReferencingThisNode(currentTimelineChart, dataMineProduct)
                                    if (referencedLayerManager !== undefined) {
                                        // We have found a timeline chart that references our product data mine, let's check if our product is installed, otherwise we install it
                                        let botLayer = createBotLayerIfNotPresent(referencedLayerManager)
                                        createLayerIfNotPresent(botLayer)
                                        existingTimelineChartUpdated = true
                                    }

                                }
                                // None of the existing timeline charts are referencing our data mine, so let's create it
                                if (existingTimelineChartUpdated === false) {
                                    createTimelineChartWithAllBranches(timeMachine)
                                }
                            } else {
                                //No timeline chart exists at all, so let's create one for our data mine
                                createTimelineChartWithAllBranches(timeMachine)
                            }

                            function createTimelineChartWithAllBranches(timeMachine) {
                                let newTimelineChart = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(timeMachine, 'Timeline Chart')
                                newTimelineChart.name = productDataMineParent.name

                                let layerManager = newTimelineChart.layerManager
                                UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(layerManager, dataMineProduct)

                                let botLayer = createBotLayerIfNotPresent(layerManager)
                                createLayerIfNotPresent(botLayer)

                            }

                            function createBotLayerIfNotPresent(layerManager) {
                                let botLayer = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(layerManager, undefined, productIndicatorBot.name, false, true, false, false)

                                if (botLayer === undefined) {
                                    let newBotLayer = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(layerManager, 'Bot Layers')
                                    newBotLayer.name = productIndicatorBot.name
                                    return newBotLayer
                                }
                                return botLayer
                            }

                            function createLayerIfNotPresent(botLayer) {
                                UI.projects.visualScripting.utilities.nodeChildren.findOrCreateChildWithReference(botLayer, 'Layer', dataProduct)
                            }
                        }
                    }
                }

            }

        }


    }

}



