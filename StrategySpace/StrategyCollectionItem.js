function newStrategyCollectionItem () {
  const MODULE_NAME = 'Strategy Collection Item'
  let thisObject = {
    strategy: undefined,
    container: undefined,
    draw: draw,
    getContainer: getContainer,
    initialize: initialize
  }

  let isInitialized = false

  thisObject.container = newContainer()
  thisObject.container.name = MODULE_NAME
  thisObject.container.initialize()
  thisObject.container.isClickeable = true
  thisObject.container.isDraggeable = false

  return thisObject

  function initialize () {
    const ITEM_WIDTH = 400
    const ITEM_HEIGHT = 60

    thisObject.container.frame.width = ITEM_WIDTH
    thisObject.container.frame.height = ITEM_HEIGHT

    const LEFT_MARGIN = (thisObject.container.parentContainer.frame.width - thisObject.container.frame.width) / 2
    const TOP_MARGIN = 100

    thisObject.container.frame.position.x = LEFT_MARGIN
    thisObject.container.frame.position.y = TOP_MARGIN

    thisObject.container.eventHandler.listenToEvent('onMouseClick', onMouseClick)
    isInitialized = true
  }

  function onMouseClick (event) {

  }

  function getContainer (point) {
    let container
    if (thisObject.container.frame.isThisPointHere(point, true) === true) {
      return thisObject.container
    } else {
      return undefined
    }
  }

  function draw () {
    if (isInitialized === false) { return }

    borders()
    text()
  }

  function text () {
    if (thisObject.strategy === undefined) {
      return
    }

    const LEFT_MARGIN = 50
    const TOP_MARGIN = 30

    let strategy = thisObject.strategy

    let labelPoint = {
      x: LEFT_MARGIN,
      y: TOP_MARGIN
    }

    labelPoint = thisObject.container.frame.frameThisPoint(labelPoint)

    let labelToPrint = strategy.name
    labelToPrint = labelToPrint.toUpperCase()
    labelToPrint = labelToPrint.substring(0, 30)
    let opacity = 1
    let fontSize = 15

    printLabel(labelToPrint, labelPoint.x, labelPoint.y, opacity, fontSize)
  }

  function borders () {
    let point1
    let point2
    let point3
    let point4

    point1 = {
      x: 0,
      y: 0
    }

    point2 = {
      x: thisObject.container.frame.width,
      y: 0
    }

    point3 = {
      x: thisObject.container.frame.width,
      y: thisObject.container.frame.height
    }

    point4 = {
      x: 0,
      y: thisObject.container.frame.height
    }

    point1 = thisObject.container.frame.frameThisPoint(point1)
    point2 = thisObject.container.frame.frameThisPoint(point2)
    point3 = thisObject.container.frame.frameThisPoint(point3)
    point4 = thisObject.container.frame.frameThisPoint(point4)

    let opacity

    /* Shadow */

    for (let i = 0; i <= 5; i++) {
      opacity = 1 - (i / 100) - 0.93

      browserCanvasContext.beginPath()
      browserCanvasContext.moveTo(point1.x + i, point1.y + i)
      browserCanvasContext.lineTo(point2.x + i, point2.y + i)
      browserCanvasContext.lineTo(point3.x + i, point3.y + i)
      browserCanvasContext.lineTo(point4.x + i, point4.y + i)
      browserCanvasContext.lineTo(point1.x + i, point1.y + i)
      browserCanvasContext.closePath()

      browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.BLACK + ', ' + opacity + ''
      browserCanvasContext.lineWidth = 1
      browserCanvasContext.stroke()
    }

    /* Background and Border */

    browserCanvasContext.setLineDash([0, 0])
    browserCanvasContext.beginPath()
    browserCanvasContext.moveTo(point1.x, point1.y)
    browserCanvasContext.lineTo(point2.x, point2.y)
    browserCanvasContext.lineTo(point3.x, point3.y)
    browserCanvasContext.lineTo(point4.x, point4.y)
    browserCanvasContext.lineTo(point1.x, point1.y)
    browserCanvasContext.closePath()

    opacity = 1

    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + opacity + ''
    browserCanvasContext.fill()

    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GREY + ', ' + opacity + ''
    browserCanvasContext.lineWidth = 0.3
    browserCanvasContext.stroke()
  }
}
