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
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] finalize -> err = ' + err) }
    }
  }

  function initialize (callBackFunction) {
    thisObject.floatingLayer = newFloatingLayer()
    thisObject.floatingLayer.initialize(onFloatingLayerInitialized)

    function onFloatingLayerInitialized (err) {
      thisObject.profileBalls = newProfileBalls()
      thisObject.profileBalls.initialize(thisObject.floatingLayer, onProfileBallsInitialized)

      function onProfileBallsInitialized (err) {
        thisObject.noteSets = newNoteSets()
        thisObject.noteSets.initialize(thisObject.floatingLayer, onNoteSetsInitialized)

        function onNoteSetsInitialized (err) {

        }
      }
    }
  }
}

