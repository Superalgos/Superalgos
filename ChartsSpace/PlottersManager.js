function newPlottersManager () {
  const MODULE_NAME = 'Plotters Manager'
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let connectors = []

  let timeFrame = INITIAL_TIME_PERIOD
  let datetime = NEW_SESSION_INITIAL_DATE

  let thisObject = {
    fitFunction: undefined,
    container: undefined,
    payload: undefined,
    setDatetime: setDatetime,
    setTimeFrame: setTimeFrame,
    setCoordinateSystem: setCoordinateSystem,
    draw: draw,
    getContainer: getContainer,
    initialize: initialize,
    finalize: finalize
  }

  let initializationReady = false
  let layersPanel
  let onLayerStatusChangedEventSuscriptionId
  let coordinateSystem

  setupContainer()
  return thisObject

  function setupContainer () {
    thisObject.container = newContainer()
    thisObject.container.initialize(MODULE_NAME)
  }

  function finalize () {
    layersPanel.container.eventHandler.stopListening(onLayerStatusChangedEventSuscriptionId)
    layersPanel = undefined

    for (let i = 0; i < connectors.length; i++) {
      let connector = connectors[i]
      /* Then the panels. */
      for (let j = 0; j < connector.panels.length; j++) {
        canvas.panelsSpace.destroyPanel(connector.panels[j])
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
    connectors = []
    coordinateSystem = undefined

    thisObject.container.finalize()
    thisObject.container = undefined
    thisObject.payload = undefined
  }

  function finalizeStorage (storage) {
    storage.eventHandler.stopListening(storage.onMarketFileLoadedLayerEventsSubscriptionId)
    storage.eventHandler.stopListening(storage.onDailyFileLoadedLayerEventsSubscriptionId)
    storage.eventHandler.stopListening(storage.onSingleFileLoadedLayerEventsSubscriptionId)
    storage.eventHandler.stopListening(storage.onFileSequenceLoadedLayerEventsSubscriptionId)
    storage.eventHandler.stopListening(storage.onDailyFileLoadedPlotterEventsSubscriptionId)
    storage.finalize()
  }

  function initialize (pLayersPanel) {
    /* Remember the Layers Panel */
    layersPanel = pLayersPanel

    /* Listen to the event of change of status */
    onLayerStatusChangedEventSuscriptionId = layersPanel.container.eventHandler.listenToEvent('Layer Status Changed', onLayerStatusChanged)
  }

  function initializePlotter (layer) {
    try {
      /* Before Initializing a Plotter, we need the Storage it will use, loaded with the files it will initially need. */
      let storage = newProductStorage(layer.payload.node.id)

      /*
      Before Initializing the Storage, we will put the Layer to listen to the events the storage will raise every time a file is loaded,
      so that the UI can somehow show this. There are different types of events.
      */
      for (let i = 0; i < layer.definition.referenceParent.referenceParent.datasets.length; i++) {
        let dataset = layer.definition.referenceParent.referenceParent.datasets[i]

        switch (dataset.code.type) {
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

      let baseAsset = layer.definition.referenceParent.parentNode.referenceParent.baseAsset.referenceParent.code.codeName
      let quotedAsset = layer.definition.referenceParent.parentNode.referenceParent.quotedAsset.referenceParent.code.codeName
      let market = {
        baseAsset: baseAsset,
        quotedAsset: quotedAsset
      }
      let product = layer.definition.referenceParent.referenceParent
      let bot = layer.definition.referenceParent.referenceParent.parentNode
      let dataMine = layer.definition.referenceParent.referenceParent.parentNode.parentNode
      let exchange = layer.definition.referenceParent.parentNode.referenceParent.parentNode.parentNode
      let plotterModule = layer.definition.referenceParent.referenceParent.referenceParent
      let session

      if (layer.definition.referenceParent.parentNode.parentNode !== undefined) {
        if (layer.definition.referenceParent.parentNode.parentNode.type === 'Session Reference') {
          if (layer.definition.referenceParent.parentNode.parentNode.referenceParent !== undefined) {
            session = layer.definition.referenceParent.parentNode.parentNode.referenceParent
          }
        }
      }

      storage.initialize(
        dataMine,
        bot,
        session,
        product,
        exchange,
        market,
        datetime,
        timeFrame,
        onProductStorageInitialized
      )

      function onProductStorageInitialized (err) {
        try {
          if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
            /* Now we have all the initial data loaded and ready to be delivered to the new instance of the plotter. */
            let plotter

            if (plotterModule.code.isLegacy !== true) {
              plotter = newPlotter()
            } else {
              plotter = getNewPlotter(dataMine.code.codeName, plotterModule.parentNode.code.codeName, plotterModule.code.codeName)
            }

            plotter.container.connectToParent(thisObject.container, true, true, false, true, true, true, false, false, true)
            plotter.container.frame.position.x = thisObject.container.frame.width / 2 - plotter.container.frame.width / 2
            plotter.container.frame.position.y = thisObject.container.frame.height / 2 - plotter.container.frame.height / 2
            plotter.fitFunction = thisObject.fitFunction
            plotter.initialize(storage, datetime, timeFrame, coordinateSystem, onPlotterInizialized, product)

            function onPlotterInizialized () {
              try {
                let connector = {
                  layer: layer,
                  plotter: plotter,
                  storage: storage
                }
                /* Let the Plotter listen to the event of Cursor Files loaded, so that it can react recalculating if needed. */
                plotter.onDailyFileLoadedPlotterEventsSubscriptionId = storage.eventHandler.listenToEvent('Daily File Loaded', plotter.onDailyFileLoaded)
                /* Lets load now this plotter panels. */
                connector.panels = []

                if (product !== undefined) {
                  for (let i = 0; i < plotterModule.panels.length; i++) {
                    let panel = plotterModule.panels[i]

                    let parameters = {
                      dataMine: dataMine.code.codeName,
                      plotterCodeName: plotterModule.parentNode.code.codeName,
                      moduleCodeName: plotterModule.code.codeName,
                      panelNode: panel
                    }

                    let owner = thisObject.payload.node.payload.parentNode.id // Panels are owned by the time machine.
                    let plotterPanelHandle = canvas.panelsSpace.createNewPanel('Plotter Panel', parameters, owner, layer.session)
                    let plotterPanel = canvas.panelsSpace.getPanel(plotterPanelHandle)

                    /* Connect Panel to the Plotter via an Event. */
                    connector.plotter.onRecordChangeEventsSubscriptionId = connector.plotter.container.eventHandler.listenToEvent('Current Record Changed', plotterPanel.onRecordChange)
                    connector.panels.push(plotterPanelHandle)
                  }

                  connector.layer.panels = connector.panels
                }

                connectors.push(connector)
              } catch (err) {
                if (ERROR_LOG === true) { logger.write('[ERROR] initializePlotter -> onProductStorageInitialized -> onPlotterInizialized -> err = ' + err.stack) }
              }
            }
          }
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] initializePlotter -> onProductStorageInitialized -> err = ' + err.stack) }
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] initializePlotter -> err = ' + err.stack) }
    }
  }

  function onLayerStatusChanged (layer) {
    if (layer.status === LAYER_STATUS.LOADING) {
            /* Lets see if we can find the Plotter of this card on our Active Plotters list, other wise we will initialize it */
      let found = false
      for (let i = 0; i < connectors.length; i++) {
        let connector = connectors[i]
        if (connector.layer.payload.node.id === layer.payload.node.id) {
          found = true
        }
      }
      if (found === false) {
        initializePlotter(layer, onProductPlotterInitialized)
        function onProductPlotterInitialized (err) {
                    /* There is no policy yet of what to do if this fails. */
        }
      }
    }
    if (layer.status === LAYER_STATUS.OFF) {
            /* If the plotter of this card is not on our Active Plotters list, then we remove it. */
      for (let i = 0; i < connectors.length; i++) {
        let connector = connectors[i]
        if (connector.layer.payload.node.id === layer.payload.node.id) {
                    /* Then the panels. */
          for (let j = 0; j < connector.panels.length; j++) {
            canvas.panelsSpace.destroyPanel(connector.panels[j])
          }
                    /* Finally the Storage Objects */

          if (connector.plotter.finalize !== undefined) {
            connector.plotter.container.eventHandler.stopListening(connector.plotter.onRecordChangeEventsSubscriptionId)
            connector.plotter.container.finalize()
            connector.plotter.finalize()
          }
          finalizeStorage(connector.storage)
          connectors.splice(i, 1) // Delete item from array.
          return // We already found the product woth changes and processed it.
        }
      }
    }
  }

  function setTimeFrame (pTimeFrame) {
    timeFrame = pTimeFrame
    for (let i = 0; i < connectors.length; i++) {
      let connector = connectors[i]
      connector.layer.setTimeFrame(timeFrame)
      connector.storage.setTimeFrame(timeFrame)
      connector.plotter.setTimeFrame(timeFrame)
    }
  }

  function setDatetime (pDatetime) {
    datetime = pDatetime
    for (let i = 0; i < connectors.length; i++) {
      let connector = connectors[i]
      connector.layer.setDatetime(pDatetime)
      connector.storage.setDatetime(pDatetime)
      connector.plotter.setDatetime(pDatetime)
    }
  }

  function setCoordinateSystem (pCoordinateSystem) {
    coordinateSystem = pCoordinateSystem
    for (let i = 0; i < connectors.length; i++) {
      let connector = connectors[i]
      connector.plotter.setCoordinateSystem(coordinateSystem)
    }
  }

  function getContainer (point) {
  }

  function draw () {
    if (connectors === undefined) { return } // We need to wait
        /* First the Product Plotters. */
    for (let i = 0; i < connectors.length; i++) {
      let connector = connectors[connectors.length - i - 1]
      connector.plotter.draw()
    }
  }
}
