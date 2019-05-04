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
    initialize: initialize,
    finalize: finalize
  }

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
}

