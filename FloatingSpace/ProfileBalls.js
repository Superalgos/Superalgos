
function newProfileBalls () {
  const MODULE_NAME = 'Profile Balls'
  const INFO_LOG = false
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

   /*

   This object deals with Profile Balls, a type of Floating Object that shows profile info in a floating ball.

   */

  let thisObject = {

    createNewProfileBall: createNewProfileBall,
    destroyProfileBall: destroyProfileBall,
    initialize: initialize,
    finalize: finalize

  }

  let floatingLayer

  return thisObject

  function initialize (pFloatingLayer) {
    floatingLayer = pFloatingLayer
  }

  function finalize () {
    floatingLayer.finalize()
    floatingLayer = undefined
  }

  function createNewProfileBall (pPayload, callBackFunction) {
    let floatingObject = newFloatingObject()
    floatingObject.initialize('Profile Ball', '', floatingLayer)

    floatingObject.payload = pPayload

    floatingObject.friction = 0.995

    floatingObject.initializeMass(100)
    floatingObject.initializeRadius(30)
    floatingObject.initializeImageSize(50)
    floatingObject.initializeFontSize(10)

    floatingObject.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 0.5)'
    floatingObject.labelStrokeStyle = 'rgba(60, 60, 60, 0.50)'

    floatingLayer.addFloatingObject(floatingObject)

    callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE, floatingObject.handle)
  }

  function destroyProfileBall (pFloatingObjectHandle) {
    floatingLayer.removeFloatingObject(pFloatingObjectHandle)
  }
}

