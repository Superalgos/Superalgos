
function newCircularMenuItem () {
  const MODULE_NAME = 'Circular Menu Iem'

  let thisObject = {
    isDeployed: undefined,
    iconOn: undefined,
    iconOff: undefined,
    label: undefined,
    visible: false,
    imagePathOn: undefined,
    imagePathOff: undefined,
    rawRadius: undefined,
    targetRadius: undefined,
    currentRadius: undefined,
    angle: undefined,
    container: undefined,
    physics: physics,
    drawBackground: drawBackground,
    drawForeground: drawForeground,
    getContainer: getContainer,
    initialize: initialize
  }

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME)
  thisObject.container.isClickeable = false
  thisObject.container.isDraggeable = false
  thisObject.container.frame.radius = 0
  thisObject.container.frame.position.x = 0
  thisObject.container.frame.position.y = 0
  thisObject.container.frame.width = 150
  thisObject.container.frame.height = 30

  let isMouseOver = false

  return thisObject

  function initialize () {
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

    thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)
    thisObject.container.eventHandler.listenToEvent('onMouseClick', onMouseClick)
    thisObject.container.eventHandler.listenToEvent('onMouseNotOver', onMouseNotOver)
  }

  function getContainer (point) {
    let container
    if (thisObject.isDeployed === true) {
      if (thisObject.container.frame.isThisPointHere(point, true, true) === true) {
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

    thisObject.container.frame.position.x = thisObject.container.frame.radius * 3 / 7 * Math.cos(toRadians(thisObject.angle)) - thisObject.currentRadius
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

  }

  function drawBackground () {
    if (thisObject.container.frame.position.x > 0 && thisObject.isDeployed === true && thisObject.currentRadius >= thisObject.targetRadius) {
      let position = {
        x: 0,
        y: 0
      }

      position = thisObject.container.frame.frameThisPoint(position)

      browserCanvasContext.beginPath()

      browserCanvasContext.rect(position.x, position.y, thisObject.container.frame.width, thisObject.container.frame.height)

      if (isMouseOver === true) {
        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.RED + ', 1)'
      } else {
        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.RED + ', 0.5)'
      }

      browserCanvasContext.closePath()
      browserCanvasContext.fill()
    }
  }

  function drawForeground () {
    let menuPosition = {
      x: thisObject.currentRadius,
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

