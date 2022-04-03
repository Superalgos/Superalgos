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
        if (pools.payload === undefined) { return }
        let tokens = pools.payload.tokens

        /* Check if this Pools has already been processed by it's reference child.*/
        if (tokens !== undefined && tokens > 0) { return }

        let confiTokens = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(pools.payload, 'tokens')
        if (confiTokens !== undefined) {
            tokens = confiTokens
            distributeTokens(pools, tokens)
        }
    }

    function resetTokenFlow(node) {
        if (node === undefined) { return }
        if (node.payload === undefined) { return }
        node.payload.tokens = 0
        /*
        If there is a reference parent defined, this means that the token flow is 
        transferred to it and not distributed among children.
        */
        if (node.payload.referenceParent !== undefined) {
            resetTokenFlow(node.payload.referenceParent)
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
                        if (node.type === 'Pools' && property.name === "votingProgram") {
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
        At hierarchy heads we will show how many tokens are coming in.
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
        transferred to it and not distributed among children.
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
                        if (node.type === 'Pools' && property.name === "votingProgram") {
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
        if (node.payload === undefined) { return }
        tokens = tokens | 0
        let status
        if (weight !== undefined && weight !== 0) {
            status = 'Reward: '  + tokens.toLocaleString('en')
                + ' ' + 'SA' + ' ≃ ' +  UI.projects.governance.utilities.conversions.estimateSATokensInBTC(tokens | 0) + '  BTC ' + ' + Weight: ' + (weight * 100).toFixed(2) + " %" 
            node.payload.uiObject.statusAngleOffset = 0
            node.payload.uiObject.statusAtAngle = true

            node.payload.uiObject.setStatus(status, UI.projects.governance.globals.designer.SET_STATUS_COUNTER)
        } else {
            status = 'Reward: '  + tokens.toLocaleString('en')
                + ' ' + 'SA' + ' ≃ ' +  UI.projects.governance.utilities.conversions.estimateSATokensInBTC(tokens | 0) + '  BTC ' 

            node.payload.uiObject.statusAngleOffset = 0
            node.payload.uiObject.statusAtAngle = false

            node.payload.uiObject.setStatus(status, UI.projects.governance.globals.designer.SET_STATUS_COUNTER)
        }
    }
}