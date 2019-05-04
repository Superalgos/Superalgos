 ﻿
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
    strategyParts: undefined,
    noteSets: undefined,
    makeVisible: makeVisible,
    makeInvisible: makeInvisible,
    draw: draw,
    getContainer: getContainer,
    initialize: initialize,
    finalize: finalize
  }

  let visible = false

  return thisObject

  function finalize () {
    thisObject.floatingLayer.finalize()
    thisObject.profileBalls.finalize()
    thisObject.strategyParts.finalize()
    thisObject.noteSets.finalize()
  }

  function initialize (callBackFunction) {
    thisObject.floatingLayer = newFloatingLayer()
    thisObject.floatingLayer.initialize()

    thisObject.profileBalls = newProfileBalls()
    thisObject.profileBalls.initialize(thisObject.floatingLayer)

    thisObject.noteSets = newNoteSets()
    thisObject.noteSets.initialize(thisObject.floatingLayer)

    thisObject.strategyParts = newStrategyParts()
    thisObject.strategyParts.initialize(thisObject.floatingLayer)
  }

  function makeVisible () {
    canvas.chartSpace.visible = false
    canvas.panelsSpace.visible = false
    visible = true
  }

  function makeInvisible () {
    canvas.chartSpace.visible = true
    canvas.panelsSpace.visible = true
    visible = false
  }

  function getContainer (point) {
    let container

    container = thisObject.floatingLayer.getContainer(point)
    if (container !== undefined) { return container }

    return container
  }

  function draw () {
    if (visible === true) {
      drawBackground()
    }
  }

  function drawBackground () {
    browserCanvasContext.beginPath()

    browserCanvasContext.rect(SIDE_PANEL_WIDTH, 0, browserCanvas.width - SIDE_PANEL_WIDTH, browserCanvas.height)
    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.BLACK + ', 1)'

    browserCanvasContext.closePath()
    browserCanvasContext.fill()
  }
}

