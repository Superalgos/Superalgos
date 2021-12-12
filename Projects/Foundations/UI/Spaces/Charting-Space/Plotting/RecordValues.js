function newRecordValues() {
    const MODULE_NAME = 'Record Values'
    const logger = newWebDebugLog()


    let thisObject = {
        onRecordChange: onRecordChange,
        initialize: initialize,
        finalize: finalize
    }

    let tradingSystem
    let tradingEngine
    let portfolioSystem
    let portfolioEngine
    let learningSystem
    let learningEngine
    let productDefinition
    let propertyTargetNodeMap = new Map()
    return thisObject

    function finalize() {
        tradingSystem = undefined
        tradingEngine = undefined
        portfolioSystem = undefined
        portfolioEngine = undefined
        learningSystem = undefined
        learningEngine = undefined
        productDefinition = undefined
        propertyTargetNodeMap = undefined
    }

    function initialize(pTradingOrLearningOrPortfolioSystem, pTradingOrLearningOrPortfolioEngine, pProductDefinition) {
        if (pTradingOrLearningOrPortfolioSystem.type === 'Trading System') {
            tradingSystem = UI.projects.foundations.spaces.designSpace.workspace.getHierarchyHeadsById(pTradingOrLearningOrPortfolioSystem.id)
        }
        if (pTradingOrLearningOrPortfolioSystem.type === 'Portfolio System') {
            portfolioSystem = UI.projects.foundations.spaces.designSpace.workspace.getHierarchyHeadsById(pTradingOrLearningOrPortfolioSystem.id)
        }
        if (pTradingOrLearningOrPortfolioSystem.type === 'Learning System') {
            learningSystem = UI.projects.foundations.spaces.designSpace.workspace.getHierarchyHeadsById(pTradingOrLearningOrPortfolioSystem.id)
        }
        if (pTradingOrLearningOrPortfolioEngine.type === 'Trading Engine') {
            tradingEngine = UI.projects.foundations.spaces.designSpace.workspace.getHierarchyHeadsById(pTradingOrLearningOrPortfolioEngine.id)
        }
        if (pTradingOrLearningOrPortfolioEngine.type === 'Portfolio Engine') {
            portfolioEngine = UI.projects.foundations.spaces.designSpace.workspace.getHierarchyHeadsById(pTradingOrLearningOrPortfolioEngine.id)
        }
        if (pTradingOrLearningOrPortfolioEngine.type === 'Learning Engine') {
            learningEngine = UI.projects.foundations.spaces.designSpace.workspace.getHierarchyHeadsById(pTradingOrLearningOrPortfolioEngine.id)
        }
        productDefinition = pProductDefinition

        /*
        The product root can be a node or a node property of type array.
        */
        let productRoot = eval(productDefinition.config.nodePath)

        if (productDefinition.config.nodePathType === 'array') {
            /*
            This means that the configured nodePath is not pointing to a node, but to a node property that is an array.
            For that reason we will assume that each element of the array is a record to be outputed
            */
            for (let index = 0; index < productRoot.length; index++) {
                /*
                The Product Root Node is the root of the node hierarchy from where we are going to extract the record values.
                */
                let productRootNode = productRoot[index]
                scanProperties(productDefinition, productRootNode, index)
            }
        } else {
            /*
            This means that the configured nodePath points to a single node, which is the one whose children constitutes
            the record to be saved at the output file.
            */
            /*
            The Product Root Node is the root of the node hierarchy from where we are going to extract the record values.
            */
            let productRootNode = productRoot
            scanProperties(productDefinition, productRootNode)
        }

        function scanProperties(productDefinition, productRootNode, index) {
            for (let i = 0; i < productDefinition.record.properties.length; i++) {
                let property = productDefinition.record.properties[i]
                let key = property.id
                if (index !== undefined) {
                    key = property.id + '-' + index
                }
                if (property.config.nodePath !== undefined) {
                    let propertyRoot
                    try {
                        propertyRoot = eval(property.config.nodePath)
                    } catch (err) {
                        console.log('Definition Error at Product ' + productDefinition.name)
                        console.log('productDefinition.config = ' + JSON.stringify(productDefinition.config))
                        console.log('Definition Error at Property ' + property.name)
                        console.log('property.config = ' + JSON.stringify(property.config))
                        console.log('property.config.nodePath = ' + property.config.nodePath)
                        return
                    }
                    propertyTargetNodeMap.set(key, propertyRoot)
                } else {
                    propertyTargetNodeMap.set(key, productRootNode)
                }
            }
        }
    }

    function onRecordChange(currentRecord) {
        if (currentRecord === undefined) { return }
        for (let i = 0; i < productDefinition.record.properties.length; i++) {
            let property = productDefinition.record.properties[i]
            let value = currentRecord[property.config.codeName]
            let key = property.id
            if (productDefinition.config.nodePathType === 'array') {
                /*
                When we have an array configuration, in this case we will use the index
                property that was injected into the record in order to build the key to 
                get the node where we have to send the value.
                */
                key = property.id + '-' + currentRecord.index
            }
            let targetNode = propertyTargetNodeMap.get(key)
            /*
            If the codeName of the Record Property can not match the name of the property at
            the target node, the user can explicitly specify the property name at the configuration,
            and in those cases we need to use that. This happens when there are many Record Properties
            pointing to the same property at the Target Node.
            */
            if (property.config.childProperty !== undefined) {
                applyValue(targetNode[property.config.childProperty], value, property.config.decimals)
            } else {
                applyValue(targetNode[property.config.codeName], value, property.config.decimals)
            }
        }
    }

    function applyValue(node, value, minDecimals) {
        if (UI.projects.foundations.spaces.chartingSpace.visible !== true) { return }
        if (node === undefined) { return }
        if (node.payload === undefined) { return }
        if (node.payload.uiObject === undefined) { return }
        if (value === true) { value = 'true' }
        if (value === false) { value = 'false' }
        node.payload.uiObject.valueAtAngle = true
        node.payload.uiObject.setValue(value, 1, minDecimals)
    }
}
