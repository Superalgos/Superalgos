function newStrategyCollectionItem () {
  const MODULE_NAME = 'Strategy Collection Item'
  let thisObject = {
    icon: undefined,
    strategySource: undefined,
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

  let status = 'off'

  return thisObject

  function initialize (strategy) {
    thisObject.strategySource = strategy

    const ITEM_WIDTH = SIDE_PANEL_WIDTH - 20
    const ITEM_HEIGHT = 80

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
    if (status === 'off') {
      canvas.floatingSpace.makeVisible()
      thisObject.strategy = newTradingSystem()
      thisObject.strategy.initialize(thisObject.strategySource)
      status = 'on'
    } else {
      canvas.floatingSpace.makeInvisible()
      thisObject.strategy.finalize()
      status = 'off'
    }
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
    arrow()
    icon()
  }

  function text () {
    if (thisObject.strategySource === undefined) {
      return
    }

    const LEFT_MARGIN = 80
    const TOP_MARGIN = 45

    let strategy = thisObject.strategySource

    let labelpoint = {
      x: LEFT_MARGIN,
      y: TOP_MARGIN
    }

    labelpoint = thisObject.container.frame.frameThisPoint(labelpoint)

    let labelToPrint = strategy.name
    labelToPrint = ''
    labelToPrint = labelToPrint.substring(0, 30)
    let opacity = 1
    let fontSize = 15

    printLabel(labelToPrint, labelpoint.x, labelpoint.y, opacity, fontSize)
  }

  function borders () {
    let params = {
      cornerRadius: 8,
      lineWidth: 0.1,
      opacity: 1,
      container: thisObject.container,
      borderColor: UI_COLOR.DARK,
      backgroundColor: UI_COLOR.WHITE,
      castShadow: true
    }

    roundedCornersBackground(params)
  }

  function arrow () {
    const X_OFFSET = 400
    const Y_OFFSET = 40
    const HEIGHT = 12
    const WIDTH = 6
    const LINE_WIDTH = 2
    const OPACITY = 0.6

    point1 = {
      x: X_OFFSET,
      y: Y_OFFSET - HEIGHT / 2
    }

    point2 = {
      x: X_OFFSET + WIDTH,
      y: Y_OFFSET
    }

    point3 = {
      x: X_OFFSET,
      y: Y_OFFSET + HEIGHT / 2
    }

        /* Now the transformations. */

    point1 = thisObject.container.frame.frameThisPoint(point1)
    point2 = thisObject.container.frame.frameThisPoint(point2)
    point3 = thisObject.container.frame.frameThisPoint(point3)

    browserCanvasContext.setLineDash([0, 0])

          /* The Arrow  */

    browserCanvasContext.beginPath()

    browserCanvasContext.moveTo(point1.x, point1.y)
    browserCanvasContext.lineTo(point2.x, point2.y)
    browserCanvasContext.lineTo(point3.x, point3.y)

    browserCanvasContext.lineWidth = LINE_WIDTH
    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.DARK + ', ' + OPACITY + ')'
    browserCanvasContext.stroke()
  }

  function icon () {
    if (thisObject.icon === undefined) { return }

    const X_OFFSET = 45
    const Y_OFFSET = 40
    const IMAGE_SIZE = 40

    point1 = {
      x: X_OFFSET,
      y: Y_OFFSET
    }

        /* Now the transformations. */

    point1 = thisObject.container.frame.frameThisPoint(point1)

    browserCanvasContext.drawImage(thisObject.icon, point1.x - IMAGE_SIZE / 2, point1.y - IMAGE_SIZE / 2, IMAGE_SIZE, IMAGE_SIZE)
  }
}
