
function newRestartSimulation () {
  const MODULE_NAME = 'Restart Simulation'
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    visible: true,
    container: undefined,
    status: undefined,
    startOrStop: startOrStop,
    physics: physics,
    draw: draw,
    getContainer: getContainer,
    initialize: initialize,
    finalize: finalize
  }

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME)

  thisObject.container.isDraggeable = false
  thisObject.container.isWheelable = false
  thisObject.container.isClickeable = true
  thisObject.container.detectMouseOver = true

  let selfMouseOverEventSubscriptionId
  let selfMouseClickEventSubscriptionId
  let selfMouseNotOverEventSubscriptionId

  let isMouseOver = false
  let counterTillNextState = 0

  let productCardsToTurnOn = []

  let executionFocusExists = false
  let idleLabel = ''
  let isRunning = false
  let eventSubscriptionIdSimulationFilesUpdated
  let eventSubscriptionIdProcessStopped

  return thisObject

  function finalize () {
    thisObject.container.eventHandler.stopListening(selfMouseOverEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(selfMouseClickEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(selfMouseNotOverEventSubscriptionId)

    systemEventHandler.stopListening('Jason-Multi-Period', eventSubscriptionIdSimulationFilesUpdated)
    systemEventHandler.stopListening('Jason-Multi-Period', eventSubscriptionIdProcessStopped)

    thisObject.container.finalize()
    thisObject.container = undefined
  }

  function initialize () {
    thisObject.container.frame.width = 250
    thisObject.container.frame.height = COCKPIT_SPACE_HEIGHT - 12

    selfMouseOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)
    selfMouseClickEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseClick', onMouseClick)
    selfMouseNotOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseNotOver', onMouseNotOver)

    thisObject.status = 'Ready'

    systemEventHandler.createEventHandler('Cockpit-Restart-Button')

    /*
      We will start listening to the event that is triggered when the simulation process finishes processing one day in the case
      of daily files or the whole market in the case of market files.
    */
    eventSubscriptionIdSimulationFilesUpdated = systemEventHandler.listenToEvent('Jason-Multi-Period', 'Simulation Files Updated', undefined, undefined, undefined, onFilesUpdated)

    function onFilesUpdated (message) {
      turnOffProductCards()
      turnOnProductCards()
    }

    eventSubscriptionIdProcessStopped = systemEventHandler.listenToEvent('Jason-Multi-Period', 'Process Stopped', undefined, undefined, undefined, onProcessStopped)

    function onProcessStopped (message) {
      thisObject.status = 'Ready'
      isRunning = false
    }
  }

  function getContainer (point, purpose) {
    if (thisObject.visible !== true || (thisObject.status !== 'Ready' && thisObject.status !== 'Calculating') || executionFocusExists === false) { return }

    if (thisObject.container.frame.isThisPointHere(point, true) === true) {
      return thisObject.container
    } else {
      return undefined
    }
  }

  function onMouseOver (point) {
    if (thisObject.container.frame.isThisPointHere(point, true, false) === true) {
      isMouseOver = true
    } else {
      isMouseOver = false
    }
  }

  function onMouseNotOver (point) {
    isMouseOver = false
  }

  function onMouseClick (event) {
    startOrStop()
  }

  async function startOrStop () {
    try {
      if (isRunning === false) {
        thisObject.status = 'Saving'
        let result = await canvas.strategySpace.strategizerGateway.saveToStrategyzer(getSimulationParams())
        if (result === false) {
          thisObject.status = 'Error'
          counterTillNextState = 500
        } else {
          if (idleLabel === 'START LIVE TRADING') {
            callServer('', 'ResetLogsAndData', onSaved)
            function onSaved (err) {
              if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                logger.write('[INFO] Restart Simulation -> Logs and Simulation data Deleted.')
              } else {
                logger.write('[ERROR] Restart Simulation -> Can not delete Logs and Simulation data. err = ' + err.messsage)
              }
            }
            let event = {
              definition: getDefinition()
            }
            systemEventHandler.raiseEvent('Cockpit-Restart-Button', 'Live-Trading Started', event)
          } else {
            let event = {
              definition: getDefinition()
            }
            systemEventHandler.raiseEvent('Cockpit-Restart-Button', 'Backstesting Started', event)
          }

          thisObject.status = 'Calculating'
          isRunning = true
        }
      } else {
        /* isRunning === true */
        systemEventHandler.raiseEvent('Cockpit-Restart-Button', 'Stop Requested')
        isRunning = false
        thisObject.status = 'Stopping'
      }
    } catch (err) {
      thisObject.status = 'Error'
      counterTillNextState = 500
    }
  }

  function getDefinition () {
    let definitionNode = canvas.strategySpace.workspace.getProtocolDefinitionNode()
    definitionNode.simulationParams = getSimulationParams()
    return JSON.stringify(definitionNode)
  }

  function turnOffProductCards () {
    let productCardsToTurnOff = ['Trading-Simulation', 'Simulation-Conditions', 'Simulation-Strategies', 'Simulation-Trades', 'Live Trading History']
    for (let i = 0; i < canvas.panelsSpace.panels.length; i++) {
      let panel = canvas.panelsSpace.panels[i]
      if (panel.name === 'Products Panel') {
        for (j = 0; j < panel.productCards.length; j++) {
          let productCard = panel.productCards[j]
          if (productCardsToTurnOff.includes(productCard.product.codeName) && productCard.status !== PRODUCT_CARD_STATUS.OFF) {
            productCard.turnOff()
            productCardsToTurnOn.push(productCard)
          }
        }
      }
    }
  }

  function turnOnProductCards () {
    for (let i = 0; i < productCardsToTurnOn.length; i++) {
      let productCard = productCardsToTurnOn[i]
      productCard.turnOn()
    }
    productCardsToTurnOn = []
  }

  function physics () {
    labelPhysics()

    if (counterTillNextState > 0) {
      counterTillNextState--

      if (counterTillNextState === 0) {
        switch (thisObject.status) {
          case 'Ready':

            break
          case 'Saving':

            break
          case 'Calculating':

            break
          case 'Stopping':

            break
          case 'Error':
            thisObject.status = 'Ready'
            break
        }
      }
    }

    positionPhysics()
    executionFocusPhysics()
  }

  function labelPhysics () {
    idleLabel = 'START BACKTESTING'
    if (canvas.strategySpace.workspace.definition) {
      let definition = canvas.strategySpace.workspace.definition
      if (definition.personalData) {
        if (definition.personalData.exchangeAccounts) {
          if (definition.personalData.exchangeAccounts.length > 0) {
            let exchangeAccount = definition.personalData.exchangeAccounts[0]
            if (exchangeAccount.keys) {
              if (exchangeAccount.keys.length > 0) {
                let key = exchangeAccount.keys[0]
                idleLabel = 'START LIVE TRADING'
              }
            }
          }
        }
      }
    }
  }

  function executionFocusPhysics () {
    if (canvas.strategySpace.workspace.definition !== undefined) {
      executionFocusExists = true
    } else {
      executionFocusExists = false
    }
  }

  function positionPhysics () {
    thisObject.container.frame.position.x = thisObject.container.parentContainer.frame.width - thisObject.container.frame.width - 50
    thisObject.container.frame.position.y = 6
  }

  function draw () {
    if (thisObject.visible !== true || executionFocusExists === false) { return }
    drawBackground()
    drawText()
  }

  function drawBackground () {
    let params = {
      cornerRadius: 3,
      lineWidth: 0.01,
      container: thisObject.container,
      borderColor: UI_COLOR.DARK,
      castShadow: false,
      opacity: 1
    }

    switch (thisObject.status) {
      case 'Ready': {
        if (isMouseOver === true) {
          params.backgroundColor = UI_COLOR.TURQUOISE
        } else {
          params.backgroundColor = UI_COLOR.DARK_TURQUOISE
        }
        break
      }
      case 'Saving':
        params.backgroundColor = UI_COLOR.GREY
        break
      case 'Calculating':
        params.backgroundColor = UI_COLOR.TITANIUM_YELLOW
        break
      case 'Stopping':
        params.backgroundColor = UI_COLOR.GOLDEN_ORANGE
        break
      case 'Error':
        params.backgroundColor = UI_COLOR.RUSTED_RED
        break
    }

    roundedCornersBackground(params)
  }

  function drawText () {
    let fontSize
    let label
    let xOffset
    let yOffset

    const OPACITY = 1

      /* We put the params.VALUE in the middle */

    fontSize = 15

    browserCanvasContext.font = 'bold  ' + fontSize + 'px ' + UI_FONT.PRIMARY

    switch (thisObject.status) {
      case 'Ready':
        label = idleLabel
        break
      case 'Saving':
        label = 'SAVING STRATEGIES CHANGES...'
        break
      case 'Calculating':
        label = 'STOP CALCULATING'
        break
      case 'Stopping':
        label = 'STOPPING...'
        break
      case 'Error':
        label = 'ERROR, RETRY LATER'
        break
    }

    let labelPoint = {
      x: thisObject.container.frame.width / 2 - label.length / 2 * fontSize * FONT_ASPECT_RATIO - 25,
      y: thisObject.container.frame.height - 9
    }
    labelPoint = thisObject.container.frame.frameThisPoint(labelPoint)

    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + OPACITY + ')'
    browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
  }
}
