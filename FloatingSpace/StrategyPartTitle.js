
function newStrategyPartTitle () {
  const MODULE_NAME = 'Strategy Part Title'
  const ERROR_LOG = true

  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    container: undefined,
    payload: undefined,
    physics: physics,
    draw: draw,
    getContainer: getContainer,
    finalize: finalize,
    initialize: initialize
  }

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME)
  thisObject.container.isClickeable = true
  thisObject.container.isDraggeable = false
  thisObject.container.frame.radius = 0

  let selfFocusEventSubscriptionId
  let selfNotFocuskEventSubscriptionId
  let selfMouseClickEventSubscriptionId

  return thisObject

  function finalize () {
    thisObject.container.eventHandler.stopListening(selfFocusEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(selfNotFocuskEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(selfMouseClickEventSubscriptionId)

    thisObject.container.finalize()
    thisObject.container = undefined
    thisObject.payload = undefined
  }

  function initialize (payload) {
    thisObject.payload = payload

    switch (payload.node.type) {
      case 'Strategy': {
        break
      }
      case 'Strategy Entry Event': {
        break
      }
      case 'Strategy Exit Event': {
        break
      }
      case 'Trade Entry Event': {
        break
      }
      case 'Stop': {
        break
      }
      case 'Take Profit': {
        break
      }
      case 'Phase': {
        break
      }
      case 'Situation': {
        break
      }
      case 'Condition': {
        break
      }
      default: {
        if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> Part Type not Recognized -> type = ' + payload.node.type) }
      }
    }

    selfFocusEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onFocus', onFocus)
    selfNotFocuskEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onNotFocus', onNotFocus)
    selfMouseClickEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseClick', onMouseClick)
  }

  function getContainer (point) {
    let container

    if (thisObject.container.frame.isThisPointHere(point, true) === true) {
      return thisObject.container
    } else {
      return undefined
    }
  }

  function physics () {
    thisObject.container.frame.position.x = 0 - label.length / 2 * fontSize * FONT_ASPECT_RATIO * 1.2
    thisObject.container.frame.position.y = 0 - radius * 1 / 2 - fontSize * FONT_ASPECT_RATIO - 10

    thisObject.container.frame.width = thisObject.container.frame.radius
    thisObject.container.frame.height = 20
  }

  function onFocus () {
    thisObject.isOnFocus = true
  }

  function onNotFocus () {
    thisObject.isOnFocus = false
  }

  function onMouseClick (event) {

  }

  function draw (params) {
    if (thisObject.isOnFocus === true) {
      drawText(params)
    }
  }

  function drawText (params) {
/* Text Follows */
    let position = {
      x: 0,
      y: 0
    }

    position = thisObject.container.frame.frameThisPoint(position)

    let backgroundParams = {
      cornerRadius: 3,
      lineWidth: 0.1,
      container: thisObject.container,
      borderColor: UI_COLOR.DARK,
      backgroundColor: UI_COLOR.RED,
      castShadow: false,
      opacity: 1
    }

    roundedCornersBackground(backgroundParams)

    let radius = thisObject.container.frame.radius
            /* Label Text */
    let labelPoint
    let fontSize = params.currentFontSize
    let label

    if (radius > 6 && thisObject.isOnFocus === true) {
      const MAX_LABEL_LENGTH = 25

      browserCanvasContext.strokeStyle = params.labelStrokeStyle

      browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY

      label = params.payload.downLabel

      if (label !== undefined) {
        if (label.length > MAX_LABEL_LENGTH) {
          label = label.substring(0, MAX_LABEL_LENGTH) + '...'
        }

        labelPoint = {
          x: position.x - label.length / 2 * fontSize * FONT_ASPECT_RATIO * 1.2,
          y: position.y - radius * 1 / 2 - fontSize * FONT_ASPECT_RATIO - 10
        }

        browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
        browserCanvasContext.fillStyle = params.labelStrokeStyle
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
      }
    }
  }
}

