function newPlottersManager() {
    const MODULE_NAME = 'Plotters Manager'
    const ERROR_LOG = true
    const logger = newWebDebugLog()


    let timeFrame = INITIAL_TIME_PERIOD
    let datetime = NEW_SESSION_INITIAL_DATE

    let thisObject = {
        fitFunction: undefined,
        container: undefined,
        payload: undefined,
        connectors: [],
        setDatetime: setDatetime,
        setTimeFrame: setTimeFrame,
        setCoordinateSystem: setCoordinateSystem,
        physics: physics,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize,
        finalize: finalize
    }

    thisObject.connectors = []

    let initializationReady = false
    let layersPanel
    let onLayerStatusChangedEventSuscriptionId
    let coordinateSystem

    setupContainer()
    return thisObject

    function setupContainer() {
        thisObject.container = newContainer()
        thisObject.container.initialize(MODULE_NAME)
    }

    function finalize() {
        layersPanel.container.eventHandler.stopListening(onLayerStatusChangedEventSuscriptionId)
        layersPanel = undefined

        for (let i = 0; i < thisObject.connectors.length; i++) {
            let connector = thisObject.connectors[i]
            /* Then the panels. */
            for (let j = 0; j < connector.panels.length; j++) {
                UI.projects.foundations.spaces.panelSpace.destroyPanel(connector.panels[j])
                connector.panels[j] = undefined
            }
            connector.panels = undefined

            /* Finalize the plotters */
            if (connector.plotter.finalize !== undefined) {
                connector.plotter.container.eventHandler.stopListening(connector.plotter.onRecordChangeEventsSubscriptionId)
                connector.plotter.finalize()
            }
            connector.plotter = undefined

            /* Finally the Storage Objects */
            finalizeStorage(connector.storage)
            connector.storage = undefined

            connector = undefined
        }
        thisObject.connectors = []
        coordinateSystem = undefined

        thisObject.container.finalize()
        thisObject.container = undefined
        thisObject.payload = undefined
    }

    function finalizeStorage(storage) {
        storage.eventHandler.stopListening(storage.onMarketFileLoadedLayerEventsSubscriptionId)
        storage.eventHandler.stopListening(storage.onDailyFileLoadedLayerEventsSubscriptionId)
        storage.eventHandler.stopListening(storage.onSingleFileLoadedLayerEventsSubscriptionId)
        storage.eventHandler.stopListening(storage.onFileSequenceLoadedLayerEventsSubscriptionId)
        storage.eventHandler.stopListening(storage.onDailyFileLoadedPlotterEventsSubscriptionId)
        storage.finalize()
    }

    function initialize(pLayersPanel) {
        /* Remember this */
        layersPanel = pLayersPanel

        /* Listen to the event of change of status */
        onLayerStatusChangedEventSuscriptionId = layersPanel.container.eventHandler.listenToEvent('Layer Status Changed', onLayerStatusChanged)
    }

    function initializePlotter(layer) {
        try {
            /* Before Initializing a Plotter, we need the Storage it will use, loaded with the files it will initially need. */
            let storage = newProductStorage(layer.payload.node.id)

            /*
            Before Initializing the Storage, we will put the Layer to listen to the events the storage will raise every time a file is loaded,
            so that the UI can somehow show this. There are different types of events.
            */
            for (let i = 0; i < layer.definition.referenceParent.referenceParent.datasets.length; i++) {
                let dataset = layer.definition.referenceParent.referenceParent.datasets[i]

                switch (dataset.config.type) {
                    case 'Market Files': {
                        storage.onMarketFileLoadedLayerEventsSubscriptionId = storage.eventHandler.listenToEvent('Market File Loaded', layer.onMarketFileLoaded)
                    }
                        break
                    case 'Daily Files': {
                        storage.onDailyFileLoadedLayerEventsSubscriptionId = storage.eventHandler.listenToEvent('Daily File Loaded', layer.onDailyFileLoaded)
                    }
                        break
                    case 'Single File': {
                        storage.onSingleFileLoadedLayerEventsSubscriptionId = storage.eventHandler.listenToEvent('Single File Loaded', layer.onSingleFileLoaded)
                    }
                        break
                    case 'File Sequence': {
                        storage.onFileSequenceLoadedLayerEventsSubscriptionId = storage.eventHandler.listenToEvent('File Sequence Loaded', layer.onFileSequenceLoaded)
                    }
                        break
                    default: {
                        if (ERROR_LOG === true) {
                            logger.write('[ERROR] initializePlotter -> Dataset Type Incorrect or Undefined -> dataset.type = ' + dataset.type)
                        }
                        return
                    }
                }
            }

            let baseAsset = layer.baseAsset.config.codeName
            let quotedAsset = layer.quotedAsset.config.codeName
            let market = {
                baseAsset: baseAsset,
                quotedAsset: quotedAsset
            }
            let productDefinition = layer.productDefinition
            let bot = layer.bot
            let mine = layer.mine
            let exchange = layer.exchange
            let plotterModule = layer.plotterModule
            let session
            let tradingOrLearningOrPortfolioSystem
            let tradingOrLearningOrPortfolioEngine

            /*
            A layer can be referencing a Data Product in 3 different branches of the Network hierarchy.
            Two of those branches have sessions.
            */
            let sessionReference = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(layer.definition, 'Trading Session Reference', undefined, false, true, true, true)
            if (sessionReference === undefined) {
                sessionReference = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(layer.definition, 'Learning Session Reference', undefined, false, true, true, true)
            }
            if (sessionReference === undefined) {
                sessionReference = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(layer.definition, 'Portfolio Session Reference', undefined, false, true, true, true)
            }

            if (sessionReference !== undefined) {
                session = sessionReference.referenceParent
                if (session === undefined) {
                    logger.write('[ERROR] initializePlotter -> Session Reference without a Reference Parent -> Plotter will not be loaded. ')
                    return
                }
                /* From the session we might be able to reach the Trading System or the Trading Engine */
                if (session.tradingSystemReference !== undefined) {
                    tradingOrLearningOrPortfolioSystem = session.tradingSystemReference.referenceParent
                }
                if (session.tradingEngineReference !== undefined) {
                    tradingOrLearningOrPortfolioEngine = session.tradingEngineReference.referenceParent
                }
                if (session.portfolioSystemReference !== undefined) {
                    tradingOrLearningOrPortfolioSystem = session.portfolioSystemReference.referenceParent
                }
                if (session.portfolioEngineReference !== undefined) {
                    tradingOrLearningOrPortfolioEngine = session.portfolioEngineReference.referenceParent
                }
                if (session.learningSystemReference !== undefined) {
                    tradingOrLearningOrPortfolioSystem = session.learningSystemReference.referenceParent
                }
                if (session.learningEngineReference !== undefined) {
                    tradingOrLearningOrPortfolioEngine = session.learningEngineReference.referenceParent
                }
            }

            let host = layer.lanNetworkNode.config.host
            let webPort = layer.lanNetworkNode.config.webPort
            let extWSURL = layer.lanNetworkNode.config.webSocketsExternalURL
            let scheme = 'http'
            if (host === undefined) { host = window.location.hostname }
            if (webPort === undefined) { webPort = window.location.port }

            if (UI.environment.DEMO_MODE === true) {
                host = UI.environment.DEMO_MODE_HOST
            }
            
            if (extWSURL !== undefined) { 
            	host = window.location.hostname
            	webPort = window.location.port
            	scheme = window.location.protocol.slice(0,-1)
            }

            let eventsServerClient = UI.projects.foundations.spaces.designSpace.workspace.eventsServerClients.get(layer.lanNetworkNode.id)

            storage.initialize(
                mine,
                bot,
                session,
                productDefinition,
                exchange,
                market,
                datetime,
                timeFrame,
                host,
                webPort,
                eventsServerClient,
                onProductStorageInitialized,
                scheme,
            )

            function onProductStorageInitialized(err) {
                if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    /* Now we have all the initial data loaded and ready to be delivered to the new instance of the plotter. */
                    let plotter

                    if (plotterModule.config.isLegacy !== true) {
                        plotter = newPlotter()
                    } else {
                        plotter = getNewPlotter(mine.config.codeName, plotterModule.parentNode.config.codeName, plotterModule.config.codeName)
                    }

                    plotter.container.connectToParent(thisObject.container, true, true, false, true, true, true, false, false, true)
                    plotter.container.frame.position.x = thisObject.container.frame.width / 2 - plotter.container.frame.width / 2
                    plotter.container.frame.position.y = thisObject.container.frame.height / 2 - plotter.container.frame.height / 2
                    plotter.fitFunction = thisObject.fitFunction
                    plotter.initialize(storage, datetime, timeFrame, coordinateSystem, onPlotterInizialized, productDefinition)

                    function onPlotterInizialized() {
                        let connector = {
                            layer: layer,
                            plotter: plotter,
                            storage: storage
                        }
                        /* Let the Plotter listen to the event of Cursor Files loaded, so that it can react recalculating if needed. */
                        plotter.onDailyFileLoadedPlotterEventsSubscriptionId = storage.eventHandler.listenToEvent('Daily File Loaded', plotter.onDailyFileLoaded)
                        /* Lets load now this plotter panels. */
                        connector.panels = []

                        if (productDefinition !== undefined) {
                            /* Here we setup the panels associated with this plotter */
                            for (let i = 0; i < plotterModule.panels.length; i++) {
                                let panel = plotterModule.panels[i]

                                let parameters = {
                                    mine: mine.config.codeName,
                                    plotterCodeName: plotterModule.parentNode.config.codeName,
                                    moduleCodeName: plotterModule.config.codeName,
                                    panelNode: panel
                                }

                                let owner = thisObject.payload.node.payload.parentNode.id // Panels are owned by the time machine.
                                let plotterPanelHandle = UI.projects.foundations.spaces.panelSpace.createNewPanel('Plotter Panel', parameters, owner, layer.session)
                                let plotterPanel = UI.projects.foundations.spaces.panelSpace.getPanel(plotterPanelHandle)

                                /* Connect Panel to the Plotter via an Event. */
                                connector.plotter.onRecordChangeEventsSubscriptionId = connector.plotter.container.eventHandler.listenToEvent('Current Record Changed', plotterPanel.onRecordChange)
                                connector.panels.push(plotterPanelHandle)
                            }
                            connector.layer.panels = connector.panels

                            /*
                            Next we will check the different types of Plotting related to connecting to an existing node branch.
                            */
                            if (plotterModule.nodesHighlights !== undefined && plotterModule.config.connectTo !== undefined) {
                                connector.nodesHighlights = newNodesHighlights()
                                switch (plotterModule.config.connectTo) {
                                    case 'Trading System':
                                        connector.nodesHighlights.initialize(tradingOrLearningOrPortfolioSystem)
                                        break
                                    case 'Trading Engine':
                                        connector.nodesHighlights.initialize(tradingOrLearningOrPortfolioEngine)
                                        break
                                    case 'Portfolio System':
                                        connector.nodesHighlights.initialize(tradingOrLearningOrPortfolioSystem)
                                        break
                                    case 'Portfolio Engine':
                                        connector.nodesHighlights.initialize(tradingOrLearningOrPortfolioEngine)
                                        break
                                    case 'Learning System':
                                        connector.nodesHighlights.initialize(tradingOrLearningOrPortfolioSystem)
                                        break
                                    case 'Learning Engine':
                                        connector.nodesHighlights.initialize(tradingOrLearningOrPortfolioEngine)
                                        break
                                }
                                connector.nodesHighlights.onRecordChangeEventsSubscriptionId = connector.plotter.container.eventHandler.listenToEvent('Current Record Changed', connector.nodesHighlights.onRecordChange)
                            }
                            if (plotterModule.nodesValues !== undefined && plotterModule.config.connectTo !== undefined) {
                                connector.nodesValues = newNodesValues()
                                switch (plotterModule.config.connectTo) {
                                    case 'Trading System':
                                        connector.nodesValues.initialize(tradingOrLearningOrPortfolioSystem)
                                        break
                                    case 'Trading Engine':
                                        connector.nodesValues.initialize(tradingOrLearningOrPortfolioEngine)
                                        break
                                    case 'Portfolio System':
                                        connector.nodesValues.initialize(tradingOrLearningOrPortfolioSystem)
                                        break
                                    case 'Portfolio Engine':
                                        connector.nodesValues.initialize(tradingOrLearningOrPortfolioEngine)
                                        break
                                    case 'Learning System':
                                        connector.nodesValues.initialize(tradingOrLearningOrPortfolioSystem)
                                        break
                                    case 'Learning Engine':
                                        connector.nodesValues.initialize(tradingOrLearningOrPortfolioEngine)
                                        break
                                }
                                connector.nodesValues.onRecordChangeEventsSubscriptionId = connector.plotter.container.eventHandler.listenToEvent('Current Record Changed', connector.nodesValues.onRecordChange)
                            }
                            if (plotterModule.nodesErrors !== undefined && plotterModule.config.connectTo !== undefined) {
                                connector.nodesErrors = newNodesErrors()
                                switch (plotterModule.config.connectTo) {
                                    case 'Trading System':
                                        connector.nodesErrors.initialize(tradingOrLearningOrPortfolioSystem)
                                        break
                                    case 'Trading Engine':
                                        connector.nodesErrors.initialize(tradingOrLearningOrPortfolioEngine)
                                        break
                                    case 'Portfolio System':
                                        connector.nodesErrors.initialize(tradingOrLearningOrPortfolioSystem)
                                        break
                                    case 'Portfolio Engine':
                                        connector.nodesErrors.initialize(tradingOrLearningOrPortfolioEngine)
                                        break
                                    case 'Learning System':
                                        connector.nodesErrors.initialize(tradingOrLearningOrPortfolioSystem)
                                        break
                                    case 'Learning Engine':
                                        connector.nodesErrors.initialize(tradingOrLearningOrPortfolioEngine)
                                        break
                                }
                                connector.nodesErrors.onRecordChangeEventsSubscriptionId = connector.plotter.container.eventHandler.listenToEvent('Current Record Changed', connector.nodesErrors.onRecordChange)
                            }
                            if (plotterModule.nodesWarnings !== undefined && plotterModule.config.connectTo !== undefined) {
                                connector.nodesWarnings = newNodesWarnings()
                                switch (plotterModule.config.connectTo) {
                                    case 'Trading System':
                                        connector.nodesWarnings.initialize(tradingOrLearningOrPortfolioSystem)
                                        break
                                    case 'Trading Engine':
                                        connector.nodesWarnings.initialize(tradingOrLearningOrPortfolioEngine)
                                        break
                                    case 'Portfolio System':
                                        connector.nodesWarnings.initialize(tradingOrLearningOrPortfolioSystem)
                                        break
                                    case 'Portfolio Engine':
                                        connector.nodesWarnings.initialize(tradingOrLearningOrPortfolioEngine)
                                        break
                                    case 'Learning System':
                                        connector.nodesWarnings.initialize(tradingOrLearningOrPortfolioSystem)
                                        break
                                    case 'Learning Engine':
                                        connector.nodesWarnings.initialize(tradingOrLearningOrPortfolioEngine)
                                        break
                                }
                                connector.nodesWarnings.onRecordChangeEventsSubscriptionId = connector.plotter.container.eventHandler.listenToEvent('Current Record Changed', connector.nodesWarnings.onRecordChange)
                            }
                            if (plotterModule.nodesInfos !== undefined && plotterModule.config.connectTo !== undefined) {
                                connector.nodesInfos = newNodesInfos()
                                switch (plotterModule.config.connectTo) {
                                    case 'Trading System':
                                        connector.nodesInfos.initialize(tradingOrLearningOrPortfolioSystem)
                                        break
                                    case 'Trading Engine':
                                        connector.nodesInfos.initialize(tradingOrLearningOrPortfolioEngine)
                                        break
                                    case 'Portfolio System':
                                        connector.nodesInfos.initialize(tradingOrLearningOrPortfolioSystem)
                                        break
                                    case 'Portfolio Engine':
                                        connector.nodesInfos.initialize(tradingOrLearningOrPortfolioEngine)
                                        break
                                    case 'Learning System':
                                        connector.nodesInfos.initialize(tradingOrLearningOrPortfolioSystem)
                                        break
                                    case 'Learning Engine':
                                        connector.nodesInfos.initialize(tradingOrLearningOrPortfolioEngine)
                                        break
                                }
                                connector.nodesInfos.onRecordChangeEventsSubscriptionId = connector.plotter.container.eventHandler.listenToEvent('Current Record Changed', connector.nodesInfos.onRecordChange)
                            }
                            if (plotterModule.nodesRunning !== undefined && plotterModule.config.connectTo !== undefined) {
                                connector.nodesRunning = newNodesRunning()
                                switch (plotterModule.config.connectTo) {
                                    case 'Trading System':
                                        connector.nodesRunning.initialize(tradingOrLearningOrPortfolioSystem)
                                        break
                                    case 'Trading Engine':
                                        connector.nodesRunning.initialize(tradingOrLearningOrPortfolioEngine)
                                        break
                                    case 'Portfolio System':
                                        connector.nodesRunning.initialize(tradingOrLearningOrPortfolioSystem)
                                        break
                                    case 'Portfolio Engine':
                                        connector.nodesRunning.initialize(tradingOrLearningOrPortfolioEngine)
                                        break
                                    case 'Learning System':
                                        connector.nodesRunning.initialize(tradingOrLearningOrPortfolioSystem)
                                        break
                                    case 'Learning Engine':
                                        connector.nodesRunning.initialize(tradingOrLearningOrPortfolioEngine)
                                        break
                                }
                                connector.nodesRunning.onRecordChangeEventsSubscriptionId = connector.plotter.container.eventHandler.listenToEvent('Current Record Changed', connector.nodesRunning.onRecordChange)
                            }
                            if (plotterModule.nodesStatus !== undefined && plotterModule.config.connectTo !== undefined) {
                                connector.nodesStatus = newNodesStatus()
                                switch (plotterModule.config.connectTo) {
                                    case 'Trading System':
                                        connector.nodesStatus.initialize(tradingOrLearningOrPortfolioSystem)
                                        break
                                    case 'Trading Engine':
                                        connector.nodesStatus.initialize(tradingOrLearningOrPortfolioEngine)
                                        break
                                    case 'Portfolio System':
                                        connector.nodesStatus.initialize(tradingOrLearningOrPortfolioSystem)
                                        break
                                    case 'Portfolio Engine':
                                        connector.nodesStatus.initialize(tradingOrLearningOrPortfolioEngine)
                                        break
                                    case 'Learning System':
                                        connector.nodesStatus.initialize(tradingOrLearningOrPortfolioSystem)
                                        break
                                    case 'Learning Engine':
                                        connector.nodesStatus.initialize(tradingOrLearningOrPortfolioEngine)
                                        break
                                }
                                connector.nodesStatus.onRecordChangeEventsSubscriptionId = connector.plotter.container.eventHandler.listenToEvent('Current Record Changed', connector.nodesStatus.onRecordChange)
                            }
                            if (plotterModule.nodesProgress !== undefined && plotterModule.config.connectTo !== undefined) {
                                connector.nodesProgress = newNodesProgress()
                                switch (plotterModule.config.connectTo) {
                                    case 'Trading System':
                                        connector.nodesProgress.initialize(tradingOrLearningOrPortfolioSystem)
                                        break
                                    case 'Trading Engine':
                                        connector.nodesProgress.initialize(tradingOrLearningOrPortfolioEngine)
                                        break
                                    case 'Portfolio System':
                                        connector.nodesProgress.initialize(tradingOrLearningOrPortfolioSystem)
                                        break
                                    case 'Portfolio Engine':
                                        connector.nodesProgress.initialize(tradingOrLearningOrPortfolioEngine)
                                        break
                                    case 'Learning System':
                                        connector.nodesProgress.initialize(tradingOrLearningOrPortfolioSystem)
                                        break
                                    case 'Learning Engine':
                                        connector.nodesProgress.initialize(tradingOrLearningOrPortfolioEngine)
                                        break
                                }
                                connector.nodesProgress.onRecordChangeEventsSubscriptionId = connector.plotter.container.eventHandler.listenToEvent('Current Record Changed', connector.nodesProgress.onRecordChange)
                            }
                            if (plotterModule.nodesAnnouncements !== undefined && plotterModule.config.connectTo !== undefined) {
                                connector.nodesAnnounements = newNodesAnnouncements()
                                switch (plotterModule.config.connectTo) {
                                    case 'Trading System':
                                        connector.nodesAnnounements.initialize(tradingOrLearningOrPortfolioSystem)
                                        break
                                    case 'Trading Engine':
                                        connector.nodesAnnounements.initialize(tradingOrLearningOrPortfolioEngine)
                                        break
                                    case 'Portfolio System':
                                        connector.nodesAnnounements.initialize(tradingOrLearningOrPortfolioSystem)
                                        break
                                    case 'Portfolio Engine':
                                        connector.nodesAnnounements.initialize(tradingOrLearningOrPortfolioEngine)
                                        break
                                    case 'Learning System':
                                        connector.nodesAnnounements.initialize(tradingOrLearningOrPortfolioSystem)
                                        break
                                    case 'Learning Engine':
                                        connector.nodesAnnounements.initialize(tradingOrLearningOrPortfolioEngine)
                                        break
                                }
                                connector.nodesAnnounements.onRecordChangeEventsSubscriptionId = connector.plotter.container.eventHandler.listenToEvent('Current Record Changed', connector.nodesAnnounements.onRecordChange)
                            }
                            /*
                            Another type of plotting is with Record Values. This method uses the record definition to find the target node
                            and from there is looks into its children all based on the Record Definition configuration.
                            */
                            if (plotterModule.recordValues !== undefined) {
                                connector.recordValues = newRecordValues()
                                connector.recordValues.initialize(tradingOrLearningOrPortfolioSystem, tradingOrLearningOrPortfolioEngine, productDefinition)
                                connector.recordValues.onRecordChangeEventsSubscriptionId = connector.plotter.container.eventHandler.listenToEvent('Current Record Changed', connector.recordValues.onRecordChange)
                            }
                        }
                        thisObject.connectors.push(connector)
                    }
                }
            }
        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] initializePlotter -> err = ' + err.stack) }
        }
    }

    function onLayerStatusChanged(layer) {
        if (layer.status === LAYER_STATUS.LOADING) {
            /* Lets see if we can find the Plotter of this card on our Active Plotters list, other wise we will initialize it */
            let found = false
            for (let i = 0; i < thisObject.connectors.length; i++) {
                let connector = thisObject.connectors[i]
                if (connector.layer.payload.node.id === layer.payload.node.id) {
                    found = true
                }
            }
            if (found === false) {
                initializePlotter(layer)
            }
        }
        if (layer.status === LAYER_STATUS.OFF) {
            /* If the plotter of this card is not on our Active Plotters list, then we remove it. */
            for (let i = 0; i < thisObject.connectors.length; i++) {
                let connector = thisObject.connectors[i]
                if (connector.layer.payload.node.id === layer.payload.node.id) {
                    /* Then the panels. */
                    for (let j = 0; j < connector.panels.length; j++) {
                        UI.projects.foundations.spaces.panelSpace.destroyPanel(connector.panels[j])
                    }
                    /* Finally the Storage Objects */
                    finalizeNodesPlotting(connector)
                    if (connector.plotter.finalize !== undefined) {
                        connector.plotter.container.eventHandler.stopListening(connector.plotter.onRecordChangeEventsSubscriptionId)
                        connector.plotter.container.finalize()
                        connector.plotter.finalize()
                    }
                    finalizeStorage(connector.storage)
                    thisObject.connectors.splice(i, 1) // Delete item from array.
                    return // We already found the product with changes and processed it.
                }
            }
        }
    }

    function finalizeNodesPlotting(connector) {
        if (connector.nodesHighlights !== undefined) {
            connector.plotter.container.eventHandler.stopListening(connector.nodesHighlights.onRecordChangeEventsSubscriptionId)
            connector.nodesHighlights.finalize()
        }
        if (connector.nodesValues !== undefined) {
            connector.plotter.container.eventHandler.stopListening(connector.nodesValues.onRecordChangeEventsSubscriptionId)
            connector.nodesValues.finalize()
        }
        if (connector.nodesErrors !== undefined) {
            connector.plotter.container.eventHandler.stopListening(connector.nodesErrors.onRecordChangeEventsSubscriptionId)
            connector.nodesErrors.finalize()
        }
        if (connector.nodesWarnings !== undefined) {
            connector.plotter.container.eventHandler.stopListening(connector.nodesWarnings.onRecordChangeEventsSubscriptionId)
            connector.nodesWarnings.finalize()
        }
        if (connector.nodesInfos !== undefined) {
            connector.plotter.container.eventHandler.stopListening(connector.nodesInfos.onRecordChangeEventsSubscriptionId)
            connector.nodesInfos.finalize()
        }
        if (connector.nodesStatus !== undefined) {
            connector.plotter.container.eventHandler.stopListening(connector.nodesStatus.onRecordChangeEventsSubscriptionId)
            connector.nodesStatus.finalize()
        }
        if (connector.nodesProgress !== undefined) {
            connector.plotter.container.eventHandler.stopListening(connector.Progress.onRecordChangeEventsSubscriptionId)
            connector.Progress.finalize()
        }
        if (connector.nodesRunning !== undefined) {
            connector.plotter.container.eventHandler.stopListening(connector.nodesRunning.onRecordChangeEventsSubscriptionId)
            connector.nodesRunning.finalize()
        }
        if (connector.recordValues !== undefined) {
            connector.plotter.container.eventHandler.stopListening(connector.recordValues.onRecordChangeEventsSubscriptionId)
            connector.recordValues.finalize()
        }
    }

    function setTimeFrame(pTimeFrame) {
        timeFrame = pTimeFrame
        for (let i = 0; i < thisObject.connectors.length; i++) {
            let connector = thisObject.connectors[i]
            connector.layer.setTimeFrame(timeFrame)
            connector.storage.setTimeFrame(timeFrame)
            connector.plotter.setTimeFrame(timeFrame)
        }
    }

    function setDatetime(pDatetime) {
        datetime = pDatetime
        for (let i = 0; i < thisObject.connectors.length; i++) {
            let connector = thisObject.connectors[i]
            connector.layer.setDatetime(pDatetime)
            connector.storage.setDatetime(pDatetime)
            connector.plotter.setDatetime(pDatetime)
        }
    }

    function setCoordinateSystem(pCoordinateSystem) {
        coordinateSystem = pCoordinateSystem
        for (let i = 0; i < thisObject.connectors.length; i++) {
            let connector = thisObject.connectors[i]
            connector.plotter.setCoordinateSystem(coordinateSystem)
        }
    }

    function getContainer(point) {
    }

    function draw() {
        if (thisObject.connectors === undefined) { return } // We need to wait
        /* First the Product Plotters. */
        let maxElementsPlotted = 0
        for (let i = 0; i < thisObject.connectors.length; i++) {
            let connector = thisObject.connectors[thisObject.connectors.length - i - 1]
            let elementsPlotted = connector.plotter.draw()
            if (elementsPlotted !== undefined) {
                if (elementsPlotted > maxElementsPlotted) {
                    maxElementsPlotted = elementsPlotted
                }
            }
        }
        return maxElementsPlotted
    }

    function physics() {
        if (thisObject.connectors === undefined) { return } // We need to wait
        for (let i = 0; i < thisObject.connectors.length; i++) {
            let connector = thisObject.connectors[thisObject.connectors.length - i - 1]
            if (connector.plotter.physics !== undefined) {
                connector.plotter.physics()
            }
        }
    }
}
