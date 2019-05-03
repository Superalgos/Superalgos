 ﻿
function newFloatingSpace () {
  const MODULE_NAME = 'Floating Space'
  const INFO_LOG = false
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
    try {
      if (INFO_LOG === true) { logger.write('[INFO] finalize -> Entering function.') }

      thisObject.floatingLayer.finalize()
      thisObject.profileBalls.finalize()
      thisObject.strategyParts.finalize()
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] finalize -> err = ' + err.stack) }
    }
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

