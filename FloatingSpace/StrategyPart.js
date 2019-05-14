
function newStrategyPart () {
  const MODULE_NAME = 'Strategy Part'
  const ERROR_LOG = true

  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    fitFunction: undefined,
    isVisibleFunction: undefined,
    type: undefined,
    menu: undefined,
    isOnFocus: false,
    container: undefined,
    payload: undefined,
    codeEditor: undefined,
    partTitle: undefined,
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

  let icon

  let selfFocusEventSubscriptionId
  let selfNotFocuskEventSubscriptionId
  let selfDisplaceEventSubscriptionId

  return thisObject

  function finalize () {
    thisObject.container.eventHandler.stopListening(selfFocusEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(selfNotFocuskEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(selfDisplaceEventSubscriptionId)

    thisObject.container.finalize()
    thisObject.container = undefined
    thisObject.payload = undefined
    thisObject.menu.finalize()
    thisObject.menu = undefined
    thisObject.partTitle.finalize()
    thisObject.partTitle = undefined
    thisObject.fitFunction = undefined
    thisObject.isVisibleFunction = undefined

    if (thisObject.codeEditor !== undefined) {
      thisObject.codeEditor.finalize()
      thisObject.codeEditor = undefined
    }

    icon = undefined
  }

  function initialize (payload, menuItemsInitialValues) {
    thisObject.payload = payload

/* Initialize the Menu */

    thisObject.menu = newCircularMenu()
    thisObject.menu.initialize(menuItemsInitialValues, thisObject.payload)
    thisObject.menu.container.connectToParent(thisObject.container, false, false, true, true, false, false, true, true)

/* Initialize Part Title */

    thisObject.partTitle = newStrategyPartTitle()
    thisObject.partTitle.isVisibleFunction = thisObject.isVisibleFunction
    thisObject.partTitle.container.connectToParent(thisObject.container, false, false, true, true, false, false, true, true)
    thisObject.partTitle.initialize(thisObject.payload)

/* Load Part Image */

    iconPhysics()

    selfFocusEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onFocus', onFocus)
    selfNotFocuskEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onNotFocus', onNotFocus)
    selfDisplaceEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onDisplace', onDisplace)
  }

  function getContainer (point) {
    let container

    if (thisObject.codeEditor !== undefined) {
      container = thisObject.codeEditor.getContainer(point)
      if (container !== undefined) { return container }
    }

    container = thisObject.partTitle.getContainer(point)
    if (container !== undefined) { return container }

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
    thisObject.partTitle.physics()

    if (thisObject.codeEditor !== undefined) {
      thisObject.codeEditor.physics()
    }

    if (thisObject.payload.chainParent === undefined) {
      thisObject.payload.targetPosition.x = canvas.floatingSpace.container.frame.width / 2,
      thisObject.payload.targetPosition.y = canvas.floatingSpace.container.frame.height / 2
    } else {
      thisObject.payload.targetPosition.x = thisObject.payload.chainParent.payload.position.x
      thisObject.payload.targetPosition.y = thisObject.payload.chainParent.payload.position.y
    }

    iconPhysics()
  }

  function iconPhysics () {
    icon = canvas.strategySpace.iconByPartType.get(thisObject.payload.node.type)
  }

  function onFocus () {
    thisObject.isOnFocus = true
  }

  function onNotFocus () {
    thisObject.isOnFocus = false
    if (thisObject.codeEditor !== undefined) {
      thisObject.codeEditor.deactivate()
    }
  }

  function onDisplace (event) {
    thisObject.partTitle.exitEditMode()
  }

  function drawBackground () {
    if (thisObject.isOnFocus === false) {
      drawConnectingLine()
      thisObject.menu.drawBackground()
    }
  }

  function drawMiddleground () {
    if (thisObject.isOnFocus === false) {
      drawText()
      thisObject.partTitle.draw()
    }
  }

  function drawForeground () {
    if (thisObject.isOnFocus === false) {
      drawBodyAndPicture()
      thisObject.menu.drawForeground()
    }
  }

  function drawOnFocus () {
    if (thisObject.isOnFocus === true) {
      drawConnectingLine()
      thisObject.menu.drawBackground()

      if (thisObject.codeEditor !== undefined) {
        thisObject.codeEditor.drawBackground()
        thisObject.codeEditor.drawForeground()
      }

      drawText()
      thisObject.partTitle.draw()

      if (thisObject.codeEditor !== undefined) {
        if (thisObject.codeEditor.visible === false) {
          drawBodyAndPicture()
          thisObject.menu.drawForeground()
        }
      } else {
        drawBodyAndPicture()
        thisObject.menu.drawForeground()
      }
    }
  }

  function drawConnectingLine () {
    if (thisObject.payload.chainParent === undefined) { return }

    let targetPoint = {
      x: thisObject.payload.targetPosition.x,
      y: thisObject.payload.targetPosition.y
    }

    let position = {
      x: 0,
      y: 0
    }

    targetPoint = canvas.floatingSpace.container.frame.frameThisPoint(targetPoint)
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

    if (thisObject.container.frame.radius > 0.5) {
            /* Target Spot */

      let radius = 1

      browserCanvasContext.beginPath()
      browserCanvasContext.arc(targetPoint.x, targetPoint.y, radius, 0, Math.PI * 2, true)
      browserCanvasContext.closePath()
      browserCanvasContext.fillStyle = 'rgba(30, 30, 30, 1)'
      browserCanvasContext.fill()
    }
  }

  function drawText () {
/* Text Follows */
    let position = {
      x: 0,
      y: 0
    }

    position = thisObject.container.frame.frameThisPoint(position)

    let radius = thisObject.container.frame.radius
            /* Label Text */
    let labelPoint
    let fontSize = thisObject.payload.floatingObject.currentFontSize
    let label

    if (radius > 6) {
      const MAX_LABEL_LENGTH = 30

      label = thisObject.payload.subTitle
      label = addIndexNumber(label)

      if (label !== undefined) {
        if (label.length > MAX_LABEL_LENGTH) {
          label = label.substring(0, MAX_LABEL_LENGTH) + '...'
        }

        labelPoint = {
          x: position.x - label.length / 2 * fontSize * FONT_ASPECT_RATIO - 5,
          y: position.y + radius * 2 / 3 + fontSize * FONT_ASPECT_RATIO + 15
        }

        browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
        browserCanvasContext.fillStyle = thisObject.payload.floatingObject.labelStrokeStyle
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
      }
    }
  }

  function addIndexNumber (label) {
    switch (thisObject.payload.node.type) {
      case 'Phase': {
        let parent = thisObject.payload.parentNode
        for (let i = 0; i < parent.phases.length; i++) {
          let phase = parent.phases[i]
          if (phase.id === thisObject.payload.node.id) {
            label = label + ' #' + (i + 1)
            return label
          }
        }
        break
      }
      case 'Situation': {
        let parent = thisObject.payload.parentNode
        for (let i = 0; i < parent.situations.length; i++) {
          let situation = parent.situations[i]
          if (situation.id === thisObject.payload.node.id) {
            label = label + ' #' + (i + 1)
            return label
          }
        }
        break
      }
      case 'Condition': {
        let parent = thisObject.payload.parentNode
        for (let i = 0; i < parent.conditions.length; i++) {
          let condition = parent.conditions[i]
          if (condition.id === thisObject.payload.node.id) {
            label = label + ' #' + (i + 1)
            return label
          }
        }
        break
      }
      default: {
        return label
      }
    }
  }

  function drawBodyAndPicture () {
    let position = {
      x: thisObject.container.frame.position.x,
      y: thisObject.container.frame.position.y
    }

    position = thisObject.container.frame.frameThisPoint(position)

    let radius = thisObject.container.frame.radius

    if (radius > 0.5) {
      const VISIBLE_RADIUS = 5

      let visiblePosition = {
        x: thisObject.container.frame.position.x,
        y: thisObject.container.frame.position.y
      }

      visiblePosition = thisObject.container.frame.frameThisPoint(visiblePosition)
      visiblePosition = thisObject.fitFunction(visiblePosition)

      browserCanvasContext.beginPath()
      browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
      browserCanvasContext.closePath()

      browserCanvasContext.fillStyle = thisObject.payload.floatingObject.fillStyle

      browserCanvasContext.fill()

      browserCanvasContext.beginPath()
      browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS / 2, 0, Math.PI * 2, true)
      browserCanvasContext.closePath()

      browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.BLACK + ', 1)'

      browserCanvasContext.fill()
    }

        /* Image */

    if (icon !== undefined) {
      if (icon.canDrawIcon === true) {
        browserCanvasContext.drawImage(
          icon, position.x - thisObject.payload.floatingObject.currentImageSize / 2,
          position.y - thisObject.payload.floatingObject.currentImageSize / 2,
          thisObject.payload.floatingObject.currentImageSize,
          thisObject.payload.floatingObject.currentImageSize)
      }
    }
  }
}
