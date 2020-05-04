
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
  let conditionStructure
  let scanResult

  return thisObject

  function finalize () {
    thisObject.container.finalize()
    thisObject.container = undefined
    thisObject.payload = undefined
    thisObject.isVisibleFunction = undefined

    conditionStructure = undefined
    scanResult = undefined
  }

  function initialize () {

  }

  function activate (payload) {
    thisObject.visible = true
    thisObject.payload = payload
    thisObject.payload.uiObject.setErrorMessage('', 0)

    conditionStructure = {
      code: thisObject.payload.node.code,
      logicOperands: []
    }

    scanDataMines()
    loadFromCode()
    EDITOR_ON_FOCUS = true
  }

  function deactivate () {
    convertToCode()
    finalizePickers()

    conditionStructure = undefined

    if (thisObject.visible === true) {
      thisObject.visible = false
    }
    EDITOR_ON_FOCUS = false
  }

  function loadFromCode () {
    thisObject.payload.node.code = 'chart.at24hs.popularSMA.begin + chart.at24hs.popularSMA.begin > chart.at24hs.candlesProbability.begin + chart.at24hs.candlesProbability.begin || chart.at24hs.popularSMA.begin + chart.at24hs.popularSMA.begin > chart.at24hs.candlesProbability.begin + chart.at24hs.candlesProbability.begin || '
    thisObject.payload.node.code = thisObject.payload.node.code + 'chart.at24hs.popularSMA.begin + chart.at24hs.popularSMA.begin > chart.at24hs.candlesProbability.begin + chart.at24hs.candlesProbability.begin '

    if (thisObject.payload.node.code === undefined || thisObject.payload.node.code === '') { return }

    /* LOGICAL ORs */
    let orArray = conditionStructure.code.split(' || ')
    for (let j = 0; j < orArray.length; j++) {
      let logicOperand = {
        code: orArray[j],
        index: j,
        comparison: {}
      }
      checkComparison(logicOperand, j)
      conditionStructure.logicOperands.push(logicOperand)
    }

    function checkComparison (logicOperand) {
    /* We are going to decompose the  code into 2 comparison operators */
      logicOperand.comparison.operandA = { index: 0}
      logicOperand.comparison.operandB = { index: 1}

      if (logicOperand.code.indexOf(' > ') > 0) {
        let codeArray = logicOperand.code.split(' > ')
        logicOperand.comparison.operandA.code = codeArray[0]
        logicOperand.comparison.operandB.code = codeArray[1]
        logicOperand.comparison.operator = ' > '
        logicOperand.comparison.operatorIndex = 0
      }

      if (logicOperand.code.indexOf(' < ') > 0) {
        let codeArray = logicOperand.code.split(' < ')
        logicOperand.comparison.operandA.code = codeArray[0]
        logicOperand.comparison.operandB.code = codeArray[1]
        logicOperand.comparison.operator = ' < '
        logicOperand.comparison.operatorIndex = 1
      }

      if (logicOperand.code.indexOf(' >= ') > 0) {
        let codeArray = logicOperand.code.split(' >= ')
        logicOperand.comparison.operandA.code = codeArray[0]
        logicOperand.comparison.operandB.code = codeArray[1]
        logicOperand.comparison.operator = ' >= '
        logicOperand.comparison.operatorIndex = 2
      }

      if (logicOperand.code.indexOf(' <= ') > 0) {
        let codeArray = logicOperand.code.split(' <= ')
        logicOperand.comparison.operandA.code = codeArray[0]
        logicOperand.comparison.operandB.code = codeArray[1]
        logicOperand.comparison.operator = ' <= '
        logicOperand.comparison.operatorIndex = 3
      }

      if (logicOperand.code.indexOf(' === ') > 0) {
        let codeArray = logicOperand.code.split(' === ')
        logicOperand.comparison.operandA.code = codeArray[0]
        logicOperand.comparison.operandB.code = codeArray[1]
        logicOperand.comparison.operator = ' === '
        logicOperand.comparison.operatorIndex = 4
      }

      logicOperand.comparison.picker = newPicker()
      let picker = logicOperand.comparison.picker
      picker.name = 'Comparison'
      picker.container.connectToParent(thisObject.container)
      picker.container.frame.position.x = 0 - picker.container.frame.width / 2
      picker.container.frame.position.y = 0 - picker.container.frame.height / 2
      let optionsList = ['Greater Than', 'Less Than', 'Greater or Equal Than', 'Less or Equal Than', 'Equal To']
      picker.initialize(optionsList)

      picker.eventSuscriptionId = picker.container.eventHandler.listenToEvent('onParentChanged', onParentChanged)

    /* Each comparison code may have one or more algebraic operators */
      checkAlgebra(logicOperand, logicOperand.comparison.operandA)
      checkAlgebra(logicOperand, logicOperand.comparison.operandB)
    }

    function checkAlgebra (logicOperand, comparisonOperand) {
      comparisonOperand.algebra = {
        operandA: { index: 0},
        operandB: { index: 1}
      }

      /* The default situation is that there is no Algebraic operation, meaning we will setup a Algebraic operation only with operandA */
      comparisonOperand.algebra.operandA.code = comparisonOperand.code
      comparisonOperand.algebra.operandB.code = ''
      comparisonOperand.algebra.operator = ' ... '
      comparisonOperand.algebra.operatorIndex = 0

      if (comparisonOperand.code.indexOf(' + ') > 0) {
        let codeArray = comparisonOperand.code.split(' + ')
        comparisonOperand.algebra.operandA.code = codeArray[0]
        comparisonOperand.algebra.operandB.code = codeArray[1]
        comparisonOperand.algebra.operator = ' + '
        comparisonOperand.algebra.operatorIndex = 1
      }

      if (comparisonOperand.code.indexOf(' - ') > 0) {
        let codeArray = comparisonOperand.code.split(' - ')
        comparisonOperand.algebra.operandA.code = codeArray[0]
        comparisonOperand.algebra.operandB.code = codeArray[1]
        comparisonOperand.algebra.operator = ' - '
        comparisonOperand.algebra.operatorIndex = 2
      }

      if (comparisonOperand.code.indexOf(' * ') > 0) {
        let codeArray = comparisonOperand.code.split(' * ')
        comparisonOperand.algebra.operandA.code = codeArray[0]
        comparisonOperand.algebra.operandB.code = codeArray[1]
        comparisonOperand.algebra.operator = ' * '
        comparisonOperand.algebra.operatorIndex = 3
      }

      if (comparisonOperand.code.indexOf(' / ') > 0) {
        let codeArray = comparisonOperand.code.split(' / ')
        comparisonOperand.algebra.operandA.code = codeArray[0]
        comparisonOperand.algebra.operandB.code = codeArray[1]
        comparisonOperand.algebra.operator = ' / '
        comparisonOperand.algebra.operatorIndex = 4
      }

      initializePickersSet(logicOperand, comparisonOperand, comparisonOperand.algebra.operandA)
      initializePickersSet(logicOperand, comparisonOperand, comparisonOperand.algebra.operandB)
      updatePickers(logicOperand, comparisonOperand, comparisonOperand.algebra.operandA)
      updatePickers(logicOperand, comparisonOperand, comparisonOperand.algebra.operandB)
    }

    function initializePickersSet (logicOperand, comparisonOperand, algebraOperand) {
      const ALGEBRA_SEPARATION = 60
      const COMPARISON_SEPARATION = ALGEBRA_SEPARATION * 2
      const LOGIC_SEPARATION = COMPARISON_SEPARATION * 2

      let properties
      let parent
      let current
      let yOffset = (logicOperand.index - 1) * LOGIC_SEPARATION + (comparisonOperand.index - 0.5) * COMPARISON_SEPARATION + (algebraOperand.index - 0.5) * ALGEBRA_SEPARATION

      algebraOperand.whenPicker = newPicker()
      algebraOperand.whenPicker.name = 'When'
      algebraOperand.whenPicker.container.connectToParent(thisObject.container)
      algebraOperand.whenPicker.container.frame.position.x = 0 - algebraOperand.whenPicker.container.frame.width / 2 - algebraOperand.whenPicker.container.frame.width * 1.0
      algebraOperand.whenPicker.container.frame.position.y = 0 - algebraOperand.whenPicker.container.frame.height / 2 + yOffset
      current = ['Current', '1 Previous', '2 Previous', '3 Previous', '4 Previous', '5 Previous']
      algebraOperand.whenPicker.initialize(current, current)
      algebraOperand.whenPicker.visible = true

      algebraOperand.algebraicPicker = newPicker()
      algebraOperand.algebraicPicker.name = 'Algebraic'
      algebraOperand.algebraicPicker.container.connectToParent(thisObject.container)
      algebraOperand.algebraicPicker.container.frame.position.x = 0 - algebraOperand.algebraicPicker.container.frame.width / 2 + algebraOperand.algebraicPicker.container.frame.width * 2.5
      algebraOperand.algebraicPicker.container.frame.position.y = 0 - algebraOperand.algebraicPicker.container.frame.height / 2 + yOffset
      algebraOperand.algebraicPicker.container.frame.width = algebraOperand.algebraicPicker.container.frame.width / 2
      current = ['+ - * /', 'Plus', 'Minus', 'Times', 'Divided by']
      algebraOperand.algebraicPicker.initialize(current, current)
      algebraOperand.algebraicPicker.visible = true

      algebraOperand.dataMinePicker = newPicker()
      algebraOperand.dataMinePicker.name = 'Data Mine'
      algebraOperand.dataMinePicker.container.connectToParent(thisObject.container)
      algebraOperand.dataMinePicker.container.frame.position.x = 0 - algebraOperand.dataMinePicker.container.frame.width / 2 - algebraOperand.dataMinePicker.container.frame.width * 3.0
      algebraOperand.dataMinePicker.container.frame.position.y = 0 - algebraOperand.dataMinePicker.container.frame.height / 2 + yOffset
      current = scanResult
      properties = Object.keys(current)
      algebraOperand.dataMinePicker.initialize(properties, current)
      parent = current
      algebraOperand.dataMinePicker.visible = true

      algebraOperand.botPicker = newPicker()
      algebraOperand.botPicker.name = 'Bot'
      algebraOperand.botPicker.container.connectToParent(thisObject.container)
      algebraOperand.botPicker.container.frame.position.x = 0 - algebraOperand.botPicker.container.frame.width / 2 - algebraOperand.botPicker.container.frame.width * 2.0
      algebraOperand.botPicker.container.frame.position.y = 0 - algebraOperand.botPicker.container.frame.height / 2 + yOffset
      current = parent[properties[0]]
      properties = Object.keys(current)
      algebraOperand.botPicker.initialize(properties, current, parent)
      parent = current
      algebraOperand.botPicker.visible = true

      algebraOperand.productPicker = newPicker()
      algebraOperand.productPicker.name = 'Product'
      algebraOperand.productPicker.container.connectToParent(thisObject.container)
      algebraOperand.productPicker.container.frame.position.x = 0 - algebraOperand.productPicker.container.frame.width / 2 + algebraOperand.productPicker.container.frame.width * 0.0
      algebraOperand.productPicker.container.frame.position.y = 0 - algebraOperand.productPicker.container.frame.height / 2 + yOffset
      current = parent[properties[0]]
      properties = Object.keys(current)
      algebraOperand.productPicker.initialize(properties, current, parent)
      parent = current
      algebraOperand.productPicker.visible = true

      let productParent = parent
      let productProperties = properties

      algebraOperand.propertyPicker = newPicker()
      algebraOperand.propertyPicker.name = 'Property'
      algebraOperand.propertyPicker.container.connectToParent(thisObject.container)
      algebraOperand.propertyPicker.container.frame.position.x = 0 - algebraOperand.propertyPicker.container.frame.width / 2 + algebraOperand.propertyPicker.container.frame.width * 1.0
      algebraOperand.propertyPicker.container.frame.position.y = 0 - algebraOperand.propertyPicker.container.frame.height / 2 + yOffset
      current = productParent[productProperties[0]]
      current = current.properties
      properties = Object.keys(current)
      algebraOperand.propertyPicker.initialize(properties, current, productParent, 'properties')
      parent = current
      algebraOperand.propertyPicker.visible = true

      algebraOperand.valuePicker = newPicker()
      algebraOperand.valuePicker.name = 'Value'
      algebraOperand.valuePicker.container.connectToParent(thisObject.container)
      algebraOperand.valuePicker.container.frame.position.x = 0 - algebraOperand.valuePicker.container.frame.width / 2
      algebraOperand.valuePicker.container.frame.position.y = 0 - algebraOperand.valuePicker.container.frame.height / 2 + yOffset
      current = parent[properties[0]]
      properties = current.possibleValues
      algebraOperand.valuePicker.initialize(properties, current, parent, 'possibleValues')
      parent = current
      algebraOperand.valuePicker.visible = false

      algebraOperand.timeFramePicker = newPicker()
      algebraOperand.timeFramePicker.name = 'Time Frame'
      algebraOperand.timeFramePicker.container.connectToParent(thisObject.container)
      algebraOperand.timeFramePicker.container.frame.position.x = 0 - algebraOperand.timeFramePicker.container.frame.width / 2 + algebraOperand.timeFramePicker.container.frame.width * 2.0
      algebraOperand.timeFramePicker.container.frame.position.y = 0 - algebraOperand.timeFramePicker.container.frame.height / 2 + yOffset
      algebraOperand.timeFramePicker.container.frame.width = algebraOperand.timeFramePicker.container.frame.width / 2
      current = productParent[productProperties[0]]
      properties = current.validTimeFrames
      algebraOperand.timeFramePicker.initialize(properties, current, productParent, 'validTimeFrames')
      parent = current
      algebraOperand.timeFramePicker.visible = true

      algebraOperand.botPicker.eventSuscriptionId = algebraOperand.dataMinePicker.container.eventHandler.listenToEvent('onParentChanged', algebraOperand.botPicker.onParentChanged)
      algebraOperand.productPicker.eventSuscriptionId = algebraOperand.botPicker.container.eventHandler.listenToEvent('onParentChanged', algebraOperand.productPicker.onParentChanged)
      algebraOperand.propertyPicker.eventSuscriptionId = algebraOperand.productPicker.container.eventHandler.listenToEvent('onParentChanged', algebraOperand.propertyPicker.onParentChanged)
      algebraOperand.valuePicker.eventSuscriptionId = algebraOperand.propertyPicker.container.eventHandler.listenToEvent('onParentChanged', algebraOperand.valuePicker.onParentChanged)
      algebraOperand.timeFramePicker.eventSuscriptionId = algebraOperand.productPicker.container.eventHandler.listenToEvent('onParentChanged', algebraOperand.timeFramePicker.onParentChanged)
    }

    function updatePickers (logicOperand, comparisonOperand, algebraOperand) {
      let codeArray = algebraOperand.code.split('.')

      let codeTimeFrame = codeArray[1].substring(2, 4) + '-' + codeArray[1].substring(4, 7)
      let codeProduct = codeArray[2]

      /* Parse When */
      let propertyDisplacement = 0
      let codeWhen = 'Current'
      if (codeArray[3] === 'previous') {
        propertyDisplacement++
        codeWhen = '1 Previous'
      }
      if (codeArray[4] === 'previous') {
        propertyDisplacement++
        codeWhen = '2 Previous'
      }
      if (codeArray[5] === 'previous') {
        propertyDisplacement++
        codeWhen = '3 Previous'
      }
      if (codeArray[6] === 'previous') {
        propertyDisplacement++
        codeWhen = '4 Previous'
      }
      if (codeArray[7] === 'previous') {
        propertyDisplacement++
        codeWhen = '5 Previous'
      }
      algebraOperand.whenPicker.setSelected(undefined, undefined, undefined, propertyDisplacement)

      let codeProperty = codeArray[3 + propertyDisplacement]
      let codeValue = comparisonOperand.algebra.operandB.code.replace('"', '').replace('"', '')

      let dataMines = Object.keys(scanResult)
      for (let i = 0; i < dataMines.length; i++) {
        let dataMine = dataMines[i]
        let dataMineObject = scanResult[dataMine]
        let bots = Object.keys(dataMineObject)
        for (let j = 0; j < bots.length; j++) {
          let bot = bots[j]
          let botObject = dataMineObject[bot]
          let products = Object.keys(botObject)
          for (let k = 0; k < products.length; k++) {
            let product = products[k]
            let productObject = botObject[product]
            if (codeProduct === product) {
              algebraOperand.dataMinePicker.setSelected(dataMines, scanResult, undefined, i)
              algebraOperand.botPicker.setSelected(bots, dataMineObject, scanResult, j)
              algebraOperand.productPicker.setSelected(products, botObject, dataMineObject, k)
              let properties = Object.keys(productObject.properties)
              for (let m = 0; m < properties.length; m++) {
                let property = properties[m]
                let propertyObject = productObject.properties[property]
                if (codeProperty === property) {
                  algebraOperand.propertyPicker.setSelected(properties, productObject.properties, botObject, m)
                  let values = propertyObject.possibleValues
                  for (let n = 0; n < values.length; n++) {
                    let value = values[n]
                    let valueObject = propertyObject[value]
                    if (codeValue === value) {
                      algebraOperand.valuePicker.setSelected(values, propertyObject, productObject, n)
                    }
                  }
                }
              }
              let timeFrames = productObject.validTimeFrames
              for (let m = 0; m < timeFrames.length; m++) {
                let timeFrame = timeFrames[m]
                let timeFrameObject = productObject.validTimeFrames[timeFrame]
                if (codeTimeFrame === timeFrame) {
                  algebraOperand.timeFramePicker.setSelected(timeFrames, productObject, botObject, m)
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
    scanResult = JSON.parse(JSON.stringify(selector))
  }

  function convertToCode () {
    // if (comparisonOperatorA === undefined || comparisonOperatorB === undefined || comparisonPicker === undefined) { return }

    // chart.at01hs.bollingerSubChannel.previous.previous.slope=== "Extreme"
    /*
    let code = ''

    code = code + 'chart.at' + comparisonOperatorA.timeFramePicker.getSelected().replace('-', '')
    code = code + '.' + comparisonOperatorA.productPicker.getSelected()
    insertWhen(comparisonOperatorA)
    code = code + '.' + comparisonOperatorA.propertyPicker.getSelected()

    switch (comparisonPicker.getSelected()) {
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

    if (comparisonPicker.getSelected() === 'Equal To') {
      code = code + '"' + comparisonOperatorA.valuePicker.getSelected() + '"'
    } else {
      code = code + 'chart.at' + comparisonOperatorB.timeFramePicker.getSelected().replace('-', '')
      code = code + '.' + comparisonOperatorB.productPicker.getSelected()
      insertWhen(comparisonOperatorB)
      code = code + '.' + comparisonOperatorB.propertyPicker.getSelected()
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
    */
  }

  function finalizePickers () {
    if (conditionStructure === undefined) { return }
    for (let i = 0; i < conditionStructure.logicOperands.length; i++) {
      let logicOperand = conditionStructure.logicOperands[i]
      finalizeOperator(logicOperand.comparison.operandA.algebra.operandA)
      finalizeOperator(logicOperand.comparison.operandA.algebra.operandB)
      finalizeOperator(logicOperand.comparison.operandB.algebra.operandA)
      finalizeOperator(logicOperand.comparison.operandB.algebra.operandB)
    }
  }

  function finalizeOperator (operand) {
    if (operand === undefined) { return }

    if (operand.whenPicker !== undefined) {
      operand.whenPicker.finalize()
      operand.whenPicker = undefined
    }

    if (operand.algebraicPicker !== undefined) {
      operand.algebraicPicker.finalize()
      operand.algebraicPicker = undefined
    }

    if (operand.dataMinePicker !== undefined) {
      operand.dataMinePicker.container.eventHandler.stopListening(operand.botPicker.eventSuscriptionId)
      operand.dataMinePicker.finalize()
      operand.dataMinePicker = undefined
    }

    if (operand.botPicker !== undefined) {
      operand.botPicker.container.eventHandler.stopListening(operand.productPicker.eventSuscriptionId)
      operand.botPicker.finalize()
      operand.botPicker = undefined
    }

    if (operand.productPicker !== undefined) {
      operand.productPicker.container.eventHandler.stopListening(operand.propertyPicker.eventSuscriptionId)
      operand.productPicker.container.eventHandler.stopListening(operand.timeFramePicker.eventSuscriptionId)
      operand.productPicker.finalize()
      operand.productPicker = undefined
    }

    if (operand.propertyPicker !== undefined) {
      operand.propertyPicker.container.eventHandler.stopListening(operand.valuePicker.eventSuscriptionId)
      operand.propertyPicker.finalize()
      operand.propertyPicker = undefined
    }

    if (operand.valuePicker !== undefined) {
      operand.valuePicker.finalize()
      operand.valuePicker = undefined
    }

    if (operand.timeFramePicker !== undefined) {
      operand.timeFramePicker.finalize()
      operand.timeFramePicker = undefined
    }
  }

  function onParentChanged (event) {
    if (event.selected === 4) {
 // this means Equal To

      comparisonOperatorA.valuePicker.visible = true
      comparisonOperatorB.whenPicker.visible = false
      comparisonOperatorB.algebraicPicker.visible = false
      comparisonOperatorB.dataMinePicker.visible = false
      comparisonOperatorB.botPicker.visible = false
      comparisonOperatorB.productPicker.visible = false
      comparisonOperatorB.propertyPicker.visible = false
      comparisonOperatorB.timeFramePicker.visible = false
    } else {
      comparisonOperatorA.valuePicker.visible = false
      comparisonOperatorB.whenPicker.visible = true
      comparisonOperatorB.algebraicPicker.visible = true
      comparisonOperatorB.dataMinePicker.visible = true
      comparisonOperatorB.botPicker.visible = true
      comparisonOperatorB.productPicker.visible = true
      comparisonOperatorB.propertyPicker.visible = true
      comparisonOperatorB.timeFramePicker.visible = true
    }
  }

  function getContainer (point) {
    let container
    if (thisObject.visible === true) {
      if (conditionStructure === undefined) { return }

      for (let i = 0; i < conditionStructure.logicOperands.length; i++) {
        let logicOperand = conditionStructure.logicOperands[i]
        container = operandGetContainer(point, logicOperand.comparison.operandA.algebra.operandA)
        if (container !== undefined) { return container }
        container = operandGetContainer(point, logicOperand.comparison.operandA.algebra.operandB)
        if (container !== undefined) { return container }
        container = operandGetContainer(point, logicOperand.comparison.operandB.algebra.operandA)
        if (container !== undefined) { return container }
        container = operandGetContainer(point, logicOperand.comparison.operandB.algebra.operandB)
        if (container !== undefined) { return container }

        container = logicOperand.comparison.picker.getContainer(point)
        if (container !== undefined) { return container }
      }

      if (thisObject.container.frame.isThisPointHere(point, true) === true) {
        return thisObject.container
      } else {
        return undefined
      }
    }
  }

  function operandGetContainer (point, operand) {
    let container
    if (operand.whenPicker !== undefined) {
      if (operand.whenPicker.visible === true) {
        container = operand.whenPicker.getContainer(point)
        if (container !== undefined) { return container }
      }
    }

    if (operand.algebraicPicker !== undefined) {
      if (operand.algebraicPicker.visible === true) {
        container = operand.algebraicPicker.getContainer(point)
        if (container !== undefined) { return container }
      }
    }

    if (operand.dataMinePicker !== undefined) {
      if (operand.dataMinePicker.visible === true) {
        container = operand.dataMinePicker.getContainer(point)
        if (container !== undefined) { return container }
      }
    }

    if (operand.botPicker !== undefined) {
      if (operand.botPicker.visible === true) {
        container = operand.botPicker.getContainer(point)
        if (container !== undefined) { return container }
      }
    }

    if (operand.productPicker !== undefined) {
      if (operand.productPicker.visible === true) {
        container = operand.productPicker.getContainer(point)
        if (container !== undefined) { return container }
      }
    }

    if (operand.propertyPicker !== undefined) {
      if (operand.propertyPicker.visible === true) {
        container = operand.propertyPicker.getContainer(point)
        if (container !== undefined) { return container }
      }
    }

    if (operand.valuePicker !== undefined) {
      if (operand.valuePicker.visible === true) {
        container = operand.valuePicker.getContainer(point)
        if (container !== undefined) { return container }
      }
    }

    if (operand.timeFramePicker !== undefined) {
      if (operand.timeFramePicker.visible === true) {
        container = operand.timeFramePicker.getContainer(point)
        if (container !== undefined) { return container }
      }
    }
  }

  function physics () {

  }

  function drawBackground () {
    thisObjectDrawBackground()
    childrenDrawBackground()
  }

  function childrenDrawBackground () {
    if (conditionStructure === undefined) { return }

    for (let i = 0; i < conditionStructure.logicOperands.length; i++) {
      let logicOperand = conditionStructure.logicOperands[i]
      operandDrawBackground(logicOperand.comparison.operandA.algebra.operandA)
      operandDrawBackground(logicOperand.comparison.operandA.algebra.operandB)
      operandDrawBackground(logicOperand.comparison.operandB.algebra.operandA)
      operandDrawBackground(logicOperand.comparison.operandB.algebra.operandB)

      logicOperand.comparison.picker.drawBackground
    }
  }

  function operandDrawBackground (operand) {
    if (operand === undefined) { return }

    if (operand.whenPicker !== undefined) {
      if (operand.whenPicker.visible === true) {
        operand.whenPicker.drawBackground()
      }
    }

    if (operand.algebraicPicker !== undefined) {
      if (operand.algebraicPicker.visible === true) {
        operand.algebraicPicker.drawBackground()
      }
    }

    if (operand.dataMinePicker !== undefined) {
      if (operand.dataMinePicker.visible === true) {
        operand.dataMinePicker.drawBackground()
      }
    }

    if (operand.botPicker !== undefined) {
      if (operand.botPicker.visible === true) {
        operand.botPicker.drawBackground()
      }
    }

    if (operand.productPicker !== undefined) {
      if (operand.productPicker.visible === true) {
        operand.productPicker.drawBackground()
      }
    }

    if (operand.propertyPicker !== undefined) {
      if (operand.propertyPicker.visible === true) {
        operand.propertyPicker.drawBackground()
      }
    }

    if (operand.valuePicker !== undefined) {
      if (operand.valuePicker.visible === true) {
        operand.valuePicker.drawBackground()
      }
    }

    if (operand.timeFramePicker !== undefined) {
      if (operand.timeFramePicker.visible === true) {
        operand.timeFramePicker.drawBackground()
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
    if (conditionStructure === undefined) { return }

    for (let i = 0; i < conditionStructure.logicOperands.length; i++) {
      let logicOperand = conditionStructure.logicOperands[i]
      operandDrawForeground(logicOperand.comparison.operandA.algebra.operandA)
      operandDrawForeground(logicOperand.comparison.operandA.algebra.operandB)
      operandDrawForeground(logicOperand.comparison.operandB.algebra.operandA)
      operandDrawForeground(logicOperand.comparison.operandB.algebra.operandB)

      logicOperand.comparison.picker.drawForeground
    }
  }

  function operandDrawForeground (operand) {
    if (operand === undefined) { return }

    if (operand.whenPicker !== undefined) {
      if (operand.whenPicker.visible === true) {
        operand.whenPicker.drawForeground()
      }
    }

    if (operand.algebraicPicker !== undefined) {
      if (operand.algebraicPicker.visible === true) {
        operand.algebraicPicker.drawForeground()
      }
    }

    if (operand.dataMinePicker !== undefined) {
      if (operand.dataMinePicker.visible === true) {
        operand.dataMinePicker.drawForeground()
      }
    }

    if (operand.botPicker !== undefined) {
      if (operand.botPicker.visible === true) {
        operand.botPicker.drawForeground()
      }
    }

    if (operand.productPicker !== undefined) {
      if (operand.productPicker.visible === true) {
        operand.productPicker.drawForeground()
      }
    }

    if (operand.propertyPicker !== undefined) {
      if (operand.propertyPicker.visible === true) {
        operand.propertyPicker.drawForeground()
      }
    }

    if (operand.valuePicker !== undefined) {
      if (operand.valuePicker.visible === true) {
        operand.valuePicker.drawForeground()
      }
    }

    if (operand.timeFramePicker !== undefined) {
      if (operand.timeFramePicker.visible === true) {
        operand.timeFramePicker.drawForeground()
      }
    }
  }

  function thisObjectDrawForeground () {

  }
}
