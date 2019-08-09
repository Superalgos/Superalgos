
function newRestartSimulation () {
  const MODULE_NAME = 'Restart Simulation'

  let thisObject = {
    visible: true,
    container: undefined,
    status: undefined,
    restart: restart,
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
  return thisObject

  function finalize () {
    thisObject.container.eventHandler.stopListening(selfMouseOverEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(selfMouseClickEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(selfMouseNotOverEventSubscriptionId)

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
  }

  function getContainer (point, purpose) {
    if (thisObject.visible !== true || thisObject.status !== 'Ready' || executionFocusExists === false) { return }

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
    restart()
  }

  async function restart () {
    let dateAtScreenCorner = new Date(window.localStorage.getItem('Date @ Screen Corner'))
    let currentTimePeriod = JSON.parse(window.localStorage.getItem('Current Time Period'))

    let timePeriodsMasterArray = [marketFilesPeriods, dailyFilePeriods]
    let timePeriodArray = timePeriodsMasterArray[currentTimePeriod.filePeriodIndex]
    let timePeriod = timePeriodArray[currentTimePeriod.timePeriodIndex][1]

    let timePeriodDailyArray = []
    let timePeriodMarketArray = []

    switch (currentTimePeriod.filePeriodIndex) {
      case 0: {
        timePeriodMarketArray.push(timePeriod)
        break
      }
      case 1: {
        timePeriodDailyArray.push(timePeriod)
        break
      }
    }

    let simulationParams = {
      beginDatetime: dateAtScreenCorner.valueOf() / 1000 | 0,
      resumeExecution: false,
      timePeriodDailyArray: timePeriodDailyArray,
      timePeriodMarketArray: timePeriodMarketArray
    }
    try {
      thisObject.status = 'Saving'
      let result = await canvas.strategySpace.strategizerGateway.saveToStrategyzer()
      if (result === true) {
        thisObject.status = 'Restarting'
        await graphQlRestartSimulation(simulationParams)
        thisObject.status = 'Calculating'
        counterTillNextState = 50
      } else {
        thisObject.status = 'Error'
        counterTillNextState = 500
      }
    } catch (err) {
      thisObject.status = 'Error'
      counterTillNextState = 500
    }
  }

  function turnOffProductCards () {
    let productCardsToTurnOff = ['Trading-Simulation', 'Simulation-Conditions', 'Simulation-Strategies', 'Simulation-Trades']
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
    if (counterTillNextState > 0) {
      counterTillNextState--

      if (counterTillNextState === 0) {
        switch (thisObject.status) {
          case 'Ready':

            break
          case 'Saving':

            break
          case 'Restarting':

            break
          case 'Calculating':
            thisObject.status = 'Refreshing'
            counterTillNextState = 15
            break
          case 'Refreshing':
            thisObject.status = 'Reviewing'
            turnOffProductCards()
            turnOnProductCards()
            counterTillNextState = 150
            break
          case 'Reviewing':
            thisObject.status = '2nd Refresh'
            counterTillNextState = 25
            break
          case '2nd Refresh':
            thisObject.status = 'Ready'
            turnOffProductCards()
            turnOnProductCards()
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
      case 'Restarting':
        params.backgroundColor = UI_COLOR.GREY
        break
      case 'Refreshing':
        params.backgroundColor = UI_COLOR.GOLDEN_ORANGE
        break
      case 'Calculating':
        params.backgroundColor = UI_COLOR.TITANIUM_YELLOW
        break
      case 'Reviewing':
        params.backgroundColor = UI_COLOR.GREY
        break
      case '2nd Refresh':
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
        label = 'RUN SIMULATION'
        break
      case 'Saving':
        label = 'SAVING STRATEGIES CHANGES...'
        break
      case 'Restarting':
        label = 'RESTARTING TRADING ENGINE...'
        break
      case 'Refreshing':
        label = 'RE-LOADING...'
        break
      case 'Calculating':
        label = 'CALCULATING...'
        break
      case 'Reviewing':
        label = 'WAITING TO UPDATE...'
        break
      case '2nd Refresh':
        label = 'UPDATING...'
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
