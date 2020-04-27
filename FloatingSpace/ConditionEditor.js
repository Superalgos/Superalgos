
function newConditionEditor () {
  const MODULE_NAME = 'Condition Editor'

  let thisObject = {
    isVisibleFunction: undefined,
    visible: false,
    imagePathOK: undefined,
    imagePathNOT_OK: undefined,
    rawRadius: undefined,
    targetRadius: undefined,
    currentRadius: undefined,
    container: undefined,
    payload: undefined,
    deactivate: deactivate,
    activate: activate,
    physics: physics,
    drawBackground: drawBackground,
    drawForeground: drawForeground,
    getContainer: getContainer,
    finalize: finalize,
    initialize: initialize
  }

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME)
  thisObject.container.isClickeable = false
  thisObject.container.isDraggeable = false
  thisObject.container.detectMouseOver = false
  thisObject.container.frame.radius = 0
  thisObject.container.frame.position.x = 0
  thisObject.container.frame.position.y = 0

  let isMouseOver = false
  let operatorA = {}
  let operatorB = {}

  return thisObject

  function finalize () {
    thisObject.container.finalize()
    thisObject.container = undefined
    thisObject.payload = undefined
    thisObject.isVisibleFunction = undefined
  }

  function initialize () {

  }

  function deactivate () {
    finalizePickers()

    if (thisObject.visible === true) {
      thisObject.visible = false
    }
    EDITOR_ON_FOCUS = false
  }

  function activate (payload) {
    thisObject.visible = true
    thisObject.payload = payload
    thisObject.rawRadius = 8
    thisObject.targetRadius = thisObject.container.frame.radius
    thisObject.currentRadius = 0
    thisObject.payload.uiObject.setErrorMessage('', 0)

    scanDataMines()
    initializePickers()
    EDITOR_ON_FOCUS = true
  }

  function scanDataMines () {
    let selector = {}

    let workspace = canvas.designSpace.workspace.workspaceNode

    for (let i = 0; i < workspace.rootNodes.length; i++) {
      let rootNode = workspace.rootNodes[i]
      if (rootNode.type !== 'Data Mine') { continue }
      let dataMine = rootNode
      let dataMineName = loadPropertyFromNodeConfig(dataMine.payload, 'codeName')
      selector[dataMineName] = {}
      let bots = dataMine.sensorBots.concat(dataMine.indicatorBots)
      for (let j = 0; j < bots.length; j++) {
        let bot = bots[j]
        let botName = loadPropertyFromNodeConfig(bot.payload, 'codeName')
        let selectorDataMine = selector[dataMineName]
        selectorDataMine[botName] = {}
        for (let k = 0; k < bot.products.length; k++) {
          let product = bot.products[k]
          let productName = loadPropertyFromNodeConfig(product.payload, 'singularVariableName')
          if (productName === undefined) { continue }
          let selectorProduct = selectorDataMine[botName]
          selectorProduct[productName] = {}
          if (product.record === undefined) { continue }
          for (let m = 0; m < product.record.properties.length; m++) {
            let property = product.record.properties[m]
            let propertyName = loadPropertyFromNodeConfig(property.payload, 'codeName')
            let selectorProperty = selectorProduct[productName]
            selectorProperty[propertyName] = {}
            let possibleValues = loadPropertyFromNodeConfig(property.payload, 'possibleValues')
            if (possibleValues === undefined) { possibleValues = [] }
            let selectorPossibleValue = selectorProperty[propertyName]
            selectorPossibleValue.possibleValues = possibleValues
          }
          let productKeys = Object.keys(selectorProduct[productName])
          if (productKeys.length === 0) {
            selectorProduct[productName] = undefined
          }
        }
        let botKeys = Object.keys(selectorDataMine[botName])
        if (botKeys.length === 0) {
          selectorDataMine[botName] = undefined
        }
      }
      let dataMineKeys = Object.keys(selector[dataMineName])
      if (dataMineKeys.length === 0) {
        selector[dataMineName] = undefined
      }
    }
    operatorA.selector = JSON.parse(JSON.stringify(selector))
    operatorB.selector = JSON.parse(JSON.stringify(selector))
  }

  function initializePickers () {
    operatorA.dataMinePicker = newPicker()
    operatorA.dataMinePicker.container.connectToParent(thisObject.container)
    operatorA.dataMinePicker.container.frame.position.x = 0 - operatorA.dataMinePicker.container.frame.width / 2
    operatorA.dataMinePicker.container.frame.position.y = 0 - operatorA.dataMinePicker.container.frame.height / 2
    operatorA.dataMinePicker.initialize(Object.keys(operatorA.selector))
  }

  function finalizePickers () {
    if (operatorA.dataMinePicker !== undefined) {
      operatorA.dataMinePicker.finalize()
      operatorA.dataMinePicker = undefined
    }
  }

  function getContainer (point) {
    let container
    if (thisObject.visible === true) {
      if (operatorA.dataMinePicker !== undefined) {
        container = operatorA.dataMinePicker.getContainer(point)
        if (container !== undefined) { return container }
      }

      if (thisObject.container.frame.isThisPointHere(point, true, false) === true) {
        return thisObject.container
      } else {
        return undefined
      }
    }
  }

  function physics () {
    thisObjectphysics()
    operatorsPhysics()
  }

  function operatorsPhysics () {
    if (operatorA.dataMinePicker !== undefined) {
      operatorA.dataMinePicker.physics()
    }
  }

  function thisObjectphysics () {
    if (Math.abs(thisObject.currentRadius - thisObject.targetRadius) >= 0.5) {
      if (thisObject.currentRadius < thisObject.targetRadius) {
        thisObject.currentRadius = thisObject.currentRadius + 0.5
      } else {
        thisObject.currentRadius = thisObject.currentRadius - 0.5
      }
    }

    thisObject.container.frame.position.x = 0
    thisObject.container.frame.position.y = 0

    thisObject.container.frame.width = thisObject.container.frame.radius * 1 * 2
    thisObject.container.frame.height = thisObject.container.frame.radius * 1 * 2
  }

  function drawBackground () {
    thisObjectDrawBackground()
    childrenDrawBackground()
  }

  function childrenDrawBackground () {
    if (operatorA.dataMinePicker !== undefined) {
      operatorA.dataMinePicker.drawBackground()
    }
  }

  function thisObjectDrawBackground () {
    if (thisObject.visible === true) {
      let position = {
        x: 0,
        y: 0
      }

      position = thisObject.container.frame.frameThisPoint(position)

      let radius = thisObject.container.frame.radius * 1

      if (radius > 0.5) {
        browserCanvasContext.beginPath()
        browserCanvasContext.arc(position.x, position.y, radius * 1.3 + 3, 0, Math.PI * 2, true)
        browserCanvasContext.closePath()
        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + 1 + ')'
        browserCanvasContext.fill()

        browserCanvasContext.beginPath()
        browserCanvasContext.arc(position.x, position.y, radius * 1.3, 0, Math.PI * 2, true)
        browserCanvasContext.closePath()
        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.GREY + ', ' + 1 + ')'
        browserCanvasContext.fill()
      }
    }
  }

  function drawForeground () {
    thisObjectDrawForeground()
    childrenDrawForeground()
  }

  function childrenDrawForeground () {
    if (operatorA.dataMinePicker !== undefined) {
      operatorA.dataMinePicker.drawForeground()
    }
  }

  function thisObjectDrawForeground () {
    let iconPosition = {
      x: 0,
      y: thisObject.currentRadius * 1
    }

    iconPosition = thisObject.container.frame.frameThisPoint(iconPosition)

      /* Menu  Item */

    if (thisObject.canDrawIcon === true && thisObject.currentRadius > 1) {
      browserCanvasContext.drawImage(thisObject.icon, iconPosition.x - thisObject.currentRadius, iconPosition.y - thisObject.currentRadius, thisObject.currentRadius * 2, thisObject.currentRadius * 2)

      /* Menu Label */

      let label = 'Code looks good!'
      let labelPoint
      let fontSize = 10

      browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY

      if (label !== undefined && thisObject.currentRadius >= thisObject.targetRadius) {
        labelPoint = {
          x: iconPosition.x + thisObject.currentRadius + 10,
          y: iconPosition.y + fontSize * FONT_ASPECT_RATIO
        }

        browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
      }
    }
  }
}
