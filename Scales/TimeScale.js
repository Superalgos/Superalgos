function newTimeScale () {
  const MODULE_NAME = 'Time Scale'

  let thisObject = {
    lenghtPercentage: undefined,
    container: undefined,
    date: undefined,
    visible: true,
    physics: physics,
    draw: draw,
    getContainer: getContainer,
    initialize: initialize,
    finalize: finalize
  }

  const LENGHT_PERCENTAGE_DEFAULT_VALUE = 5
  const STEP_SIZE = 5
  const MIN_HEIGHT = 50

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME)

  thisObject.container.isDraggeable = false
  thisObject.container.isClickeable = false
  thisObject.container.isWheelable = true

  thisObject.container.frame.width = 190
  thisObject.container.frame.height = 25

  return thisObject

  function finalize () {
    thisObject.container.finalize()
    thisObject.container = undefined
  }

  function initialize () {
    thisObject.container.eventHandler.listenToEvent('onMouseWheel', onMouseWheel)

    thisObject.lenghtPercentage = window.localStorage.getItem(MODULE_NAME)
    if (!thisObject.lenghtPercentage) {
      thisObject.lenghtPercentage = LENGHT_PERCENTAGE_DEFAULT_VALUE
    } else {
      thisObject.lenghtPercentage = JSON.parse(thisObject.lenghtPercentage)
    }

    let event = {}
    event.lenghtPercentage = thisObject.lenghtPercentage

    thisObject.container.eventHandler.raiseEvent('Lenght Percentage Changed', event)
  }

  function onMouseWheel (event) {
    delta = event.wheelDelta
    if (delta < 0) {
      thisObject.lenghtPercentage = thisObject.lenghtPercentage - STEP_SIZE
      if (thisObject.lenghtPercentage < STEP_SIZE) { thisObject.lenghtPercentage = STEP_SIZE }
    } else {
      thisObject.lenghtPercentage = thisObject.lenghtPercentage + STEP_SIZE
      if (thisObject.lenghtPercentage > 100) { thisObject.lenghtPercentage = 100 }
    }

    event.lenghtPercentage = thisObject.lenghtPercentage
    thisObject.container.eventHandler.raiseEvent('Lenght Percentage Changed', event)

    window.localStorage.setItem(MODULE_NAME, thisObject.lenghtPercentage)
  }

  function getContainer (point) {
    if (thisObject.container.frame.isThisPointHere(point, true) === true) {
      return thisObject.container
    }
  }

  function physics () {

  }

  function draw () {
    if (thisObject.visible === false || thisObject.date === undefined) { return }

    let label = thisObject.date.toUTCString()
    let labelArray = label.split(' ')
    let label1 = labelArray[1] + ' ' + labelArray[2] + ' ' + labelArray[3]
    let label2 = labelArray[4]

    let fontSize1 = 20
    let fontSize2 = 10

    const RED_LINE_HIGHT = 5
    const OPACITY = 1

    let params = {
      cornerRadius: 3,
      lineWidth: RED_LINE_HIGHT,
      container: thisObject.container,
      borderColor: UI_COLOR.RUSTED_RED,
      castShadow: false,
      backgroundColor: UI_COLOR.DARK,
      opacity: OPACITY
    }

    roundedCornersBackground(params)

    /* Place the Text */

    let xOffset1 = label1.length * fontSize1 * FONT_ASPECT_RATIO

    let labelPoint1 = {
      x: thisObject.container.frame.width / 2 - xOffset1 + 15,
      y: thisObject.container.frame.height / 2 + 6
    }

    labelPoint1 = thisObject.container.frame.frameThisPoint(labelPoint1)

    browserCanvasContext.font = fontSize1 + 'px ' + UI_FONT.PRIMARY
    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'

    browserCanvasContext.fillText(label1, labelPoint1.x, labelPoint1.y)

    let xOffset2 = label2.length * fontSize2 * FONT_ASPECT_RATIO

    let labelPoint2 = {
      x: thisObject.container.frame.width / 2 - xOffset2 / 2 - 3 + 60,
      y: thisObject.container.frame.height / 2 + 6
    }

    labelPoint2 = thisObject.container.frame.frameThisPoint(labelPoint2)

    browserCanvasContext.font = fontSize2 + 'px ' + UI_FONT.PRIMARY
    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'

    browserCanvasContext.fillText(label2, labelPoint2.x, labelPoint2.y)
  }
}

