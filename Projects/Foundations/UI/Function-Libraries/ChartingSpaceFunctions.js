function newFoundationsFunctionLibraryChartingSpaceFunctions() {
    let thisObject = {
        addAllLayerPanels: addAllLayerPanels,
        addAllLayerPolygons: addAllLayerPolygons,
        addAllMineLayers: addAllMineLayers,
        addMissingDashboards: addMissingDashboards,
        addMissingProjectDashboards: addMissingProjectDashboards,
        addMissingTimeMachines: addMissingTimeMachines,
        createTimeMachine: createTimeMachine
    }

    return thisObject

    function addAllMineLayers(node, rootNodes) {

        /* Validations to see if we can do this or not. */
        if (node.payload === undefined) { return }
        if (node.payload.uiObject === undefined) { return }
        if (node.payload.referenceParent === undefined) {
            node.payload.uiObject.setErrorMessage('You need to have a reference parent node to execute this action.')
            return
        }
        if (node.payload.referenceParent.payload === undefined) {
            node.payload.uiObject.setErrorMessage('You need to have a reference parent node to execute this action.')
            return
        }

        /* 
        We are going to go through the referenced branch and recreate the structure
        we find there inside the layers manager. We will end up having at the end
        all layers referencing the data products inside the referenced branch.
        */
        let mine = node.payload.referenceParent
        scanBotArray(mine.botProducts)

        function scanBotArray(botArray) {
            for (let i = 0; i < botArray.length; i++) {
                let bot = botArray[i]
                let botLayers = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(node, 'Bot Layers')
                botLayers.name = bot.name

                UI.projects.foundations.utilities.folders.asymetricalFolderStructureCloning(
                    bot,
                    botLayers,
                    'dataProducts',
                    'dataProductFolders',
                    'layerFolders',
                    'Layer',
                    'Layer Folder',
                    undefined
                )
                /*
                There are some layers that should not exist, for example the ones related to Data Products
                that do not have a plotter module. Since our previous action created all layers no matter
                what, we need now to delete all the ones that do not have a plotter module.
                */
                let allLayers = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(botLayers, 'Layer')
                for (let j = 0; j < allLayers.length; j++) {
                    let layer = allLayers[j]
                    layer.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_45

                    let plotterModule = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(layer, 'Plotter Module', undefined, true, false, false, true)
                    if (plotterModule === undefined) {
                        UI.projects.visualScripting.functionLibraries.nodeDeleter.deleteUIObject(layer, rootNodes)
                    }
                }
                /*
                For each of the layers we will not create the Layer Panels and Layer Polygons.
                */
                allLayers = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(botLayers, 'Layer')
                for (let j = 0; j < allLayers.length; j++) {
                    let layer = allLayers[j]
                    let menu = layer.payload.uiObject.menu
                    menu.internalClick('Add Missing Children')

                    layer.layerPanels.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
                    layer.layerPolygons.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180

                    menu = layer.layerPanels.payload.uiObject.menu
                    menu.internalClick('Add All Layer Panels')

                    menu = layer.layerPolygons.payload.uiObject.menu
                    menu.internalClick('Add All Layer Polygons')

                    layer.layerPanels.payload.floatingObject.collapseToggle()
                    layer.layerPolygons.payload.floatingObject.collapseToggle()
                    layer.payload.floatingObject.collapseToggle()
                }
            }
        }
    }

    function addMissingTimeMachines(node, rootNodes) {
        if (node.payload.referenceParent === undefined) {
            node.payload.uiObject.setErrorMessage('This node needs to have a Reference Parent for this command tu run.')
            return
        }

        for (let i = 0; i < rootNodes.length; i++) {
            let rootNode = rootNodes[i]
            if (rootNode.type === 'LAN Network') {
                let lanNetworkNode = rootNode
                scanNetworkNode(lanNetworkNode)
            }
        }

        function scanNetworkNode(lanNetworkNode) {
            if (lanNetworkNode === undefined) { return }

            let backtestingSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(lanNetworkNode, 'Backtesting Session')
            let fordwardTestingSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(lanNetworkNode, 'Forward Testing Session')
            let paperTradingSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(lanNetworkNode, 'Paper Trading Session')
            let liveTradingSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(lanNetworkNode, 'Live Trading Session')
            let livePortfolioSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(lanNetworkNode, 'Live Portfolio Session')
            let backLearningSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(lanNetworkNode, 'Back Learning Session')
            let liveLearningSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(lanNetworkNode, 'Live Learning Session')

            scanSessionArray(backtestingSessionsArray, 'Market Trading Tasks')
            scanSessionArray(fordwardTestingSessionsArray, 'Market Trading Tasks')
            scanSessionArray(paperTradingSessionsArray, 'Market Trading Tasks')
            scanSessionArray(liveTradingSessionsArray, 'Market Trading Tasks')
            scanSessionArray(livePortfolioSessionsArray, 'Market Portfolio Tasks')
            scanSessionArray(backLearningSessionsArray, 'Market Trading Tasks')
            scanSessionArray(liveLearningSessionsArray, 'Market Trading Tasks')

            function scanSessionArray(sessionsArray, nodeType) {
                for (let i = 0; i < sessionsArray.length; i++) {
                    let session = sessionsArray[i]
                    let environment = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(session, node.payload.referenceParent.type, undefined, true, false, true, false)
                    if (environment === undefined) { continue }
                    if (environment.id !== node.payload.referenceParent.id) { continue }
                    let market = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(session, nodeType, undefined, true, false, true, false)
                    if (market.payload.referenceParent === undefined) { continue }
                    if (UI.projects.visualScripting.utilities.nodeChildren.isMissingChildrenById(node, session, true) === true) {
                        createTimeMachine(node, session, market.payload.referenceParent, lanNetworkNode, rootNodes)
                    }
                }
            }
        }
    }

    function createTimeMachine(dashboard, session, market, lanNetworkNode, rootNodes) {
        let mineProducts
        let timeMachine = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(dashboard, 'Time Machine')
        let exchange = market.payload.parentNode.payload.parentNode
        UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(timeMachine, session)
        timeMachine.name = session.name + ' ' + session.type + ' ' + lanNetworkNode.name + ' ' + exchange.name + ' ' + market.name
        timeMachine.payload.floatingObject.collapseToggle()
        timeMachine.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
        timeMachine.timeFrameScale.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
        timeMachine.timeScale.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
        timeMachine.rateScale.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180

        /*
         *  We will create 3 Time Line Charts for the Trading Mine Products:
         */
        mineProducts = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(lanNetworkNode, 'Trading Mine Products')
        for (let j = 0; j < mineProducts.length; j++) {
            let mineProduct = mineProducts[j]
            /*
            The mine products found so far, belongs to any session. To filter all the sessions
            that are not the one we are interested in, we do the following:
            */
            if (mineProduct.payload.parentNode === undefined) { continue }
            if (mineProduct.payload.parentNode.payload.referenceParent.id !== session.id) { continue }

            /*
            At the current version of Superalgos, beta 6, there is only one Trading Mine,
            with only one bot, and it has so many data products that we want to put them
            in 3 different timeline charts. So we will create 3 charts, connect them, 
            and delete from each one 1/3 of the layers. We do all that next:
            */
            for (let k = 0; k < 3; k++) {
                let timelineChart = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(timeMachine, 'Timeline Chart')

                UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(timelineChart.layerManager, mineProduct)
                timelineChart.payload.floatingObject.collapseToggle()
                timelineChart.layerManager.payload.floatingObject.collapseToggle()
                timelineChart.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
                timelineChart.layerManager.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180

                let menu = timelineChart.layerManager.payload.uiObject.menu
                menu.internalClick('Add All Mine Layers')
                menu.internalClick('Add All Mine Layers')

                switch (k) {
                    case 0: {
                        timelineChart.name = 'Trading Engine'
                        deleteNodeByName('Trading System')
                        deleteNodeByName('Simulation Objects')
                        break
                    }
                    case 1: {
                        timelineChart.name = 'Trading System'
                        deleteNodeByName('Trading Engine')
                        deleteNodeByName('Simulation Objects')
                        break
                    }
                    case 2: {
                        timelineChart.name = 'Simulation Objects'
                        deleteNodeByName('Trading Engine')
                        deleteNodeByName('Trading System')
                        break
                    }
                }
                function deleteNodeByName(nodeName) {
                    let nodeToDelete = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(timelineChart.layerManager, undefined, nodeName, true, true, false, false)
                    if (nodeToDelete === undefined) { return }
                    UI.projects.visualScripting.functionLibraries.nodeDeleter.deleteUIObject(nodeToDelete, rootNodes)
                }
            }
        }

        /*
         *  We will create 3 Time Line Charts for the Portfolio Mine Products:
         */
        mineProducts = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(lanNetworkNode, 'Portfolio Mine Products')
        for (let j = 0; j < mineProducts.length; j++) {
            let mineProduct = mineProducts[j]
            /*
            The mine products found so far, belongs to any session. To filter all the sessions
            that are not the one we are interested in, we do the following:
            */
            if (mineProduct.payload.parentNode === undefined) { continue }
            if (mineProduct.payload.parentNode.payload.referenceParent.id !== session.id) { continue }
            
            /*
            For the legacy reasons stated above @Trading Mine Products we will create 3 charts, connect them, 
            and delete from each one 1/3 of the layers. We do all that next:
            */
            for (let k = 0; k < 3; k++) {
                let timelineChart = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(timeMachine, 'Timeline Chart')

                UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(timelineChart.layerManager, mineProduct)
                timelineChart.payload.floatingObject.collapseToggle()
                timelineChart.layerManager.payload.floatingObject.collapseToggle()
                timelineChart.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
                timelineChart.layerManager.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180

                let menu = timelineChart.layerManager.payload.uiObject.menu
                menu.internalClick('Add All Mine Layers')
                menu.internalClick('Add All Mine Layers')

                switch (k) {
                    case 0: {
                        timelineChart.name = 'Portfolio Engine'
                        deleteNodeByName('Portfolio System')
                        deleteNodeByName('Simulation Objects')
                        break
                    }
                    case 1: {
                        timelineChart.name = 'Portfolio System'
                        deleteNodeByName('Portfolio Engine')
                        deleteNodeByName('Simulation Objects')
                        break
                    }
                    case 2: {
                        timelineChart.name = 'Simulation Objects'
                        deleteNodeByName('Portfolio Engine')
                        deleteNodeByName('Portfolio System')
                        break
                    }
                }
                function deleteNodeByName(nodeName) {
                    let nodeToDelete = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(timelineChart.layerManager, undefined, nodeName, true, true, false, false)
                    if (nodeToDelete === undefined) { return }
                    UI.projects.visualScripting.functionLibraries.nodeDeleter.deleteUIObject(nodeToDelete, rootNodes)
                }
            }
        }

        /*
         *  We will create 3 Time Line Charts for the Learning Mine Products:
         */
        mineProducts = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(lanNetworkNode, 'Learning Mine Products')
        for (let j = 0; j < mineProducts.length; j++) {
            let mineProduct = mineProducts[j]
            /*
            The mine products found so far, belongs to any session. To filter all the sessions
            that are not the one we are interested in, we do the following:
            */
            if (mineProduct.payload.parentNode === undefined) { continue }
            if (mineProduct.payload.parentNode.payload.referenceParent.id !== session.id) { continue }
            
            /*
            At the current version of Superalgos, beta 6, there is only one Learning Mine,
            with only one bot, and it has so many data products that we want to put them
            in 3 different timeline charts. So we will create 3 charts, connect them, 
            and delete from each one 1/3 of the layers. We do all that next:
            */
            for (let k = 0; k < 3; k++) {
                let timelineChart = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(timeMachine, 'Timeline Chart')

                UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(timelineChart.layerManager, mineProduct)
                timelineChart.payload.floatingObject.collapseToggle()
                timelineChart.layerManager.payload.floatingObject.collapseToggle()
                timelineChart.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
                timelineChart.layerManager.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180

                let menu = timelineChart.layerManager.payload.uiObject.menu
                menu.internalClick('Add All Mine Layers')
                menu.internalClick('Add All Mine Layers')

                switch (k) {
                    case 0: {
                        timelineChart.name = 'Learning Engine'
                        deleteNodeByName('Learning System')
                        deleteNodeByName('Simulation Objects')
                        break
                    }
                    case 1: {
                        timelineChart.name = 'Learning System'
                        deleteNodeByName('Learning Engine')
                        deleteNodeByName('Simulation Objects')
                        break
                    }
                    case 2: {
                        timelineChart.name = 'Simulation Objects'
                        deleteNodeByName('Learning Engine')
                        deleteNodeByName('Learning System')
                        break
                    }
                }
                function deleteNodeByName(nodeName) {
                    let nodeToDelete = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(timelineChart.layerManager, undefined, nodeName, true, true, false, false)
                    if (nodeToDelete === undefined) { return }
                    UI.projects.visualScripting.functionLibraries.nodeDeleter.deleteUIObject(nodeToDelete, rootNodes)
                }
            }
        }
        /*
        We need to create a Timeline Chart for each Data Mine Products.
        */
        mineProducts = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(lanNetworkNode, 'Data Mine Products')
        for (let j = 0; j < mineProducts.length; j++) {
            let mineProduct = mineProducts[j]
            /*
            We need to filter out the ones that do not belong to the market where 
            the session is running at. 
            */
            if (mineProduct.payload.parentNode.payload.referenceParent === undefined) { continue }
            if (mineProduct.payload.parentNode.payload.referenceParent.id !== market.id) { continue }

            let timelineChart = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(timeMachine, 'Timeline Chart')
            /* 
            The Mine Product Node might be collapsed and since its creation it never
            received the physics call, so we will do the call so that it properly
            sets its own name, which we are going to reuse here.
            */
            mineProduct.payload.uiObject.invisiblePhysics()
            timelineChart.name = mineProduct.name + ' Data'
            UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(timelineChart.layerManager, mineProduct)
            timelineChart.payload.floatingObject.collapseToggle()
            timelineChart.layerManager.payload.floatingObject.collapseToggle()
            timelineChart.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
            timelineChart.layerManager.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180

            let menu = timelineChart.layerManager.payload.uiObject.menu
            menu.internalClick('Add All Mine Layers')
            menu.internalClick('Add All Mine Layers')
        }
    }

    function addMissingDashboards(node, rootNodes) {
        for (let i = 0; i < rootNodes.length; i++) {
            let rootNode = rootNodes[i]
            if (rootNode.type === 'LAN Network') {
                let network = rootNode
                scanNetwork(network)
            }
        }

        function scanNetwork(network) {
            if (network === undefined) { return }

            for (let j = 0; j < network.lanNetworkNodes.length; j++) {
                let lanNetworkNode = network.lanNetworkNodes[j]
                scanNetworkNode(lanNetworkNode)
            }

            function scanNetworkNode(lanNetworkNode) {
                let testingTradingTasks = UI.projects.visualScripting.utilities.branches.findInBranch(lanNetworkNode, 'Testing Trading Tasks', node, true)
                let productionTradingTasks = UI.projects.visualScripting.utilities.branches.findInBranch(lanNetworkNode, 'Production Trading Tasks', node, true)
                let productionPortfolioTasks = UI.projects.visualScripting.utilities.branches.findInBranch(lanNetworkNode, 'Production Portfolio Tasks', node, true)

                if (UI.projects.visualScripting.utilities.nodeChildren.isMissingChildrenById(node, testingTradingTasks, true) === true) {
                    let dashboard = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(node, 'Dashboard')
                    UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(dashboard, testingTradingTasks)
                    dashboard.name = testingTradingTasks.type + ' ' + lanNetworkNode.name
                }

                if (UI.projects.visualScripting.utilities.nodeChildren.isMissingChildrenById(node, productionTradingTasks, true) === true) {
                    let dashboard = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(node, 'Dashboard')
                    UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(dashboard, productionTradingTasks)
                    dashboard.name = productionTradingTasks.type + ' ' + lanNetworkNode.name
                }

                if (UI.projects.visualScripting.utilities.nodeChildren.isMissingChildrenById(node, productionPortfolioTasks, true) === true) {
                    let dashboard = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(node, 'Dashboard')
                    UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(dashboard, productionPortfolioTasks)
                    dashboard.name = productionPortfolioTasks.type + ' ' + lanNetworkNode.name
                }
            }
        }
    }

    function addMissingProjectDashboards(node, rootNodes) {
        for (let k = 0; k < PROJECTS_SCHEMA.length; k++) {
            let projectDefinition = PROJECTS_SCHEMA[k]
            let project = projectDefinition.name

            if (projectDefinition.products === undefined) { continue }

            for (let j = 0; j < rootNodes.length; j++) {
                let rootNode = rootNodes[j]
                if (rootNode.type === project + ' Project') {
                    let projectDefinition = rootNode.projectDefinition
                    if (projectDefinition !== undefined) {
                        if (UI.projects.visualScripting.utilities.nodeChildren.isMissingChildrenById(node, projectDefinition, true) === true) {
                            let projectTasks = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(node, 'Project Dashboards', undefined, project)
                            UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(projectTasks, projectDefinition)
                        }
                    }
                }
            }
        }
    }

    function addAllLayerPanels(node) {
        if (validateReferences(node) !== true) { return }
        let layerNode = node.payload.parentNode

        let plotterModule = layerNode.payload.referenceParent.payload.referenceParent.payload.referenceParent
        for (let i = 0; i < plotterModule.panels.length; i++) {
            let plotterPanel = plotterModule.panels[i]
            let layerPanel = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(node, 'Layer Panel')
            UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(layerPanel, plotterPanel)
        }
    }

    function addAllLayerPolygons(node) {
        if (validateReferences(node) !== true) { return }
        let layerNode = node.payload.parentNode

        let plotterModule = layerNode.payload.referenceParent.payload.referenceParent.payload.referenceParent

        if (plotterModule.shapes === undefined) {
            node.payload.uiObject.setWarningMessage('Referenced Plotter Module does not have a Shapes child.')
            return
        }

        for (let i = 0; i < plotterModule.shapes.polygons.length; i++) {
            let polygon = plotterModule.shapes.polygons[i]
            let layerPolygon = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(node, 'Layer Polygon')
            UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(layerPolygon, polygon)
        }
    }

    function validateReferences(node) {
        /* Validations to see if we can do this or not. */
        if (node.payload === undefined) { return }
        if (node.payload.uiObject === undefined) { return }

        if (node.payload.parentNode === undefined) {
            node.payload.uiObject.setErrorMessage('You need to have a Layer node as a parent to execute this action.')
            return
        }
        if (node.payload.parentNode.payload === undefined) {
            node.payload.uiObject.setErrorMessage('You need to have a Layer node as a parent to execute this action.')
            return
        }
        let layerNode = node.payload.parentNode

        if (layerNode.payload.referenceParent === undefined) {
            node.payload.uiObject.setErrorMessage('The Layer node needs to have a reference parent node to execute this action.')
            return
        }
        if (layerNode.payload.referenceParent.payload === undefined) {
            node.payload.uiObject.setErrorMessage('The Layer node needs to have a reference parent node to execute this action.')
            return
        }
        if (layerNode.payload.referenceParent.payload.referenceParent === undefined) {
            node.payload.uiObject.setErrorMessage('The Layer node needs to have a reference grand parent node to execute this action.')
            return
        }
        if (layerNode.payload.referenceParent.payload.referenceParent.payload === undefined) {
            node.payload.uiObject.setErrorMessage('The Layer node needs to have a reference grand parent node to execute this action.')
            return
        }
        if (layerNode.payload.referenceParent.payload.referenceParent.payload.referenceParent === undefined) {
            node.payload.uiObject.setErrorMessage('The Layer node to have a reference grand grand parent node to execute this action.')
            return
        }
        if (layerNode.payload.referenceParent.payload.referenceParent.payload.referenceParent.payload === undefined) {
            node.payload.uiObject.setErrorMessage('The Layer node to have a reference grand grand parent node to execute this action.')
            return
        }
        return true
    }

}
