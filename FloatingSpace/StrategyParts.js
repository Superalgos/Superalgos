
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
    floatingObject.initialize('Strategy Part', type, floatingLayer, onInitialized)
    floatingObject.underlayingObject.type = type

    function onInitialized (err) {
      const FRICTION = 0.97
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
        case 'Phase': {
          level_3()
          break
        }
        case 'Situation': {
          level_4()
          break
        }
        case 'Condition': {
          level_5()
          break
        }
        default: {
          if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> Part Type not Recognized -> type = ' + type) }
        }
      }

      function level_1 () {
        floatingObject.friction = FRICTION

        floatingObject.initializeMass(100)
        floatingObject.initializeRadius(45)
        floatingObject.initializeImageSize(80)
        floatingObject.initializeFontSize(10)

        floatingObject.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'
      }

      function level_2 () {
        floatingObject.friction = FRICTION

        floatingObject.initializeMass(50)
        floatingObject.initializeRadius(40)
        floatingObject.initializeImageSize(70)
        floatingObject.initializeFontSize(10)

        floatingObject.fillStyle = 'rgba(' + UI_COLOR.GREEN + ', 1)'
      }

      function level_3 () {
        floatingObject.friction = FRICTION

        floatingObject.initializeMass(10)
        floatingObject.initializeRadius(35)
        floatingObject.initializeImageSize(60)
        floatingObject.initializeFontSize(10)

        floatingObject.fillStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', 1)'
      }

      function level_4 () {
        floatingObject.friction = FRICTION

        floatingObject.initializeMass(10)
        floatingObject.initializeRadius(30)
        floatingObject.initializeImageSize(50)
        floatingObject.initializeFontSize(10)

        floatingObject.fillStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', 1)'
      }

      function level_5 () {
        floatingObject.friction = FRICTION

        floatingObject.initializeMass(10)
        floatingObject.initializeRadius(25)
        floatingObject.initializeImageSize(30)
        floatingObject.initializeFontSize(10)

        floatingObject.fillStyle = 'rgba(' + UI_COLOR.RED + ', 1)'
      }

      floatingObject.labelStrokeStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'

      floatingLayer.addFloatingObject(floatingObject)

      callBackFunction(GLOBAL.CUSTOM_OK_RESPONSE, floatingObject.handle)
    }
  }

  function destroyStrategyPart (pFloatingObjectHandle) {
    floatingLayer.killFloatingObject(pFloatingObjectHandle)
  }
}
