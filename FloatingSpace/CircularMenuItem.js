
function newCircularMenuItem () {
  const MODULE_NAME = 'Circular Menu Iem'

  let thisObject = {
    isDeployed: undefined,
    iconOn: undefined,
    iconOff: undefined,
    action: undefined,
    actionFunction: undefined,
    label: undefined,
    visible: false,
    imagePathOn: undefined,
    imagePathOff: undefined,
    rawRadius: undefined,
    targetRadius: undefined,
    currentRadius: undefined,
    angle: undefined,
    container: undefined,
    payload: undefined,
    physics: physics,
    drawBackground: drawBackground,
    drawForeground: drawForeground,
    getContainer: getContainer,
    finalize: finalize,
    initialize: initialize
  }

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME)
  thisObject.container.isClickeable = true
  thisObject.container.isDraggeable = false
  thisObject.container.detectMouseOver = true
  thisObject.container.frame.radius = 0
  thisObject.container.frame.position.x = 0
  thisObject.container.frame.position.y = 0
  thisObject.container.frame.width = 150
  thisObject.container.frame.height = 30

  let isMouseOver = false

  let selfMouseOverEventSubscriptionId
  let selfMouseClickEventSubscriptionId
  let selfMouseNotOverEventSubscriptionId
  return thisObject

  function finalize () {
    thisObject.container.eventHandler.stopListening(selfMouseOverEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(selfMouseClickEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(selfMouseNotOverEventSubscriptionId)

    thisObject.container.finalize()
    thisObject.container = undefined
    thisObject.iconOn = undefined
    thisObject.iconOff = undefined
    thisObject.payload = undefined
    thisObject.actionFunction = undefined
  }

  function initialize (pPayload) {
    thisObject.payload = pPayload
    /* Load Menu Images */

    thisObject.iconOn = new Image()
    thisObject.iconOn.onload = onImageLoad

    function onImageLoad () {
      thisObject.iconOff = new Image()
      thisObject.iconOff.onload = onImageLoad

      function onImageLoad () {
        thisObject.canDrawIcon = true
      }
      thisObject.iconOff.src = window.canvasApp.urlPrefix + thisObject.imagePathOff
    }
    thisObject.iconOn.src = window.canvasApp.urlPrefix + thisObject.imagePathOn
    thisObject.icon = thisObject.iconOn // The default value is ON.

    selfMouseOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)
    selfMouseClickEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseClick', onMouseClick)
    selfMouseNotOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseNotOver', onMouseNotOver)
  }

  function getContainer (point) {
    let container
    if (thisObject.isDeployed === true) {
      if (thisObject.container.frame.isThisPointHere(point, true, false) === true) {
        return thisObject.container
      } else {
        return undefined
      }
    }
  }

  function physics () {
    if (Math.abs(thisObject.currentRadius - thisObject.targetRadius) >= 0.5) {
      if (thisObject.currentRadius < thisObject.targetRadius) {
        thisObject.currentRadius = thisObject.currentRadius + 0.5
      } else {
        thisObject.currentRadius = thisObject.currentRadius - 0.5
      }
    }

    thisObject.container.frame.position.x = thisObject.container.frame.radius * 3 / 7 * Math.cos(toRadians(thisObject.angle)) - thisObject.currentRadius * 1.5
    thisObject.container.frame.position.y = thisObject.container.frame.radius * 3 / 7 * Math.sin(toRadians(thisObject.angle)) - thisObject.container.frame.height / 2
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
    thisObject.actionFunction(thisObject.payload, thisObject.action)
  }

  function drawBackground () {
    if (thisObject.container.frame.position.x > 0 && thisObject.isDeployed === true && thisObject.currentRadius >= thisObject.targetRadius) {
      let params = {
        cornerRadius: 3,
        lineWidth: 0.1,
        container: thisObject.container,
        borderColor: UI_COLOR.DARK,
        backgroundColor: UI_COLOR.RED,
        castShadow: false
      }

      if (isMouseOver === true) {
        params.opacity = 1
      } else {
        params.opacity = 0.8
      }

      roundedCornersBackground(params)
    }
  }

  function drawForeground () {
    let menuPosition = {
      x: thisObject.currentRadius * 1.5,
      y: thisObject.container.frame.height / 2
    }

    menuPosition = thisObject.container.frame.frameThisPoint(menuPosition)

        /* Menu  Item */

    if (thisObject.canDrawIcon === true && thisObject.currentRadius > 1 && thisObject.isDeployed === true) {
      browserCanvasContext.drawImage(thisObject.icon, menuPosition.x - thisObject.currentRadius, menuPosition.y - thisObject.currentRadius, thisObject.currentRadius * 2, thisObject.currentRadius * 2)

        /* Menu Label */

      let labelPoint
      let fontSize = 10

      browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY

      if (thisObject.label !== undefined && thisObject.currentRadius >= thisObject.targetRadius) {
        labelPoint = {
          x: menuPosition.x + thisObject.currentRadius + 10,
          y: menuPosition.y + fontSize * FONT_ASPECT_RATIO
        }

        browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'
        browserCanvasContext.fillText(thisObject.label, labelPoint.x, labelPoint.y)
      }
    }
  }
}
