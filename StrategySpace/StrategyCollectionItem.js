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
    const ITEM_WIDTH = 430
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

    const LEFT_MARGIN = 70
    const TOP_MARGIN = 35

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
    let params = {
      cornerRadious: 8,
      lineWidth: 0.1,
      opacity: 1,
      container: thisObject.container,
      borderColor: UI_COLOR.DARK,
      backgroundColor: UI_COLOR.WHITE,
      castShadow: true
    }

    roundedCornersBackground(params)
  }
}

