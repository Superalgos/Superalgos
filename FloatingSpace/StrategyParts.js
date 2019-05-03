
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

  function createNewStrategyPart (type, pPayload, callBackFunction) {
    let floatingObject = newFloatingObject()
    floatingObject.initialize('Strategy Part', floatingLayer, onInitialized)

    function onInitialized (err) {
      floatingObject.payload = pPayload

      switch (type) {
        case 'Strategy': {
          level_1()
          break
        }
        case 'Strategy Entry': {
          level_2()
          break
        }
        case 'Strategy Exit': {
          level_2()
          break
        }
        case 'Trade Entry': {
          level_2()
          break
        }
        case 'Trade Exit': {
          level_2()
          break
        }
        case 'Stop': {
          level_2()
          break
        }
        case 'Take Profit': {
          level_2()
          break
        }
        default: {
          level_3()
        }
      }

      function level_1 () {
        floatingObject.friction = 0.9

        floatingObject.initializeMass(100)
        floatingObject.initializeRadius(50)
        floatingObject.initializeImageSize(60)
        floatingObject.initializeFontSize(10)
      }

      function level_2 () {
        floatingObject.friction = 0.85

        floatingObject.initializeMass(50)
        floatingObject.initializeRadius(30)
        floatingObject.initializeImageSize(50)
        floatingObject.initializeFontSize(10)
      }

      function level_3 () {
        floatingObject.friction = 0.8

        floatingObject.initializeMass(10)
        floatingObject.initializeRadius(10)
        floatingObject.initializeImageSize(50)
        floatingObject.initializeFontSize(10)
      }

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
