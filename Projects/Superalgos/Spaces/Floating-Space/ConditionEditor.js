
function newConditionEditor() {
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
    thisObject.container.frame.width = thisObject.container.frame.radius * 2
    thisObject.container.frame.height = thisObject.container.frame.radius * 2
    thisObject.container.frame.containerName = MODULE_NAME

    let isMouseOver = false
    let conditionStructure
    let scanResult

    let timeFrameIcon
    let dataMineIcon
    let botIcon
    let whenIcon
    let productIcon
    let propertyIcon
    let operationIcon
    let valueIcon

    const PICKER_WIDTH = 150
    const PICKER_HEIGHT = 60

    return thisObject

    function finalize() {
        thisObject.container.finalize()
        thisObject.container = undefined
        thisObject.payload = undefined
        thisObject.isVisibleFunction = undefined

        conditionStructure = undefined
        scanResult = undefined

        timeFrameIcon = undefined
        dataMineIcon = undefined
        whenIcon = undefined
        botIcon = undefined
        productIcon = undefined
        operationIcon = undefined
        propertyIcon = undefined
        valueIcon = undefined
    }

    function initialize() {
        timeFrameIcon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'time-frame')
        dataMineIcon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'data-mine')
        botIcon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'indicator-bot')
        whenIcon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'trigger-on')
        productIcon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'product-definition')
        propertyIcon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'record-property')
        operationIcon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'space-settings')
        valueIcon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'trading-strategy')
    }

    function activate(action) {
        thisObject.visible = true
        thisObject.payload = action.node.payload
        thisObject.payload.uiObject.resetErrorMessage()
        thisObject.payload.uiObject.uiObjectTitle.exitEditMode()

        conditionStructure = {
            code: '',
            logicOperands: []
        }

        scanDataMines()
        loadFromCode()
        EDITOR_ON_FOCUS = true
    }

    function deactivate() {
        convertToCode()
        finalizePickers()

        conditionStructure = undefined

        if (thisObject.visible === true) {
            thisObject.visible = false
        }
        EDITOR_ON_FOCUS = false
    }

    function loadFromCode() {
        if (thisObject.payload.node.code === undefined) { thisObject.payload.node.code = '' }
        conditionStructure.code = thisObject.payload.node.code.replace(/ /g, '')

        /* LOGICAL ORs */
        let orArray = conditionStructure.code.split('||')
        for (let j = 0; j < 3; j++) {
            let logicOperand = {
                code: orArray[j],
                index: j,
                comparison: {},
                visible: false
            }

            if (logicOperand.code !== undefined) {
                logicOperand.visible = true
                if (orArray[j + 1] !== undefined) {
                    logicOperand.operator = '||'
                }
            } else {
                logicOperand.code = ''
            }

            checkComparison(logicOperand, j)
            conditionStructure.logicOperands.push(logicOperand)
        }

        function checkComparison(logicOperand) {
            /* We are going to decompose the  code into 2 comparison operators */
            logicOperand.comparison.operandA = {
                index: 0,
                code: ''
            }
            logicOperand.comparison.operandB = {
                index: 1,
                code: ''
            }

            if (logicOperand.code.indexOf('>') > 0) {
                let codeArray = logicOperand.code.split('>')
                logicOperand.comparison.operandA.code = codeArray[0]
                logicOperand.comparison.operandB.code = codeArray[1]
                logicOperand.comparison.operator = '>'
                logicOperand.comparison.operatorIndex = 0
            }

            if (logicOperand.code.indexOf('<') > 0) {
                let codeArray = logicOperand.code.split('<')
                logicOperand.comparison.operandA.code = codeArray[0]
                logicOperand.comparison.operandB.code = codeArray[1]
                logicOperand.comparison.operator = '<'
                logicOperand.comparison.operatorIndex = 1
            }

            if (logicOperand.code.indexOf('>=') > 0) {
                let codeArray = logicOperand.code.split('>=')
                logicOperand.comparison.operandA.code = codeArray[0]
                logicOperand.comparison.operandB.code = codeArray[1]
                logicOperand.comparison.operator = '>='
                logicOperand.comparison.operatorIndex = 2
            }

            if (logicOperand.code.indexOf('<=') > 0) {
                let codeArray = logicOperand.code.split('<=')
                logicOperand.comparison.operandA.code = codeArray[0]
                logicOperand.comparison.operandB.code = codeArray[1]
                logicOperand.comparison.operator = '<='
                logicOperand.comparison.operatorIndex = 3
            }

            if (logicOperand.code.indexOf('===') > 0) {
                let codeArray = logicOperand.code.split('===')
                logicOperand.comparison.operandA.code = codeArray[0]
                logicOperand.comparison.operandB.code = codeArray[1]
                logicOperand.comparison.operator = '==='
                logicOperand.comparison.operatorIndex = 4
            }

            /* Each comparison code may have one or more algebra operators */
            checkAlgebra(logicOperand, logicOperand.comparison.operandA)
            checkAlgebra(logicOperand, logicOperand.comparison.operandB)
        }

        function checkAlgebra(logicOperand, comparisonOperand) {
            comparisonOperand.algebra = {
                operandA: { index: 0 },
                operandB: { index: 1 }
            }

            /* The default situation is that there is no algebra operation, meaning we will setup a algebra operation only with operandA */
            comparisonOperand.algebra.operandA.code = comparisonOperand.code
            comparisonOperand.algebra.operandB.code = ''
            comparisonOperand.algebra.operator = '...'
            comparisonOperand.algebra.operatorIndex = 0

            if (comparisonOperand.code.indexOf('+') > 0) {
                let codeArray = comparisonOperand.code.split('+')
                comparisonOperand.algebra.operandA.code = codeArray[0]
                comparisonOperand.algebra.operandB.code = codeArray[1]
                comparisonOperand.algebra.operator = '+'
                comparisonOperand.algebra.operatorIndex = 1
            }

            if (comparisonOperand.code.indexOf('-') > 0) {
                let codeArray = comparisonOperand.code.split('-')
                comparisonOperand.algebra.operandA.code = codeArray[0]
                comparisonOperand.algebra.operandB.code = codeArray[1]
                comparisonOperand.algebra.operator = '-'
                comparisonOperand.algebra.operatorIndex = 2
            }

            if (comparisonOperand.code.indexOf('*') > 0) {
                let codeArray = comparisonOperand.code.split('*')
                comparisonOperand.algebra.operandA.code = codeArray[0]
                comparisonOperand.algebra.operandB.code = codeArray[1]
                comparisonOperand.algebra.operator = '*'
                comparisonOperand.algebra.operatorIndex = 3
            }

            if (comparisonOperand.code.indexOf('/') > 0) {
                let codeArray = comparisonOperand.code.split('/')
                comparisonOperand.algebra.operandA.code = codeArray[0]
                comparisonOperand.algebra.operandB.code = codeArray[1]
                comparisonOperand.algebra.operator = '/'
                comparisonOperand.algebra.operatorIndex = 4
            }

            initializePickersSet(logicOperand, comparisonOperand, comparisonOperand.algebra.operandA)
            initializePickersSet(logicOperand, comparisonOperand, comparisonOperand.algebra.operandB)
            updatePickers(logicOperand, comparisonOperand, comparisonOperand.algebra.operandA)
            updatePickers(logicOperand, comparisonOperand, comparisonOperand.algebra.operandB)
        }

        function initializePickersSet(logicOperand, comparisonOperand, algebraOperand) {
            const ALGEBRA_SEPARATION = PICKER_HEIGHT
            const COMPARISON_SEPARATION = ALGEBRA_SEPARATION * 2
            const LOGIC_SEPARATION = COMPARISON_SEPARATION * 2

            let properties
            let parent
            let current
            let yOffset = (logicOperand.index - 1) * LOGIC_SEPARATION + (comparisonOperand.index - 0.5) * COMPARISON_SEPARATION + (algebraOperand.index - 0.5) * ALGEBRA_SEPARATION

            if (algebraOperand.index === 0) {
                comparisonOperand.algebra.picker = newPicker()
                let picker = comparisonOperand.algebra.picker
                picker.name = 'Algebra'
                picker.container.connectToParent(thisObject.container)
                picker.container.frame.position.x = 0 - picker.container.frame.width / 2 + picker.container.frame.width * 2.5
                picker.container.frame.position.y = 0 - picker.container.frame.height / 2 + yOffset
                current = ['...', 'Plus', 'Minus', 'Times', 'Divided by']
                picker.initialize(current, current)
                switch (comparisonOperand.algebra.operator) {
                    case '+': {
                        picker.setSelected(undefined, undefined, undefined, 1)
                        break
                    }
                    case '-': {
                        picker.setSelected(undefined, undefined, undefined, 2)
                        break
                    }
                    case '*': {
                        picker.setSelected(undefined, undefined, undefined, 3)
                        break
                    }
                    case '/': {
                        picker.setSelected(undefined, undefined, undefined, 4)
                        break
                    }
                }
                picker.visible = true
                let structureBranch = {
                    logicOperand: logicOperand,
                    comparisonOperand: comparisonOperand,
                    algebraOperand: algebraOperand,
                    pickerName: 'Algebra'
                }
                picker.eventSuscriptionId = picker.container.eventHandler.listenToEvent('onParentChanged', onParentChanged, structureBranch)
            }

            if (comparisonOperand.index === 0 && algebraOperand.index === 1) {
                logicOperand.comparison.picker = newPicker()
                let picker = logicOperand.comparison.picker
                picker.name = 'Comparison'
                picker.container.connectToParent(thisObject.container)
                picker.container.frame.position.x = 0 - picker.container.frame.width / 2 + picker.container.frame.width * 2.5
                picker.container.frame.position.y = 0 - picker.container.frame.height / 2 + yOffset
                let optionsList = ['Greater Than', 'Less Than', 'Greater or Equal Than', 'Less or Equal Than', 'Equal To']
                picker.initialize(optionsList)
                switch (logicOperand.comparison.operator) {
                    case '>': {
                        picker.setSelected(undefined, undefined, undefined, 0)
                        break
                    }
                    case '<': {
                        picker.setSelected(undefined, undefined, undefined, 1)
                        break
                    }
                    case '>=': {
                        picker.setSelected(undefined, undefined, undefined, 2)
                        break
                    }
                    case '<=': {
                        picker.setSelected(undefined, undefined, undefined, 3)
                        break
                    }
                    case '===': {
                        picker.setSelected(undefined, undefined, undefined, 4)
                        break
                    }
                }
                picker.visible = true
                let structureBranch = {
                    logicOperand: logicOperand,
                    comparisonOperand: comparisonOperand,
                    algebraOperand: algebraOperand,
                    pickerName: 'Comparison'
                }
                picker.eventSuscriptionId = picker.container.eventHandler.listenToEvent('onParentChanged', onParentChanged, structureBranch)
            }

            if (comparisonOperand.index === 1 && algebraOperand.index === 1 && logicOperand.index <= 1) {
                logicOperand.picker = newPicker()
                let picker = logicOperand.picker
                picker.name = 'Logic'
                picker.container.connectToParent(thisObject.container)
                picker.container.frame.position.x = 0 - picker.container.frame.width / 2 + picker.container.frame.width * 2.5
                picker.container.frame.position.y = 0 - picker.container.frame.height / 2 + yOffset
                let optionsList = ['...', 'OR']
                picker.initialize(optionsList)
                if (logicOperand.operator === '||') {
                    picker.setSelected(undefined, undefined, undefined, 1)
                }
                picker.visible = true
                let structureBranch = {
                    logicOperand: logicOperand,
                    comparisonOperand: comparisonOperand,
                    algebraOperand: algebraOperand,
                    pickerName: 'Logic'
                }
                picker.eventSuscriptionId = picker.container.eventHandler.listenToEvent('onParentChanged', onParentChanged, structureBranch)
            }

            let visible = true
            if (algebraOperand.index === 1 && comparisonOperand.algebra.picker.getSelected() === '...') { visible = false }
            if (logicOperand.comparison.picker !== undefined && comparisonOperand.index === 1 && logicOperand.comparison.picker.getSelected() === 'Equal To') { visible = false }

            algebraOperand.whenPicker = newPicker()
            algebraOperand.whenPicker.name = 'When'
            algebraOperand.whenPicker.container.connectToParent(thisObject.container)
            algebraOperand.whenPicker.container.frame.position.x = 0 - algebraOperand.whenPicker.container.frame.width / 2 - algebraOperand.whenPicker.container.frame.width * 0.5
            algebraOperand.whenPicker.container.frame.position.y = 0 - algebraOperand.whenPicker.container.frame.height / 2 + yOffset
            current = ['Current', '1 Previous', '2 Previous', '3 Previous', '4 Previous', '5 Previous']
            algebraOperand.whenPicker.initialize(current, current)
            algebraOperand.whenPicker.visible = visible

            algebraOperand.dataMinePicker = newPicker()
            algebraOperand.dataMinePicker.name = 'Data Mine'
            algebraOperand.dataMinePicker.container.connectToParent(thisObject.container)
            algebraOperand.dataMinePicker.container.frame.position.x = 0 - algebraOperand.dataMinePicker.container.frame.width / 2 - algebraOperand.dataMinePicker.container.frame.width * 2.5
            algebraOperand.dataMinePicker.container.frame.position.y = 0 - algebraOperand.dataMinePicker.container.frame.height / 2 + yOffset
            current = scanResult
            properties = Object.keys(current)
            algebraOperand.dataMinePicker.initialize(properties, current)
            parent = current
            algebraOperand.dataMinePicker.visible = visible

            algebraOperand.botPicker = newPicker()
            algebraOperand.botPicker.name = 'Bot'
            algebraOperand.botPicker.container.connectToParent(thisObject.container)
            algebraOperand.botPicker.container.frame.position.x = 0 - algebraOperand.botPicker.container.frame.width / 2 - algebraOperand.botPicker.container.frame.width * 1.5
            algebraOperand.botPicker.container.frame.position.y = 0 - algebraOperand.botPicker.container.frame.height / 2 + yOffset
            current = parent[properties[0]]
            properties = Object.keys(current)
            algebraOperand.botPicker.initialize(properties, current, parent)
            parent = current
            algebraOperand.botPicker.visible = visible

            algebraOperand.productPicker = newPicker()
            algebraOperand.productPicker.name = 'Product'
            algebraOperand.productPicker.container.connectToParent(thisObject.container)
            algebraOperand.productPicker.container.frame.position.x = 0 - algebraOperand.productPicker.container.frame.width / 2 + algebraOperand.productPicker.container.frame.width * 0.5
            algebraOperand.productPicker.container.frame.position.y = 0 - algebraOperand.productPicker.container.frame.height / 2 + yOffset
            current = parent[properties[0]]
            properties = Object.keys(current)
            algebraOperand.productPicker.initialize(properties, current, parent)
            parent = current
            algebraOperand.productPicker.visible = visible

            let productParent = parent
            let productProperties = properties

            algebraOperand.propertyPicker = newPicker()
            algebraOperand.propertyPicker.name = 'Property'
            algebraOperand.propertyPicker.container.connectToParent(thisObject.container)
            algebraOperand.propertyPicker.container.frame.position.x = 0 - algebraOperand.propertyPicker.container.frame.width / 2 + algebraOperand.propertyPicker.container.frame.width * 1.5
            algebraOperand.propertyPicker.container.frame.position.y = 0 - algebraOperand.propertyPicker.container.frame.height / 2 + yOffset
            current = productParent[productProperties[0]]
            current = current.properties
            properties = Object.keys(current)
            algebraOperand.propertyPicker.initialize(properties, current, productParent, 'properties')
            parent = current
            algebraOperand.propertyPicker.visible = visible

            algebraOperand.valuePicker = newPicker()
            algebraOperand.valuePicker.name = 'Value'
            algebraOperand.valuePicker.container.connectToParent(thisObject.container)
            algebraOperand.valuePicker.container.frame.position.x = 0 - algebraOperand.valuePicker.container.frame.width / 2 + algebraOperand.valuePicker.container.frame.width * 3.5
            algebraOperand.valuePicker.container.frame.position.y = 0 - algebraOperand.valuePicker.container.frame.height / 2 + yOffset + ALGEBRA_SEPARATION
            current = parent[properties[0]]
            properties = current.possibleValues
            algebraOperand.valuePicker.initialize(properties, current, parent, 'possibleValues')
            parent = current
            algebraOperand.valuePicker.visible = false
            if (logicOperand.comparison.picker !== undefined && logicOperand.comparison.picker.getSelected() === 'Equal To') {
                comparisonOperand.algebra.operandA.valuePicker.visible = true
            }

            algebraOperand.timeFramePicker = newPicker()
            algebraOperand.timeFramePicker.name = 'Time Frame'
            algebraOperand.timeFramePicker.container.connectToParent(thisObject.container)
            algebraOperand.timeFramePicker.container.frame.position.x = 0 - algebraOperand.timeFramePicker.container.frame.width / 2 - algebraOperand.timeFramePicker.container.frame.width * 3.0
            algebraOperand.timeFramePicker.container.frame.position.y = 0 - algebraOperand.timeFramePicker.container.frame.height / 2 + yOffset
            algebraOperand.timeFramePicker.container.frame.width = algebraOperand.timeFramePicker.container.frame.width / 2
            current = productParent[productProperties[0]]
            properties = current.validTimeFrames
            algebraOperand.timeFramePicker.initialize(properties, current, productParent, 'validTimeFrames')
            parent = current
            algebraOperand.timeFramePicker.visible = visible

            algebraOperand.botPicker.eventSuscriptionId = algebraOperand.dataMinePicker.container.eventHandler.listenToEvent('onParentChanged', algebraOperand.botPicker.onParentChanged)
            algebraOperand.productPicker.eventSuscriptionId = algebraOperand.botPicker.container.eventHandler.listenToEvent('onParentChanged', algebraOperand.productPicker.onParentChanged)
            algebraOperand.propertyPicker.eventSuscriptionId = algebraOperand.productPicker.container.eventHandler.listenToEvent('onParentChanged', algebraOperand.propertyPicker.onParentChanged)
            algebraOperand.valuePicker.eventSuscriptionId = algebraOperand.propertyPicker.container.eventHandler.listenToEvent('onParentChanged', algebraOperand.valuePicker.onParentChanged)
            algebraOperand.timeFramePicker.eventSuscriptionId = algebraOperand.productPicker.container.eventHandler.listenToEvent('onParentChanged', algebraOperand.timeFramePicker.onParentChanged)
        }

        function updatePickers(logicOperand, comparisonOperand, algebraOperand) {
            let codeArray = algebraOperand.code.split('.')

            let codeTimeFrame
            if (codeArray[1] !== undefined) {
                codeTimeFrame = codeArray[1].substring(2, 4) + '-' + codeArray[1].substring(4, 7)
            }

            let codeProduct
            if (codeArray[2] !== undefined) {
                codeProduct = codeArray[2]
            }

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

            let codeProperty
            if (codeArray[3 + propertyDisplacement] !== undefined) {
                codeProperty = codeArray[3 + propertyDisplacement]
            }

            let codeValue = logicOperand.comparison.operandB.code.replace('"', '').replace('"', '')

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

    function scanDataMines() {
        let selector = {}

        let workspace = UI.projects.superalgos.spaces.designSpace.workspace.workspaceNode

        for (let i = 0; i < workspace.rootNodes.length; i++) {
            let rootNode = workspace.rootNodes[i]
            if (rootNode.type !== 'Data Mine') { continue }
            let dataMine = rootNode
            let dataMineName = UI.projects.superalgos.utilities.nodeConfig.loadPropertyFromNodeConfig(dataMine.payload, 'codeName')
            selector[dataMineName] = {}
            let bots = dataMine.sensorBots.concat(dataMine.indicatorBots)
            for (let j = 0; j < bots.length; j++) {
                let bot = bots[j]
                let botName = UI.projects.superalgos.utilities.nodeConfig.loadPropertyFromNodeConfig(bot.payload, 'codeName')
                let selectorDataMine = selector[dataMineName]
                selectorDataMine[botName] = {}
                for (let k = 0; k < bot.products.length; k++) {
                    let product = bot.products[k]
                    let productName = UI.projects.superalgos.utilities.nodeConfig.loadPropertyFromNodeConfig(product.payload, 'singularVariableName')
                    if (productName === undefined) { continue }
                    let selectorProduct = selectorDataMine[botName]
                    selectorProduct[productName] = {
                        properties: {}
                    }
                    if (product.record === undefined) { continue }
                    for (let m = 0; m < product.record.properties.length; m++) {
                        let property = product.record.properties[m]
                        let propertyName = UI.projects.superalgos.utilities.nodeConfig.loadPropertyFromNodeConfig(property.payload, 'codeName')
                        let selectorProperty = selectorProduct[productName]
                        selectorProperty = selectorProperty.properties
                        selectorProperty[propertyName] = {}
                        let possibleValues = UI.projects.superalgos.utilities.nodeConfig.loadPropertyFromNodeConfig(property.payload, 'possibleValues')
                        if (possibleValues === undefined) { possibleValues = [] }
                        let selectorPossibleValue = selectorProperty[propertyName]
                        selectorPossibleValue.possibleValues = possibleValues
                    }
                    let allPossibleTimeFrames = []
                    for (let m = 0; m < product.datasets.length; m++) {
                        let dataset = product.datasets[m]
                        let validTimeFrames = UI.projects.superalgos.utilities.nodeConfig.loadPropertyFromNodeConfig(dataset.payload, 'validTimeFrames')
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

    function convertToCode() {
        if (conditionStructure === undefined) { return }

        // chart.at01hs.bollingerSubChannel.previous.previous.slope=== "Extreme"

        let code = ''

        for (let i = 0; i < conditionStructure.logicOperands.length; i++) {
            let logicOperand = conditionStructure.logicOperands[i]
            logicOperandToCode(logicOperand)
            if (logicOperand.picker.getSelected() !== 'OR') {
                break
            } else {
                code = code + ' || '
            }
        }

        thisObject.payload.node.code = code

        function logicOperandToCode(logicOperand) {
            algebraOperandToCode(logicOperand.comparison.operandA.algebra.operandA)
            if (logicOperand.comparison.operandA.algebra.picker.getSelected() !== '...') {
                insertAlgebraOperator(logicOperand.comparison.operandA.algebra)
                algebraOperandToCode(logicOperand.comparison.operandA.algebra.operandB)
            }

            switch (logicOperand.comparison.picker.getSelected()) {
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

            if (logicOperand.comparison.picker.getSelected() === 'Equal To') {
                code = code + '"' + logicOperand.comparison.operandA.algebra.operandA.valuePicker.getSelected() + '"'
            } else {
                algebraOperandToCode(logicOperand.comparison.operandB.algebra.operandA)
                if (logicOperand.comparison.operandB.algebra.picker.getSelected() !== '...') {
                    insertAlgebraOperator(logicOperand.comparison.operandB.algebra)
                    algebraOperandToCode(logicOperand.comparison.operandB.algebra.operandB)
                }
            }

            function algebraOperandToCode(algebraOperand) {
                if (algebraOperand.timeFramePicker.getSelected() === 'Any Time Frame') {
                    code = code + 'chart.atAnyTimeFrame'
                } else {
                    code = code + 'chart.at' + algebraOperand.timeFramePicker.getSelected().replace('-', '')
                }

                code = code + '.' + algebraOperand.productPicker.getSelected()
                insertWhen(algebraOperand)
                code = code + '.' + algebraOperand.propertyPicker.getSelected()
            }

            function insertAlgebraOperator(algebra) {
                switch (algebra.picker.getSelected()) {
                    case '...': {
                        return
                    }
                    case 'Plus': {
                        code = code + ' + '
                        return
                    }
                    case 'Minus': {
                        code = code + ' - '
                        return
                    }
                    case 'Times': {
                        code = code + ' * '
                        return
                    }
                    case 'Divided by': {
                        code = code + ' / '
                        return
                    }
                }
            }
            function insertWhen(algebraOperand) {
                switch (algebraOperand.whenPicker.getSelected()) {
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
    }

    function finalizePickers() {
        if (conditionStructure === undefined) { return }
        for (let i = 0; i < conditionStructure.logicOperands.length; i++) {
            let logicOperand = conditionStructure.logicOperands[i]
            finalizeOperator(logicOperand.comparison.operandA.algebra.operandA)
            finalizeOperator(logicOperand.comparison.operandA.algebra.operandB)
            finalizeOperator(logicOperand.comparison.operandB.algebra.operandA)
            finalizeOperator(logicOperand.comparison.operandB.algebra.operandB)

            if (logicOperand.comparison.operandA.algebra.picker !== undefined) {
                logicOperand.comparison.operandA.algebra.picker.container.eventHandler.stopListening(logicOperand.comparison.operandA.algebra.picker.eventSuscriptionId)
                logicOperand.comparison.operandA.algebra.picker.finalize()
            }

            if (logicOperand.comparison.operandB.algebra.picker !== undefined) {
                logicOperand.comparison.operandB.algebra.picker.container.eventHandler.stopListening(logicOperand.comparison.operandB.algebra.picker.eventSuscriptionId)
                logicOperand.comparison.operandB.algebra.picker.finalize()
            }

            if (logicOperand.comparison.picker !== undefined) {
                logicOperand.comparison.picker.container.eventHandler.stopListening(logicOperand.comparison.picker.eventSuscriptionId)
                logicOperand.comparison.picker.finalize()
            }

            if (logicOperand.picker !== undefined) {
                logicOperand.picker.container.eventHandler.stopListening(logicOperand.picker.eventSuscriptionId)
                logicOperand.picker.finalize()
            }
        }
    }

    function finalizeOperator(operand) {
        if (operand === undefined) { return }

        if (operand.whenPicker !== undefined) {
            operand.whenPicker.finalize()
            operand.whenPicker = undefined
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

    function onParentChanged(event, structureBranch) {
        let logicOperand = structureBranch.logicOperand

        if (structureBranch.pickerName === 'Logic') {
            if (event.selected === 0) {
                if (logicOperand.index === 0) {
                    conditionStructure.logicOperands[1].visible = false
                    conditionStructure.logicOperands[2].visible = false
                }
                if (logicOperand.index === 1) {
                    conditionStructure.logicOperands[2].visible = false
                }
            } else {
                if (logicOperand.index === 0) {
                    conditionStructure.logicOperands[1].visible = true

                    if (conditionStructure.logicOperands[1].picker.getSelected() !== '...') {
                        conditionStructure.logicOperands[2].visible = true
                    }
                }
                if (logicOperand.index === 1) {
                    conditionStructure.logicOperands[2].visible = true
                }
            }
        }

        if (structureBranch.pickerName === 'Algebra') {
            if (event.selected === 0) {
                setVisibility(structureBranch.comparisonOperand.algebra.operandB, false)
            } else {
                setVisibility(structureBranch.comparisonOperand.algebra.operandB, true)
            }
        }

        if (structureBranch.pickerName === 'Comparison') {
            if (event.selected === 4) {
                // this means Equal To

                logicOperand.comparison.operandA.algebra.operandA.valuePicker.visible = true
                logicOperand.comparison.operandA.algebra.picker.visible = false
                logicOperand.comparison.operandB.algebra.picker.visible = false
                setVisibility(logicOperand.comparison.operandA.algebra.operandB, false)
                setVisibility(logicOperand.comparison.operandB.algebra.operandA, false)
                setVisibility(logicOperand.comparison.operandB.algebra.operandB, false)
            } else {
                logicOperand.comparison.operandA.algebra.operandA.valuePicker.visible = false
                logicOperand.comparison.operandA.algebra.picker.visible = true
                logicOperand.comparison.operandB.algebra.picker.visible = true
                if (logicOperand.comparison.operandA.algebra.picker.getSelected() !== '...') {
                    setVisibility(logicOperand.comparison.operandA.algebra.operandB, true)
                }

                if (logicOperand.comparison.picker.getSelected() !== 'Equal To') {
                    setVisibility(logicOperand.comparison.operandB.algebra.operandA, true)
                }

                if (logicOperand.comparison.operandB.algebra.picker.getSelected() !== '...') {
                    setVisibility(logicOperand.comparison.operandB.algebra.operandB, true)
                }
            }
        }

        function setLogicOperanVisibility(logicOperand, isVisible) {

        }

        function setVisibility(algebraOperand, isVisible) {
            algebraOperand.whenPicker.visible = isVisible
            algebraOperand.dataMinePicker.visible = isVisible
            algebraOperand.botPicker.visible = isVisible
            algebraOperand.productPicker.visible = isVisible
            algebraOperand.propertyPicker.visible = isVisible
            algebraOperand.timeFramePicker.visible = isVisible
        }
    }

    function getContainer(point) {
        let container
        if (thisObject.visible === true) {
            if (conditionStructure === undefined) { return }

            for (let i = 0; i < conditionStructure.logicOperands.length; i++) {
                let logicOperand = conditionStructure.logicOperands[i]
                if (logicOperand.visible !== true) { continue }

                container = operandGetContainer(point, logicOperand.comparison.operandA.algebra.operandA)
                if (container !== undefined) { return container }
                container = operandGetContainer(point, logicOperand.comparison.operandA.algebra.operandB)
                if (container !== undefined) { return container }
                container = operandGetContainer(point, logicOperand.comparison.operandB.algebra.operandA)
                if (container !== undefined) { return container }
                container = operandGetContainer(point, logicOperand.comparison.operandB.algebra.operandB)
                if (container !== undefined) { return container }

                if (container = logicOperand.comparison.operandA.algebra.picker !== undefined) {
                    if (container = logicOperand.comparison.operandA.algebra.picker.visible === true) {
                        container = logicOperand.comparison.operandA.algebra.picker.getContainer(point)
                        if (container !== undefined) { return container }
                    }
                }

                if (logicOperand.comparison.operandB.algebra.picker !== undefined) {
                    if (container = logicOperand.comparison.operandB.algebra.picker.visible === true) {
                        container = logicOperand.comparison.operandB.algebra.picker.getContainer(point)
                        if (container !== undefined) { return container }
                    }
                }

                if (container = logicOperand.comparison.picker !== undefined) {
                    if (container = logicOperand.comparison.picker.visible === true) {
                        container = logicOperand.comparison.picker.getContainer(point)
                        if (container !== undefined) { return container }
                    }
                }

                if (container = logicOperand.picker !== undefined) {
                    if (container = logicOperand.picker.visible === true) {
                        container = logicOperand.picker.getContainer(point)
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

    function operandGetContainer(point, operand) {
        let container
        if (operand.whenPicker !== undefined) {
            if (operand.whenPicker.visible === true) {
                container = operand.whenPicker.getContainer(point)
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

    function physics() {

    }

    function drawBackground() {
        thisObjectDrawBackground()
        childrenDrawBackground()
    }

    function childrenDrawBackground() {
        if (conditionStructure === undefined) { return }

        for (let i = 0; i < conditionStructure.logicOperands.length; i++) {
            let logicOperand = conditionStructure.logicOperands[i]
            if (logicOperand.visible !== true) { continue }

            operandDrawBackground(logicOperand.comparison.operandA.algebra.operandA)
            operandDrawBackground(logicOperand.comparison.operandA.algebra.operandB)
            operandDrawBackground(logicOperand.comparison.operandB.algebra.operandA)
            operandDrawBackground(logicOperand.comparison.operandB.algebra.operandB)

            if (logicOperand.comparison.operandA.algebra.picker !== undefined) {
                if (logicOperand.comparison.operandA.algebra.picker.visible === true) {
                    logicOperand.comparison.operandA.algebra.picker.drawBackground()
                }
            }
            if (logicOperand.comparison.operandB.algebra.picker !== undefined) {
                if (logicOperand.comparison.operandB.algebra.picker.visible === true) {
                    logicOperand.comparison.operandB.algebra.picker.drawBackground()
                }
            }
            if (logicOperand.comparison.picker !== undefined) {
                if (logicOperand.comparison.picker.visible === true) {
                    logicOperand.comparison.picker.drawBackground()
                }
            }
            if (logicOperand.picker !== undefined) {
                if (logicOperand.picker.visible === true) {
                    logicOperand.picker.drawBackground()
                }
            }
        }
    }

    function operandDrawBackground(operand) {
        if (operand === undefined) { return }

        if (operand.whenPicker !== undefined) {
            if (operand.whenPicker.visible === true) {
                operand.whenPicker.drawBackground()
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

    function thisObjectDrawBackground() {
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

    function drawForeground() {
        thisObjectDrawForeground()
        childrenDrawForeground()
    }

    function childrenDrawForeground() {
        if (conditionStructure === undefined) { return }

        for (let i = 0; i < conditionStructure.logicOperands.length; i++) {
            let logicOperand = conditionStructure.logicOperands[i]
            if (logicOperand.visible !== true) { continue }

            operandDrawForeground(logicOperand.comparison.operandA.algebra.operandA)
            operandDrawForeground(logicOperand.comparison.operandA.algebra.operandB)
            operandDrawForeground(logicOperand.comparison.operandB.algebra.operandA)
            operandDrawForeground(logicOperand.comparison.operandB.algebra.operandB)

            if (logicOperand.comparison.operandA.algebra.picker !== undefined) {
                if (logicOperand.comparison.operandA.algebra.picker.visible === true) {
                    logicOperand.comparison.operandA.algebra.picker.drawForeground()
                }
            }
            if (logicOperand.comparison.operandB.algebra.picker !== undefined) {
                if (logicOperand.comparison.operandB.algebra.picker.visible === true) {
                    logicOperand.comparison.operandB.algebra.picker.drawForeground()
                }
            }
            if (logicOperand.comparison.picker !== undefined) {
                if (logicOperand.comparison.picker.visible === true) {
                    logicOperand.comparison.picker.drawForeground()
                }
            }
            if (logicOperand.picker !== undefined) {
                if (logicOperand.picker.visible === true) {
                    logicOperand.picker.drawForeground()
                }
            }
        }
    }

    function operandDrawForeground(operand) {
        if (operand === undefined) { return }

        if (operand.whenPicker !== undefined) {
            if (operand.whenPicker.visible === true) {
                operand.whenPicker.drawForeground()
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

    function thisObjectDrawForeground() {
        if (thisObject.visible === true) {
            const SIZE = 36
            UI.projects.superalgos.utilities.drawPrint.drawIcon(timeFrameIcon, 0, 0, -PICKER_WIDTH * 3.25, -PICKER_HEIGHT * 7, SIZE, thisObject.container)
            UI.projects.superalgos.utilities.drawPrint.drawIcon(dataMineIcon, 0, 0, -PICKER_WIDTH * 2.5, -PICKER_HEIGHT * 7, SIZE, thisObject.container)
            UI.projects.superalgos.utilities.drawPrint.drawIcon(botIcon, 0, 0, -PICKER_WIDTH * 1.5, -PICKER_HEIGHT * 7, SIZE, thisObject.container)
            UI.projects.superalgos.utilities.drawPrint.drawIcon(whenIcon, 0, 0, -PICKER_WIDTH * 0.5, -PICKER_HEIGHT * 7, SIZE, thisObject.container)
            UI.projects.superalgos.utilities.drawPrint.drawIcon(productIcon, 0, 0, PICKER_WIDTH * 0.5, -PICKER_HEIGHT * 7, SIZE, thisObject.container)
            UI.projects.superalgos.utilities.drawPrint.drawIcon(propertyIcon, 0, 0, PICKER_WIDTH * 1.45, -PICKER_HEIGHT * 7, SIZE, thisObject.container)
            UI.projects.superalgos.utilities.drawPrint.drawIcon(operationIcon, 0, 0, PICKER_WIDTH * 2.45, -PICKER_HEIGHT * 7, SIZE, thisObject.container)
            UI.projects.superalgos.utilities.drawPrint.drawIcon(valueIcon, 0, 0, PICKER_WIDTH * 3.45, -PICKER_HEIGHT * 7, SIZE, thisObject.container)
        }
    }
}
