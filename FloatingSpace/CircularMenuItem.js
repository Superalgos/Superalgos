
function newCircularMenuItem () {
  const MODULE_NAME = 'Circular Menu Iem'

  let thisObject = {
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
  thisObject.container.frame.width = 100
  thisObject.container.frame.height = 50

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

    if (thisObject.container.frame.isThisPointHere(point, true) === true) {
      return thisObject.container
    } else {
      return undefined
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
  }

  function onMouseOver () {
    isMouseOver = true
  }

  function onMouseNotOver () {
    isMouseOver = false
  }

  function onMouseClick (event) {

  }

  function drawBackground () {
    if (isMouseOver === true) {
      let point = {
        x: thisObject.container.frame.position.x,
        y: thisObject.container.frame.position.y
      }

      point = thisObject.container.frame.frameThisPoint(point)

      browserCanvasContext.beginPath()

      browserCanvasContext.rect(point.x, point.y, thisObject.container.frame.width, thisObject.container.frame.height)
      browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.RED + ', 1)'

      browserCanvasContext.closePath()
      browserCanvasContext.fill()
    }
  }

  function drawForeground () {
    let position = {
      x: 0,
      y: 0
    }

    position = thisObject.container.frame.frameThisPoint(position)

        /* Menu  Item */

    if (thisObject.canDrawIcon === true && thisObject.currentRadius > 1) {
      let menuPosition = {
        x: position.x + thisObject.currentRadius * 3 / 4 * Math.cos(toRadians(thisObject.angle)),
        y: position.y - thisObject.currentRadius * 3 / 4 * Math.sin(toRadians(thisObject.angle)) }

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
