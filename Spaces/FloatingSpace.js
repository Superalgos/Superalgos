 ﻿
function newFloatingSpace () {
    /*
    The Floating Space is the place where floating elements like floatingObjects, live and are rendered.
    This space has its own physics which helps with the animation of these objects and also preventing them to overlap.
    */

  let thisObject = {
    floatingLayer: undefined,               // This is the array of floatingObjects being displayed
    profileBalls: undefined,
    noteSets: undefined,
    initialize: initialize
  }

  return thisObject

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

