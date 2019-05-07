
function newStrategyPart () {
  const MODULE_NAME = 'Strategy Part'
  const ERROR_LOG = true

  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    type: undefined,
    menu: undefined,
    isOnFocus: false,
    container: undefined,
    payload: undefined,
    physics: physics,
    drawBackground: drawBackground,
    drawMiddleground: drawMiddleground,
    drawForeground: drawForeground,
    drawOnFocus: drawOnFocus,
    getContainer: getContainer,
    finalize: finalize,
    initialize: initialize
  }

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME, 'Circle')
  thisObject.container.isClickeable = false
  thisObject.container.isDraggeable = false
  thisObject.container.frame.radius = 0
  thisObject.container.frame.position.x = 0
  thisObject.container.frame.position.y = 0

  let floatingLayer
  let image
  let imagePath

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
    thisObject.menu.finalize()
    thisObject.menu = undefined

    floatingLayer = undefined
    image = undefined
    imagePath = undefined
  }

  function initialize (pFloatingLayer, pType, pPayload) {
    thisObject.payload = pPayload
    floatingLayer = pFloatingLayer

    let menuItemsInitialValues = []
    switch (pType) {
      case 'Strategy': {
        imagePath = 'Images/icons/style-01/quality.png'
        menuItemsInitialValues = [
          {
            action: 'Open Settings',
            label: 'Settings',
            visible: false,
            imagePathOn: 'Images/icons/style-01/tools.png',
            imagePathOff: 'Images/icons/style-01/target.png',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 20
          },
          {
            action: 'Delete Strategy',
            label: 'Delete This Strategy',
            visible: false,
            imagePathOn: 'Images/icons/style-01/trash.png',
            imagePathOff: 'Images/icons/style-01/target.png',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -20
          }]
        break
      }
      case 'Strategy Entry Event': {
        imagePath = 'Images/icons/style-01/startup.png'
        menuItemsInitialValues = [
          {
            action: 'Add Situation',
            label: 'Add Situation',
            visible: false,
            imagePathOn: 'Images/icons/style-01/attractive.png',
            imagePathOff: 'Images/icons/style-01/target.png',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }]
        break
      }
      case 'Strategy Exit Event': {
        imagePath = 'Images/icons/style-01/support.png'
        menuItemsInitialValues = [
          {
            action: 'Add Situation',
            label: 'Add Situation',
            visible: false,
            imagePathOn: 'Images/icons/style-01/attractive.png',
            imagePathOff: 'Images/icons/style-01/target.png',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }]
        break
      }
      case 'Trade Entry Event': {
        imagePath = 'Images/icons/style-01/compass.png'
        menuItemsInitialValues = [
          {
            action: 'Add Situation',
            label: 'Add Situation',
            visible: false,
            imagePathOn: 'Images/icons/style-01/attractive.png',
            imagePathOff: 'Images/icons/style-01/target.png',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }]
        break
      }
      case 'Stop': {
        imagePath = 'Images/icons/style-01/pixel.png'
        menuItemsInitialValues = [
          {
            action: 'Add Phase',
            label: 'Add Phase',
            visible: false,
            imagePathOn: 'Images/icons/style-01/placeholder.png',
            imagePathOff: 'Images/icons/style-01/target.png',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }]
        break
      }
      case 'Take Profit': {
        imagePath = 'Images/icons/style-01/competition.png'
        menuItemsInitialValues = [
          {
            action: 'Add Phase',
            label: 'Add Phase',
            visible: false,
            imagePathOn: 'Images/icons/style-01/placeholder.png',
            imagePathOff: 'Images/icons/style-01/target.png',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }]
        break
      }
      case 'Phase': {
        imagePath = 'Images/icons/style-01/placeholder.png'
        menuItemsInitialValues = [
          {
            action: 'Edit Code',
            label: 'Edit Code',
            visible: false,
            imagePathOn: 'Images/icons/style-01/html.png',
            imagePathOff: 'Images/icons/style-01/target.png',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          },
          {
            action: 'Add Situation',
            label: 'Add Situation',
            visible: false,
            imagePathOn: 'Images/icons/style-01/attractive.png',
            imagePathOff: 'Images/icons/style-01/target.png',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          },
          {
            action: 'Delete Phase',
            label: 'Delete This Phase',
            visible: false,
            imagePathOn: 'Images/icons/style-01/trash.png',
            imagePathOff: 'Images/icons/style-01/target.png',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }]
        break
      }
      case 'Situation': {
        imagePath = 'Images/icons/style-01/attractive.png'
        menuItemsInitialValues = [
          {
            action: 'Add Condition',
            label: 'Add Condition',
            visible: false,
            imagePathOn: 'Images/icons/style-01/testing.png',
            imagePathOff: 'Images/icons/style-01/target.png',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 20
          },
          {
            action: 'Delete Situation',
            label: 'Delete This Situation',
            visible: false,
            imagePathOn: 'Images/icons/style-01/trash.png',
            imagePathOff: 'Images/icons/style-01/target.png',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -20
          }]
        break
      }
      case 'Condition': {
        imagePath = 'Images/icons/style-01/testing.png'
        menuItemsInitialValues = [
          {
            action: 'Edit Code',
            label: 'Edit Code',
            visible: false,
            imagePathOn: 'Images/icons/style-01/html.png',
            imagePathOff: 'Images/icons/style-01/target.png',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 20
          },
          {
            action: 'Delete Condition',
            label: 'Delete This Condition',
            visible: false,
            imagePathOn: 'Images/icons/style-01/trash.png',
            imagePathOff: 'Images/icons/style-01/target.png',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -20
          }]
        break
      }
      default: {
        if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> Part Type not Recognized -> type = ' + pType) }
      }
    }

    thisObject.menu = newCircularMenu()
    thisObject.menu.initialize(menuItemsInitialValues, thisObject.payload)
    thisObject.menu.container.connectToParent(thisObject.container, false, false, true, true, false, false, true, true)

/* Load Part Image */

    if (imagePath !== undefined) {
      image = new Image()
      image.onload = onImageLoad

      function onImageLoad () {
        image.canDrawIcon = true
      }
      image.src = window.canvasApp.urlPrefix + imagePath
    }

    selfFocusEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onFocus', onFocus)
    selfNotFocuskEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onNotFocus', onNotFocus)
    selfMouseClickEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseClick', onMouseClick)
  }

  function getContainer (point) {
    let container

    container = thisObject.menu.getContainer(point)
    if (container !== undefined) { return container }

    if (thisObject.container.frame.isThisPointHere(point, true) === true) {
      return thisObject.container
    } else {
      return undefined
    }
  }

  function physics () {
    thisObject.menu.physics()
  }

  function onFocus () {
    thisObject.isOnFocus = true
  }

  function onNotFocus () {
    thisObject.isOnFocus = false
  }

  function onMouseClick (event) {

  }

  function drawBackground (pFloatingObject) {
    if (thisObject.isOnFocus === false) {
      drawConnectingLine(pFloatingObject)
      thisObject.menu.drawBackground()
    }
  }

  function drawMiddleground (pFloatingObject) {
    if (thisObject.isOnFocus === false) {
      drawText(pFloatingObject)
    }
  }

  function drawForeground (pFloatingObject) {
    if (thisObject.isOnFocus === false) {
      drawBodyAndPicture(pFloatingObject)
      thisObject.menu.drawForeground()
    }
  }

  function drawOnFocus (pFloatingObject) {
    if (thisObject.isOnFocus === true) {
      drawConnectingLine(pFloatingObject)
      thisObject.menu.drawBackground()

      drawText(pFloatingObject)

      drawBodyAndPicture(pFloatingObject)
      thisObject.menu.drawForeground()
    }
  }

  function drawConnectingLine (pFloatingObject) {
    if (pFloatingObject.payload.parentNode === undefined) { return }

    /* Here we do the trick of recalculation the position of the anchor by setting it to the position of its parent */
    let parentFloatingObject = floatingLayer.getFloatingObject(thisObject.payload.chainParent.handle)

    thisObject.payload.position.x = parentFloatingObject.container.frame.position.x
    thisObject.payload.position.y = parentFloatingObject.container.frame.position.y

   /* Here I continue painting the background */

    let targetPoint = {
      x: thisObject.payload.position.x,
      y: thisObject.payload.position.y
    }

    let position = {
      x: 0,
      y: 0
    }

    position = thisObject.container.frame.frameThisPoint(position)

    if (thisObject.container.frame.radius > 1) {
            /* Target Line */

      browserCanvasContext.beginPath()
      browserCanvasContext.moveTo(position.x, position.y)
      browserCanvasContext.lineTo(targetPoint.x, targetPoint.y)
      browserCanvasContext.strokeStyle = 'rgba(204, 204, 204, 0.5)'
      browserCanvasContext.setLineDash([1, 4])
      browserCanvasContext.lineWidth = 1
      browserCanvasContext.stroke()
      browserCanvasContext.setLineDash([0, 0])
    }

    if (pFloatingObject.container.frame.radius > 0.5) {
            /* Target Spot */

      let radius = 1

      browserCanvasContext.beginPath()
      browserCanvasContext.arc(targetPoint.x, targetPoint.y, radius, 0, Math.PI * 2, true)
      browserCanvasContext.closePath()
      browserCanvasContext.fillStyle = 'rgba(30, 30, 30, 1)'
      browserCanvasContext.fill()
    }
  }

  function drawText (pFloatingObject) {
/* Text Follows */
    let position = {
      x: pFloatingObject.container.frame.position.x,
      y: pFloatingObject.container.frame.position.y
    }
    let radius = pFloatingObject.container.frame.radius
            /* Label Text */
    let labelPoint
    let fontSize = pFloatingObject.currentFontSize
    let label

    if (radius > 6 && thisObject.isOnFocus === true) {
      browserCanvasContext.strokeStyle = pFloatingObject.labelStrokeStyle

      browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY

      label = pFloatingObject.payload.downLabel

      if (label !== undefined) {
        labelPoint = {
          x: position.x - label.length / 2 * fontSize * FONT_ASPECT_RATIO,
          y: position.y - radius * 1 / 2 - fontSize * FONT_ASPECT_RATIO - 10
        }

        browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
        browserCanvasContext.fillStyle = pFloatingObject.labelStrokeStyle
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
      }
    }
    if (radius > 6) {
      label = pFloatingObject.payload.upLabel

      if (label !== undefined) {
        labelPoint = {
          x: position.x - label.length / 2 * fontSize * FONT_ASPECT_RATIO,
          y: position.y + radius * 2 / 3 + fontSize * FONT_ASPECT_RATIO + 15
        }

        browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
        browserCanvasContext.fillStyle = pFloatingObject.labelStrokeStyle
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
      }
    }
  }

  function drawBodyAndPicture (pFloatingObject) {
    let position = {
      x: pFloatingObject.container.frame.position.x,
      y: pFloatingObject.container.frame.position.y
    }

    let radius = pFloatingObject.container.frame.radius

    if (radius > 0.5 && image === undefined) {
            /* Main FloatingObject */

      browserCanvasContext.beginPath()
      browserCanvasContext.arc(position.x, position.y, radius * 2 / 3, 0, Math.PI * 2, true)
      browserCanvasContext.closePath()

      browserCanvasContext.fillStyle = pFloatingObject.fillStyle

      browserCanvasContext.fill()

      browserCanvasContext.beginPath()
      browserCanvasContext.arc(position.x, position.y, radius * 1 / 3, 0, Math.PI * 2, true)
      browserCanvasContext.closePath()

      browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.BLACK + ', 1)'

      browserCanvasContext.fill()
    }

        /* Image */

    if (image !== undefined) {
      if (image.canDrawIcon === true) {
        browserCanvasContext.drawImage(image, position.x - pFloatingObject.currentImageSize / 2, position.y - pFloatingObject.currentImageSize / 2, pFloatingObject.currentImageSize, pFloatingObject.currentImageSize)
      }
    }
  }
}
