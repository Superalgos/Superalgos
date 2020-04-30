
function newConditionEditor () {
  const MODULE_NAME = 'Condition Editor'

  let thisObject = {
    isVisibleFunction: undefined,
    visible: false,
    imagePathOK: undefined,
    imagePathNOT_OK: undefined,
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
  thisObject.container.initialize(MODULE_NAME, 'Circle')
  thisObject.container.isClickeable = false
  thisObject.container.isDraggeable = false
  thisObject.container.detectMouseOver = false
  thisObject.container.frame.radius = 750
  thisObject.container.frame.containerName = MODULE_NAME

  let isMouseOver = false
  let operationPicker
  let operatorA
  let operatorB

  return thisObject

  function finalize () {
    thisObject.container.finalize()
    thisObject.container = undefined
    thisObject.payload = undefined
    thisObject.isVisibleFunction = undefined

    operationPicker = undefined
    operatorA = undefined
    operatorB = undefined
  }

  function initialize () {

  }

  function activate (payload) {
    thisObject.visible = true
    thisObject.payload = payload
    thisObject.payload.uiObject.setErrorMessage('', 0)

    operatorA = {}
    operatorB = {}
    scanDataMines()
    initializePickers()

    loadFromCode()
    EDITOR_ON_FOCUS = true
  }

  function deactivate () {
    convertToCode()
    finalizePickers()

    if (thisObject.visible === true) {
      thisObject.visible = false
    }
    EDITOR_ON_FOCUS = false
  }

  function convertToCode () {
    if (operatorA === undefined || operatorB === undefined || operationPicker === undefined) { return }

    // chart.at01hs.bollingerSubChannel.previous.previous.slope=== "Extreme"
    let code = ''

    code = code + 'chart.at' + operatorA.timeFramePicker.getSelected().replace('-', '')
    code = code + '.' + operatorA.productPicker.getSelected()
    insertWhen(operatorA)
    code = code + '.' + operatorA.propertyPicker.getSelected()

    switch (operationPicker.getSelected()) {
      case 'Greater Than': {
        code = code + ' > '
        break
      }
      case 'Less Than': {
        code = code + ' < '
        break
      }
      case 'Greater or Equal Than': {
        code = code + ' >= '
        break
      }
      case 'Less or Equal Than': {
        code = code + ' <= '
        break
      }
      case 'Equal To': {
        code = code + ' === '
        break
      }
    }

    if (operationPicker.getSelected() === 'Equal To') {
      code = code + '"' + operatorA.valuePicker.getSelected() + '"'
    } else {
      code = code + 'chart.at' + operatorB.timeFramePicker.getSelected().replace('-', '')
      code = code + '.' + operatorB.productPicker.getSelected()
      insertWhen(operatorB)
      code = code + '.' + operatorB.propertyPicker.getSelected()
    }

    thisObject.payload.node.code = code

    function insertWhen (operator) {
      switch (operator.whenPicker.getSelected()) {
        case 'Current': {
          return
        }
        case '1 Previous': {
          code = code + '.previous'
          return
        }
        case '2 Previous': {
          code = code + '.previous.previous'
          return
        }
        case '3 Previous': {
          code = code + '.previous.previous.previous'
          return
        }
        case '4 Previous': {
          code = code + '.previous.previous.previous.previous'
          return
        }
        case '5 Previous': {
          code = code + '.previous.previous.previous.previous.previous'
          return
        }
      }
    }
  }

  function loadFromCode () {
    if (thisObject.payload.node.code === undefined || thisObject.payload.node.code === '') { return }

    let code = thisObject.payload.node.code
    let codeA
    let codeB

    if (code.indexOf(' > ') > 0) {
      let codeArray = code.split(' > ')
      codeA = codeArray[0]
      codeB = codeArray[1]
      operationPicker.setSelected(undefined, undefined, undefined, 0)
    }

    if (code.indexOf(' < ') > 0) {
      let codeArray = code.split(' < ')
      codeA = codeArray[0]
      codeB = codeArray[1]
      operationPicker.setSelected(undefined, undefined, undefined, 1)
    }

    if (code.indexOf(' >= ') > 0) {
      let codeArray = code.split(' >= ')
      codeA = codeArray[0]
      codeB = codeArray[1]
      operationPicker.setSelected(undefined, undefined, undefined, 2)
    }

    if (code.indexOf(' <= ') > 0) {
      let codeArray = code.split(' <= ')
      codeA = codeArray[0]
      codeB = codeArray[1]
      operationPicker.setSelected(undefined, undefined, undefined, 3)
    }

    if (code.indexOf(' === ') > 0) {
      let codeArray = code.split(' === ')
      codeA = codeArray[0]
      codeB = codeArray[1]
      operationPicker.setSelected(undefined, undefined, undefined, 4)
    }

    let codeAArray = codeA.split('.')
    let codeBArray = codeB.split('.')

    updatePickers(operatorA, codeAArray)
    updatePickers(operatorB, codeBArray)

    function updatePickers (operator, codeArray) {
      let codeTimeFrame = codeArray[1].substring(2, 4) + '-' + codeArray[1].substring(4, 7)
      let codeProduct = codeArray[2]
      let codeProperty = codeArray[3]
      let codeValue = codeBArray[0].replace('"', '').replace('"', '')

      let dataMines = Object.keys(operator.selector)
      for (let i = 0; i < dataMines.length; i++) {
        let dataMine = dataMines[i]
        let dataMineObject = operator.selector[dataMine]
        let bots = Object.keys(dataMineObject)
        for (let j = 0; j < bots.length; j++) {
          let bot = bots[j]
          let botObject = dataMineObject[bot]
          let products = Object.keys(botObject)
          for (let k = 0; k < products.length; k++) {
            let product = products[k]
            let productObject = botObject[product]
            if (codeProduct === product) {
              operator.dataMinePicker.setSelected(dataMines, operator.selector, undefined, i)
              operator.botPicker.setSelected(bots, dataMineObject, operator.selector, j)
              operator.productPicker.setSelected(products, botObject, dataMineObject, k)
              let properties = Object.keys(productObject.properties)
              for (let m = 0; m < properties.length; m++) {
                let property = properties[m]
                let propertyObject = productObject.properties[property]
                if (codeProperty === property) {
                  operator.propertyPicker.setSelected(properties, productObject.properties, botObject, m)
                  let values = propertyObject.possibleValues
                  for (let n = 0; n < values.length; n++) {
                    let value = values[n]
                    let valueObject = propertyObject[value]
                    if (codeValue === value) {
                      operator.valuePicker.setSelected(values, propertyObject, productObject, n)
                    }
                  }
                }
              }
              let timeFrames = productObject.validTimeFrames
              for (let m = 0; m < timeFrames.length; m++) {
                let timeFrame = timeFrames[m]
                let timeFrameObject = productObject.validTimeFrames[timeFrame]
                if (codeTimeFrame === timeFrame) {
                  operator.timeFramePicker.setSelected(timeFrames, productObject, botObject, m)
                }
              }
            }
          }
        }
      }
    }
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
          selectorProduct[productName] = {
            properties: {}
          }
          if (product.record === undefined) { continue }
          for (let m = 0; m < product.record.properties.length; m++) {
            let property = product.record.properties[m]
            let propertyName = loadPropertyFromNodeConfig(property.payload, 'codeName')
            let selectorProperty = selectorProduct[productName]
            selectorProperty = selectorProperty.properties
            selectorProperty[propertyName] = {}
            let possibleValues = loadPropertyFromNodeConfig(property.payload, 'possibleValues')
            if (possibleValues === undefined) { possibleValues = [] }
            let selectorPossibleValue = selectorProperty[propertyName]
            selectorPossibleValue.possibleValues = possibleValues
          }
          let allPossibleTimeFrames = []
          for (let m = 0; m < product.datasets.length; m++) {
            let dataset = product.datasets[m]
            let validTimeFrames = loadPropertyFromNodeConfig(dataset.payload, 'validTimeFrames')
            if (validTimeFrames !== undefined) {
              allPossibleTimeFrames = allPossibleTimeFrames.concat(validTimeFrames)
            }
          }
          let selectorValidTimeFrames = selectorProduct[productName]
          selectorValidTimeFrames.validTimeFrames = allPossibleTimeFrames

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
    initializeOperator(operatorA, -1)
    initializeOperator(operatorB, 1)

    operationPicker = newPicker()
    operationPicker.name = 'Data Mine'
    operationPicker.container.connectToParent(thisObject.container)
    operationPicker.container.frame.position.x = 0 - operationPicker.container.frame.width / 2
    operationPicker.container.frame.position.y = 0 - operationPicker.container.frame.height / 2
    current = ['Greater Than', 'Less Than', 'Greater or Equal Than', 'Less or Equal Than', 'Equal To']
    operationPicker.initialize(current, current)

    operationPicker.eventSuscriptionId = operationPicker.container.eventHandler.listenToEvent('onParentChanged', onParentChanged)
  }

  function initializeOperator (operator, ySign) {
    let properties
    let parent
    let current

    operator.whenPicker = newPicker()
    operator.whenPicker.name = 'When'
    operator.whenPicker.container.connectToParent(thisObject.container)
    operator.whenPicker.container.frame.position.x = 0 - operator.whenPicker.container.frame.width / 2 - operator.whenPicker.container.frame.width * 0.5
    operator.whenPicker.container.frame.position.y = 0 - operator.whenPicker.container.frame.height / 2 + operator.whenPicker.container.frame.height * ySign
    current = ['Current', '1 Previous', '2 Previous', '3 Previous', '4 Previous', '5 Previous']
    operator.whenPicker.initialize(current, current)
    operator.whenPicker.visible = true

    operator.dataMinePicker = newPicker()
    operator.dataMinePicker.name = 'Data Mine'
    operator.dataMinePicker.container.connectToParent(thisObject.container)
    operator.dataMinePicker.container.frame.position.x = 0 - operator.dataMinePicker.container.frame.width / 2 - operator.dataMinePicker.container.frame.width * 2.5
    operator.dataMinePicker.container.frame.position.y = 0 - operator.dataMinePicker.container.frame.height / 2 + operator.dataMinePicker.container.frame.height * ySign
    current = operator.selector
    properties = Object.keys(current)
    operator.dataMinePicker.initialize(properties, current)
    parent = current
    operator.dataMinePicker.visible = true

    operator.botPicker = newPicker()
    operator.botPicker.name = 'Bot'
    operator.botPicker.container.connectToParent(thisObject.container)
    operator.botPicker.container.frame.position.x = 0 - operator.botPicker.container.frame.width / 2 - operator.botPicker.container.frame.width * 1.5
    operator.botPicker.container.frame.position.y = 0 - operator.botPicker.container.frame.height / 2 + operator.dataMinePicker.container.frame.height * ySign
    current = parent[properties[0]]
    properties = Object.keys(current)
    operator.botPicker.initialize(properties, current, parent)
    parent = current
    operator.botPicker.visible = true

    operator.productPicker = newPicker()
    operator.productPicker.name = 'Product'
    operator.productPicker.container.connectToParent(thisObject.container)
    operator.productPicker.container.frame.position.x = 0 - operator.productPicker.container.frame.width / 2 + operator.productPicker.container.frame.width * 0.5
    operator.productPicker.container.frame.position.y = 0 - operator.productPicker.container.frame.height / 2 + operator.dataMinePicker.container.frame.height * ySign
    current = parent[properties[0]]
    properties = Object.keys(current)
    operator.productPicker.initialize(properties, current, parent)
    parent = current
    operator.productPicker.visible = true

    let productParent = parent
    let productProperties = properties

    operator.propertyPicker = newPicker()
    operator.propertyPicker.name = 'Property'
    operator.propertyPicker.container.connectToParent(thisObject.container)
    operator.propertyPicker.container.frame.position.x = 0 - operator.propertyPicker.container.frame.width / 2 + operator.propertyPicker.container.frame.width * 1.5
    operator.propertyPicker.container.frame.position.y = 0 - operator.propertyPicker.container.frame.height / 2 + operator.dataMinePicker.container.frame.height * ySign
    current = productParent[productProperties[0]]
    current = current.properties
    properties = Object.keys(current)
    operator.propertyPicker.initialize(properties, current, productParent, 'properties')
    parent = current
    operator.propertyPicker.visible = true

    operator.valuePicker = newPicker()
    operator.valuePicker.name = 'Value'
    operator.valuePicker.container.connectToParent(thisObject.container)
    operator.valuePicker.container.frame.position.x = 0 - operator.valuePicker.container.frame.width / 2
    operator.valuePicker.container.frame.position.y = 0 - operator.valuePicker.container.frame.height / 2 + operator.valuePicker.container.frame.height * 1
    current = parent[properties[0]]
    properties = current.possibleValues
    operator.valuePicker.initialize(properties, current, parent, 'possibleValues')
    parent = current
    operator.valuePicker.visible = false

    operator.timeFramePicker = newPicker()
    operator.timeFramePicker.name = 'Time Frame'
    operator.timeFramePicker.container.connectToParent(thisObject.container)
    operator.timeFramePicker.container.frame.position.x = 0 - operator.timeFramePicker.container.frame.width / 2 + operator.timeFramePicker.container.frame.width * 2.5
    operator.timeFramePicker.container.frame.position.y = 0 - operator.timeFramePicker.container.frame.height / 2 + operator.timeFramePicker.container.frame.height * ySign
    current = productParent[productProperties[0]]
    properties = current.validTimeFrames
    operator.timeFramePicker.initialize(properties, current, productParent, 'validTimeFrames')
    parent = current
    operator.timeFramePicker.visible = true

    operator.botPicker.eventSuscriptionId = operator.dataMinePicker.container.eventHandler.listenToEvent('onParentChanged', operator.botPicker.onParentChanged)
    operator.productPicker.eventSuscriptionId = operator.botPicker.container.eventHandler.listenToEvent('onParentChanged', operator.productPicker.onParentChanged)
    operator.propertyPicker.eventSuscriptionId = operator.productPicker.container.eventHandler.listenToEvent('onParentChanged', operator.propertyPicker.onParentChanged)
    operator.valuePicker.eventSuscriptionId = operator.propertyPicker.container.eventHandler.listenToEvent('onParentChanged', operator.valuePicker.onParentChanged)
    operator.timeFramePicker.eventSuscriptionId = operator.productPicker.container.eventHandler.listenToEvent('onParentChanged', operator.timeFramePicker.onParentChanged)
  }

  function finalizePickers () {
    finalizeOperator(operatorA)
    finalizeOperator(operatorB)

    operatorA = undefined
    operatorB = undefined

    if (operationPicker !== undefined) {
      operationPicker.container.eventHandler.stopListening(operationPicker.eventSuscriptionId)
      operationPicker.finalize()
      operationPicker = undefined
    }
  }

  function finalizeOperator (operator) {
    if (operator === undefined) { return }

    if (operator.whenPicker !== undefined) {
      operator.whenPicker.finalize()
      operator.whenPicker = undefined
    }

    if (operator.dataMinePicker !== undefined) {
      operator.dataMinePicker.container.eventHandler.stopListening(operator.botPicker.eventSuscriptionId)
      operator.dataMinePicker.finalize()
      operator.dataMinePicker = undefined
    }

    if (operator.botPicker !== undefined) {
      operator.botPicker.container.eventHandler.stopListening(operator.productPicker.eventSuscriptionId)
      operator.botPicker.finalize()
      operator.botPicker = undefined
    }

    if (operator.productPicker !== undefined) {
      operator.productPicker.container.eventHandler.stopListening(operator.propertyPicker.eventSuscriptionId)
      operator.productPicker.container.eventHandler.stopListening(operator.timeFramePicker.eventSuscriptionId)
      operator.productPicker.finalize()
      operator.productPicker = undefined
    }

    if (operator.propertyPicker !== undefined) {
      operator.propertyPicker.container.eventHandler.stopListening(operator.valuePicker.eventSuscriptionId)
      operator.propertyPicker.finalize()
      operator.propertyPicker = undefined
    }

    if (operator.valuePicker !== undefined) {
      operator.valuePicker.finalize()
      operator.valuePicker = undefined
    }

    if (operator.timeFramePicker !== undefined) {
      operator.timeFramePicker.finalize()
      operator.timeFramePicker = undefined
    }
  }

  function onParentChanged (event) {
    if (event.selected === 4) {
 // this means Equal To

      operatorA.valuePicker.visible = true
      operatorB.whenPicker.visible = false
      operatorB.dataMinePicker.visible = false
      operatorB.botPicker.visible = false
      operatorB.productPicker.visible = false
      operatorB.propertyPicker.visible = false
      operatorB.timeFramePicker.visible = false
    } else {
      operatorA.valuePicker.visible = false
      operatorB.whenPicker.visible = true
      operatorB.dataMinePicker.visible = true
      operatorB.botPicker.visible = true
      operatorB.productPicker.visible = true
      operatorB.propertyPicker.visible = true
      operatorB.timeFramePicker.visible = true
    }
  }

  function getContainer (point) {
    let container
    if (thisObject.visible === true) {
      if (operationPicker !== undefined) {
        container = operationPicker.getContainer(point)
        if (container !== undefined) { return container }
      }

      if (operatorA !== undefined) {
        if (operatorA.whenPicker !== undefined) {
          if (operatorA.whenPicker.visible === true) {
            container = operatorA.whenPicker.getContainer(point)
            if (container !== undefined) { return container }
          }
        }

        if (operatorA.dataMinePicker !== undefined) {
          if (operatorA.dataMinePicker.visible === true) {
            container = operatorA.dataMinePicker.getContainer(point)
            if (container !== undefined) { return container }
          }
        }

        if (operatorA.botPicker !== undefined) {
          if (operatorA.botPicker.visible === true) {
            container = operatorA.botPicker.getContainer(point)
            if (container !== undefined) { return container }
          }
        }

        if (operatorA.productPicker !== undefined) {
          if (operatorA.productPicker.visible === true) {
            container = operatorA.productPicker.getContainer(point)
            if (container !== undefined) { return container }
          }
        }

        if (operatorA.propertyPicker !== undefined) {
          if (operatorA.propertyPicker.visible === true) {
            container = operatorA.propertyPicker.getContainer(point)
            if (container !== undefined) { return container }
          }
        }

        if (operatorA.valuePicker !== undefined) {
          if (operatorA.valuePicker.visible === true) {
            container = operatorA.valuePicker.getContainer(point)
            if (container !== undefined) { return container }
          }
        }

        if (operatorA.timeFramePicker !== undefined) {
          if (operatorA.timeFramePicker.visible === true) {
            container = operatorA.timeFramePicker.getContainer(point)
            if (container !== undefined) { return container }
          }
        }
      }
      if (operatorB !== undefined) {
        if (operatorB.whenPicker !== undefined) {
          if (operatorB.whenPicker.visible === true) {
            container = operatorB.whenPicker.getContainer(point)
            if (container !== undefined) { return container }
          }
        }

        if (operatorB.dataMinePicker !== undefined) {
          if (operatorB.dataMinePicker.visible === true) {
            container = operatorB.dataMinePicker.getContainer(point)
            if (container !== undefined) { return container }
          }
        }

        if (operatorB.botPicker !== undefined) {
          if (operatorB.botPicker.visible === true) {
            container = operatorB.botPicker.getContainer(point)
            if (container !== undefined) { return container }
          }
        }

        if (operatorB.productPicker !== undefined) {
          if (operatorB.productPicker.visible === true) {
            container = operatorB.productPicker.getContainer(point)
            if (container !== undefined) { return container }
          }
        }

        if (operatorB.propertyPicker !== undefined) {
          if (operatorB.propertyPicker.visible === true) {
            container = operatorB.propertyPicker.getContainer(point)
            if (container !== undefined) { return container }
          }
        }

        if (operatorB.valuePicker !== undefined) {
          if (operatorB.valuePicker.visible === true) {
            container = operatorB.valuePicker.getContainer(point)
            if (container !== undefined) { return container }
          }
        }

        if (operatorB.timeFramePicker !== undefined) {
          if (operatorB.timeFramePicker.visible === true) {
            container = operatorB.timeFramePicker.getContainer(point)
            if (container !== undefined) { return container }
          }
        }
      }

      if (thisObject.container.frame.isThisPointHere(point, true) === true) {
        return thisObject.container
      } else {
        return undefined
      }
    }
  }

  function physics () {
    thisObjectphysics()
    operatorsPhysics(operatorA)
    operatorsPhysics(operatorB)

    if (operationPicker !== undefined) {
      operationPicker.physics()
    }
  }

  function selectionPhysics () {

  }

  function operatorsPhysics (operator) {
    if (operator === undefined) { return }

    if (operator.whenPicker !== undefined) {
      operator.whenPicker.physics()
    }

    if (operator.dataMinePicker !== undefined) {
      operator.dataMinePicker.physics()
    }

    if (operator.botPicker !== undefined) {
      operator.botPicker.physics()
    }

    if (operator.productPicker !== undefined) {
      operator.productPicker.physics()
    }

    if (operator.propertyPicker !== undefined) {
      operator.propertyPicker.physics()
    }

    if (operator.valuePicker !== undefined) {
      operator.valuePicker.physics()
    }

    if (operator.timeFramePicker !== undefined) {
      operator.timeFramePicker.physics()
    }
  }

  function thisObjectphysics () {

  }

  function drawBackground () {
    thisObjectDrawBackground()
    childrenDrawBackground()
  }

  function childrenDrawBackground () {
    operatorDrawBackground(operatorA)
    operatorDrawBackground(operatorB)

    if (operationPicker !== undefined) {
      operationPicker.drawBackground()
    }
  }

  function operatorDrawBackground (operator) {
    if (operator === undefined) { return }

    if (operator.whenPicker !== undefined) {
      if (operator.whenPicker.visible === true) {
        operator.whenPicker.drawBackground()
      }
    }

    if (operator.dataMinePicker !== undefined) {
      if (operator.dataMinePicker.visible === true) {
        operator.dataMinePicker.drawBackground()
      }
    }

    if (operator.botPicker !== undefined) {
      if (operator.botPicker.visible === true) {
        operator.botPicker.drawBackground()
      }
    }

    if (operator.productPicker !== undefined) {
      if (operator.productPicker.visible === true) {
        operator.productPicker.drawBackground()
      }
    }

    if (operator.propertyPicker !== undefined) {
      if (operator.propertyPicker.visible === true) {
        operator.propertyPicker.drawBackground()
      }
    }

    if (operator.valuePicker !== undefined) {
      if (operator.valuePicker.visible === true) {
        operator.valuePicker.drawBackground()
      }
    }

    if (operator.timeFramePicker !== undefined) {
      if (operator.timeFramePicker.visible === true) {
        operator.timeFramePicker.drawBackground()
      }
    }
  }

  function thisObjectDrawBackground () {
    if (thisObject.visible === true) {
      let position = {
        x: 0,
        y: 0
      }

      position = thisObject.container.frame.frameThisPoint(position)

      let radius = thisObject.container.frame.radius

      browserCanvasContext.beginPath()
      browserCanvasContext.arc(position.x, position.y, radius + 3, 0, Math.PI * 2, true)
      browserCanvasContext.closePath()
      browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + 1 + ')'
      browserCanvasContext.fill()

      browserCanvasContext.beginPath()
      browserCanvasContext.arc(position.x, position.y, radius, 0, Math.PI * 2, true)
      browserCanvasContext.closePath()
      browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.GREY + ', ' + 1 + ')'
      browserCanvasContext.fill()
    }
  }

  function drawForeground () {
    thisObjectDrawForeground()
    childrenDrawForeground()
  }

  function childrenDrawForeground () {
    operatorDrawForeground(operatorA)
    operatorDrawForeground(operatorB)

    if (operationPicker !== undefined) {
      operationPicker.drawForeground()
    }
  }

  function operatorDrawForeground (operator) {
    if (operator === undefined) { return }

    if (operator.whenPicker !== undefined) {
      if (operator.whenPicker.visible === true) {
        operator.whenPicker.drawForeground()
      }
    }

    if (operator.dataMinePicker !== undefined) {
      if (operator.dataMinePicker.visible === true) {
        operator.dataMinePicker.drawForeground()
      }
    }

    if (operator.botPicker !== undefined) {
      if (operator.botPicker.visible === true) {
        operator.botPicker.drawForeground()
      }
    }

    if (operator.productPicker !== undefined) {
      if (operator.productPicker.visible === true) {
        operator.productPicker.drawForeground()
      }
    }

    if (operator.propertyPicker !== undefined) {
      if (operator.propertyPicker.visible === true) {
        operator.propertyPicker.drawForeground()
      }
    }

    if (operator.valuePicker !== undefined) {
      if (operator.valuePicker.visible === true) {
        operator.valuePicker.drawForeground()
      }
    }

    if (operator.timeFramePicker !== undefined) {
      if (operator.timeFramePicker.visible === true) {
        operator.timeFramePicker.drawForeground()
      }
    }
  }

  function thisObjectDrawForeground () {

  }
}
