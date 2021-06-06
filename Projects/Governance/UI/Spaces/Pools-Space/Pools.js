function newGovernancePoolsSpace() {
    const MODULE_NAME = 'Pool Space'

    let thisObject = {
        container: undefined,
        physics: physics,
        draw: draw,
        getContainer: getContainer,
        finalize: finalize,
        initialize: initialize
    }

    thisObject.container = newContainer()
    thisObject.container.initialize(MODULE_NAME)

    return thisObject

    function initialize() {

    }

    function finalize() {
        thisObject.container.finalize()
        thisObject.container = undefined
    }

    function getContainer(point) {

        if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            thisObject.container.space = MODULE_NAME
            return thisObject.container
        } else {
            return undefined
        }
    }

    function physics() {
        if (UI.projects.superalgos.spaces.designSpace.workspace === undefined) { return }

        let pools = UI.projects.superalgos.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('Pools')

        /* Weight Calculation Follows */
        for (let i = 0; i < pools.length; i++) {
            let poolsNode = pools[i]
            UI.projects.governance.functionLibraries.weights.calculateWeights(poolsNode)
        }
        /*
        We will reset all the token flows, and then distribute it.
        */
        for (let i = 0; i < pools.length; i++) {
            let poolsNode = pools[i]
            poolsReset(poolsNode)
        }
        for (let i = 0; i < pools.length; i++) {
            let poolsNode = pools[i]
            poolsDistribute(poolsNode)
        }
    }

    function poolsReset(pools) {
        resetTokenFlow(pools)
    }

    function poolsDistribute(pools) {
        let tokenFlow = UI.projects.superalgos.utilities.nodeConfig.loadPropertyFromNodeConfig(pools.payload, 'tokens')
        distributeTokens(pools, tokenFlow)
    }

    function resetTokenFlow(node) {
        if (node === undefined) { return }
        if (node.payload === undefined) { return }
        node.payload.tokenFlow = 0
        /*
        If there is a reference parent defined, this means that the token flow is 
        transfered to it and not distributed among children.
        */
        if (node.payload.referenceParent !== undefined) {
            resetTokenFlow(node.payload.referenceParent)
            return
        }
        /*
        When we reach certain node types, we will halt the distribution, because thse are targets for 
        token flow.
        */
        if (
            node.type === 'Asset' ||
            node.type === 'Feature'
        ) { return }
        /*
        If there is no reference parent we will redistribute token flow among children.
        */
        let schemaDocument = getSchemaDocument(node)
        if (schemaDocument === undefined) { return }

        if (schemaDocument.childrenNodesProperties !== undefined) {
            for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                let property = schemaDocument.childrenNodesProperties[i]

                switch (property.type) {
                    case 'node': {
                        if (node.type === 'Pools' && property.name === "votesDistribution") {
                            let childNode = node[property.name]
                            resetTokenFlow(childNode)
                        }
                    }
                        break
                    case 'array': {
                        let propertyArray = node[property.name]
                        if (propertyArray !== undefined) {
                            for (let m = 0; m < propertyArray.length; m++) {
                                let childNode = propertyArray[m]
                                resetTokenFlow(childNode)
                            }
                        }
                        break
                    }
                }
            }
        }
    }

    function distributeTokens(node, tokenFlow) {
        if (node === undefined) { return }
        if (node.payload === undefined) { return }
        /*
        Let's get the schemaDocument first
        */
        let schemaDocument = getSchemaDocument(node)
        if (schemaDocument === undefined) { return }
        /*
        At hierarchy heads we will shouw how many tokens are comming in.
        */
        if (
            schemaDocument.isHierarchyHead === true
        ) {
            drawTokenFlow(node, tokenFlow)
        }
        /*
        We will also have tokens at nodes with weight.
        */
        if (
            isNaN(node.payload.weight ) !== true && 
            node.payload.weight !== undefined &&
            node.payload.weight !== 0
        ) {
            node.payload.tokenFlow = tokenFlow * node.payload.weight
            drawTokenFlow(node, node.payload.tokenFlow, node.payload.weight)
        }
        /*
        If there is a reference parent defined, this means that the token flow is 
        transfered to it and not distributed among children.
        */
        if (node.payload.referenceParent !== undefined) {
            distributeTokens(node.payload.referenceParent, node.payload.tokenFlow)
            return
        }
        /*
        When we reach certain node types, we will halt the distribution, because these are targets for 
        token flow.
        */
        if (
            node.type === 'Asset' ||
            node.type === 'Feature'
        ) { return }

        if (schemaDocument.childrenNodesProperties !== undefined) {
            for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                let property = schemaDocument.childrenNodesProperties[i]

                switch (property.type) {
                    case 'node': {
                        if (node.type === 'Pools' && property.name === "votesDistribution") {
                            let childNode = node[property.name]
                            distributeTokens(childNode, tokenFlow)
                        }
                    }
                        break
                    case 'array': {
                        let propertyArray = node[property.name]
                        if (propertyArray !== undefined) {
                            for (let m = 0; m < propertyArray.length; m++) {
                                let childNode = propertyArray[m]
                                distributeTokens(childNode, tokenFlow)
                            }
                        }
                        break
                    }
                }
            }
        }
    }

    function drawTokenFlow(node, tokenFlow, weight) {
        if (weight !== undefined && weight !== 0) {
            tokenFlow = new Intl.NumberFormat().format(tokenFlow) + ' ' + 'SA Tokens' + ' - ' + 'Weight: ' + weight.toFixed(2)
        } else {
            tokenFlow = new Intl.NumberFormat().format(tokenFlow) + ' ' + 'SA Tokens'
        }

        if (node.payload !== undefined) {
            node.payload.uiObject.setStatus(tokenFlow)
        }
    }

    function draw() {

    }
}
