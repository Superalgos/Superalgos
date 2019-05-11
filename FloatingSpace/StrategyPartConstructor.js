
function newStrategyPartConstructor () {
  const MODULE_NAME = 'Strategy Part Constructor'
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {

    createStrategyPart: createStrategyPart,
    destroyStrategyPart: destroyStrategyPart,
    initialize: initialize,
    finalize: finalize

  }

  let floatingLayer

  return thisObject

  function finalize () {
    floatingLayer = undefined

    payload.uiObject.finalize()
    payload.uiObject = undefined
  }

  function initialize (pFloatingLayer) {
    floatingLayer = pFloatingLayer
  }

  function createStrategyPart (payload) {
    let floatingObject = newFloatingObject()
    floatingObject.fitFunction = canvas.floatingSpace.fitIntoVisibleArea
    floatingObject.container.connectToParent(canvas.floatingSpace.container, false, false, false, false, false, false, false, false)
    floatingObject.initialize('Strategy Part', payload)
    payload.floatingObject = floatingObject

    let strategyPart = newStrategyPart()
    strategyPart.fitFunction = canvas.floatingSpace.fitIntoVisibleArea
    strategyPart.initialize(payload)
    strategyPart.container.connectToParent(floatingObject.container, false, false, true, true, false, false, true, true)
    payload.uiObject = strategyPart

    const FRICTION = 0.97

    switch (payload.node.type) {
      case 'Investment Plan': {
        level_0()
        break
      }
      case 'Strategy': {
        level_1()
        break
      }
      case 'Strategy Entry Event': {
        level_2()
        break
      }
      case 'Strategy Exit Event': {
        level_2()
        break
      }
      case 'Trade Entry Event': {
        level_2()
        break
      }
      case 'Trade Exit Event': {
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
        if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> Part Type not Recognized -> type = ' + payload.node.type) }
        return
      }
    }

    function level_0 () {
      floatingObject.friction = 0.93

      floatingObject.initializeMass(500)
      floatingObject.initializeRadius(45)
      floatingObject.initializeImageSize(80)
      floatingObject.initializeFontSize(10)

      floatingObject.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'
    }

    function level_1 () {
      floatingObject.friction = 0.94

      floatingObject.initializeMass(250)
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

    return
  }

  function destroyStrategyPart (payload) {
    floatingLayer.removeFloatingObject(payload.floatingObject.handle)

    payload.floatingObject.finalize()
    payload.floatingObject = undefined

    payload.uiObject.finalize()
    payload.uiObject = undefined
  }
}
