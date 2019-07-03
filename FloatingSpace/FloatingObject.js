
function newFloatingObject () {
  const MODULE_NAME = 'Floating Object'
  const ERROR_LOG = true

  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    fitFunction: undefined,
    container: undefined,
    positionLocked: false,
    isOnFocus: false,
    payload: undefined,                     // This is a reference to an object controlled by a Plotter. The plotter can change its internal value and we will see them from here.
    type: undefined,                        // Currently there are two types of Floating Objects: Profile Balls, and Notes.
    currentSpeed: 0,                        // This is the current speed of the floating object.
    currentMass: 0,                         // This is the current mass of the floating object, including its zoom applied.
    friction: 0,                            // This is a factor that will ultimatelly desacelerate the floating object.
    targetFriction: 0,
    rawMass: 0,                             // This is the mass value without zoom.
    rawRadius: 0,                           // This is the radius of this floating object without zoom.
    targetRadius: 0,                        // This is the target radius of the floating object with zoom applied. It should be animated until reaching this value.
    isPinned: false,
    isFrozen: false,
    isTensed: false,
    frozenManually: false,
    getPinStatus: getPinStatus,
    getFreezeStatus: getFreezeStatus,
    getTensionStatus: getTensionStatus,
    nearbyFloatingObjects: [],
    setPosition: setPosition,
    pinToggle: pinToggle,
    freezeToggle: freezeToggle,
    tensionToggle: tensionToggle,
    physics: physics,
    initializeMass: initializeMass,
    initializeRadius: initializeRadius,
    initializeImageSize: initializeImageSize,
    initializeFontSize: initializeFontSize,
    initializeCurrentPosition: initializeCurrentPosition,
    radomizeCurrentSpeed: radomizeCurrentSpeed,
    drawBackground: drawBackground,
    drawMiddleground: drawMiddleground,
    drawForeground: drawForeground,
    drawOnFocus: drawOnFocus,
    updateMass: updateMass,                 // Function to update the mass when the zoom level changed.
    updateRadius: updateRadius,             // Function to update the radius when the zoom level changed.
    getContainer: getContainer,
    finalize: finalize,
    initialize: initialize
  }

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME, 'Circle')
  thisObject.container.isClickeable = true
  thisObject.container.isDraggeable = true
  thisObject.container.detectMouseOver = true
  thisObject.container.frame.radius = 0
  thisObject.container.frame.position.x = 0
  thisObject.container.frame.position.y = 0

  let selfMouseOverEventSubscriptionId
  let selfMouseClickEventSubscriptionId
  let spaceMouseOverEventSubscriptionId
  let spaceFocusAquiredEventSubscriptionId

  return thisObject

  function finalize () {
    thisObject.container.eventHandler.stopListening(selfMouseOverEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(selfMouseClickEventSubscriptionId)
    canvas.floatingSpace.container.eventHandler.stopListening(spaceMouseOverEventSubscriptionId)
    canvas.floatingSpace.container.eventHandler.stopListening(spaceFocusAquiredEventSubscriptionId)

    thisObject.container.finalize()
    thisObject.container = undefined
    thisObject.payload = undefined
    thisObject.fitFunction = undefined
    thisObject.nearbyFloatingObjects = undefined
  }

  function initialize (type, payload) {
    thisObject.payload = payload
    thisObject.type = type

    selfMouseOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)
    selfMouseClickEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseClick', onMouseClick)

      /* To consider that this object lost the focus, we monitor the space for 2 key events */
    spaceMouseOverEventSubscriptionId = canvas.floatingSpace.container.eventHandler.listenToEvent('onMouseOver', mouseOverFlotingSpace)
    spaceFocusAquiredEventSubscriptionId = canvas.floatingSpace.container.eventHandler.listenToEvent('onFocusAquired', someoneAquiredFocus)

    /* Assign a position and speed */

    thisObject.initializeCurrentPosition(thisObject.payload.targetPosition)
    thisObject.radomizeCurrentSpeed()
  }

  function getContainer (point) {
    let container

    container = thisObject.payload.uiObject.getContainer(point)
    if (container !== undefined) { return container }

    if (thisObject.container.frame.isThisScreenPointHere(point) === true) {
      return thisObject.container
    } else {
      return undefined
    }
  }

  function getPinStatus () {
    return thisObject.isPinned
  }

  function pinToggle () {
    if (thisObject.isPinned !== true) {
      thisObject.isPinned = true
      thisObject.positionLocked = true
    } else {
      thisObject.isPinned = false
    }
    return thisObject.isPinned
  }

  function getFreezeStatus () {
    return thisObject.isFrozen
  }

  function getTensionStatus () {
    return thisObject.isTensed
  }

  function freezeToggle () {
    if (thisObject.isFrozen !== true) {
      thisObject.isFrozen = true
      thisObject.frozenManually = true
    } else {
      thisObject.isFrozen = false
      thisObject.frozenManually = false
    }
    return thisObject.isFrozen
  }

  function tensionToggle () {
    if (thisObject.isTensed !== true) {
      thisObject.isTensed = true
      thisObject.tensedManually = true
    } else {
      thisObject.isTensed = false
      thisObject.tensedManually = false
    }
    return thisObject.isTensed
  }

  function physics () {
    thisObjectPhysics()
    thisObject.payload.uiObject.physics()
    frozenPhysics()
    tensionPhysics()
  }

  function frozenPhysics () {
    if (thisObject.frozenManually === false) {
      let parent = thisObject.payload.chainParent
      if (parent !== undefined) {
        thisObject.isFrozen = parent.payload.floatingObject.isFrozen
      }
    }
  }

  function tensionPhysics () {
    /* Tension Inheritance */
    if (thisObject.tensedManually === false) {
      let parent = thisObject.payload.chainParent
      if (parent !== undefined) {
        thisObject.isTensed = parent.payload.floatingObject.isTensed
      }
    }

    /* Tension Effect */
    if (thisObject.isTensed === true) {
      let parent = thisObject.payload.chainParent
      if (parent !== undefined) {
        let distanceToChainParent = Math.sqrt(Math.pow(parent.payload.position.x - thisObject.container.frame.position.x, 2) + Math.pow(parent.payload.position.y - thisObject.container.frame.position.y, 2))  // ... we calculate the distance ...
        let parentChildren = canvas.strategySpace.workspace.nodeChildren.childrenCount(parent, thisObject.payload.node)
        let axisCount = parentChildren.childrenCount
        let axisIndex = parentChildren.childIndex

        if (parent.payload.chainParent !== undefined) {
          axisCount++
          axisIndex++
        }

        let angleStep = 360 / axisCount
        let myAngle = axisIndex * axisCount

        thisObject.container.frame.position.x = parent.payload.position.x + distanceToChainParent * Math.cos(toRadians(myAngle))
        thisObject.container.frame.position.y = parent.payload.position.y + distanceToChainParent * Math.sin(toRadians(myAngle))
      }
    }
  }

  function thisObjectPhysics () {
                           // The radius also have a target.

    if (Math.abs(thisObject.container.frame.radius - thisObject.targetRadius) >= 15) {
      if (thisObject.container.frame.radius < thisObject.targetRadius) {
        thisObject.container.frame.radius = thisObject.container.frame.radius + 15
      } else {
        thisObject.container.frame.radius = thisObject.container.frame.radius - 15
      }
      thisObject.container.eventHandler.raiseEvent('Dimmensions Changed', event)
    }

                           // The imageSize also have a target.

    if (Math.abs(thisObject.currentImageSize - thisObject.targetImageSize) >= 10) {
      if (thisObject.currentImageSize < thisObject.targetImageSize) {
        thisObject.currentImageSize = thisObject.currentImageSize + 10
      } else {
        thisObject.currentImageSize = thisObject.currentImageSize - 10
      }
    }

                           // The fontSize also have a target.

    if (Math.abs(thisObject.currentFontSize - thisObject.targetFontSize) >= 1) {
      if (thisObject.currentFontSize < thisObject.targetFontSize) {
        thisObject.currentFontSize = thisObject.currentFontSize + 1
      } else {
        thisObject.currentFontSize = thisObject.currentFontSize - 1
      }
    }

    /* Floating object position in screen coordinates */

    thisObject.payload.position.x = thisObject.container.frame.position.x
    thisObject.payload.position.y = thisObject.container.frame.position.y
  }

  function onMouseOver (point) {
    if (thisObject.isOnFocus === false) {
      thisObject.targetRadius = thisObject.rawRadius * 6.0
      thisObject.targetImageSize = thisObject.rawImageSize * 2.0
      thisObject.targetFontSize = thisObject.rawFontSize * 2.0

      thisObject.payload.uiObject.container.eventHandler.raiseEvent('onFocus', point)

      thisObject.positionLocked = true

      canvas.floatingSpace.container.eventHandler.raiseEvent('onFocusAquired', thisObject.container)
      thisObject.isOnFocus = true
    }
  }

  function mouseOverFlotingSpace (point) {
    removeFocus()
  }

  function someoneAquiredFocus (container) {
    if (container.id !== thisObject.container.id) {
      removeFocus()
    }
  }

  function removeFocus () {
    if (thisObject.isOnFocus === true) {
      thisObject.targetRadius = thisObject.rawRadius * 1
      thisObject.targetImageSize = thisObject.rawImageSize * 1
      thisObject.targetFontSize = thisObject.rawFontSize * 1

      thisObject.payload.uiObject.container.eventHandler.raiseEvent('onNotFocus')

      if (thisObject.isPinned !== true) {
        thisObject.positionLocked = false
      }
      thisObject.isOnFocus = false
    }
  }

  function onMouseClick (pPoint) {
    let event = {
      point: pPoint,
      parent: thisObject
    }
    thisObject.payload.uiObject.container.eventHandler.raiseEvent('onMouseClick', event)
  }

  function drawBackground () {
    thisObject.payload.uiObject.drawBackground()
  }

  function drawMiddleground () {
    thisObject.payload.uiObject.drawMiddleground()
  }

  function drawForeground () {
    thisObject.payload.uiObject.drawForeground()
  }

  function drawOnFocus () {
    thisObject.payload.uiObject.drawOnFocus()
  }

  function initializeMass (suggestedValue) {
    let mass = suggestedValue
    if (mass < 0.1) {
      mass = 0.1
    }

    thisObject.rawMass = mass
    thisObject.currentMass = mass
  }

  function initializeRadius (suggestedValue) {
    let radius = suggestedValue
    if (radius < 2) {
      radius = 2
    }

    thisObject.rawRadius = radius
    thisObject.targetRadius = radius
    thisObject.container.frame.radius = radius / 3

    thisObject.container.eventHandler.raiseEvent('Dimmensions Changed', event)
  }

  function initializeImageSize (suggestedValue) {
    var size = suggestedValue
    if (size < 2) {
      size = 2
    }

    thisObject.rawImageSize = size
    thisObject.targetImageSize = size
    thisObject.currentImageSize = size / 3
  }

  function initializeFontSize (suggestedValue) {
    var size = suggestedValue
    if (size < 3) {
      size = 3
    }

    thisObject.rawFontSize = size
    thisObject.targetFontSize = size
    thisObject.currentFontSize = size / 3
  }

  function initializeCurrentPosition (arroundPoint) {
    let position = {}

    if (thisObject.payload.position === undefined) {
      if (thisObject.payload.chainParent !== undefined) {
        position.x = thisObject.payload.chainParent.payload.position.x + 250
        if (thisObject.payload.node.type === thisObject.payload.chainParent.type) {
          position.y = thisObject.payload.chainParent.payload.position.y
        } else {
          position.y = thisObject.payload.chainParent.payload.position.y + Math.floor((Math.random() * (1000) - 500))
        }
      } else {
        position = {
          x: Math.floor((Math.random() * (200) - 100)) + arroundPoint.x,
          y: Math.floor((Math.random() * (200) - 100)) + arroundPoint.y
        }
      }
    } else {
      position = {
        x: thisObject.payload.position.x,
        y: thisObject.payload.position.y
      }
    }

    setPosition(position)
  }

  function setPosition (position) {
    thisObject.container.frame.position.x = position.x
    thisObject.container.frame.position.y = position.y

    thisObject.payload.position = {}
    thisObject.payload.position.x = position.x
    thisObject.payload.position.y = position.y
  }

  function radomizeCurrentSpeed () {
    var initialXDirection
    var randomX = Math.floor((Math.random() * 10) + 1)
    if (randomX > 5) {
      initialXDirection = 1
    } else {
      initialXDirection = -1
    }

    var initialYDirection
    var randomY = Math.floor((Math.random() * 10) + 1)
    if (randomY > 5) {
      initialYDirection = 1
    } else {
      initialYDirection = -1
    }

    var velocity = {
      x: initialXDirection * Math.floor((Math.random() * 300) + 1) / 100,
      y: initialYDirection * Math.floor((Math.random() * 300) + 1) / 100
    }

    thisObject.currentSpeed = velocity
  }

  function updateMass () {

  }

  function updateRadius () {
  }
}
