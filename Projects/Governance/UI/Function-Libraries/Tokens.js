function newGovernanceFunctionLibraryTokens() {
    let thisObject = {
        calculate: calculate
    }

    return thisObject

    function calculate(
        pools
    ) {
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
        let tokens = UI.projects.foundations.utilities.nodeConfig.loadPropertyFromNodeConfig(pools.payload, 'tokens')
        distributeTokens(pools, tokens)
    }

    function resetTokenFlow(node) {
        if (node === undefined) { return }
        if (node.payload === undefined) { return }
        node.payload.tokens = 0
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

    function distributeTokens(node, tokens) {
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
            drawTokenFlow(node, tokens)
        }
        /*
        We will also have tokens at nodes with weight.
        */
        if (
            isNaN(node.payload.weight) !== true &&
            node.payload.weight !== undefined &&
            node.payload.weight !== 0
        ) {
            node.payload.tokens = tokens * node.payload.weight
            drawTokenFlow(node, node.payload.tokens, node.payload.weight)
        }
        /*
        If there is a reference parent defined, this means that the token flow is 
        transfered to it and not distributed among children.
        */
        if (node.payload.referenceParent !== undefined) {
            distributeTokens(node.payload.referenceParent, node.payload.tokens)
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
                            distributeTokens(childNode, tokens)
                        }
                    }
                        break
                    case 'array': {
                        let propertyArray = node[property.name]
                        if (propertyArray !== undefined) {
                            for (let m = 0; m < propertyArray.length; m++) {
                                let childNode = propertyArray[m]
                                distributeTokens(childNode, tokens)
                            }
                        }
                        break
                    }
                }
            }
        }
    }

    function drawTokenFlow(node, tokens, weight) {
        let status
        if (weight !== undefined && weight !== 0) {
            status = new Intl.NumberFormat().format(tokens) + ' ' + 'SA Tokens Reward' + ' - ' + 'Weight: ' + weight.toFixed(2)
        } else {
            status = new Intl.NumberFormat().format(tokens) + ' ' + 'SA Tokens Reward'
        }

        if (node.payload !== undefined) {
            node.payload.uiObject.setStatus(status)
        }
    }
}