
function newCodeEditor () {
  const MODULE_NAME = 'Circular Menu Iem'

  let thisObject = {
    isDeployed: undefined,
    iconOK: undefined,
    iconNOT_OK: undefined,
    visible: false,
    imagePathOK: undefined,
    imagePathNOT_OK: undefined,
    rawRadius: undefined,
    targetRadius: undefined,
    currentRadius: undefined,
    container: undefined,
    payload: undefined,
    deactivate: deactivate,
    activate: activate,
    physics: physics,
    drawBackground: drawBackground,
    drawForeground: drawForeground,
    getContainer: getContainer,
    finalize: finalize,
    initialize: initialize
  }

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME)
  thisObject.container.isClickeable = false
  thisObject.container.isDraggeable = false
  thisObject.container.detectMouseOver = false
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
    thisObject.iconOK = undefined
    thisObject.iconNOT_OK = undefined
    thisObject.payload = undefined
  }

  function initialize () {
    /* Load Images */

    thisObject.iconOK = new Image()
    thisObject.iconOK.onload = onImageLoad

    function onImageLoad () {
      thisObject.iconNOT_OK = new Image()
      thisObject.iconNOT_OK.onload = onImageLoad

      function onImageLoad () {
        thisObject.canDrawIcon = true
      }
      thisObject.iconNOT_OK.src = window.canvasApp.urlPrefix + thisObject.imagePathNOT_OK
    }
    thisObject.iconOK.src = window.canvasApp.urlPrefix + thisObject.imagePathOK
    thisObject.icon = thisObject.iconOK // The default value is ON.

    selfMouseOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)
    selfMouseClickEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseClick', onMouseClick)
    selfMouseNotOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseNotOver', onMouseNotOver)
  }

  function deactivate () {
    if (thisObject.visible === true) {
      thisObject.visible = false
      let textArea = document.getElementById('textArea')
      textArea.style.display = 'none'
      thisObject.payload.node.code = textArea.value
    }
  }

  function activate (payload) {
    const WIDTH = thisObject.container.frame.radius * 2.2
    const HEIGHT = thisObject.container.frame.radius * 1

    let textAreaPosition = {
      x: 0 - WIDTH / 2,
      y: 0
    }

    textAreaPosition = thisObject.container.frame.frameThisPoint(textAreaPosition)
    if (textAreaPosition.y < window.canvasApp.topMargin) { return }

    thisObject.visible = true
    thisObject.payload = payload
    thisObject.rawRadius = 8
    thisObject.targetRadius = thisObject.container.frame.radius
    thisObject.currentRadius = 0

    let textArea = document.getElementById('textArea')
    textArea.value = payload.node.code
    textArea.style = 'resize: none; border: none; outline: none; box-shadow: none; overflow:hidden; font-family: Saira; font-size: 12px; background-color: rgb(204, 88, 53);color:rgb(255, 255, 255); width: ' + WIDTH + 'px; height: ' + HEIGHT + 'px'
    textArea.style.display = 'block'
    textArea.focus()

    let textAreaDiv = document.getElementById('textAreaDiv')
    textAreaDiv.style = 'position:absolute; top:' + textAreaPosition.y + 'px; left:' + textAreaPosition.x + 'px; z-index:1; '
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

    thisObject.container.frame.position.x = 0
    thisObject.container.frame.position.y = 0
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
    if (thisObject.visible === true) {
      let position = {
        x: 0,
        y: 0
      }

      position = thisObject.container.frame.frameThisPoint(position)

      let radius = thisObject.container.frame.radius

      if (radius > 0.5) {
        browserCanvasContext.beginPath()
        browserCanvasContext.arc(position.x, position.y, radius * 1.3 + 3, 0, Math.PI * 2, true)
        browserCanvasContext.closePath()
        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + 1 + ')'
        browserCanvasContext.fill()

        browserCanvasContext.beginPath()
        browserCanvasContext.arc(position.x, position.y, radius * 1.3, 0, Math.PI * 2, true)
        browserCanvasContext.closePath()
        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', ' + 1 + ')'
        browserCanvasContext.fill()
      }
    }
  }
  function drawForeground () {
    let iconPosition = {
      x: 0,
      y: thisObject.currentRadius * 1.5
    }

    iconPosition = thisObject.container.frame.frameThisPoint(iconPosition)

      /* Menu  Item */

    if (thisObject.canDrawIcon === true && thisObject.currentRadius > 1) {
      browserCanvasContext.drawImage(thisObject.icon, iconPosition.x - thisObject.currentRadius, iconPosition.y - thisObject.currentRadius, thisObject.currentRadius * 2, thisObject.currentRadius * 2)

      /* Menu Label */

      let label = 'Code looks good!'
      let labelPoint
      let fontSize = 10

      browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY

      if (label !== undefined && thisObject.currentRadius >= thisObject.targetRadius) {
        labelPoint = {
          x: iconPosition.x + thisObject.currentRadius + 10,
          y: iconPosition.y + fontSize * FONT_ASPECT_RATIO
        }

        browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
      }
    }
  }
}

