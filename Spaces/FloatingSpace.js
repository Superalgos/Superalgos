
function newFloatingSpace () {
  const MODULE_NAME = 'Floating Space'
  const ERROR_LOG = true
   /*
   The Floating Space is the place where floating elements like floatingObjects, live and are rendered.
   This space has its own physics which helps with the animation of these objects and also preventing them to overlap.
   */

  let thisObject = {
    floatingLayer: undefined,               // This is the array of floatingObjects being displayed
    uiObjectConstructor: undefined,
    container: undefined,
    inMapMode: false,
    transformPoointToMap: transformPoointToMap,
    oneScreenUp: oneScreenUp,
    oneScreenDown: oneScreenDown,
    oneScreenLeft: oneScreenLeft,
    oneScreenRight: oneScreenRight,
    positionAtNode: positionAtNode,
    fitIntoVisibleArea: fitIntoVisibleArea,
    isThisPointVisible: isThisPointVisible,
    isItFar: isItFar,
    makeVisible: makeVisible,
    makeInvisible: makeInvisible,
    draw: draw,
    physics: physics,
    getContainer: getContainer,
    initialize: initialize,
    finalize: finalize
  }

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME)
  thisObject.container.isClickeable = false
  thisObject.container.isDraggeable = true
  thisObject.container.isWheelable = true
  thisObject.container.detectMouseOver = true
  thisObject.container.isClickeable = false
  thisObject.container.frame.radius = 0

  let devicePixelRatio = window.devicePixelRatio
  const SPACE_SIZE = 50000

  thisObject.container.frame.width = SPACE_SIZE
  thisObject.container.frame.height = SPACE_SIZE
  thisObject.container.frame.position.x = browserCanvas.width / 2 - thisObject.container.frame.width / 2
  thisObject.container.frame.position.y = browserCanvas.height / 2 - thisObject.container.frame.height / 2

  let visible = false

  const PERCENTAGE_OF_SCREEN_FOR_DISPLACEMENT = 25
  let eventSubscriptionId
  let onDragStartedEventSubscriptionId

  let doubleClickCounter = 0

  return thisObject

  function finalize () {
    thisObject.container.eventHandler.stopListening(eventSubscriptionId)
    thisObject.container.eventHandler.stopListening(onDragStartedEventSubscriptionId)

    thisObject.floatingLayer.finalize()
    thisObject.uiObjectConstructor.finalize()
    thisObject.container.finalize()

    thisObject.floatingLayer = undefined
    thisObject.uiObjectConstructor = undefined
    thisObject.container = undefined
  }

  function initialize (callBackFunction) {
    thisObject.floatingLayer = newFloatingLayer()
    thisObject.floatingLayer.initialize()

    thisObject.uiObjectConstructor = newUiObjectConstructor()
    thisObject.uiObjectConstructor.initialize(thisObject.floatingLayer)

    eventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseWheel', onMouseWheel)
    onDragStartedEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onDragStarted', onDragStarted)
  }

  function transformPoointToMap (point) {
    let returnPoint = {
      x: point.x - thisObject.container.frame.position.x,
      y: point.y - thisObject.container.frame.position.y
    }
    returnPoint.x = returnPoint.x / SPACE_SIZE * browserCanvas.width
    returnPoint.y = returnPoint.y / SPACE_SIZE * browserCanvas.height
    return returnPoint
  }

  function onDoubleClick () {
    doubleClickCounter = 0

    if (thisObject.inMapMode === false) {
      thisObject.inMapMode = true
    } else {
      thisObject.inMapMode = false
    }
    console.log(thisObject.inMapMode)
  }

  function onDragStarted (event) {
    if (doubleClickCounter > 0) {
      onDoubleClick()
      return
    } else {
      doubleClickCounter = 10
    }
  }

  function isItFar (payload, dontCheckParent) {
    /* If for any reason the paylaod is undefined we return false */
    if (payload === undefined) { return false }

    let radarFactor = 2 // How big is the margin

    /* If the chain parent is not far, they we dont consither this far. */
    if (dontCheckParent !== true) {
      if (payload.chainParent !== undefined) {
        if (isItFar(payload.chainParent.payload, true) === false) { return false }
      }
    }

    /* Exceptions that are never considered far. */
    if (
      payload.node.type === 'Trading System' ||
      payload.node.type === 'Network' ||
      payload.node.type === 'Crypto Ecosystem' ||
      payload.node.type === 'Charting Space' ||
      payload.node.type === 'Data Mine' ||
      payload.node.type === 'Super Scripts'
  ) {
      return false
    }

    /* Another exception are the ones who have reference parents */
    if (payload.referenceParent !== undefined) { return false }

    /* Here we will check the position of a floatingobject to see if it is outside the screen, with a margin of one screen around. */
    let point = thisObject.container.frame.frameThisPoint(payload.position)

    if (point.x > browserCanvas.width + browserCanvas.width * radarFactor) {
      return true
    }

    if (point.x < 0 - browserCanvas.width * radarFactor) {
      return true
    }

    let bottom = COCKPIT_SPACE_POSITION + COCKPIT_SPACE_HEIGHT
    let heightDiff = browserCanvas.height - bottom
    if (point.y < bottom - heightDiff * radarFactor) {
      return true
    }

    if (point.y > browserCanvas.height + heightDiff * radarFactor) {
      return true
    }
    return false
  }

  function fitIntoVisibleArea (point) {
      /* Here we check the boundaries of the resulting points, so they dont go out of the visible area. */

    let returnPoint = {
      x: point.x,
      y: point.y
    }

    if (point.x > browserCanvas.width) {
      returnPoint.x = browserCanvas.width
    }

    if (point.x < 0) {
      returnPoint.x = 0
    }

    if (point.y < COCKPIT_SPACE_POSITION + COCKPIT_SPACE_HEIGHT) {
      returnPoint.y = COCKPIT_SPACE_POSITION + COCKPIT_SPACE_HEIGHT
    }

    if (point.y > browserCanvas.height) {
      returnPoint.y = browserCanvas.height
    }

    return returnPoint
  }

  function oneScreenUp () {
    if (visible === false) { return }
    let displaceVector = {
      x: 0,
      y: browserCanvas.height * PERCENTAGE_OF_SCREEN_FOR_DISPLACEMENT / 100
    }

    thisObject.container.displace(displaceVector)
    return displaceVector
  }

  function oneScreenDown () {
    if (visible === false) { return }
    let displaceVector = {
      x: 0,
      y: -browserCanvas.height * PERCENTAGE_OF_SCREEN_FOR_DISPLACEMENT / 100
    }

    thisObject.container.displace(displaceVector)
    return displaceVector
  }

  function oneScreenLeft () {
    if (visible === false) { return }
    let displaceVector = {
      x: browserCanvas.width * PERCENTAGE_OF_SCREEN_FOR_DISPLACEMENT / 100,
      y: 0
    }

    thisObject.container.displace(displaceVector)
    return displaceVector
  }

  function oneScreenRight () {
    if (visible === false) { return }
    let displaceVector = {
      x: -browserCanvas.width * PERCENTAGE_OF_SCREEN_FOR_DISPLACEMENT / 100,
      y: 0
    }

    thisObject.container.displace(displaceVector)
    return displaceVector
  }

  function positionAtNode (node) {
    let position = thisObject.container.frame.frameThisPoint(node.payload.position)

    let displaceVector = {
      x: browserCanvas.width / 2 - position.x,
      y: (COCKPIT_SPACE_POSITION + COCKPIT_SPACE_HEIGHT) + (browserCanvas.height - (COCKPIT_SPACE_POSITION + COCKPIT_SPACE_HEIGHT)) / 2 - position.y
    }

    thisObject.container.displace(displaceVector)
  }

  function isThisPointVisible (point) {
    if (point.x > browserCanvas.width) {
      return false
    }

    if (point.x < 0) {
      return false
    }

    if (point.y < COCKPIT_SPACE_POSITION + COCKPIT_SPACE_HEIGHT) {
      return false
    }

    if (point.y > browserCanvas.height) {
      return false
    }

    return true
  }

  function onMouseWheel (event) {
    if (visible === false) { return }
    thisObject.floatingLayer.changeTargetRepulsion(event.wheelDelta)
  }

  function makeVisible () {
    visible = true
  }

  function makeInvisible () {
    visible = false
  }

  function getContainer (point) {
    if (visible === false) { return }
    let container

    container = thisObject.floatingLayer.getContainer(point)
    if (container !== undefined) {
      container.space = 'Floating Space'
      return container
    }

    if (visible === true) {
      thisObject.container.space = 'Floating Space'
      return thisObject.container
    }
  }

  function physics () {
    if (visible === false) { return }
    browserZoomPhysics()
    positionContraintsPhysics()
    thisObject.floatingLayer.physics()
    doubleClickPhysics()
  }

  function doubleClickPhysics () {
    doubleClickCounter--
    if (doubleClickCounter < 0) {
      doubleClickCounter = 0
    }
  }

  function positionContraintsPhysics () {
    if (thisObject.container.frame.position.x > 0) {
      thisObject.container.frame.position.x = 0
    }
    if (thisObject.container.frame.position.y > 0) {
      thisObject.container.frame.position.y = 0
    }
    if (thisObject.container.frame.position.x + thisObject.container.frame.width < browserCanvas.width) {
      thisObject.container.frame.position.x = browserCanvas.width - thisObject.container.frame.width
    }
    if (thisObject.container.frame.position.y + thisObject.container.frame.height < browserCanvas.height) {
      thisObject.container.frame.position.y = browserCanvas.height - thisObject.container.frame.height
    }
  }

  function browserZoomPhysics () {
    if (devicePixelRatio !== window.devicePixelRatio) {
      devicePixelRatio = window.devicePixelRatio

      thisObject.container.frame.position.x = browserCanvas.width / 2 - thisObject.container.frame.width / 2
      thisObject.container.frame.position.y = browserCanvas.height / 2 - thisObject.container.frame.height / 2
    }
  }

  function draw () {
    if (visible === false) { return }
    drawBackground()
    thisObject.floatingLayer.draw()
  }

  function drawBackground () {
    browserCanvasContext.beginPath()

    browserCanvasContext.rect(thisObject.container.frame.position.x, thisObject.container.frame.position.y, thisObject.container.frame.width, thisObject.container.frame.height)
    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.BLACK + ', 1)'

    browserCanvasContext.closePath()
    browserCanvasContext.fill()
  }
}
