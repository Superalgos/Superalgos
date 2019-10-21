
function newFloatingSpace () {
  const MODULE_NAME = 'Floating Space'
  const ERROR_LOG = true
   /*
   The Floating Space is the place where floating elements like floatingObjects, live and are rendered.
   This space has its own physics which helps with the animation of these objects and also preventing them to overlap.
   */

  let thisObject = {
    floatingLayer: undefined,               // This is the array of floatingObjects being displayed
    profileBalls: undefined,
    strategyPartConstructor: undefined,
    noteSets: undefined,
    container: undefined,
    oneScreenUp: oneScreenUp,
    oneScreenDown: oneScreenDown,
    oneScreenLeft: oneScreenLeft,
    oneScreenRight: oneScreenRight,
    positionAtNode: positionAtNode,
    fitIntoVisibleArea: fitIntoVisibleArea,
    isThisPointVisible: isThisPointVisible,
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
  thisObject.container.frame.radius = 0

  let devicePixelRatio = window.devicePixelRatio
  const SPACE_SIZE = 50000

  thisObject.container.frame.width = SPACE_SIZE
  thisObject.container.frame.height = SPACE_SIZE
  thisObject.container.frame.position.x = browserCanvas.width / 2 - thisObject.container.frame.width / 2
  thisObject.container.frame.position.y = browserCanvas.height / 2 - thisObject.container.frame.height / 2

  let visible = false

  const PERCENTAGE_OF_SCREEN_FOR_DISPLACEMENT = 25
  return thisObject

  function finalize () {
    thisObject.floatingLayer.finalize()
    thisObject.profileBalls.finalize()
    thisObject.strategyPartConstructor.finalize()
    thisObject.noteSets.finalize()
  }

  function initialize (callBackFunction) {
    thisObject.floatingLayer = newFloatingLayer()
    thisObject.floatingLayer.initialize()

    thisObject.profileBalls = newProfileBalls()
    thisObject.profileBalls.initialize(thisObject.floatingLayer)

    thisObject.noteSets = newNoteSets()
    thisObject.noteSets.initialize(thisObject.floatingLayer)

    thisObject.strategyPartConstructor = newStrategyPartConstructor()
    thisObject.strategyPartConstructor.initialize(thisObject.floatingLayer)

    thisObject.container.eventHandler.listenToEvent('onMouseWheel', onMouseWheel)
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
    let displaceVector = {
      x: 0,
      y: browserCanvas.height * PERCENTAGE_OF_SCREEN_FOR_DISPLACEMENT / 100
    }

    thisObject.container.displace(displaceVector)
  }

  function oneScreenDown () {
    let displaceVector = {
      x: 0,
      y: -browserCanvas.height * PERCENTAGE_OF_SCREEN_FOR_DISPLACEMENT / 100
    }

    thisObject.container.displace(displaceVector)
  }

  function oneScreenLeft () {
    let displaceVector = {
      x: browserCanvas.width * PERCENTAGE_OF_SCREEN_FOR_DISPLACEMENT / 100,
      y: 0
    }

    thisObject.container.displace(displaceVector)
  }

  function oneScreenRight () {
    let displaceVector = {
      x: -browserCanvas.width * PERCENTAGE_OF_SCREEN_FOR_DISPLACEMENT / 100,
      y: 0
    }

    thisObject.container.displace(displaceVector)
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
    thisObject.floatingLayer.changeTargetRepulsion(event.wheelDelta)
  }

  function makeVisible () {
    visible = true
  }

  function makeInvisible () {
    visible = false
  }

  function getContainer (point) {
    let container

    container = thisObject.floatingLayer.getContainer(point)
    if (container !== undefined) { return container }

    if (visible === true) {
      return thisObject.container
    }
  }

  function physics () {
    if (visible === true) {
      browserZoomPhysics()
      thisObject.floatingLayer.physics()
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
    if (visible === true) {
      drawBackground()
      thisObject.floatingLayer.draw()
    }
  }

  function drawBackground () {
    browserCanvasContext.beginPath()

    browserCanvasContext.rect(thisObject.container.frame.position.x, thisObject.container.frame.position.y, thisObject.container.frame.width, thisObject.container.frame.height)
    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.BLACK + ', 1)'

    browserCanvasContext.closePath()
    browserCanvasContext.fill()
  }
}

