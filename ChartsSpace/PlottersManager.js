function newPlottersManager () {
  const MODULE_NAME = 'Plotters Manager'
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let productPlotters = []

  let timeFrame = INITIAL_TIME_PERIOD
  let datetime = NEW_SESSION_INITIAL_DATE

  let thisObject = {
    fitFunction: undefined,
    container: undefined,
    setDatetime: setDatetime,
    setTimeFrame: setTimeFrame,
    positionAtDatetime: positionAtDatetime,
    draw: draw,
    getContainer: getContainer,
    initialize: initialize,
    finalize: finalize
  }

  let initializationReady = false

  let layersPanel
  let exchange
  let market

  setupContainer()
  return thisObject

  function setupContainer () {
    thisObject.container = newContainer()
    thisObject.container.initialize(MODULE_NAME)
  }

  function finalize () {
    for (let i = 0; i < productPlotters.length; i++) {
      /* Then the panels. */
      for (let j = 0; j < productPlotters[i].panels.length; j++) {
        canvas.panelsSpace.destroyPanel(productPlotters[i].panels[j])
        productPlotters[i].panels[j] = undefined
      }
      productPlotters[i].panels = undefined

      /* Finalize the plotters */
      if (productPlotters[i].plotter.finalize !== undefined) {
        productPlotters[i].plotter.finalize()
      }
      productPlotters[i].plotter = undefined

      /* Finally the Storage Objects */
      productPlotters[i].storage.finalize()
      productPlotters[i].storage = undefined

      productPlotters[i] = undefined
    }
    productPlotters = []

    layersPanel = undefined

    thisObject.container.finalize()
    thisObject.container = undefined
    setupContainer()
  }

  function initialize (pProductsPanel, pExchange, pMarket) {
    try {
            /* Remember the Layers Panel */
      layersPanel = pProductsPanel
      exchange = pExchange
      market = pMarket
            /* Listen to the event of change of status */
      layersPanel.container.eventHandler.listenToEvent('Layer Status Changed', onLayerStatusChanged)

      /* Lets get all the cards that needs to be loaded. */

      let loadingLayers = layersPanel.getLoadingLayers()

      for (let i = 0; i < loadingLayers.length; i++) {
          /* For each one, we will initialize the associated plotter. */
        initializeProductPlotter(loadingLayers[i])
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err.stack) }
    }
  }

  function initializeProductPlotter (pLayer, callBack) {
    try {
            /* Before Initializing a Plotter, we need the Storage it will use, loaded with the files it will initially need. */
      let objName = pLayer.dataMine.codeName + '-' + pLayer.bot.codeName + '-' + pLayer.product.codeName
      let storage = newProductStorage(objName)
            /*

            Before Initializing the Storage, we will put the Layer to listen to the events the storage will raise every time a file is loaded,
            so that the UI can somehow show this. There are different types of events.

            */
      for (let i = 0; i < pLayer.product.dataSets.length; i++) {
        let thisSet = pLayer.product.dataSets[i]

        switch (thisSet.type) {
          case 'Market Files': {
            storage.eventHandler.listenToEvent('Market File Loaded', pLayer.onMarketFileLoaded)
          }
            break
          case 'Daily Files': {
            storage.eventHandler.listenToEvent('Daily File Loaded', pLayer.onDailyFileLoaded)
          }
            break
          case 'Single File': {
            storage.eventHandler.listenToEvent('Single File Loaded', pLayer.onSingleFileLoaded)
          }
            break
          case 'File Sequence': {
            storage.eventHandler.listenToEvent('File Sequence Loaded', pLayer.onFileSequenceLoaded)
          }
            break
        }
      }

      storage.initialize(pLayer.dataMine, pLayer.bot, pLayer.session, pLayer.product, exchange, market, datetime, timeFrame, onProductStorageInitialized)

      function onProductStorageInitialized (err) {
        try {
          if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
            /* Now we have all the initial data loaded and ready to be delivered to the new instance of the plotter. */
            let plotter
            let productDefinition

            if (pLayer.product.plotter.legacy === false) {
              plotter = newPlotter()

              /* We take a snapwhot of the current product definition to be used by the plotter. */
              let functionLibraryProtocolNode = newProtocolNode()
              let lightingPath = '->Product Definition->' +
                                'Record Definition->Record Property->Formula->' +
                                'Data Building Procedure->Procedure Loop->Javascript Code->Procedure Initialization->Javascript Code->' +
                                'Calculations Procedure->Procedure Loop->Javascript Code->Procedure Initialization->Javascript Code->' +
                                'Plotter Module->Shapes->' +
                                'Chart Points->Point->Point Formula->' +
                                'Polygon->Polygon Body->Style->Style Condition->Style->' +
                                'Polygon Border->Style->Style Condition->Style->' +
                                'Polygon Vertex->Point->' +
                                'Plotter Panel->Javascript Code->Panel Data->Data Formula->'
              productDefinition = functionLibraryProtocolNode.getProtocolNode(pLayer.product.node, false, true, true, false, false, lightingPath)
            } else {
              plotter = getNewPlotter(pLayer.product.plotter.dataMine, pLayer.product.plotter.codeName, pLayer.product.plotter.moduleName)
            }

            plotter.container.connectToParent(thisObject.container, true, true, false, true, true, true, false, false, true)
            plotter.container.frame.position.x = thisObject.container.frame.width / 2 - plotter.container.frame.width / 2
            plotter.container.frame.position.y = thisObject.container.frame.height / 2 - plotter.container.frame.height / 2
            plotter.fitFunction = thisObject.fitFunction
            plotter.initialize(storage, exchange, market, datetime, timeFrame, onPlotterInizialized, productDefinition)

            function onPlotterInizialized () {
              try {
                let productPlotter = {
                  layer: pLayer,
                  plotter: plotter,
                  storage: storage,
                  profile: undefined,
                  notes: undefined
                }
                    /* Let the Plotter listen to the event of Cursor Files loaded, so that it can react recalculating if needed. */
                storage.eventHandler.listenToEvent('Daily File Loaded', plotter.onDailyFileLoaded)
                    /* Lets load now this plotter panels. */
                productPlotter.panels = []

                /* Here is where we instantiate the legacy panels */
                for (let i = 0; i < pLayer.product.plotter.module.panels.length; i++) {
                  let panelConfig = pLayer.product.plotter.module.panels[i]

                  let parameters = {
                    dataMine: pLayer.product.plotter.dataMine,
                    plotterCodeName: pLayer.product.plotter.codeName,
                    moduleCodeName: pLayer.product.plotter.moduleName,
                    panelCodeName: panelConfig.codeName
                  }
                  let panelOwner = exchange + ' ' + market.quotedAsset + '/' + market.baseAsset
                  let plotterPanelHandle = canvas.panelsSpace.createNewPanel('Plotter Panel', parameters, panelOwner, pLayer.session)
                  let plotterPanel = canvas.panelsSpace.getPanel(plotterPanelHandle, panelOwner)
                        /* Connect Panel to the Plotter via an Event. */
                  if (panelConfig.event !== undefined) {
                    productPlotter.plotter.container.eventHandler.listenToEvent(panelConfig.event, plotterPanel.onEventRaised)
                  }
                  productPlotter.panels.push(plotterPanelHandle)
                }

                /* Here we instantiate the UI Defined Panels. */
                if (productDefinition !== undefined) {
                  for (let i = 0; i < productDefinition.referenceParent.panels.length; i++) {
                    let panel = productDefinition.referenceParent.panels[i]

                    let parameters = {
                      dataMine: pLayer.product.plotter.dataMine,
                      plotterCodeName: pLayer.product.plotter.codeName,
                      moduleCodeName: pLayer.product.plotter.moduleName,
                      panelCodeName: panel.id
                    }
                    let panelOwner = exchange + ' ' + market.quotedAsset + '/' + market.baseAsset
                    let plotterPanelHandle = canvas.panelsSpace.createNewPanel('Plotter Panel', parameters, panelOwner, pLayer.session, panel)
                    let plotterPanel = canvas.panelsSpace.getPanel(plotterPanelHandle, panelOwner)

                    /* Connect Panel to the Plotter via an Event. */
                    productPlotter.plotter.container.eventHandler.listenToEvent('Current Record Changed', plotterPanel.onRecordChange)
                    productPlotter.panels.push(plotterPanelHandle)
                  }
                }

                productPlotters.push(productPlotter)
              } catch (err) {
                if (ERROR_LOG === true) { logger.write('[ERROR] initializeProductPlotter -> onProductStorageInitialized -> onPlotterInizialized -> err = ' + err.stack) }
              }
            }
          }
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] initializeProductPlotter -> onProductStorageInitialized -> err = ' + err.stack) }
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] initializeProductPlotter -> err = ' + err.stack) }
    }
  }

  function onLayerStatusChanged (pLayer) {
    if (pLayer.status === PRODUCT_CARD_STATUS.LOADING) {
            /* Lets see if we can find the Plotter of this card on our Active Plotters list, other wise we will initialize it */
      let found = false
      for (let i = 0; i < productPlotters.length; i++) {
        if (productPlotters[i].layer.code === pLayer.code) {
          found = true
        }
      }
      if (found === false) {
        initializeProductPlotter(pLayer, onProductPlotterInitialized)
        function onProductPlotterInitialized (err) {
                    /* There is no policy yet of what to do if this fails. */
        }
      }
    }
    if (pLayer.status === PRODUCT_CARD_STATUS.OFF) {
            /* If the plotter of this card is not on our Active Plotters list, then we remove it. */
      for (let i = 0; i < productPlotters.length; i++) {
        if (productPlotters[i].layer.code === pLayer.code) {
                    /* Then the panels. */
          for (let j = 0; j < productPlotters[i].panels.length; j++) {
            canvas.panelsSpace.destroyPanel(productPlotters[i].panels[j])
          }
                    /* Finally the Storage Objects */

          if (productPlotters[i].plotter.finalize !== undefined) {
            productPlotters[i].plotter.container.finalize()
            productPlotters[i].plotter.finalize()
          }
          productPlotters[i].storage.finalize()
          productPlotters.splice(i, 1) // Delete item from array.
          return // We already found the product woth changes and processed it.
        }
      }
    }
  }

  function setTimeFrame (pTimeFrame) {
    timeFrame = pTimeFrame
    for (let i = 0; i < productPlotters.length; i++) {
      let productPlotter = productPlotters[i]
      productPlotter.layer.setTimeFrame(timeFrame)
      productPlotter.storage.setTimeFrame(timeFrame)
      productPlotter.plotter.setTimeFrame(timeFrame)
    }
  }

  function setDatetime (pDatetime) {
    datetime = pDatetime
    for (let i = 0; i < productPlotters.length; i++) {
      let productPlotter = productPlotters[i]
      productPlotter.layer.setDatetime(pDatetime)
      productPlotter.storage.setDatetime(pDatetime)
      productPlotter.plotter.setDatetime(pDatetime)
    }
  }

  function positionAtDatetime (pDatetime) {
    for (let i = 0; i < productPlotters.length; i++) {
      let productPlotter = productPlotters[i]
      if (productPlotter.plotter.positionAtDatetime !== undefined) {
        productPlotter.plotter.positionAtDatetime(pDatetime)
      }
    }
  }

  function getContainer (point) {
  }

  function draw () {
    if (productPlotters === undefined) { return } // We need to wait
        /* First the Product Plotters. */
    for (let i = 0; i < productPlotters.length; i++) {
      let productPlotter = productPlotters[i]
      productPlotter.plotter.draw()
    }
  }
}
