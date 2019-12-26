
function newUiObjectTitle () {
  const MODULE_NAME = 'UI Object Title'
  const ERROR_LOG = true

  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    isVisibleFunction: undefined,
    allwaysVisible: undefined,
    editMode: undefined,
    container: undefined,
    payload: undefined,
    enterEditMode: enterEditMode,
    exitEditMode: exitEditMode,
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
    thisObject.isVisibleFunction = undefined
  }

  function initialize (payload) {
    thisObject.payload = payload

    thisObject.allwaysVisible = false // Default value
    switch (payload.node.type) {
      case 'Definition': {
        thisObject.allwaysVisible = true
        break
      }
      case 'Data Mine': {
        thisObject.allwaysVisible = true
        break
      }
      case 'Sensor Bot': {
        thisObject.allwaysVisible = true
        break
      }
      case 'Indicator Bot': {
        thisObject.allwaysVisible = true
        break
      }
      case 'Trading Bot': {
        thisObject.allwaysVisible = true
        break
      }
      case 'Process Definition': {
        thisObject.allwaysVisible = true
        break
      }
      case 'Product Definition': {
        thisObject.allwaysVisible = true
        break
      }
      case 'Dataset Definition': {
        thisObject.allwaysVisible = true
        break
      }
      case 'Record Property': {
        thisObject.allwaysVisible = true
        break
      }
      case 'Plotter': {
        thisObject.allwaysVisible = true
        break
      }
      case 'Plotter Module': {
        thisObject.allwaysVisible = true
        break
      }
      case 'Network': {
        thisObject.allwaysVisible = true
        break
      }
      case 'Announcement': {
        thisObject.allwaysVisible = true
        break
      }
      case 'Layer': {
        thisObject.allwaysVisible = true
        break
      }
      case 'Sensor Bot Instance': {
        thisObject.allwaysVisible = true
        break
      }
      case 'Indicator Bot Instance': {
        thisObject.allwaysVisible = true
        break
      }
      case 'Backtesting Session': {
        thisObject.allwaysVisible = true
        break
      }
      case 'Live Trading Session': {
        thisObject.allwaysVisible = true
        break
      }
      case 'Fordward Testing Session': {
        thisObject.allwaysVisible = true
        break
      }
      case 'Paper Trading Session': {
        thisObject.allwaysVisible = true
        break
      }
      case 'Workspace': {
        thisObject.allwaysVisible = true
        break
      }
      case 'Trading System': {
        thisObject.allwaysVisible = true
        break
      }
      case 'Strategy': {
        thisObject.allwaysVisible = true
        break
      }
      default: {
        let nodeDefinition = APP_SCHEMA_MAP.get(thisObject.payload.node.type)
        if (nodeDefinition !== undefined) {
          if (nodeDefinition.isTitleAllwaysVisible === true) {
            thisObject.allwaysVisible = true
          }
        }
      }
    }

    selfFocusEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onFocus', onFocus)
    selfNotFocuskEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onNotFocus', onNotFocus)
    selfMouseClickEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseClick', onMouseClick)
  }

  function getContainer (point) {
    if (AT_FULL_SCREEN_MODE === true) { return } // Fullscreen mode does not allow INPUT elements

    let container

    if (thisObject.editMode === true) {
      if (point.x === VERY_LARGE_NUMBER) {
        /* The the mouse leaves the canvas, and event of mouse over with a ridiculous coordinate is triggered so that
        anyone can react. In our case, this object has an html input element that is not part of the canvas, so the event is
        triggered. We compensate recognizing this coordinate and returning our container. */
        return thisObject.container
      }
    }
    if (thisObject.container.frame.isThisPointHere(point, true) === true) {
      return thisObject.container
    } else {
      return undefined
    }
  }

  function physics () {
    if (thisObject.payload.title === undefined) { return }
    let title = trimTitle(thisObject.payload.title)

    const FRAME_HEIGHT = 25
    const FRAME_WIDTH = title.length / 2 * thisObject.payload.floatingObject.currentFontSize * FONT_ASPECT_RATIO * 1.2 * 2
    thisObject.container.frame.position.x = 0 - FRAME_WIDTH / 2
    thisObject.container.frame.position.y = 0 - thisObject.container.frame.radius * 1 / 2 - thisObject.payload.floatingObject.currentFontSize * FONT_ASPECT_RATIO - 20 - FRAME_HEIGHT

    thisObject.container.frame.width = FRAME_WIDTH
    thisObject.container.frame.height = FRAME_HEIGHT

    if (thisObject.editMode === true) {
      let inputPosition = {
        x: 0,
        y: 0 + CURRENT_TOP_MARGIN
      }

      inputPosition = thisObject.container.frame.frameThisPoint(inputPosition)

      if (inputPosition.y < CURRENT_TOP_MARGIN) { exitEditMode() }

      let inputDiv = document.getElementById('inputDiv')
      inputDiv.style = 'position:absolute; top:' + inputPosition.y + 'px; left:' + inputPosition.x + 'px; z-index:1; '
    }
  }

  function onFocus () {
    thisObject.isOnFocus = true
  }

  function onNotFocus () {
    thisObject.isOnFocus = false
    exitEditMode()
  }

  function onMouseClick (event) {
    let checkPoint = {
      x: 0,
      y: 0
    }
    checkPoint = thisObject.container.frame.frameThisPoint(checkPoint)

    if (thisObject.isVisibleFunction(checkPoint) === true) {
      enterEditMode()
    }
  }

  function exitEditMode () {
    if (thisObject.editMode === true) {
      thisObject.editMode = false
      let input = document.getElementById('input')
      input.style.display = 'none'
      if (input.value.length > 2) {
        thisObject.payload.title = input.value
        thisObject.payload.node.name = input.value
      }
    }
  }

  function enterEditMode () {
    const WIDTH = thisObject.container.frame.width
    const HEIGHT = thisObject.container.frame.height
    let fontSize = thisObject.payload.floatingObject.currentFontSize

    thisObject.editMode = true
    let input = document.getElementById('input')
    input.value = thisObject.payload.title

    let backgroundColor = '0, 0, 0'
    if (thisObject.payload.uiObject.codeEditor !== undefined) {
      if (thisObject.payload.uiObject.codeEditor.visible === true) {
        backgroundColor = '204, 88, 53'
      }
    }

    input.style = 'resize: none; border: none; outline: none; box-shadow: none; overflow:hidden; font-family: Saira; font-size: ' + fontSize + 'px; background-color: rgb(' + backgroundColor + ');color:rgb(255, 255, 255); width: ' + WIDTH + 'px; height: ' + HEIGHT + 'px'
    input.style.display = 'block'
    input.focus()
  }

  function draw () {
    if (thisObject.isOnFocus === true || thisObject.allwaysVisible === true) {
      if (thisObject.payload.uiObject.codeEditor !== undefined) {
        if (thisObject.payload.uiObject.codeEditor.visible !== true) {
          drawTitleBackground()
        }
      } else {
        drawTitleBackground()
      }

      drawText()
    }
  }

  function drawTitleBackground () {
    if (thisObject.editMode !== true) {
      let params = {
        cornerRadius: 3,
        lineWidth: 0.1,
        container: thisObject.container,
        borderColor: UI_COLOR.BLACK,
        backgroundColor: UI_COLOR.BLACK,
        castShadow: false,
        opacity: 0.25
      }

      roundedCornersBackground(params)
    }
  }

  function drawText () {
    if (thisObject.editMode !== true) {
      let radius = thisObject.container.frame.radius
      let labelPoint
      let fontSize = thisObject.payload.floatingObject.currentFontSize
      let label

      if (radius > 6 && (thisObject.isOnFocus === true || thisObject.allwaysVisible === true)) {
        browserCanvasContext.strokeStyle = thisObject.payload.floatingObject.labelStrokeStyle

        browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY

        label = thisObject.payload.title

        if (label !== undefined) {
          label = trimTitle(label)

          labelPoint = {
            x: 0,
            y: thisObject.container.frame.height * 0.8
          }

          labelPoint = thisObject.container.frame.frameThisPoint(labelPoint)

          browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
          browserCanvasContext.fillStyle = thisObject.payload.floatingObject.labelStrokeStyle
          browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
        }
      }
    }
  }

  function trimTitle (title) {
    if (title === undefined) { return }
    const MAX_LABEL_LENGTH = 50
    if (title.length > MAX_LABEL_LENGTH) {
      title = title.substring(0, MAX_LABEL_LENGTH) + '...'
    }
    return title
  }
}
