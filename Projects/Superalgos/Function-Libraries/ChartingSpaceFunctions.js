function newChartingSpaceFunctions() {
    thisObject = {
        addAllLayerPanels: addAllLayerPanels,
        addAllLayerPolygons: addAllLayerPolygons,
        addAllMineLayers: addAllMineLayers,
        addMissingDashboards: addMissingDashboards,
        addMissingTimeMachines: addMissingTimeMachines,
        createTimeMachine: createTimeMachine
    }

    return thisObject

    function addAllMineLayers(node, rootNodes, functionLibraryUiObjectsFromNodes, functionLibraryNodeDeleter) {

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
                let botLayers = functionLibraryUiObjectsFromNodes.addUIObject(node, 'Bot Layers')
                botLayers.name = bot.name

                UI.projects.superalgos.utilities.folders.asymetricalFolderStructureCloning(
                    bot,
                    botLayers,
                    'dataProducts',
                    'dataProductFolders',
                    'layerFolders',
                    'Layer',
                    'Layer Folder',
                    undefined,
                    functionLibraryUiObjectsFromNodes
                )
                /*
                There are some layers that should not exist, for example the ones related to Data Products
                that do not have a plotter module. Since our previous action created all layers no matter
                what, we need now to delete all the ones that do not have a plotter module.
                */
                let allLayers = UI.projects.superalgos.utilities.branches.nodeBranchToArray(botLayers, 'Layer')
                for (let j = 0; j < allLayers.length; j++) {
                    let layer = allLayers[j]
                    layer.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_45

                    let plotterModule = UI.projects.superalgos.utilities.meshes.findNodeInNodeMesh(layer, 'Plotter Module', undefined, true, false, false, true)
                    if (plotterModule === undefined) {
                        functionLibraryNodeDeleter.deleteUIObject(layer, rootNodes)
                    }
                }
                /*
                For each of the layers we will not create the Layer Panels and Layer Polygons.
                */
                allLayers = UI.projects.superalgos.utilities.branches.nodeBranchToArray(botLayers, 'Layer')
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

    function addMissingTimeMachines(node, rootNodes, functionLibraryUiObjectsFromNodes, functionLibraryNodeDeleter) {
        if (node.payload.referenceParent === undefined) {
            node.payload.uiObject.setErrorMessage('This node needs to have a Reference Parent for this command tu run.')
            return
        }

        for (let i = 0; i < rootNodes.length; i++) {
            let rootNode = rootNodes[i]
            if (rootNode.type === 'Network') {
                let networkNode = rootNode
                scanNetworkNode(networkNode)
            }
        }

        function scanNetworkNode(networkNode) {
            if (networkNode === undefined) { return }

            let backtestingSessionsArray = UI.projects.superalgos.utilities.branches.nodeBranchToArray(networkNode, 'Backtesting Session')
            let fordwardTestingSessionsArray = UI.projects.superalgos.utilities.branches.nodeBranchToArray(networkNode, 'Forward Testing Session')
            let paperTradingSessionsArray = UI.projects.superalgos.utilities.branches.nodeBranchToArray(networkNode, 'Paper Trading Session')
            let liveTradingSessionsArray = UI.projects.superalgos.utilities.branches.nodeBranchToArray(networkNode, 'Live Trading Session')
            let learningSessionsArray = UI.projects.superalgos.utilities.branches.nodeBranchToArray(networkNode, 'Learning Session')

            scanSessionArray(backtestingSessionsArray)
            scanSessionArray(fordwardTestingSessionsArray)
            scanSessionArray(paperTradingSessionsArray)
            scanSessionArray(liveTradingSessionsArray)
            scanSessionArray(learningSessionsArray)

            function scanSessionArray(sessionsArray) {
                for (let i = 0; i < sessionsArray.length; i++) {
                    let session = sessionsArray[i]
                    let environment = UI.projects.superalgos.utilities.meshes.findNodeInNodeMesh(session, node.payload.referenceParent.type, undefined, true, false, true, false)
                    if (environment === undefined) { continue }
                    if (environment.id !== node.payload.referenceParent.id) { continue }
                    let market = UI.projects.superalgos.utilities.meshes.findNodeInNodeMesh(session, 'Market Trading Tasks', undefined, true, false, true, false)
                    if (market.payload.referenceParent === undefined) { continue }
                    if (UI.projects.superalgos.utilities.children.isMissingChildren(node, session, true) === true) {
                        createTimeMachine(node, session, market.payload.referenceParent, networkNode, rootNodes, functionLibraryUiObjectsFromNodes, functionLibraryNodeDeleter)
                    }
                }
            }
        }
    }

    function createTimeMachine(dashboard, session, market, networkNode, rootNodes, functionLibraryUiObjectsFromNodes, functionLibraryNodeDeleter) {
        let mineProducts
        let timeMachine = functionLibraryUiObjectsFromNodes.addUIObject(dashboard, 'Time Machine')
        let exchange = market.payload.parentNode.payload.parentNode
        timeMachine.payload.referenceParent = session
        timeMachine.name = session.name + ' ' + session.type + ' ' + networkNode.name + ' ' + exchange.name + ' ' + market.name
        timeMachine.payload.floatingObject.collapseToggle()
        timeMachine.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
        timeMachine.timeFrameScale.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
        timeMachine.timeScale.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
        timeMachine.rateScale.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
        /*
        We will create 3 Time Line Charts for the Trading Mine Products
        */
        mineProducts = UI.projects.superalgos.utilities.branches.nodeBranchToArray(networkNode, 'Trading Mine Products')
        for (let j = 0; j < mineProducts.length; j++) {
            let mineProduct = mineProducts[j]
            /*
            The mine products found so far, belongs to any session. To filer all the sessions
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
                let timelineChart = functionLibraryUiObjectsFromNodes.addUIObject(timeMachine, 'Timeline Chart')

                timelineChart.layerManager.payload.referenceParent = mineProduct
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
                    let nodeToDelete = UI.projects.superalgos.utilities.meshes.findNodeInNodeMesh(timelineChart.layerManager, undefined, nodeName, true, true, false, false)
                    if (nodeToDelete === undefined) { return }
                    functionLibraryNodeDeleter.deleteUIObject(nodeToDelete, rootNodes)
                }
            }
        }
        /*
        We need to create a Timeline Chart for each Data Mine Products.
        */
        mineProducts = UI.projects.superalgos.utilities.branches.nodeBranchToArray(networkNode, 'Data Mine Products')
        for (let j = 0; j < mineProducts.length; j++) {
            let mineProduct = mineProducts[j]
            /*
            We need to filter out the ones that do not belong to the market where 
            the session is running at. 
            */
            if (mineProduct.payload.parentNode.payload.referenceParent === undefined) { continue }
            if (mineProduct.payload.parentNode.payload.referenceParent.id !== market.id) { continue }

            let timelineChart = functionLibraryUiObjectsFromNodes.addUIObject(timeMachine, 'Timeline Chart')
            /* 
            The Mine Product Node might be collapesd and since its creation it never 
            received the physics call, so we will do the call so that it properly
            sets its own name, which we are going to reuse here.
            */
            mineProduct.payload.uiObject.invisiblePhysics()
            timelineChart.name = mineProduct.name + ' Data'
            timelineChart.layerManager.payload.referenceParent = mineProduct
            timelineChart.payload.floatingObject.collapseToggle()
            timelineChart.layerManager.payload.floatingObject.collapseToggle()
            timelineChart.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
            timelineChart.layerManager.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180

            let menu = timelineChart.layerManager.payload.uiObject.menu
            menu.internalClick('Add All Mine Layers')
            menu.internalClick('Add All Mine Layers')
        }
        /*
        We need to create a Timeline Chart for each Learning Mine Products.
        */
        mineProducts = UI.projects.superalgos.utilities.branches.nodeBranchToArray(networkNode, 'Learning Mine Products')
        for (let j = 0; j < mineProducts.length; j++) {
            let mineProduct = mineProducts[j]
            /*
            We need to filter out the ones that do not belong to the market where 
            the session is running at. 
            */
            if (mineProduct.payload.parentNode.payload.parentNode.payload.referenceParent === undefined) { continue }
            if (mineProduct.payload.parentNode.payload.parentNode.payload.referenceParent.id !== market.id) { continue }

            let timelineChart = functionLibraryUiObjectsFromNodes.addUIObject(timeMachine, 'Timeline Chart')
            /* 
            The Mine Product Node might be collapesd and since its creation it never 
            received the physics call, so we will do the call so that it properly
            sets its own name, which we are going to reuse here.
            */
            mineProduct.payload.uiObject.invisiblePhysics()
            timelineChart.name = mineProduct.name + ' Learning'
            timelineChart.layerManager.payload.referenceParent = mineProduct
            timelineChart.payload.floatingObject.collapseToggle()
            timelineChart.layerManager.payload.floatingObject.collapseToggle()
            timelineChart.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
            timelineChart.layerManager.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180

            let menu = timelineChart.layerManager.payload.uiObject.menu
            menu.internalClick('Add All Mine Layers')
            menu.internalClick('Add All Mine Layers')
        }
    }

    function addMissingDashboards(node, rootNodes, functionLibraryUiObjectsFromNodes, functionLibraryNodeDeleter) {
        for (let i = 0; i < rootNodes.length; i++) {
            let rootNode = rootNodes[i]
            if (rootNode.type === 'Network') {
                let network = rootNode
                scanNetwork(network)
            }
        }

        function scanNetwork(network) {
            if (network === undefined) { return }

            for (let j = 0; j < network.networkNodes.length; j++) {
                let networkNode = network.networkNodes[j]
                scanNetworkNode(networkNode)
            }

            function scanNetworkNode(networkNode) {
                let testingEnvironment = UI.projects.superalgos.utilities.branches.findInBranch(networkNode, 'Testing Environment', node, true)
                let productionEnvironment = UI.projects.superalgos.utilities.branches.findInBranch(networkNode, 'Production Environment', node, true)

                if (UI.projects.superalgos.utilities.children.isMissingChildren(node, testingEnvironment, true) === true) {
                    let dashboard = functionLibraryUiObjectsFromNodes.addUIObject(node, 'Dashboard')
                    dashboard.payload.referenceParent = testingEnvironment
                    dashboard.name = testingEnvironment.type + ' ' + networkNode.name
                }

                if (UI.projects.superalgos.utilities.children.isMissingChildren(node, productionEnvironment, true) === true) {
                    let dashboard = functionLibraryUiObjectsFromNodes.addUIObject(node, 'Dashboard')
                    dashboard.payload.referenceParent = productionEnvironment
                    dashboard.name = productionEnvironment.type + ' ' + networkNode.name
                }
            }
        }
    }

    function addAllLayerPanels(node, functionLibraryUiObjectsFromNodes) {
        if (validateReferences(node) !== true) { return }
        let layerNode = node.payload.parentNode

        let plotterModule = layerNode.payload.referenceParent.payload.referenceParent.payload.referenceParent
        for (let i = 0; i < plotterModule.panels.length; i++) {
            let plotterPanel = plotterModule.panels[i]
            let layerPanel = functionLibraryUiObjectsFromNodes.addUIObject(node, 'Layer Panel')
            layerPanel.payload.referenceParent = plotterPanel
        }
    }

    function addAllLayerPolygons(node, functionLibraryUiObjectsFromNodes) {
        if (validateReferences(node) !== true) { return }
        let layerNode = node.payload.parentNode

        let plotterModule = layerNode.payload.referenceParent.payload.referenceParent.payload.referenceParent

        if (plotterModule.shapes === undefined) {
            node.payload.uiObject.setWarningMessage('Referenced Plotter Module does not have a Shapes child.')
            return
        }

        for (let i = 0; i < plotterModule.shapes.polygons.length; i++) {
            let polygon = plotterModule.shapes.polygons[i]
            let layerPolygon = functionLibraryUiObjectsFromNodes.addUIObject(node, 'Layer Polygon')
            layerPolygon.payload.referenceParent = polygon
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
