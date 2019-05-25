
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
    isExecuting: undefined,
    isRunning: undefined,
    run: run,
    getReadyToAttach: getReadyToAttach,
    showAvailabilityToAttach: showAvailabilityToAttach,
    highlight: highlight,
    unHighlight: unHighlight,
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
  let executingIcon

  let selfFocusEventSubscriptionId
  let selfNotFocuskEventSubscriptionId
  let selfDisplaceEventSubscriptionId
  let selfDragStartedEventSubscriptionId
  let selfDragFinishedEventSubscriptionId

  let isHighlighted
  let highlightCounter = 0
  let runningCounter = 0

  let previousDistance

  let readyToAttachDisplayCounter = 5
  let readyToAttachDisplayIncrement = 0.1

  let readyToAttachCounter = 0
  let isReadyToAttach
  let availableToAttachCounter = 0
  let isAvailableToAttach

  let isAttaching = false
  let isDragging = false
  let attachToNode

  return thisObject

  function finalize () {
    thisObject.container.eventHandler.stopListening(selfFocusEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(selfNotFocuskEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(selfDisplaceEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(selfDragStartedEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(selfDragFinishedEventSubscriptionId)

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
    attachToNode = undefined
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
    selfDragStartedEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onDragStarted', onDragStarted)
    selfDragFinishedEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onDragFinished', onDragFinished)
  }

  function getContainer (point) {
    let container

    if (isDragging === false && thisObject.isOnFocus === true) {
      if (thisObject.codeEditor !== undefined) {
        container = thisObject.codeEditor.getContainer(point)
        if (container !== undefined) { return container }
      }

      container = thisObject.partTitle.getContainer(point)
      if (container !== undefined) { return container }

      container = thisObject.menu.getContainer(point)
      if (container !== undefined) { return container }
    }

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
      thisObject.payload.targetPosition.x = thisObject.payload.position.x,
      thisObject.payload.targetPosition.y = thisObject.payload.position.y
    } else {
      thisObject.payload.targetPosition.x = thisObject.payload.chainParent.payload.position.x
      thisObject.payload.targetPosition.y = thisObject.payload.chainParent.payload.position.y
    }

    iconPhysics()
    runningPhisycs()
    highlightPhisycs()
    detachingPhysics()
    attachingPhysics()
  }

  function attachingPhysics () {
    attacchingCounters()

    if (thisObject.isOnFocus !== true) { return }
    if (isDragging !== true) { return }
    if (thisObject.payload.chainParent !== undefined) { return }

    let nearbyFloatingObjects = thisObject.payload.floatingObject.nearbyFloatingObjects
    let compatibleType
    let compatibleSubType
    switch (thisObject.payload.node.type) {
      case 'Strategy':
        compatibleType = 'Trading System'
        compatibleSubType = undefined
        break
      case 'Phase':
        compatibleType = 'Stop' + '.' + 'Take Profit' + '.' + 'Phase'
        compatibleSubType = undefined
        break
      case 'Situation':
        compatibleType = 'Phase' + '.' + 'Take Position Event' + '.' + 'Trigger On Event' + '.' + 'Trigger Off Event'
        compatibleSubType = undefined
        break
      case 'Condition':
        compatibleType = 'Situation'
        compatibleSubType = undefined
        break
      default:
        return
    }
    let foundCompatible = false
    attachToNode = undefined
    isAttaching = false

    for (let i = 0; i < nearbyFloatingObjects.length; i++) {
      let nearby = nearbyFloatingObjects[i]
      let distance = nearby[0]
      let floatingObject = nearby[1]
      let nearbyNode = floatingObject.payload.node
      if (compatibleType.indexOf(nearbyNode.type) >= 0) {
        if (thisObject.payload.node.type === 'Phase' && nearbyNode.type === 'Phase' && nearbyNode.payload.parentNode === undefined) { continue }
        if (foundCompatible === false) {
          if (distance < thisObject.container.frame.radius * 1.5 + floatingObject.container.frame.radius * 1.5) {
            nearbyNode.payload.uiObject.getReadyToAttach()
            isAttaching = true
            attachToNode = nearbyNode
            foundCompatible = true
          }
        }
        nearbyNode.payload.uiObject.showAvailabilityToAttach()
      }
    }
  }

  function attacchingCounters () {
    if (readyToAttachDisplayCounter > 15) {
      readyToAttachDisplayIncrement = -0.25
    }

    if (readyToAttachDisplayCounter < 5) {
      readyToAttachDisplayIncrement = 0.25
    }

    readyToAttachDisplayCounter = readyToAttachDisplayCounter + readyToAttachDisplayIncrement

    readyToAttachCounter--
    if (readyToAttachCounter <= 0) {
      readyToAttachCounter = 0
      isReadyToAttach = false
    } else {
      isReadyToAttach = true
    }

    availableToAttachCounter--
    if (availableToAttachCounter <= 0) {
      availableToAttachCounter = 0
      isAvailableToAttach = false
    } else {
      isAvailableToAttach = true
    }
  }

  function getReadyToAttach () {
    readyToAttachCounter = 10
  }

  function showAvailabilityToAttach () {
    availableToAttachCounter = 10
  }

  function detachingPhysics () {
    if (isDragging !== true) { return }

    let distanceToChainParent = Math.sqrt(Math.pow(thisObject.payload.position.x - thisObject.payload.targetPosition.x, 2) + Math.pow(thisObject.payload.position.y - thisObject.payload.targetPosition.y, 2))
    let ratio = distanceToChainParent / previousDistance
    previousDistance = distanceToChainParent
    if (thisObject.isOnFocus !== true) { return }
    if (thisObject.payload.chainParent === undefined) { return }
    if (thisObject.payload.parentNode === undefined) { return }

    let THRESHOLD = 1.15

    if (previousDistance !== undefined) {
      if (ratio > THRESHOLD) {
        canvas.strategySpace.workspace.detachNode(thisObject.payload.node)
      }
    }
  }

  function highlightPhisycs () {
    highlightCounter--
    if (highlightCounter < 0) {
      highlightCounter = 0
      isHighlighted = false
    }
  }

  function highlight () {
    isHighlighted = true
    highlightCounter = 30
  }

  function unHighlight () {
    // isHighlighted = false
    // highlightCounter = 0
  }

  function runningPhisycs () {
    if (canvas.strategySpace.workspace.tradingSystem !== undefined) {
      if (canvas.strategySpace.workspace.tradingSystem.id !== thisObject.payload.node.id) {
        runningCounter--
      }
    }

    if (runningCounter < 0) {
      runningCounter = 0
      thisObject.isRunning = false
    }
  }

  function run () {
    canvas.strategySpace.workspace.tradingSystem = thisObject.payload.node
    canvas.cockpitSpace.restartSimulation.restart()
    thisObject.isRunning = true
    runningCounter = 30
  }

  function iconPhysics () {
    icon = canvas.strategySpace.iconByPartType.get(thisObject.payload.node.type)
    executingIcon = canvas.strategySpace.iconCollection.get('attractive')
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

  function onDragStarted (event) {
    thisObject.partTitle.exitEditMode()
    if (thisObject.codeEditor !== undefined) {
      thisObject.codeEditor.deactivate()
    }
    isDragging = true
  }

  function onDragFinished (event) {
    if (isAttaching === true) {
      canvas.strategySpace.workspace.attachNode(thisObject.payload.node, attachToNode)
    }
    isDragging = false
  }

  function drawBackground () {
    if (thisObject.isOnFocus === false) {
      drawConnectingLine()

      if (isDragging === false && thisObject.isOnFocus === true) {
        thisObject.menu.drawBackground()
      }
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
      if (isDragging === false) {
        thisObject.menu.drawForeground()
      }
    }
  }

  function drawOnFocus () {
    if (thisObject.isOnFocus === true) {
      drawConnectingLine()

      if (thisObject.codeEditor !== undefined) {
        thisObject.codeEditor.drawBackground()
        thisObject.codeEditor.drawForeground()
      }

      drawText()
      thisObject.partTitle.draw()

      if (thisObject.codeEditor !== undefined) {
        if (thisObject.codeEditor.visible === false) {
          drawBodyAndPicture()
          if (isDragging === false) {
            thisObject.menu.drawBackground()
            thisObject.menu.drawForeground()
          }
        }
      } else {
        drawBodyAndPicture()
        if (isDragging === false) {
          thisObject.menu.drawBackground()
          thisObject.menu.drawForeground()
        }
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
      browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', 1)'
      browserCanvasContext.setLineDash([3, 4])
      browserCanvasContext.lineWidth = 2
      browserCanvasContext.stroke()
      browserCanvasContext.setLineDash([0, 0])
    }

    if (thisObject.container.frame.radius > 0.5) {
            /* Target Spot */

      let radius = 1

      browserCanvasContext.beginPath()
      browserCanvasContext.arc(targetPoint.x, targetPoint.y, radius, 0, Math.PI * 2, true)
      browserCanvasContext.closePath()
      browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'
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
      const MAX_LABEL_LENGTH = 20

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
        if (parent !== undefined) {
          for (let i = 0; i < parent.phases.length; i++) {
            let phase = parent.phases[i]
            if (phase.id === thisObject.payload.node.id) {
              label = label + ' #' + (i + 1)
              return label
            }
          }
        } else {
          return label
        }

        break
      }
      case 'Situation': {
        let parent = thisObject.payload.parentNode
        if (parent !== undefined) {
          for (let i = 0; i < parent.situations.length; i++) {
            let situation = parent.situations[i]
            if (situation.id === thisObject.payload.node.id) {
              label = label + ' #' + (i + 1)
              return label
            }
          }
        } else {
          return label
        }

        break
      }
      case 'Condition': {
        let parent = thisObject.payload.parentNode
        if (parent !== undefined) {
          for (let i = 0; i < parent.conditions.length; i++) {
            let condition = parent.conditions[i]
            if (condition.id === thisObject.payload.node.id) {
              label = label + ' #' + (i + 1)
              return label
            }
          }
        } else {
          return label
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
      let VISIBLE_RADIUS = 5

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
      browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS - 2, 0, Math.PI * 2, true)
      browserCanvasContext.closePath()

      browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.BLACK + ', 1)'

      browserCanvasContext.fill()

      if (thisObject.isRunning === true) {
        VISIBLE_RADIUS = thisObject.container.frame.radius * 2
        let OPACITY = runningCounter / 30

        browserCanvasContext.beginPath()
        browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
        browserCanvasContext.closePath()

        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', ' + OPACITY + ')'

        browserCanvasContext.lineWidth = 10
        browserCanvasContext.setLineDash([4, 20])
        browserCanvasContext.stroke()
      }

      if (isHighlighted === true) {
        VISIBLE_RADIUS = thisObject.container.frame.radius
        let OPACITY = highlightCounter / 30

        browserCanvasContext.beginPath()
        browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
        browserCanvasContext.closePath()

        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + OPACITY + ')'

        browserCanvasContext.lineWidth = 10
        browserCanvasContext.setLineDash([4, 20])
        browserCanvasContext.stroke()
      }

      if (isReadyToAttach === true) {
        VISIBLE_RADIUS = thisObject.container.frame.radius * 2 + readyToAttachDisplayCounter * 2
        let OPACITY = readyToAttachCounter / 10

        browserCanvasContext.beginPath()
        browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
        browserCanvasContext.closePath()

        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + OPACITY + ')'

        browserCanvasContext.lineWidth = 10
        browserCanvasContext.setLineDash([readyToAttachDisplayCounter, readyToAttachDisplayCounter * 2])
        browserCanvasContext.stroke()
      }

      if (isAvailableToAttach === true && isReadyToAttach === false) {
        VISIBLE_RADIUS = thisObject.container.frame.radius * 1.5
        let OPACITY = availableToAttachCounter / 10

        browserCanvasContext.beginPath()
        browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
        browserCanvasContext.closePath()

        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TURQUOISE + ', ' + OPACITY + ')'

        browserCanvasContext.lineWidth = 10
        browserCanvasContext.setLineDash([8, 20])
        browserCanvasContext.stroke()
      }
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

    if (executingIcon !== undefined) {
      if (executingIcon.canDrawIcon === true) {
        if (thisObject.isExecuting === true) {
          const DISTANCE_FROM_CENTER = thisObject.container.frame.radius / 3 + 50
          const EXECUTING_ICON_SIZE = 20 + thisObject.container.frame.radius / 6

          browserCanvasContext.drawImage(
            executingIcon, position.x - EXECUTING_ICON_SIZE / 2,
            position.y - EXECUTING_ICON_SIZE / 2 - DISTANCE_FROM_CENTER,
            EXECUTING_ICON_SIZE,
            EXECUTING_ICON_SIZE)
        }
      }
    }
  }
}
