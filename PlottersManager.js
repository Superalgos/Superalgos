function newPlottersManager () {
  const MODULE_NAME = 'Plotters Manager'
  const INFO_LOG = false
  const INTENSIVE_LOG = false
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let productPlotters = []
  let competitionPlotters = []

  let timePeriod = INITIAL_TIME_PERIOD
  let datetime = NEW_SESSION_INITIAL_DATE

  let thisObject = {
    setDatetime: setDatetime,
    setTimePeriod: setTimePeriod,
    positionAtDatetime: positionAtDatetime,
    container: undefined,
    draw: draw,
    getContainer: getContainer,
    initialize: initialize,
    finalize: finalize
  }

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME)

  let initializationReady = false

  let productsPanel
  let exchange
  let market

  return thisObject

  function finalize (callBackFunction) {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] finalize -> Entering function.') }

      for (let i = 0; i < productPlotters.length; i++) {
        if (productPlotters[i].profile !== undefined) {
          canvas.floatingSpace.profileBalls.destroyProfileBall(productPlotters[i].profile)
        }
                    /* Destroyd the Note Set */

        canvas.floatingSpace.noteSets.destroyNoteSet(productPlotters[i].noteSet)

                    /* Then the panels. */

        for (let j = 0; j < productPlotters[i].panels.length; j++) {
          canvas.panelsSpace.destroyPanel(productPlotters[i].panels[j])
        }

                    /* Finally the Storage Objects */

        productPlotters[i].storage.finalize()

        if (productPlotters[i].plotter.finalize !== undefined) {
          productPlotters[i].plotter.finalize()
        }

        productPlotters.splice(i, 1) // Delete item from array.
      }

      for (let i = 0; i < competitionPlotters.length; i++) {
        if (competitionPlotters[i].profile !== undefined) {
          canvas.floatingSpace.profileBalls.destroyProfileBall(competitionPlotters[i].profile)
        }
                    /* Destroyd the Note Set */

        canvas.floatingSpace.noteSets.destroyNoteSet(competitionPlotters[i].noteSet)

                    /* Then the panels. */

        if (competitionPlotters[i].panels !== undefined) {
          for (let j = 0; j < competitionPlotters[i].panels.length; j++) {
            canvas.panelsSpace.destroyPanel(competitionPlotters[i].panels[j])
          }
        }

                    /* Finally the Storage Objects */

        competitionPlotters[i].storage.finalize()

        if (competitionPlotters[i].plotter.finalize !== undefined) {
          competitionPlotters[i].plotter.finalize()
        }

        competitionPlotters.splice(i, 1) // Delete item from array.
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] finalize -> err = ' + err.stack) }
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
    }
  }

  function initialize (pProductsPanel, pExchange, pMarket, callBackFunction) {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] initialize -> Entering function.') }

            /* Remember the Products Panel */

      productsPanel = pProductsPanel
      exchange = pExchange
      market = pMarket

            /* Listen to the event of change of status */

      productsPanel.container.eventHandler.listenToEvent('Product Card Status Changed', onProductCardStatusChanged)

      initializeCompetitionPlotters(onCompetitionPlottersInitialized)

      function onCompetitionPlottersInitialized (err) {
        try {
          if (INFO_LOG === true) { logger.write('[INFO] initialize -> onCompetitionPlottersInitialized -> Entering function.') }

          switch (err.result) {
            case GLOBAL.DEFAULT_OK_RESPONSE.result: {
              if (INFO_LOG === true) { logger.write('[INFO] initialize -> onCompetitionPlottersInitialized -> Received OK Response.') }
              break
            }

            case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {
              if (INFO_LOG === true) { logger.write('[INFO] initialize -> onCompetitionPlottersInitialized -> Received FAIL Response.') }
              callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
              return
            }

            default: {
              if (INFO_LOG === true) { logger.write('[INFO] initialize -> onFileCursorReady -> Received Unexpected Response.') }
              callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
              return
            }
          }

          initializeProductPlotters(onProductPlottersInitialized)

          function onProductPlottersInitialized (err) {
            try {
              if (INFO_LOG === true) { logger.write('[INFO] initialize -> onCompetitionPlottersInitialized -> onProductPlottersInitialized -> Entering function.') }

              switch (err.result) {
                case GLOBAL.DEFAULT_OK_RESPONSE.result: {
                  if (INFO_LOG === true) { logger.write('[INFO] initialize -> onCompetitionPlottersInitialized -> onProductPlottersInitialized ->  Received OK Response.') }

                  initializationReady = true
                  callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE)
                  break
                }

                case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {
                  if (INFO_LOG === true) { logger.write('[INFO] initialize -> onCompetitionPlottersInitialized -> onProductPlottersInitialized ->  Received FAIL Response.') }
                  callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
                  return
                }

                default: {
                  if (INFO_LOG === true) { logger.write('[INFO] initialize -> onCompetitionPlottersInitialized -> onProductPlottersInitialized ->  Received Unexpected Response.') }
                  callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
                  return
                }
              }
            } catch (err) {
              if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> onCompetitionPlottersInitialized -> onProductPlottersInitialized -> err = ' + err.stack) }
              callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
            }
          }
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> onCompetitionPlottersInitialized -> err = ' + err.stack) }
          callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err.stack) }
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
    }
  }

  function initializeCompetitionPlotters (callBack) {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] initializeCompetitionPlotters -> Entering function.') }

            /* At this current version of the platform, we will support only one competition with only one plotter. */

      const COMPETITION_HOST = 'AAArena'
      const COMPETITION = 'Weekend-Deathmatch'

      let objName = COMPETITION_HOST + '-' + COMPETITION
      let storage = newCompetitionStorage(objName)

      let host = ecosystem.getHost(COMPETITION_HOST)
      let competition = ecosystem.getCompetition(host, COMPETITION)

      storage.initialize(host, competition, exchange, market, onCompetitionStorageInitialized)

      function onCompetitionStorageInitialized (err) {
        try {
          if (INFO_LOG === true) { logger.write('[INFO] initializeCompetitionPlotters -> onCompetitionStorageInitialized -> Entering function.') }

          switch (err.result) {
            case GLOBAL.DEFAULT_OK_RESPONSE.result: {
              if (INFO_LOG === true) { logger.write('[INFO] initializeCompetitionPlotters -> onCompetitionStorageInitialized -> Received OK Response.') }
              break
            }

            case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {
              if (INFO_LOG === true) { logger.write('[INFO] initializeCompetitionPlotters -> onCompetitionStorageInitialized -> Received FAIL Response.') }
              callBack(GLOBAL.DEFAULT_FAIL_RESPONSE)
              return
            }

            default: {
              if (INFO_LOG === true) { logger.write('[INFO] initializeCompetitionPlotters -> onCompetitionStorageInitialized -> Received Unexpected Response.') }
              callBack(GLOBAL.DEFAULT_FAIL_RESPONSE)
              return
            }
          }

                    /* Now we have all the initial data loaded and ready to be delivered to the new instance of the plotter. */

          let plotter = getNewPlotter(competition.plotter.host, competition.plotter.codeName, competition.plotter.moduleName)

          plotter.container.connectToParent(thisObject.container, true, true, false, true, true, true)

          plotter.container.frame.position.x = thisObject.container.frame.width / 2 - plotter.container.frame.width / 2
          plotter.container.frame.position.y = thisObject.container.frame.height / 2 - plotter.container.frame.height / 2

                    /* We add the profile picture of each participant, because the plotter will need it. */

          for (let k = 0; k < competition.participants.length; k++) {
            let participant = competition.participants[k]
            let devTeam = ecosystem.getTeam(participant.devTeam)
            let bot = ecosystem.getBot(devTeam, participant.bot)
            participant.profilePicture = bot.profilePicture
          }

          plotter.initialize(competition, storage, datetime, timePeriod, onPlotterInizialized)

          function onPlotterInizialized (err) {
            try {
              if (INFO_LOG === true) { logger.write('[INFO] initializeCompetitionPlotters -> onCompetitionStorageInitialized -> onPlotterInizialized -> Entering function.') }

              switch (err.result) {
                case GLOBAL.DEFAULT_OK_RESPONSE.result: {
                  if (INFO_LOG === true) { logger.write('[INFO] initializeCompetitionPlotters -> onCompetitionStorageInitialized -> onPlotterInizialized -> Received OK Response.') }
                  break
                }

                case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {
                  if (INFO_LOG === true) { logger.write('[INFO] initializeCompetitionPlotters -> onCompetitionStorageInitialized -> onPlotterInizialized -> Received FAIL Response.') }
                  callBack(GLOBAL.DEFAULT_FAIL_RESPONSE)
                  return
                }

                default: {
                  if (INFO_LOG === true) { logger.write('[INFO] initializeCompetitionPlotters -> onCompetitionStorageInitialized -> onPlotterInizialized -> Received Unexpected Response.') }
                  callBack(GLOBAL.DEFAULT_FAIL_RESPONSE)
                  return
                }
              }

              let competitionPlotter = {
                plotter: plotter,
                storage: storage
              }

                            /* Add the new Active Protter to the Array */

              competitionPlotters.push(competitionPlotter)

                            /* Create The Profie Picture FloatingObject */

              if (competitionPlotter.plotter.payload !== undefined) {
                for (let k = 0; k < competition.participants.length; k++) {
                  let participant = competition.participants[k]
                  let devTeam = ecosystem.getTeam(participant.devTeam)
                  let bot = ecosystem.getBot(devTeam, participant.bot)
                  let imageId = participant.devTeam + '.' + participant.profilePicture

                  const TEAM = devTeam.codeName.toLowerCase()
                  const BOT = bot.codeName.toLowerCase()

                  let botAvatar = new Image()

                  botAvatar.src = window.canvasApp.context.fbProfileImages.get(TEAM + '-' + BOT)

                  competitionPlotter.plotter.payload[k].profile.title = bot.displayName
                  competitionPlotter.plotter.payload[k].profile.imageId = imageId
                  competitionPlotter.plotter.payload[k].profile.botAvatar = botAvatar

                  canvas.floatingSpace.profileBalls.createNewProfileBall(competitionPlotter.plotter.payload[k], onProfileBallCreated)

                  function onProfileBallCreated (err, pProfileHandle) {
                    competitionPlotter.plotter.payload[k].profile.handle = pProfileHandle
                  }
                }
              }

              callBack(GLOBAL.DEFAULT_OK_RESPONSE)
            } catch (err) {
              if (ERROR_LOG === true) { logger.write('[ERROR] initializeCompetitionPlotters -> onCompetitionStorageInitialized -> onPlotterInizialized -> err = ' + err.stack) }
              callBack(GLOBAL.DEFAULT_FAIL_RESPONSE)
            }
          }
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] initializeCompetitionPlotters -> onCompetitionStorageInitialized -> err = ' + err.stack) }
          callBack(GLOBAL.DEFAULT_FAIL_RESPONSE)
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] initializeCompetitionPlotters -> err = ' + err.stack) }
      callBack(GLOBAL.DEFAULT_FAIL_RESPONSE)
    }
  }

  function initializeProductPlotters (callBack) {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] initializeProductPlotters -> Entering function.') }

            /* Lets get all the cards that needs to be loaded. */

      let initializationCounter = 0
      let loadingProductCards = productsPanel.getLoadingProductCards()
      let okCounter = 0
      let failCounter = 0

      if (loadingProductCards.length === 0) {
        callBack(GLOBAL.DEFAULT_OK_RESPONSE)
        return
      }

      for (let i = 0; i < loadingProductCards.length; i++) {
                /* For each one, we will initialize the associated plotter. */

        initializeProductPlotter(loadingProductCards[i], onProductPlotterInitialized)

        function onProductPlotterInitialized (err) {
          if (INFO_LOG === true) { logger.write('[INFO] initializeProductPlotters -> onProductPlotterInitialized -> Entering function.') }

          initializationCounter++

          switch (err.result) {
            case GLOBAL.DEFAULT_OK_RESPONSE.result: {
              if (INFO_LOG === true) { logger.write('[INFO] initializeProductPlotters -> onProductPlotterInitialized -> onProductPlotterInitialized -> Received OK Response.') }
              okCounter++
              break
            }

            case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {
              if (INFO_LOG === true) { logger.write('[INFO] initializeProductPlotters -> onProductPlotterInitialized -> onProductPlotterInitialized -> Received FAIL Response.') }
              failCounter++
              break
            }

            default: {
              if (INFO_LOG === true) { logger.write('[INFO] initializeProductPlotters -> onProductPlotterInitialized -> onProductPlotterInitialized -> Received Unexpected Response.') }
              failCounter++
              break
            }
          }

          if (INFO_LOG === true) { logger.write('[INFO] initializeProductPlotters -> onProductPlotterInitialized -> onProductPlotterInitialized -> initializationCounter = ' + initializationCounter) }
          if (INFO_LOG === true) { logger.write('[INFO] initializeProductPlotters -> onProductPlotterInitialized -> onProductPlotterInitialized -> okCounter = ' + okCounter) }
          if (INFO_LOG === true) { logger.write('[INFO] initializeProductPlotters -> onProductPlotterInitialized -> onProductPlotterInitialized -> failCounter = ' + failCounter) }
          if (INFO_LOG === true) { logger.write('[INFO] initializeProductPlotters -> onProductPlotterInitialized -> onProductPlotterInitialized -> loadingProductCards.length = ' + loadingProductCards.length) }

          if (initializationCounter === loadingProductCards.length) {
 // This was the last one.

            if (INFO_LOG === true) { logger.write('[INFO] initializeProductPlotters -> onProductPlotterInitialized -> onProductPlotterInitialized -> Last Product Loaded.') }

                        /* If less than 50% of plotters are initialized then we return FAIL. */

            if (okCounter >= 1) {
              callBack(GLOBAL.DEFAULT_OK_RESPONSE)
            } else {
              callBack(GLOBAL.DEFAULT_FAIL_RESPONSE)
            }
          }
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] initializeProductPlotters -> err = ' + err.stack) }
      callBack(GLOBAL.DEFAULT_FAIL_RESPONSE)
    }
  }

  function initializeProductPlotter (pProductCard, callBack) {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] initializeProductPlotter -> Entering function.') }

            /* Before Initializing a Plotter, we need the Storage it will use, loaded with the files it will initially need. */

      let objName = pProductCard.devTeam.codeName + '-' + pProductCard.bot.codeName + '-' + pProductCard.product.codeName
      let storage = newProductStorage(objName)

      if (INFO_LOG === true) { logger.write('[INFO] initializeProductPlotter -> objName = ' + objName) }

            /*

            Before Initializing the Storage, we will put the Product Card to listen to the events the storage will raise every time a file is loaded,
            so that the UI can somehow show this. There are different types of events.

            */

      for (let i = 0; i < pProductCard.product.dataSets.length; i++) {
        let thisSet = pProductCard.product.dataSets[i]

        switch (thisSet.type) {
          case 'Market Files': {
            storage.eventHandler.listenToEvent('Market File Loaded', pProductCard.onMarketFileLoaded)
          }
            break

          case 'Daily Files': {
            storage.eventHandler.listenToEvent('Daily File Loaded', pProductCard.onDailyFileLoaded)
          }
            break

          case 'Single File': {
            storage.eventHandler.listenToEvent('Single File Loaded', pProductCard.onSingleFileLoaded)
          }
            break

          case 'File Sequence': {
            storage.eventHandler.listenToEvent('File Sequence Loaded', pProductCard.onFileSequenceLoaded)
          }
            break
        }
      }

      storage.initialize(pProductCard.devTeam, pProductCard.bot, pProductCard.product, exchange, market, datetime, timePeriod, onProductStorageInitialized)

      function onProductStorageInitialized (err) {
        try {
          if (INFO_LOG === true) { logger.write('[INFO] initializeProductPlotter -> onProductStorageInitialized -> Entering function.') }
          if (INFO_LOG === true) { logger.write('[INFO] initializeProductPlotter -> onProductStorageInitialized -> key = ' + pProductCard.devTeam.codeName + '-' + pProductCard.bot.codeName + '-' + pProductCard.product.codeName) }

          switch (err.result) {
            case GLOBAL.DEFAULT_OK_RESPONSE.result: {
              if (INFO_LOG === true) { logger.write('[INFO] initializeProductPlotter -> onProductStorageInitialized -> Received OK Response.') }
              if (INFO_LOG === true) { logger.write('[INFO] initializeProductPlotter -> onProductStorageInitialized -> The plotter will be started.') }
              break
            }

            case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {
              if (INFO_LOG === true) { logger.write('[INFO] initializeProductPlotter -> onProductStorageInitialized -> Received FAIL Response.') }
              if (INFO_LOG === true) { logger.write('[INFO] initializeProductPlotter -> onProductStorageInitialized -> The plotter will not be started.') }
              callBack(GLOBAL.DEFAULT_FAIL_RESPONSE)
              return
            }

            default: {
              if (INFO_LOG === true) { logger.write('[INFO] initializeProductPlotter -> onProductStorageInitialized -> Received Unexpected Response.') }
              if (INFO_LOG === true) { logger.write('[INFO] initializeProductPlotter -> onProductStorageInitialized -> The plotter will not be started.') }
              callBack(GLOBAL.DEFAULT_FAIL_RESPONSE)
              return
            }
          }

                    /* Now we have all the initial data loaded and ready to be delivered to the new instance of the plotter. */

          let plotter = getNewPlotter(pProductCard.product.plotter.devTeam, pProductCard.product.plotter.codeName, pProductCard.product.plotter.moduleName)

          plotter.container.connectToParent(thisObject.container, true, true, false, true, true, true)

          plotter.container.frame.position.x = thisObject.container.frame.width / 2 - plotter.container.frame.width / 2
          plotter.container.frame.position.y = thisObject.container.frame.height / 2 - plotter.container.frame.height / 2

          plotter.initialize(storage, exchange, market, datetime, timePeriod, onPlotterInizialized)

          function onPlotterInizialized () {
            try {
              if (INFO_LOG === true) { logger.write('[INFO] initializeProductPlotter -> onProductStorageInitialized -> onPlotterInizialized -> Entering function.') }
              if (INFO_LOG === true) { logger.write('[INFO] initializeProductPlotter -> onProductStorageInitialized -> onPlotterInizialized -> key = ' + pProductCard.product.plotter.devTeam + '-' + pProductCard.product.plotter.codeName + '-' + pProductCard.product.plotter.moduleName) }

              try {
                                // plotter.positionAtDatetime(NEW_SESSION_INITIAL_DATE);
              } catch (err) {
                                // If the plotter does not implement this function its ok.
              }

              let productPlotter = {
                productCard: pProductCard,
                plotter: plotter,
                storage: storage,
                profile: undefined,
                notes: undefined
              }

                            /* Let the Plotter listen to the event of Cursor Files loaded, so that it can reack recalculating if needed. */

              storage.eventHandler.listenToEvent('Daily File Loaded', plotter.onDailyFileLoaded)

                            /* Lets load now this plotter panels. */

              productPlotter.panels = []

              for (let i = 0; i < pProductCard.product.plotter.module.panels.length; i++) {
                let panelConfig = pProductCard.product.plotter.module.panels[i]

                let parameters = {
                  devTeam: pProductCard.product.plotter.devTeam,
                  plotterCodeName: pProductCard.product.plotter.codeName,
                  moduleCodeName: pProductCard.product.plotter.moduleName,
                  panelCodeName: panelConfig.codeName
                }

                let panelOwner = exchange + ' ' + market.assetB + '/' + market.assetA
                let plotterPanelHandle = canvas.panelsSpace.createNewPanel('Plotter Panel', parameters, panelOwner)
                let plotterPanel = canvas.panelsSpace.getPanel(plotterPanelHandle, panelOwner)

                                /* Connect Panel to the Plotter via an Event. */

                if (panelConfig.event !== undefined) {
                  productPlotter.plotter.container.eventHandler.listenToEvent(panelConfig.event, plotterPanel.onEventRaised)
                }

                productPlotter.panels.push(plotterPanelHandle)
              }

                            /* Create The Profie Picture FloatingObject */

              if (productPlotter.plotter.payload !== undefined) {
                let imageId = pProductCard.bot.devTeam + '.' + pProductCard.bot.profilePicture

                productPlotter.plotter.payload.profile.subTitle = pProductCard.product.shortDisplayName
                productPlotter.plotter.payload.profile.title = pProductCard.bot.displayName
                productPlotter.plotter.payload.profile.imageId = imageId
                productPlotter.plotter.payload.profile.botAvatar = pProductCard.bot.avatar

                canvas.floatingSpace.profileBalls.createNewProfileBall(productPlotter.plotter.payload, onProfileBallCreated)

                function onProfileBallCreated (err, pProfileHandle) {
                  productPlotter.profile = pProfileHandle

                                    /* There is no policy yet of what to do if this fails. */
                }

                                /* Create the Text Notes */

                canvas.floatingSpace.noteSets.createNoteSet(productPlotter.plotter.payload, productPlotter.plotter.container.eventHandler, onNoteSetCreated)

                function onNoteSetCreated (err, pNoteSetHandle) {
                  productPlotter.noteSet = pNoteSetHandle

                                    /* There is no policy yet of what to do if this fails. */
                }
              }

                            /* Add the new Active Protter to the Array */

              productPlotters.push(productPlotter)

              callBack(GLOBAL.DEFAULT_OK_RESPONSE)
            } catch (err) {
              if (ERROR_LOG === true) { logger.write('[ERROR] initializeProductPlotter -> onProductStorageInitialized -> onPlotterInizialized -> err = ' + err.stack) }
              callBack(GLOBAL.DEFAULT_FAIL_RESPONSE)
            }
          }
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] initializeProductPlotter -> onProductStorageInitialized -> err = ' + err.stack) }
          callBack(GLOBAL.DEFAULT_FAIL_RESPONSE)
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] initializeProductPlotter -> err = ' + err.stack) }
      callBack(GLOBAL.DEFAULT_FAIL_RESPONSE)
    }
  }

  function onProductCardStatusChanged (pProductCard) {
    if (INFO_LOG === true) { logger.write('[INFO] onProductCardStatusChanged -> Entering function.') }

    if (pProductCard.status === PRODUCT_CARD_STATUS.LOADING) {
            /* Lets see if we can find the Plotter of this card on our Active Plotters list, other wise we will initialize it */

      let found = false

      for (let i = 0; i < productPlotters.length; i++) {
        if (productPlotters[i].productCard.code === pProductCard.code) {
          found = true
        }
      }

      if (found === false) {
        initializeProductPlotter(pProductCard, onProductPlotterInitialized)

        function onProductPlotterInitialized (err) {
          if (INFO_LOG === true) { logger.write('[INFO] initializeProductPlotters -> onProductPlotterInitialized -> Entering function.') }

                    /* There is no policy yet of what to do if this fails. */
        }
      }
    }

    if (pProductCard.status === PRODUCT_CARD_STATUS.OFF) {
            /* If the plotter of this card is not on our Active Plotters list, then we remove it. */

      for (let i = 0; i < productPlotters.length; i++) {
        if (productPlotters[i].productCard.code === pProductCard.code) {
          if (productPlotters[i].profile !== undefined) {
            canvas.floatingSpace.profileBalls.destroyProfileBall(productPlotters[i].profile)
          }

                    /* Destroyd the Note Set */

          canvas.floatingSpace.noteSets.destroyNoteSet(productPlotters[i].noteSet)

                    /* Then the panels. */

          for (let j = 0; j < productPlotters[i].panels.length; j++) {
            canvas.panelsSpace.destroyPanel(productPlotters[i].panels[j])
          }

                    /* Finally the Storage Objects */

          productPlotters[i].storage.finalize()

          if (productPlotters[i].plotter.finalize !== undefined) {
            productPlotters[i].plotter.container.finalize()
            productPlotters[i].plotter.finalize()
          }

          productPlotters.splice(i, 1) // Delete item from array.

          return // We already found the product woth changes and processed it.
        }
      }
    }
  }

  function setTimePeriod (pTimePeriod) {
    if (INFO_LOG === true) { logger.write('[INFO] setTimePeriod -> Entering function.') }

    timePeriod = pTimePeriod

    if (initializationReady === true) {
      for (let i = 0; i < productPlotters.length; i++) {
        let productPlotter = productPlotters[i]

        productPlotter.productCard.setTimePeriod(timePeriod)
        productPlotter.storage.setTimePeriod(timePeriod)
        productPlotter.plotter.setTimePeriod(timePeriod)
      }

      for (let i = 0; i < competitionPlotters.length; i++) {
        let competitionPlotter = competitionPlotters[i]

        competitionPlotter.plotter.setTimePeriod(timePeriod)
      }
    }
  }

  function setDatetime (pDatetime) {
    if (INFO_LOG === true) { logger.write('[INFO] setDatetime -> Entering function.') }

    datetime = pDatetime

    for (let i = 0; i < productPlotters.length; i++) {
      let productPlotter = productPlotters[i]

      productPlotter.productCard.setDatetime(pDatetime)
      productPlotter.storage.setDatetime(pDatetime)
      productPlotter.plotter.setDatetime(pDatetime)
    }

    for (let i = 0; i < competitionPlotters.length; i++) {
      let competitionPlotter = competitionPlotters[i]

      competitionPlotter.plotter.setDatetime(datetime)
    }
  }

  function positionAtDatetime (pDatetime) {
    if (INFO_LOG === true) { logger.write('[INFO] positionAtDatetime -> Entering function.') }

    for (let i = 0; i < productPlotters.length; i++) {
      let productPlotter = productPlotters[i]

      if (productPlotter.plotter.positionAtDatetime !== undefined) {
        productPlotter.plotter.positionAtDatetime(pDatetime)
      }
    }
  }

  function getContainer (point) {
    if (INFO_LOG === true) { logger.write('[INFO] getContainer -> Entering function.') }

    let container

    return container
  }

  function draw () {
    if (INTENSIVE_LOG === true) { logger.write('[INFO] draw -> Entering function.') }

    if (productPlotters === undefined) { return } // We need to wait

        /* First the Product Plotters. */

    for (let i = 0; i < productPlotters.length; i++) {
      let productPlotter = productPlotters[i]
      productPlotter.plotter.draw()
    }

        /* Then the competition plotters. */

    for (let i = 0; i < competitionPlotters.length; i++) {
      let competitionPlotter = competitionPlotters[i]
      competitionPlotter.plotter.draw()
    }
  }
}
