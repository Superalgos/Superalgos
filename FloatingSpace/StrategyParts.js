
function newStrategyParts () {
  const MODULE_NAME = 'Strategy Parts'
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

   /*

   This object deals with Strategy Parts, a type of Floating Object that shows together with other parts a graphical representation of a strategy.

   */

  let thisObject = {

    createNewStrategyPart: createNewStrategyPart,
    destroyStrategyPart: destroyStrategyPart,
    initialize: initialize,
    finalize: finalize

  }

  let floatingLayer

  return thisObject

  function finalize () {
    floatingLayer.finalize()
  }

  function initialize (pFloatingLayer) {
    floatingLayer = pFloatingLayer
  }

  function createNewStrategyPart (pPayload, callBackFunction) {
    let floatingObject = newFloatingObject()
    floatingObject.initialize('Profile Ball', onInitialized)

    function onInitialized (err) {
      floatingObject.payload = pPayload

      floatingObject.friction = 0.995

      floatingObject.initializeMass(100)
      floatingObject.initializeRadius(30)
      floatingObject.initializeImageSize(50)
      floatingObject.initializeFontSize(10)

      floatingObject.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 0.5)'
      floatingObject.labelStrokeStyle = 'rgba(60, 60, 60, 0.50)'

      floatingLayer.addFloatingObject(floatingObject)

      callBackFunction(GLOBAL.CUSTOM_OK_RESPONSE, floatingObject.handle)
    }
  }

  function destroyStrategyPart (pFloatingObjectHandle) {
    floatingLayer.killFloatingObject(pFloatingObjectHandle)
  }
}

