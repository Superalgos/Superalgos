
function newRestartSimulation () {
  const MODULE_NAME = 'Restart Simulation'

  let thisObject = {
    visible: true,
    container: undefined,
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

  return thisObject

  function finalize () {
    thisObject.container.eventHandler.stopListening(selfMouseOverEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(selfMouseClickEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(selfMouseNotOverEventSubscriptionId)

    thisObject.container.finalize()
    thisObject.container = undefined
  }

  function initialize () {
    thisObject.container.frame.position.x = thisObject.container.parentContainer.frame.width * 80 / 100
    thisObject.container.frame.position.y = 6
    thisObject.container.frame.width = 200
    thisObject.container.frame.height = COCKPIT_SPACE_HEIGHT - 12

    selfMouseOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)
    selfMouseClickEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseClick', onMouseClick)
    selfMouseNotOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseNotOver', onMouseNotOver)
  }

  function getContainer (point, purpose) {
    if (thisObject.visible !== true) { return }

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

  async function onMouseClick (event) {
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

    let result = await graphQlRestartSimulation(simulationParams)
  }

  function physics () {

  }

  function draw () {
    if (thisObject.visible !== true) { return }
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

    if (isMouseOver === true) {
      params.backgroundColor = UI_COLOR.TURQUOISE
    } else {
      params.backgroundColor = UI_COLOR.DARK_TURQUOISE
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

    label = 'RESTART SIMULATION'

    let labelPoint = {
      x: 21,
      y: thisObject.container.frame.height - 9
    }
    labelPoint = thisObject.container.frame.frameThisPoint(labelPoint)

    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + OPACITY + ')'
    browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
  }
}

