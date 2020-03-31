
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
    angleToParent: ANGLE_TO_PARENT.RANGE_90,
    distanceToParent: DISTANCE_TO_PARENT.PARENT_100X,
    isCollapsed: false,
    isParentCollapsed: false,
    frozenManually: false,
    collapsedManually: false,
    getPinStatus: getPinStatus,
    getFreezeStatus: getFreezeStatus,
    getCollapseStatus: getCollapseStatus,
    getAngleToParent: getAngleToParent,
    getDistanceToParent: getDistanceToParent,
    nearbyFloatingObjects: [],
    setPosition: setPosition,
    pinToggle: pinToggle,
    freezeToggle: freezeToggle,
    collapseToggle: collapseToggle,
    angleToParentToggle: angleToParentToggle,
    distanceToParentToggle: distanceToParentToggle,
    physics: physics,
    invisiblePhysics: invisiblePhysics,
    initializeMass: initializeMass,
    initializeRadius: initializeRadius,
    initializeImageSize: initializeImageSize,
    initializeFontSize: initializeFontSize,
    initializeHierarchyRing: initializeHierarchyRing,
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
  let lastParentAngle

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
    if (thisObject.payload === undefined) { return }
    if ((thisObject.isCollapsed === true && thisObject.collapsedManually === false) || thisObject.isParentCollapsed === true) { return }
    if (canvas.floatingSpace.inMapMode === true) { return }
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

  function getCollapseStatus () {
    return thisObject.isCollapsed
  }

  function getAngleToParent () {
    return thisObject.angleToParent
  }

  function getDistanceToParent () {
    return thisObject.distanceToParent
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

  function collapseToggle () {
    if (thisObject.isCollapsed !== true) {
      thisObject.isCollapsed = true
      thisObject.collapsedManually = true
    } else {
      thisObject.isCollapsed = false
      thisObject.collapsedManually = false
    }
    return thisObject.isCollapsed
  }

  function angleToParentToggle () {
    switch (thisObject.angleToParent) {
      case ANGLE_TO_PARENT.NOT_FIXED:
        thisObject.angleToParent = ANGLE_TO_PARENT.RANGE_360
        break
      case ANGLE_TO_PARENT.RANGE_360:
        thisObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
        break
      case ANGLE_TO_PARENT.RANGE_180:
        thisObject.angleToParent = ANGLE_TO_PARENT.RANGE_90
        break
      case ANGLE_TO_PARENT.RANGE_90:
        thisObject.angleToParent = ANGLE_TO_PARENT.RANGE_45
        break
      case ANGLE_TO_PARENT.RANGE_45:
        thisObject.angleToParent = ANGLE_TO_PARENT.NOT_FIXED
        break
    }

    return thisObject.angleToParent
  }

  function distanceToParentToggle () {
    switch (thisObject.distanceToParent) {
      case DISTANCE_TO_PARENT.NOT_FIXED:
        thisObject.distanceToParent = DISTANCE_TO_PARENT.PARENT_025X
        break
      case DISTANCE_TO_PARENT.PARENT_025X:
        thisObject.distanceToParent = DISTANCE_TO_PARENT.PARENT_050X
        break
      case DISTANCE_TO_PARENT.PARENT_050X:
        thisObject.distanceToParent = DISTANCE_TO_PARENT.PARENT_100X
        break
      case DISTANCE_TO_PARENT.PARENT_100X:
        thisObject.distanceToParent = DISTANCE_TO_PARENT.PARENT_150X
        break
      case DISTANCE_TO_PARENT.PARENT_150X:
        thisObject.distanceToParent = DISTANCE_TO_PARENT.PARENT_200X
        break
      case DISTANCE_TO_PARENT.PARENT_200X:
        thisObject.distanceToParent = DISTANCE_TO_PARENT.NOT_FIXED
        break
    }

    return thisObject.distanceToParent
  }

  function invisiblePhysics () {
    if (thisObject.payload.uiObject !== undefined) {
      thisObject.payload.uiObject.invisiblePhysics()
    }
  }

  function physics () {
    frozenPhysics()
    /* From here on, only if they are not too far. */
    if (canvas.floatingSpace.isItFar(thisObject.payload)) { return }
    thisObjectPhysics()
    if (thisObject.payload.uiObject !== undefined) {
      thisObject.payload.uiObject.physics()
    }
    positionContraintsPhysics()
  }

  function frozenPhysics () {
    if (thisObject.frozenManually !== false) { return }
    if (thisObject.payload === undefined) { return }
    let parent = thisObject.payload.chainParent
    if (parent !== undefined) {
      if (parent.payload !== undefined) {
        if (parent.payload.floatingObject !== undefined) {
          thisObject.isFrozen = parent.payload.floatingObject.isFrozen
        }
      }
    }
  }

  function positionContraintsPhysics () {
    if (thisObject.angleToParent !== ANGLE_TO_PARENT.NOT_FIXED && thisObject.isOnFocus !== true) {
      let parent = thisObject.payload.chainParent
      if (parent === undefined) { return }
      if (parent.payload === undefined) { return }
      if (parent.payload.position === undefined) { return }

      let distanceToParent = Math.sqrt(Math.pow(parent.payload.position.x - thisObject.container.frame.position.x, 2) + Math.pow(parent.payload.position.y - thisObject.container.frame.position.y, 2))  // ... we calculate the distance ...
      let parentChildren = canvas.designSpace.workspace.nodeChildren.childrenCount(parent, thisObject.payload.node)
      let axisCount = parentChildren.childrenCount
      let axisIndex = parentChildren.childIndex
      let baseAngle = 0
      let angleToParentAngle

      if (parent.payload.distance !== undefined) {
        switch (thisObject.distanceToParent) {
          case DISTANCE_TO_PARENT.PARENT_025X:
            distanceToParent = parent.payload.distance / 4
            break
          case DISTANCE_TO_PARENT.PARENT_050X:
            distanceToParent = parent.payload.distance / 2
            break
          case DISTANCE_TO_PARENT.PARENT_100X:
            distanceToParent = parent.payload.distance
            break
          case DISTANCE_TO_PARENT.PARENT_150X:
            distanceToParent = parent.payload.distance * 1.5
            break
          case DISTANCE_TO_PARENT.PARENT_200X:
            distanceToParent = parent.payload.distance * 2
            break
        }
      }

      switch (thisObject.angleToParent) {
        case ANGLE_TO_PARENT.RANGE_360:
          angleToParentAngle = 360
          break
        case ANGLE_TO_PARENT.RANGE_180:
          angleToParentAngle = 180
          break
        case ANGLE_TO_PARENT.RANGE_90:
          angleToParentAngle = 90
          break
        case ANGLE_TO_PARENT.RANGE_45:
          angleToParentAngle = 45
          break
      }

      if (axisIndex === undefined) {
        axisCount = 1
        axisIndex = axisCount
      }

      if (parent.payload.chainParent !== undefined && parent.payload.angle !== undefined) {
        axisCount++
        axisIndex++
        baseAngle = parent.payload.angle + 180
        lastParentAngle = parent.payload.angle
      } else {
        if (lastParentAngle !== undefined) {
          axisCount++
          axisIndex++
          baseAngle = lastParentAngle + 180
        }
      }

      let separatorAngle = (360 - angleToParentAngle) / 2
      let angleStep = angleToParentAngle / axisCount

      thisObject.payload.angle = baseAngle + separatorAngle + (axisIndex - 1) * angleStep
      if (thisObject.payload.angle >= 360) {
        thisObject.payload.angle = thisObject.payload.angle - 360
      }

      thisObject.payload.distance = distanceToParent

      if (distanceToParent > 3000 || thisObject.isPinned === true) { return } // this is introduced to avoid edges cases when importing workspaces.

      newPosition = {
        x: parent.payload.position.x + distanceToParent * Math.cos(toRadians(thisObject.payload.angle)),
        y: parent.payload.position.y + distanceToParent * Math.sin(toRadians(thisObject.payload.angle))
      }
      if (isNaN(newPosition.x) === false) {
        thisObject.container.frame.position.x = newPosition.x
      }
      if (isNaN(newPosition.y) === false) {
        thisObject.container.frame.position.y = newPosition.y
      }
    }
  }

  function thisObjectPhysics () {
                           // The radius also have a target.
    let ANIMATION_STEP = Math.abs(thisObject.targetRadius - thisObject.rawRadius) / 5

    if (ANIMATION_STEP === 0) { ANIMATION_STEP = 10 }

    if (Math.abs(thisObject.container.frame.radius - thisObject.targetRadius) >= ANIMATION_STEP) {
      if (thisObject.container.frame.radius < thisObject.targetRadius) {
        thisObject.container.frame.radius = thisObject.container.frame.radius + ANIMATION_STEP
      } else {
        thisObject.container.frame.radius = thisObject.container.frame.radius - ANIMATION_STEP
      }

      thisObject.container.eventHandler.raiseEvent('Dimmensions Changed', event)
    }

                           // The imageSize also have a target.

    if (Math.abs(thisObject.currentImageSize - thisObject.targetImageSize) >= ANIMATION_STEP) {
      if (thisObject.currentImageSize < thisObject.targetImageSize) {
        thisObject.currentImageSize = thisObject.currentImageSize + ANIMATION_STEP
      } else {
        thisObject.currentImageSize = thisObject.currentImageSize - ANIMATION_STEP
      }
    }

                           // The fontSize also have a target.

    if (Math.abs(thisObject.currentFontSize - thisObject.targetFontSize) >= ANIMATION_STEP / 10) {
      if (thisObject.currentFontSize < thisObject.targetFontSize) {
        thisObject.currentFontSize = thisObject.currentFontSize + ANIMATION_STEP / 10
      } else {
        thisObject.currentFontSize = thisObject.currentFontSize - ANIMATION_STEP / 10
      }
    }

    if (Math.abs(thisObject.currentHierarchyRing - thisObject.targetHierarchyRing) >= ANIMATION_STEP) {
      if (thisObject.currentHierarchyRing < thisObject.targetHierarchyRing) {
        thisObject.currentHierarchyRing = thisObject.currentHierarchyRing + ANIMATION_STEP
      } else {
        thisObject.currentHierarchyRing = thisObject.currentHierarchyRing - ANIMATION_STEP
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
      thisObject.targetHierarchyRing = thisObject.rawHierarchyRing * 8.0

      thisObject.payload.uiObject.container.eventHandler.raiseEvent('onFocus', point)

      thisObject.positionLocked = true

      canvas.floatingSpace.container.eventHandler.raiseEvent('onFocusAquired', thisObject)
      thisObject.isOnFocus = true
    }
  }

  function mouseOverFlotingSpace (point) {
    removeFocus()
  }

  function someoneAquiredFocus (floatingObject) {
    if (floatingObject === undefined || floatingObject.container === undefined) {
      return
    }
    if (thisObject.container === undefined) {
      return
    }
    if (floatingObject.container.id !== thisObject.container.id) {
      removeFocus()
    }
  }

  function removeFocus () {
    if (thisObject.payload === undefined) { return }
    if (thisObject.isOnFocus === true) {
      thisObject.targetRadius = thisObject.rawRadius * 1
      thisObject.targetImageSize = thisObject.rawImageSize * 1
      thisObject.targetFontSize = thisObject.rawFontSize * 1
      thisObject.targetHierarchyRing = thisObject.rawHierarchyRing * 1

      thisObject.payload.uiObject.container.eventHandler.raiseEvent('onNotFocus', thisObject.container)

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
    if (canvas.floatingSpace.isItFar(thisObject.payload)) { return }
    if ((thisObject.isCollapsed === true && thisObject.collapsedManually === false) || thisObject.isParentCollapsed === true) { return }
    thisObject.payload.uiObject.drawBackground()
  }

  function drawMiddleground () {
    if (canvas.floatingSpace.isItFar(thisObject.payload)) { return }
    if ((thisObject.isCollapsed === true && thisObject.collapsedManually === false) || thisObject.isParentCollapsed === true) { return }
    thisObject.payload.uiObject.drawMiddleground()
  }

  function drawForeground () {
    if (canvas.floatingSpace.isItFar(thisObject.payload)) { return }
    if ((thisObject.isCollapsed === true && thisObject.collapsedManually === false) || thisObject.isParentCollapsed === true) { return }
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
    thisObject.container.frame.radius = radius / 5

    thisObject.container.eventHandler.raiseEvent('Dimmensions Changed', event)
  }

  function initializeImageSize (suggestedValue) {
    let size = suggestedValue
    if (size < 2) {
      size = 2
    }

    thisObject.rawImageSize = size
    thisObject.targetImageSize = size
    thisObject.currentImageSize = size / 3
  }

  function initializeFontSize (suggestedValue) {
    let size = suggestedValue
    if (size < 3) {
      size = 3
    }

    thisObject.rawFontSize = size
    thisObject.targetFontSize = size
    thisObject.currentFontSize = size / 3
  }

  function initializeHierarchyRing (suggestedValue) {
    let radius = suggestedValue
    if (radius < 3) {
      radius = 3
    }

    thisObject.rawHierarchyRing = radius
    thisObject.targetHierarchyRing = radius
    thisObject.currentHierarchyRing = radius
  }

  function initializeCurrentPosition (arroundPoint) {
    let position = {}

    if (thisObject.payload.position === undefined) {
      position = {
        x: Math.floor((Math.random() * (200) - 100)) + arroundPoint.x,
        y: Math.floor((Math.random() * (200) - 100)) + arroundPoint.y
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
